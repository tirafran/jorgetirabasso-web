import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  es: {
    translation: {
      nav: {
        galleries: 'Galerías',
        about: 'Sobre mí',
        backToHome: 'Inicio',
      },
      hero: {
        scrollDown: 'Ver galerías',
      },
      galleries: {
        title: 'Galerías',
        viewGallery: 'Ver galería',
        photos: 'fotos',
        back: 'Volver',
      },
      about: {
        title: 'Sobre el fotógrafo',
        knowMore: 'Conocer más',
        instagram: 'Seguir en Instagram',
      },
      photo: {
        awards: 'Premios',
        of: 'de',
      },
      footer: {
        rights: 'Todos los derechos reservados',
      },
    },
  },
  en: {
    translation: {
      nav: {
        galleries: 'Galleries',
        about: 'About',
        backToHome: 'Home',
      },
      hero: {
        scrollDown: 'View galleries',
      },
      galleries: {
        title: 'Galleries',
        viewGallery: 'View gallery',
        photos: 'photos',
        back: 'Back',
      },
      about: {
        title: 'About the photographer',
        knowMore: 'Know more',
        instagram: 'Follow on Instagram',
      },
      photo: {
        awards: 'Awards',
        of: 'of',
      },
      footer: {
        rights: 'All rights reserved',
      },
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lang') ?? 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})

export default i18n
