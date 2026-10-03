import type { Row } from '../../types/finance';
import { columns, toKpi } from './normalize';
export function parseESG(rows: Row[]) {
  const cols = columns(rows);
  return rows
    .filter(
      (r) => typeof r[1] === 'string' && cols.month.some((i) => r[i] != null),
    )
    .map((r, i) => toKpi(r, 1, cols, 'esg-' + i));
}
