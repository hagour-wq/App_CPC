import { useFinanceStore } from '../../store/useFinanceStore';
import { PeriodSlicer } from './PeriodSlicer';
export function Header() {
  const m = useFinanceStore((s) => s.model);
  return (
    <header className="glass header">
      <div>
        <h1>{m?.identity["Nom de l'entreprise"] ?? 'AéroTech Maroc'}</h1>
        <p>
          {['Secteur', 'Date', 'Département', 'Responsable']
            .map((k) => m?.identity[k])
            .filter(Boolean)
            .join(' · ')}
        </p>
        <span className="control">
          {!m
            ? 'Lecture du classeur…'
            : m.controls.length
              ? m.controls.some((c) => c.includes('✖'))
                ? 'Contrôles Excel : anomalie'
                : 'Contrôles Excel ✔'
              : 'Contrôles Excel : données absentes'}
        </span>
      </div>
      <PeriodSlicer />
    </header>
  );
}
