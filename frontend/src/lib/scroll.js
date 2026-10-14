// src/lib/scroll.js
//
// Défilement doux vers une section de la page (utilisé par le menu de la
// landing page). Si l'utilisateur a demandé "moins d'animations" dans son
// système, on saute directement à la section, sans effet.

function animationsReduites() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Fait défiler la page jusqu'à l'élément dont l'id est donné.
// Les sections portent la classe "scroll-mt-20" pour ne pas passer sous la
// barre de navigation fixe.
export function allerA(id) {
  const element = document.getElementById(id)
  if (!element) return
  element.scrollIntoView({
    behavior: animationsReduites() ? 'auto' : 'smooth',
    block: 'start',
  })
}

export function remonterEnHaut() {
  window.scrollTo({ top: 0, behavior: animationsReduites() ? 'auto' : 'smooth' })
}