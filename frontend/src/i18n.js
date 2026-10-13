import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import fr from '@/locales/fr.json'
import en from '@/locales/en.json'

// Garde l'attribut lang de la page à jour (lecteurs d'écran, traduction auto du navigateur).
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    nonExplicitSupportedLngs: true, // "en-US" est traité comme "en"
    interpolation: { escapeValue: false }, // React échappe déjà le contenu
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'superstock-lang',
      caches: ['localStorage'], // la langue choisie est mémorisée
    },
  })

export default i18n