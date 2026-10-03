import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseWorkbook, parseBook } from '../lib/parse';
const bytes = readFileSync(
  new URL(
    '../../public/data/Plan_Financier_AeroTech_Maroc.xlsx',
    import.meta.url,
  ),
);
const buffer = () =>
  bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
describe('Classeur fourni', () => {
  it('lit les caches Excel et toutes les feuilles', () => {
    const m = parseWorkbook(buffer());
    expect(m.sections).toHaveLength(4);
    const all = m.sections.flatMap((s) => s.kpis);
    expect(all.find((k) => k.label === "Chiffre d'affaires")?.annual).toBe(
      87975000,
    );
    expect(all.find((k) => k.label === 'Résultat net')?.annual).toBe(8410200);
    expect(
      all.find((k) => k.label.startsWith("Marge d'exploitation"))?.annual,
    ).toBeCloseTo(0.126081);
    expect(m.identity["Nom de l'entreprise"]).toBe('AéroTech Maroc');
    expect(m.sheets).toHaveLength(7);
    expect(m.warnings).toEqual([]);
  });
  it('accepte une ligne insérée et un nouveau KPI', () => {
    const book = XLSX.read(buffer());
    const rows = XLSX.utils.sheet_to_json<unknown[]>(book.Sheets.Reporting, {
      header: 1,
      defval: null,
    });
    rows.splice(12, 0, ['Nouveau KPI', 'MAD', '', ...Array(12).fill(42), 504]);
    book.Sheets.Reporting = XLSX.utils.aoa_to_sheet(rows);
    const m = parseBook(book);
    expect(
      m.sections[0].kpis.find((k) => k.label === 'Nouveau KPI')?.annual,
    ).toBe(504);
    expect(
      m.sections[1].kpis.find((k) => k.label === 'Résultat net')?.annual,
    ).toBe(8410200);
  });
  it('signale une feuille manquante', () => {
    const book = XLSX.read(buffer());
    book.SheetNames = book.SheetNames.filter((n) => n !== 'Reporting');
    delete book.Sheets.Reporting;
    expect(parseBook(book).warnings).toContain(
      'Donnée absente : onglet Reporting',
    );
  });
  it('détecte une divergence CPC', () => {
    const book = XLSX.read(buffer());
    const sheet = book.Sheets.CPC;
    const addr = Object.keys(sheet).find(
      (a) => sheet[a]?.v === "Chiffre d'affaires",
    );
    expect(addr).toBeDefined();
    if (addr) {
      const row = XLSX.utils.decode_cell(addr).r;
      const annual = XLSX.utils.encode_cell({ r: row, c: 15 });
      sheet[annual].v += 5;
    }
    expect(
      parseBook(book).warnings.some((w) => w.includes('Écart Reporting / CPC')),
    ).toBe(true);
  });
});
