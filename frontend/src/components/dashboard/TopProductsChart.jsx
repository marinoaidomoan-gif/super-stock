import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export default function TopProductsChart({ topProducts }) {
  const { t } = useTranslation()

  if (!topProducts.length) return null

  return (
    <section className="panel top-products">
      <div className="panel-head">
        <div>
          <h2>{t('dashboard.top.title')}</h2>
          <p>{t('dashboard.top.subtitle')}</p>
        </div>
        <span className="date-chip">{t('dashboard.top.allMovements')}</span>
      </div>
      <div className="bar-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topProducts} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--border)" />
            <XAxis
              dataKey="nom"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
              }}
              formatter={(v) => [v, t('dashboard.charts.units')]}
            />
            <Bar
              isAnimationActive={false}
              dataKey="moves"
              fill="#10b981"
              radius={[5, 5, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}