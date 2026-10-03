import type { Kpi } from '../../types/finance';
import { format } from '../../lib/format';
import { assess } from '../../config/thresholds';
import { Sparkline } from './Sparkline';
import { ReadingBadge } from './ReadingBadge';
import { usePointerGlow } from '../../hooks/usePointerGlow';
export function KpiCard({ kpi, period }: { kpi: Kpi; period: number }) {
  const glow = usePointerGlow(),
    value = period === 12 ? kpi.annual : kpi.months[period];
  const prev = period > 0 && period < 12 ? kpi.months[period - 1] : null;
  const change =
    typeof value === 'number' && typeof prev === 'number' && prev !== 0
      ? (value - prev) / Math.abs(prev)
      : null;
  const status =
    typeof value === 'number' ? assess(value, kpi.reference) : 'neutral';
  return (
    <article className="glass kpi-card" onPointerMove={glow}>
      <div className="card-content">
        <h3>{kpi.label}</h3>
        <div
          className={
            'kpi-value ' + (typeof value === 'string' ? 'text-value' : '')
          }
        >
          {typeof value === 'string' ? (
            <ReadingBadge text={value} />
          ) : (
            format(value, kpi.unit)
          )}
        </div>
        <div className="card-bottom">
          <div>
            {kpi.reference && (
              <span className={'badge ' + status}>
                {status === 'good'
                  ? '✓ '
                  : status === 'bad'
                    ? '! '
                    : status === 'watch'
                      ? '△ '
                      : ''}
                {kpi.reference}
              </span>
            )}
            {period < 12 && (
              <p className="variation">
                {change === null
                  ? 'Comparaison indisponible'
                  : `${change >= 0 ? '▲' : '▼'} ${format(Math.abs(change), '%')} vs mois précédent`}
              </p>
            )}
          </div>
          {period < 12 && <Sparkline values={kpi.months} />}
        </div>
      </div>
    </article>
  );
}
