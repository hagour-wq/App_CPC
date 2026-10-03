import type { Row } from '../../types/finance';
import { normalize } from './normalize';
export function parseAccueil(rows: Row[]) {
  const identity: Record<string, string> = {};
  const keys = [
    "Nom de l'entreprise",
    'Secteur',
    'Date',
    'Département',
    'Responsable',
  ];
  for (const key of keys) {
    const row = rows.find((r) => normalize(r[1]) === normalize(key));
    identity[key] = String(row?.[2] ?? 'Non renseigné');
  }
  const start = rows.findIndex((r) =>
    r.some((v) => normalize(v).includes('controles de coherence')),
  );
  return {
    identity,
    title: String(
      rows.find((r) => normalize(r[1]).startsWith('plan financier'))?.[1] ??
        'Plan financier',
    ),
    controls:
      start < 0
        ? []
        : rows
            .slice(start + 1)
            .flatMap((r) =>
              r.filter(
                (v): v is string => typeof v === 'string' && /✔|✖/.test(v),
              ),
            ),
  };
}
