import type { Row, SheetData } from '../../types/finance';
export const parseBalance = (rows: Row[], name = 'Balance'): SheetData => ({
  name,
  rows,
});
