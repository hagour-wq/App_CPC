import type { Value } from '../../types/finance';
export function Sparkline({ values }: { values: Value[] }) {
  const nums = values.filter((v): v is number => typeof v === 'number');
  if (nums.length < 2) return null;
  const min = Math.min(...nums),
    max = Math.max(...nums);
  let d = '',
    segment = false;
  values.forEach((v, i) => {
    if (typeof v !== 'number') {
      segment = false;
      return;
    }
    d += `${segment ? 'L' : 'M'}${(i / 11) * 140},${33 - ((v - min) / (max - min || 1)) * 28} `;
    segment = true;
  });
  return (
    <svg
      className="sparkline"
      viewBox="0 0 140 38"
      aria-label="Tendance sur douze mois"
      role="img"
    >
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
