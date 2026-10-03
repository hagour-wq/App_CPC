import type { Value, Row, Kpi } from '../../types/finance';
export const normalize = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .replace(/[−–—]/g, '-')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
export const months = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];
export const scalar = (v: unknown): Value =>
  typeof v === 'number' && Number.isFinite(v)
    ? v
    : typeof v === 'string'
      ? v
      : v instanceof Date
        ? v.toLocaleDateString('fr-MA')
        : null;
export function columns(rows: Row[]) {
  const header =
    rows.find((r) => r.some((v) => normalize(v) === 'janvier')) ?? [];
  return {
    month: months.map((m) =>
      header.findIndex((v) => normalize(v) === normalize(m)),
    ),
    annual: header.findIndex((v) =>
      /^(annee|exercice) \d{4}/.test(normalize(v)),
    ),
    header,
  };
}
export function toKpi(
  row: Row,
  labelColumn: number,
  cols: ReturnType<typeof columns>,
  id: string,
): Kpi {
  return {
    id,
    label: String(row[labelColumn] ?? ''),
    unit: labelColumn === 0 ? String(row[1] ?? '') : 'MAD',
    reference: labelColumn === 0 ? String(row[2] ?? '') : '',
    months: cols.month.map((i) => (i >= 0 ? (row[i] ?? null) : null)),
    annual: cols.annual >= 0 ? (row[cols.annual] ?? null) : null,
  };
}
