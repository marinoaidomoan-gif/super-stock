import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // ===== PWA =====
    // Ce plugin, au moment du "npm run build", fabrique 2 choses :
    //  1) le MANIFESTE (manifest.webmanifest) : la fiche d'identité de
    //     l'application (nom, couleurs, icônes) qui permet de l'INSTALLER ;
    //  2) le SERVICE WORKER (sw.js) : un petit programme qui met l'application
    //     en cache pour qu'elle s'ouvre instantanément, même sans connexion.
    VitePWA({
      // "prompt" : quand une nouvelle version est publiée, on NE recharge PAS
      // l'application de force. On affichera un message "Nouvelle version
      // disponible" et l'utilisateur choisira quand actualiser (étape 2).
      // (Un rechargement surprise pourrait lui faire perdre une saisie en cours,
      // par exemple un comptage d'inventaire.)
      registerType: 'prompt',

      // Fichiers du dossier public/ à garder aussi en cache.
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'apple-touch-icon-180x180.png',
        'logo.svg',
      ],

      // ----- Manifeste : l'identité de l'application -----
      manifest: {
        id: '/',
        name: 'SuperStock — Gestion de stock',
        short_name: 'SuperStock', // nom court sous l'icône du téléphone
        description:
          'Suivez vos produits, mouvements et inventaires en temps réel.',
        lang: 'fr',

        // Adresse ouverte au lancement de l'application installée.
        // /dashboard : un utilisateur connecté arrive directement sur son tableau
        // de bord, et sinon ProtectedRoute le renvoie vers la page de connexion.
        start_url: '/dashboard',
        scope: '/',

        // "standalone" : l'application s'ouvre dans sa propre fenêtre, SANS la
        // barre d'adresse du navigateur, comme une vraie application.
        display: 'standalone',

        // Couleur de la barre d'état du téléphone (émeraude de la marque) et
        // couleur de l'écran de démarrage.
        theme_color: '#10b981',
        background_color: '#ffffff',

        categories: ['business', 'productivity'],

        // Icônes générées par "npm run generate-pwa-assets".
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            // "maskable" : Android peut découper cette icône (cercle, goutte...).
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],

        // Raccourcis (appui long sur l'icône sur Android, clic droit sur la
        // barre des tâches sous Windows).
        shortcuts: [
          { name: 'Tableau de bord', url: '/dashboard' },
          { name: 'Mouvements', url: '/mouvements' },
          { name: 'Alertes', url: '/alertes' },
        ],
      },

      // ----- Service worker : ce qu'on met en cache -----
      workbox: {
        // "Précache" : tous les fichiers de l'application (pages, scripts,
        // styles, images, polices) sont téléchargés une fois pour toutes à
        // l'installation, puis servis depuis le cache.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],

        // Les gros fichiers (Recharts, Framer Motion...) dépassent la limite par
        // défaut de 2 Mo : sans cette ligne ils ne seraient PAS mis en cache.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        // Application "monopage" : n'importe quelle adresse de l'application
        // (/produits, /inventaire/3...) affiche index.html, même hors ligne.
        navigateFallback: 'index.html',
        // ...sauf les adresses de l'API, si elle était un jour sur le même domaine.
        navigateFallbackDenylist: [/^\/api\//],

        // Supprime automatiquement les anciens caches lors d'une mise à jour.
        cleanupOutdatedCaches: true,

        // IMPORTANT : on ne définit AUCUN cache pour l'API. Les données (stock,
        // mouvements, inventaires) viennent toujours du serveur. Afficher des
        // quantités périmées sans le dire serait dangereux pour un stock.
      },

      // Le service worker est désactivé avec "npm run dev" (il gênerait le
      // développement). On le teste avec "npm run build" puis "npm run preview".
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})