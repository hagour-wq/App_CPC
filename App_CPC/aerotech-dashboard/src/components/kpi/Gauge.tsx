import type { Kpi } from '../../types/finance';
import { format } from '../../lib/format';
import { assess } from '../../config/thresholds';
export function Gauge({
  kpi,
  period,
  max,
}: {
  kpi: Kpi | undefined;
  period: number;
  max: number;
}) {
  if (!kpi) return <div className="glass gauge">Donnée absente : jauge</div>;
  const value = period === 12 ? kpi.annual : kpi.months[period],
    ratio =
      typeof value === 'number' ? Math.max(0, Math.min(1, value / max)) : 0;
  const margin = kpi.label.startsWith("Marge d'exploitation");
  const staff = kpi.label.startsWith(
    'Poids du personnel dans la valeur ajoutée',
  );
  const zones: [number, number, string][] = margin
    ? [
        [0, 20, '#c88f8f'],
        [20, 20, '#d1ad77'],
        [40, 60, '#83b397'],
      ]
    : staff
      ? [
          [0, 65, '#83b397'],
          [65, 15, '#d1ad77'],
          [80, 20, '#c88f8f'],
        ]
      : [];
  const status =
    typeof value !== 'number'
      ? 'neutral'
      : margin
        ? value < 0.05
          ? 'bad'
          : value < 0.1
            ? 'watch'
            : 'good'
        : staff
          ? value < 0.65
            ? 'good'
            : value <= 0.8
              ? 'watch'
              : 'bad'
          : assess(value, kpi.reference);
  return (
    <article className="glass gauge">
      <div>
        <h3>{kpi.label}</h3>
        <p>{kpi.reference || 'Le plus bas possible'}</p>
        {margin && (
          <p>Moins de 5 % : alerte · 5–10 % : vigilance · Dès 10 % : sain</p>
        )}
        {staff && (
          <p>Moins de 65 % : sain · 65–80 % : tendu · Plus de 80 % : alerte</p>
        )}
        <span className={'badge ' + status}>
          {typeof value !== 'number'
            ? 'Donnée absente'
            : status === 'good'
              ? '✓ Dans le repère'
              : status === 'bad'
                ? '! Hors repère'
                : status === 'watch'
                  ? '△ Vigilance'
                  : 'Repère indicatif'}
        </span>
      </div>
      <svg
        viewBox="0 0 220 135"
        role="img"
        aria-label={`${kpi.label} : ${format(value, kpi.unit)}`}
      >
        <path
          d="M25 110 A85 85 0 0 1 195 110"
          fill="none"
          stroke="#e3e7ef"
          strokeWidth="12"
          pathLength="100"
        />
        {zones.map(([start, length, color]) => (
          <path
            key={start}
            d="M25 110 A85 85 0 0 1 195 110"
            fill="none"
            stroke={color}
            strokeWidth="12"
            pathLength="100"
            strokeDasharray={`${length} ${100 - length}`}
            strokeDashoffset={-start}
          />
        ))}
        <path
          d="M25 110 A85 85 0 0 1 195 110"
          fill="none"
          stroke="#001152"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${ratio * 100} 100`}
        />
        <text x="110" y="94" textAnchor="middle">
          {format(value, kpi.unit)}
        </text>
        <text className="gauge-scale" x="22" y="133">
          0
        </text>
        <text className="gauge-scale" x="195" y="133" textAnchor="end">
          {format(max, kpi.unit)}
        </text>
      </svg>
    </article>
  );
}
