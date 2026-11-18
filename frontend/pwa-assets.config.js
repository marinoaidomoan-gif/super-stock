// pwa-assets.config.js
//
// Configuration du générateur d'icônes. À partir d'UN SEUL fichier (le logo
// SVG), il fabrique toutes les images PNG dont une PWA a besoin :
//   - pwa-64x64.png, pwa-192x192.png, pwa-512x512.png : icônes "normales"
//   - maskable-icon-512x512.png : icône "maskable" pour Android (qui la
//     découpe en cercle, en goutte, etc., selon le téléphone)
//   - apple-touch-icon-180x180.png : icône d'écran d'accueil sur iPhone/iPad
//   - favicon.ico : icône pour les vieux navigateurs
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    // On part du préréglage standard recommandé ("minimal 2023")...
    ...minimal2023Preset,
    // ...mais on supprime les marges qu'il ajoute autour du logo pour les icônes
    // "maskable" et Apple : notre logo est DÉJÀ un carré plein avec ses marges
    // intégrées, une marge de plus le rendrait minuscule.
    maskable: { ...minimal2023Preset.maskable, padding: 0 },
    apple: { ...minimal2023Preset.apple, padding: 0 },
  },
  // Image source.
  images: ['public/logo.svg'],
})