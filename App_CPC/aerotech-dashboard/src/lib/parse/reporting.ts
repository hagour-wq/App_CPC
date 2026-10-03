import type { Row, Section } from '../../types/finance';
import { columns, normalize, toKpi } from './normalize';
export function parseReporting(rows: Row[]) {
  const sections: Section[] = [];
  const cols = columns(rows);
  const start = rows.findIndex((r) => normalize(r[0]) === 'indicateur');
  if (start < 0) return { sections, year: '' };
  let current: Section | undefined;
  for (const [i, row] of rows.entries()) {
    if (i <= start) continue;
    const label = String(row[0] ?? '');
    if (/^code couleur/i.test(label)) break;
    const section = label.match(/^([1-4])\.\s*(.+)/);
    if (section) {
      current = { id: section[1], label: section[2], kpis: [] };
      sections.push(current);
    } else if (
      current &&
      label &&
      (row[1] || normalize(label).startsWith("lecture de l'elasticite"))
    ) {
      current.kpis.push(
        toKpi(row, 0, cols, `${current.id}-${normalize(label)}`),
      );
    }
  }
  return { sections, year: String(cols.header[cols.annual] ?? 'Année') };
}
