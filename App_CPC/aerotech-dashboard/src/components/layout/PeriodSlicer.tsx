import { usePeriod } from '../../hooks/usePeriod';
import { fr } from '../../i18n/fr';
export function PeriodSlicer() {
  const { period, select } = usePeriod();
  return (
    <div className="slicer" role="group" aria-label="Période analysée">
      {fr.periods.map((p, i) => (
        <button key={p} aria-pressed={period === i} onClick={() => select(i)}>
          {p}
        </button>
      ))}
    </div>
  );
}
