import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, ArrowUpRight, Package } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import MovementTypeBadge from '@/components/common/MovementTypeBadge'
import { formatNumber, formatDateTime } from '@/lib/format'

export default function RecentMovementsTable({ movements }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage

  return (
    <section className="panel movement-panel">
      <div className="panel-head">
        <div>
          <h2>
            {t('dashboard.movements.title')}
            <span className="count-badge">{movements.length}</span>
          </h2>
          <p>{t('dashboard.movements.subtitle')}</p>
        </div>
        <Link className="text-link" to="/mouvements">
          {t('dashboard.movements.viewAll')}
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {movements.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title={t('dashboard.movements.emptyTitle')}
          description={t('dashboard.movements.emptyDescription')}
        />
      ) : (
        <div className="table-scroll">
          <table className="compact-table">
            <thead>
              <tr>
                <th>{t('dashboard.movements.product')}</th>
                <th>{t('dashboard.movements.type')}</th>
                <th>{t('dashboard.movements.quantity')}</th>
                <th>{t('dashboard.movements.date')}</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 5).map((m) => {
                const p = m.product
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="product-cell">
                        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                          <Package size={15} />
                        </span>
                        <span>
                          <b>{p?.nom ?? '—'}</b>
                          <small>{p?.reference ?? ''}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <MovementTypeBadge type={m.type} />
                    </td>
                    <td>
                      <b className={m.type === 'ENTREE' ? 'text-green' : 'text-main'}>
                        {m.type === 'ENTREE' ? '+' : '−'}
                        {formatNumber(m.quantite, locale)}
                      </b>
                      <small className="inline-unit">
                        {t(`units.${p?.unite ?? 'PIECE'}`)}
                      </small>
                    </td>
                    <td className="date-cell">
                      {formatDateTime(m.dateMouvement, locale)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}