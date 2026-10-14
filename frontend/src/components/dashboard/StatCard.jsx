import { motion } from 'framer-motion'
import { TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StatCard({
  label,
  value,
  suffix,
  sub,
  tag,
  icon: Icon,
  color = 'green',
  warn = false,
  index = 0,
}) {
  return (
    <motion.div
      className={cn('stat-card', color)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <div className="stat-top">
        <span>{label}</span>
        <span className={cn('stat-icon', color)}>
          <Icon size={18} />
        </span>
      </div>
      <div className="stat-number">
        {value}
        {suffix && <small>{suffix}</small>}
      </div>
      <div className="stat-bottom">
        <span className={cn('stat-tag', warn && 'warn')}>
          {warn ? <TriangleAlert size={11} /> : <span className="tiny-dot" />}
          {tag}
        </span>
        <span className="stat-description">{sub}</span>
      </div>
    </motion.div>
  )
}