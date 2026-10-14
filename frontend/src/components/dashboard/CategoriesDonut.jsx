import { useTranslation } from 'react-i18next'
import { Package } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function CategoriesDonut({ categories, totalProducts }) {
  const { t } = useTranslation()

  // Si aucune catégorie n'a de produits, on affiche un état vide
  const hasData = categories.length > 0

  return (
    <section className="panel categories-panel">
      <div className="panel-head">
        <div>
          <h2>{t('dashboard.charts.categoriesTitle')}</h2>
          <p>{t('dashboard.charts.categoriesSubtitle')}</p>
        </div>
        <span className="subtle-icon">
          <Package size={18} />
        </span>
      </div>

      <div className="donut-chart">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                isAnimationActive={false}
                data={categories}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={82}
                paddingAngle={3}
                stroke="none"
                cornerRadius={4}
              >
                {categories.map((c) => (
                  <Cell key={c.id} fill={c.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v, _n, item) => [
                  `${v} ${t('dashboard.charts.productsLabel').toLowerCase()}`,
                  item?.payload?.name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : null}

        <div className="donut-center">
          <b>{totalProducts}</b>
          <span>{t('dashboard.charts.totalProducts')}</span>
        </div>
      </div>

      {hasData && (
        <div className="category-legend">
          {categories.map((c) => (
            <div key={c.id}>
              <span className="legend-dot" style={{ background: c.color }} />
              <span>{c.name}</span>
              <b>{c.value}</b>
              <small>
                {totalProducts ? Math.round((c.value / totalProducts) * 100) : 0}%
              </small>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}