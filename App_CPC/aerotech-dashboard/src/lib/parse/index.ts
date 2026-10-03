import * as XLSX from 'xlsx';
import type { FinanceModel, Row } from '../../types/finance';
import { scalar, normalize } from './normalize';
import { parseAccueil } from './accueil';
import { parseReporting } from './reporting';
import { parseESG } from './esg';
import { parseCPC } from './cpc';
import { parseBalance } from './balance';
export function parseWorkbook(buffer: ArrayBuffer): FinanceModel {
  return parseBook(XLSX.read(buffer, { type: 'array', cellDates: true }));
}
export function parseBook(book: XLSX.WorkBook): FinanceModel {
  const warnings: string[] = [];
  const sheets = book.SheetNames.map((name) => ({
    name,
    rows: XLSX.utils
      .sheet_to_json<unknown[]>(book.Sheets[name], {
        header: 1,
        defval: null,
        blankrows: true,
        raw: true,
      })
      .map((r) => r.map(scalar)),
  }));
  const get = (name: string): Row[] => {
    const s = sheets.find((s) => normalize(s.name) === normalize(name));
    if (!s) warnings.push(`Donnée absente : onglet ${name}`);
    return s?.rows ?? [];
  };
  const accueil = parseAccueil(get('Accueil'));
  const reporting = parseReporting(get('Reporting'));
  const cpc = parseCPC(get('CPC'));
  const esg = parseESG(get('ESG'));
  const balance = parseBalance(get('Balance'));
  const dashboard = parseBalance(get('DASHBOARD'), 'DASHBOARD');
  for (const key of [
    "Nom de l'entreprise",
    'Secteur',
    'Date',
    'Département',
    'Responsable',
  ])
    if (accueil.identity[key] === 'Non renseigné')
      warnings.push(`Donnée absente : ${key}`);
  if (reporting.sections.length !== 4)
    warnings.push('Donnée absente : une ou plusieurs sections du Reporting');
  for (const [label, source] of [
    ["chiffre d'affaires", "chiffre d'affaires"],
    ['resultat net', 'xiii. resultat net'],
    ["resultat d'exploitation (rex)", "iii. resultat d'exploitation"],
  ]) {
    const k = reporting.sections
      .flatMap((s) => s.kpis)
      .find((k) => normalize(k.label) === label);
    const c = cpc.find((k) => normalize(k.label).startsWith(source));
    if (!k || !c) {
      warnings.push(`Donnée absente : ${label} (rapprochement CPC)`);
      continue;
    }
    for (let i = 0; i < 13; i++) {
      const a = i === 12 ? k.annual : k.months[i],
        b = i === 12 ? c.annual : c.months[i];
      if (typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) > 1)
        warnings.push(
          `Écart Reporting / CPC : ${label}, ${i === 12 ? 'année' : i + 1} (${Math.round(a - b)} MAD)`,
        );
    }
  }
  for (const name of ['Reporting', 'CPC', 'ESG']) {
    const sheet = book.Sheets[name];
    if (sheet)
      for (const [address, cell] of Object.entries(sheet)) {
        if (address.startsWith('!')) continue;
        const c = cell as XLSX.CellObject;
        if (c.t === 'e')
          warnings.push(`Erreur Excel : ${name}!${address} (${c.w ?? c.v})`);
        else if (c.f && c.v == null)
          warnings.push(
            `Valeur calculée absente : ${name}!${address}. Recalculer et enregistrer dans Excel.`,
          );
      }
  }
  return {
    ...accueil,
    ...reporting,
    cpc,
    esg,
    balance,
    dashboard,
    sheets,
    warnings: [...new Set(warnings)],
  };
}
