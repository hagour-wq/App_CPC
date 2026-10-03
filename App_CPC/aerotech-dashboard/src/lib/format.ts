import type { Value } from '../types/finance';
export function format(value: Value, unit = '', compact = false) {
  if (value === null) return 'Donnée absente';
  if (typeof value === 'string') return value;
  const number = new Intl.NumberFormat('fr-MA', {
    maximumFractionDigits: unit === 'MAD' ? 0 : 1,
    notation: compact ? 'compact' : 'standard',
  });
  if (unit === '%') return `${number.format(value * 100)} %`;
  return `${number.format(value)}${unit === 'jours' ? ' j' : unit === 'x' ? 'x' : unit ? ' ' + unit : ''}`;
}
