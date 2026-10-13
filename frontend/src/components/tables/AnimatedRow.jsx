import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function AnimatedRow({ index = 0, className, ...props }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      // Le délai plafonne à 10 lignes pour ne pas faire attendre sur les longues listes.
      transition={{ duration: 0.2, delay: Math.min(index, 10) * 0.03 }}
      className={cn('border-b transition-colors hover:bg-muted/50', className)}
      {...props}
    />
  )
}