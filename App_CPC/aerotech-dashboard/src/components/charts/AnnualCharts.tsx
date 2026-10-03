import type { FinanceModel } from '../../types/finance';
import { normalize } from '../../lib/parse/normalize';
import { TrendChart } from './TrendChart';
import { WaterfallChart } from './WaterfallChart';
export default function AnnualCharts({ model }: { model: FinanceModel }) {
  const all = model.sections.flatMap((s) => s.kpis);
  return (
    <>
      <div className="chart-grid">
        {[
          "Chiffre d'affaires",
          'Résultat net',
          'Valeur ajoutée',
          "Résultat d'exploitation (REX)",
        ].map((label) => (
          <TrendChart
            key={label}
            kpi={all.find((k) => normalize(k.label) === normalize(label))}
          />
        ))}
      </div>
      <WaterfallChart esg={model.esg} />
    </>
  );
}
