import { motion } from 'framer-motion'

// Trois "blobs" émeraude qui flottent lentement en arrière-plan.
// Chaque blob a sa propre trajectoire et sa propre durée pour ne jamais
// se synchroniser visuellement.
const BLOBS = [
  {
    size: 520,
    initial: { x: '-20%', y: '-30%', opacity: 0.35 },
    animate: {
      x: ['-20%', '10%', '-10%', '-20%'],
      y: ['-30%', '10%', '20%', '-30%'],
    },
    duration: 22,
    color: 'bg-emerald-500/30',
  },
  {
    size: 420,
    initial: { x: '60%', y: '40%', opacity: 0.28 },
    animate: {
      x: ['60%', '30%', '70%', '60%'],
      y: ['40%', '70%', '20%', '40%'],
    },
    duration: 28,
    color: 'bg-emerald-400/25',
  },
  {
    size: 360,
    initial: { x: '30%', y: '60%', opacity: 0.22 },
    animate: {
      x: ['30%', '70%', '10%', '30%'],
      y: ['60%', '20%', '80%', '60%'],
    },
    duration: 34,
    color: 'bg-teal-400/25',
  },
]

export default function LoginBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Dégradé de base très léger */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-emerald-50/50 dark:from-emerald-950/40 dark:via-background dark:to-emerald-950/30" />

      {/* Blobs animés */}
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${blob.color}`}
          style={{ width: blob.size, height: blob.size }}
          initial={blob.initial}
          animate={blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Grain subtil pour éviter l'effet "trop lisse" */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}