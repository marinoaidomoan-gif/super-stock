// src/components/landing/motion.jsx
//
// Trois petits composants d'animation réutilisés par toute la landing page :
//  - Reveal          : fait apparaître un bloc quand il entre à l'écran
//  - ScrollProgress  : barre de progression de lecture en haut de la page
//  - AnimatedCounter : nombre qui s'incrémente de 0 jusqu'à sa valeur
import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion'

// ----- Reveal -----
// Utilisation : <Reveal delay={0.1}>...contenu...</Reveal>
//  - whileInView : l'animation se joue quand le bloc devient visible
//  - once: true  : elle ne se rejoue pas à chaque passage
//  - margin -80px : elle démarre un peu avant que le bloc soit entièrement visible
// Si l'utilisateur demande "moins d'animations", <MotionConfig reducedMotion>
// (dans Landing.jsx) supprime le glissement et ne garde qu'un fondu.
export function Reveal({ children, delay = 0, y = 28, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ----- ScrollProgress -----
// useScroll donne l'avancement du défilement (0 en haut, 1 en bas) ; useSpring
// le lisse pour que la barre ne saccade pas.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const largeur = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: largeur }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-emerald-500"
    />
  )
}

// ----- AnimatedCounter -----
// Compte de 0 à "valeur" quand le nombre devient visible.
// tabular-nums : tous les chiffres ont la même largeur, donc le nombre ne
// "tremble" pas pendant le comptage.
export function AnimatedCounter({ valeur, suffixe = '' }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-50px' })
  const reduit = useReducedMotion()
  const [affiche, setAffiche] = useState(0)

  useEffect(() => {
    if (!visible) return undefined

    // Animations réduites : on affiche directement la valeur finale.
    if (reduit) {
      setAffiche(valeur)
      return undefined
    }

    const controle = animate(0, valeur, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setAffiche(Math.round(v)),
    })
    return () => controle.stop()
  }, [visible, valeur, reduit])

  return (
    <span ref={ref} className="tabular-nums">
      {affiche}
      {suffixe}
    </span>
  )
}