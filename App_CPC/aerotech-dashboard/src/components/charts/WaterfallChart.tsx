import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import type { Kpi } from '../../types/finance';
import { format } from '../../lib/format';
export function WaterfallChart({ esg }: { esg: Kpi[] }) {
  const get = (prefix: string) => {
    const k = esg.find((k) => k.label.startsWith(prefix));
    return typeof k?.annual === 'number' ? k.annual : null;
  };
  const values = [
    'II.',
    'I.',
    'III.',
    'IV.',
    '8.',
    '9.',
    '10.',
    'V.',
    'VI.',
    'VII.',
    'IX.',
    '15.',
    'X.',
  ].map(get);
  if (values.some((v) => v === null))
    return (
      <article className="glass chart">
        Donnée absente : soldes ESG nécessaires au waterfall
      </article>
    );
  const [
    production,
    margin,
    consumption,
    va,
    sub,
    tax,
    staff,
    ebe,
    rex,
    fin,
    nc,
    is,
    rn,
  ] = values as number[];
  let total = 0;
  const steps: [string, number, boolean][] = [
    ['Production', production, false],
    ['Marge brute', margin, false],
    ['Consommation', -consumption, false],
    ['VA', va, true],
    ['Subventions', sub, false],
    ['Taxes', -tax, false],
    ['Personnel', -staff, false],
    ['EBE', ebe, true],
    ['Ajust. exploitation', rex - ebe, false],
    ['REX', rex, true],
    ['Financier', fin, false],
    ['Non courant', nc, false],
    ['IS', -is, false],
    ['Résultat net', rn, true],
  ];
  const data = steps.map(([name, amount, subtotal]) => {
    const before = subtotal ? 0 : total;
    total = subtotal ? amount : total + amount;
    return {
      name,
      base: Math.min(before, total),
      range: Math.abs(total - before),
      amount,
      subtotal,
    };
  });
  return (
    <article className="glass waterfall chart">
      <h3>De la production au résultat net</h3>
      <p>
        Marge commerciale incluse · Ajustements d’exploitation = autres produits
        − autres charges + reprises − dotations
      </p>
      <div className="waterfall-scroll">
        <ResponsiveContainer width="100%" height={340} minWidth={900}>
          <BarChart
            data={data}
            margin={{ left: 20, right: 20, top: 20, bottom: 80 }}
          >
            <CartesianGrid vertical={false} stroke="#e7eaf0" />
            <XAxis
              dataKey="name"
              angle={-35}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              width={65}
              tickFormatter={(v) => format(Number(v), '', true)}
            />
            <Tooltip
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as
                  (typeof data)[number] | undefined;
                return active && row ? (
                  <div className="tooltip">
                    {row.name}
                    <br />
                    {format(row.amount, 'MAD')}
                  </div>
                ) : null;
              }}
            />
            <Bar dataKey="base" stackId="waterfall" fill="transparent" />
            <Bar dataKey="range" stackId="waterfall" radius={[3, 3, 0, 0]}>
              {data.map((row, i) => (
                <Cell
                  key={i}
                  fill={
                    row.subtotal
                      ? '#001152'
                      : row.amount < 0
                        ? '#c8a18f'
                        : '#8faab7'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
