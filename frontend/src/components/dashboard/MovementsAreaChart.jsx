import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { formatNumber } from '@/lib/format'

export default function MovementsAreaChart({ charts }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const [period, setPeriod] = useState(7)

  const chart = charts.slice(-period).map((d) => ({
    ...d,
    label: new Date(d.date + 'T12:00:00')
      .toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'short' })
      .replace('.', ''),
  }))

  const totals = chart.reduce(
    (acc, d) => ({ entree: acc.entree + d.entree, sortie: acc.sortie + d.sortie }),
    { entree: 0, sortie: 0 },
  )

  return (
    <section className="panel evolution-panel">
      <div className="panel-head">
        <div>
          <h2>{t('dashboard.charts.evolutionTitle')}</h2>
          <p>{t('dashboard.charts.evolutionSubtitle')}</p>
        </div>
        <select
          className="small-select"
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          aria-label={t('dashboard.charts.period')}
        >
          <option value={7}>{t('dashboard.charts.last7')}</option>
          <option value={3}>{t('dashboard.charts.last3')}</option>
        </select>
      </div>

      <div className="chart-totals">
        <div>
          <span className="legend-dot green" />
          {t('dashboard.charts.entries')}
          <b>{formatNumber(totals.entree, locale)}</b>
          <small>{t('dashboard.charts.units')}</small>
        </div>
        <div>
          <span className="legend-dot blue" />
          {t('dashboard.charts.exits')}
          <b>{formatNumber(totals.sortie, locale)}</b>
          <small>{t('dashboard.charts.units')}</small>
        </div>
      </div>

      <div className="area-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="stockGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="stockBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--card)',
                fontSize: 12,
              }}
              formatter={(v, name) => [
                `${v} ${t('dashboard.charts.units')}`,
                name === 'entree' ? t('dashboard.charts.entries') : t('dashboard.charts.exits'),
              ]}
            />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey="entree"
              stroke="#10b981"
              fill="url(#stockGreen)"
              strokeWidth={2.5}
              activeDot={{ r: 5 }}
            />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey="sortie"
              stroke="#60a5fa"
              fill="url(#stockBlue)"
              strokeWidth={2.5}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-foot">
        <span>
          <TrendingUp size={14} />
          {t('dashboard.charts.footLeft')}
        </span>
        <span>{t('dashboard.charts.footRight')}</span>
      </div>
    </section>
  )
}