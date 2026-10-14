// src/pages/public/Landing.jsx
//
// Page d'accueil publique (site vitrine) : assemble toutes les sections.
// <MotionConfig reducedMotion="user"> : si l'utilisateur a demandé "moins
// d'animations" dans son système, toutes les animations de mouvement sont
// automatiquement désactivées (accessibilité).
import { MotionConfig } from 'framer-motion'
import AboutContact from '@/components/landing/AboutContact.jsx'
import Features from '@/components/landing/Features.jsx'
import FinalCta from '@/components/landing/FinalCta.jsx'
import Hero from '@/components/landing/Hero.jsx'
import HowItWorks from '@/components/landing/HowItWorks.jsx'
import LandingFooter from '@/components/landing/LandingFooter.jsx'
import LandingNavbar from '@/components/landing/LandingNavbar.jsx'
import { ScrollProgress } from '@/components/landing/motion.jsx'
import Stats from '@/components/landing/Stats.jsx'

export default function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-background text-foreground">
        <ScrollProgress />
        <LandingNavbar />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <Stats />
          <AboutContact />
          <FinalCta />
        </main>
        <LandingFooter />
      </div>
    </MotionConfig>
  )
}