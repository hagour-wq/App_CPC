import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { Kpi } from '../../types/finance';
import { fr } from '../../i18n/fr';
import { format } from '../../lib/format';
export function TrendChart({ kpi }: { kpi: Kpi | undefined }) {
  if (!kpi) return <div className="glass chart">Donnée absente : tendance</div>;
  const data = kpi.months.map((value, i) => ({
    month: fr.periods[i],
    value: typeof value === 'number' ? value : null,
  }));
  return (
    <article className="glass chart">
      <h3>{kpi.label}</h3>
      <p>Évolution mensuelle · MAD</p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={data}
          margin={{ left: 12, right: 12, top: 20, bottom: 0 }}
        >
          <CartesianGrid stroke="#e7eaf0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => format(Number(v), '', true)}
            width={65}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => format(typeof v === 'number' ? v : null, 'MAD')}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#001152"
            strokeWidth={2.5}
            fill="#001152"
            fillOpacity={0.07}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </article>
  );
}
