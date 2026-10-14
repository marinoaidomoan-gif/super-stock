import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Package, Plus, TriangleAlert } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import { formatNumber } from '@/lib/format'

export default function AlertsPanel({ alerts }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage

  return (
    <section className="panel alerts-panel">
      <div className="panel-head">
        <div>
          <h2>
            <span className="amber-icon">
              <TriangleAlert size={17} />
            </span>
            {t('dashboard.alerts.title')}
            <span className="count-badge amber">{alerts.length}</span>
          </h2>
          <p>{t('dashboard.alerts.subtitle')}</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t('dashboard.alerts.emptyTitle')}
          description={t('dashboard.alerts.emptyDescription')}
        />
      ) : (
        <div className="alert-list">
          {alerts.slice(0, 4).map((p) => (
            <div className="alert-item" key={p.id}>
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <Package size={15} />
              </span>
              <div className="alert-info">
                <b>{p.nom}</b>
                <span>
                  <strong className={p.quantiteStock === 0 ? 'text-red' : 'text-amber'}>
                    {formatNumber(p.quantiteStock, locale)} {t('dashboard.alerts.inStock')}
                  </strong>
                  <small>
                    / {t('dashboard.alerts.threshold')} : {formatNumber(p.seuilAlerte, locale)}
                  </small>
                </span>
              </div>
              <Link
                to="/mouvements"
                className="restock-button"
                aria-label={`${t('dashboard.alerts.restock')} ${p.nom}`}
              >
                <Plus size={15} />
              </Link>
            </div>
          ))}
        </div>
      )}

      <Link to="/alertes" className="alert-footer">
        {t('dashboard.alerts.viewAll')}
        <ArrowRight size={14} />
      </Link>
    </section>
  )
}