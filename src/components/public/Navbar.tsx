import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '@/lib/i18n'
import { Button } from '@/components/ui/button'

export default function Navbar({ transparent = false }: { transparent?: boolean }) {
  const { t } = useTranslation()

  function toggleLang() {
    const next = i18n.language === 'es' ? 'en' : 'es'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 transition-colors ${
        transparent ? 'bg-transparent' : 'bg-background/90 backdrop-blur-sm border-b border-border'
      }`}
    >
      <Link to="/" className={`text-lg font-light tracking-[0.2em] uppercase ${transparent ? 'text-white' : 'text-foreground'}`}>
        Jorge Tirabasso
      </Link>
      <div className="flex items-center gap-4">
        <Link
          to="/#galleries"
          className={`text-sm tracking-wider uppercase hover:opacity-70 transition-opacity ${transparent ? 'text-white' : 'text-foreground'}`}
        >
          {t('nav.galleries')}
        </Link>
        <Link
          to="/about"
          className={`text-sm tracking-wider uppercase hover:opacity-70 transition-opacity ${transparent ? 'text-white' : 'text-foreground'}`}
        >
          {t('nav.about')}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLang}
          className={`text-xs font-mono tracking-widest ${transparent ? 'text-white hover:bg-white/20' : ''}`}
        >
          {i18n.language === 'es' ? 'EN' : 'ES'}
        </Button>
      </div>
    </nav>
  )
}
