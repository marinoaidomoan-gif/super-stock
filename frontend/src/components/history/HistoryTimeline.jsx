import { useTranslation } from 'react-i18next'
import HistoryEventCard from '@/components/history/HistoryEventCard'

function groupByDay(events) {
  const groups = new Map()
  for (const e of events) {
    const key = e.date.toISOString().slice(0, 10) // YYYY-MM-DD
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(e)
  }
  return Array.from(groups.entries()).map(([day, items]) => ({
    day,
    items,
  }))
}

export default function HistoryTimeline({ events }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const groups = groupByDay(events)

  return (
    <div className="space-y-6">
      {groups.map(({ day, items }) => {
        const label = new Date(day + 'T12:00:00').toLocaleDateString(
          locale === 'fr' ? 'fr-FR' : 'en-GB',
          { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
        )
        return (
          <section key={day}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </h3>
            <div className="space-y-3">
              {items.map((e) => (
                <HistoryEventCard key={e.id} event={e} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}