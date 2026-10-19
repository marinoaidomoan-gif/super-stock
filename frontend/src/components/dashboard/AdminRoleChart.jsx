import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ROLES } from '@/lib/roles'

const COLORS = {
  [ROLES.PROPRIETAIRE]: '#8b5cf6',   // violet
  [ROLES.GERANT]: '#3b82f6',         // bleu
  [ROLES.ADMINISTRATEUR]: '#f43f5e', // rose
}

export default function AdminRoleChart({ parRole, total }) {
  const { t } = useTranslation()

  const data = [
    { name: t('roles.PROPRIETAIRE'), value: parRole[ROLES.PROPRIETAIRE], color: COLORS[ROLES.PROPRIETAIRE] },
    { name: t('roles.GERANT'), value: parRole[ROLES.GERANT], color: COLORS[ROLES.GERANT] },
    { name: t('roles.ADMINISTRATEUR'), value: parRole[ROLES.ADMINISTRATEUR], color: COLORS[ROLES.ADMINISTRATEUR] },
  ].filter((d) => d.value > 0)

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>{t('dashboard.admin.chartTitle')}</h2>
          <p>{t('dashboard.admin.chartSubtitle')}</p>
        </div>
      </div>

      <div className="donut-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              isAnimationActive={false}
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={82}
              paddingAngle={3}
              stroke="none"
              cornerRadius={4}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v, _n, item) => [v, item?.payload?.name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <b>{total}</b>
          <span>{t('dashboard.admin.usersTotal')}</span>
        </div>
      </div>

      <div className="category-legend">
        {data.map((d) => (
          <div key={d.name}>
            <span className="legend-dot" style={{ background: d.color }} />
            <span>{d.name}</span>
            <b>{d.value}</b>
            <small>{total ? Math.round((d.value / total) * 100) : 0}%</small>
          </div>
        ))}
      </div>
    </section>
  )
}