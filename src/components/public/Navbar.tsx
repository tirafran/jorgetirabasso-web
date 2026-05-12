import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import i18n from '@/lib/i18n'
import { Button } from '@/components/ui/button'

export default function Navbar({ transparent = false }: { transparent?: boolean }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  function toggleLang() {
    const next = i18n.language === 'es' ? 'en' : 'es'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  const textCls = transparent ? 'text-white' : 'text-foreground'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-colors ${transparent ? 'bg-transparent' : 'bg-background/90 backdrop-blur-sm border-b border-border'}`}>
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className={`text-lg font-light tracking-[0.2em] uppercase ${textCls}`}>
          Jorge Tirabasso
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-4">
          <Link to="/#galleries" className={`text-sm tracking-wider uppercase hover:opacity-70 transition-opacity ${textCls}`}>{t('nav.galleries')}</Link>
          <Link to="/about" className={`text-sm tracking-wider uppercase hover:opacity-70 transition-opacity ${textCls}`}>{t('nav.about')}</Link>
          <Button variant="ghost" size="sm" onClick={toggleLang} className={`text-xs font-mono tracking-widest ${transparent ? 'text-white hover:bg-white/20' : ''}`}>
            {i18n.language === 'es' ? 'EN' : 'ES'}
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden items-center gap-1">
          <Button variant="ghost" size="sm" onClick={toggleLang} className={`text-xs font-mono tracking-widest ${transparent ? 'text-white hover:bg-white/20' : ''}`}>
            {i18n.language === 'es' ? 'EN' : 'ES'}
          </Button>
          <button onClick={() => setOpen((v) => !v)} className={`p-2 ${textCls}`} aria-label="Menú">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className={`sm:hidden border-t flex flex-col gap-1 px-6 py-4 ${transparent ? 'bg-black/80 border-white/10' : 'bg-background border-border'}`}>
          <Link to="/#galleries" onClick={() => setOpen(false)} className={`py-2 text-sm tracking-wider uppercase hover:opacity-70 transition-opacity ${textCls}`}>{t('nav.galleries')}</Link>
          <Link to="/about" onClick={() => setOpen(false)} className={`py-2 text-sm tracking-wider uppercase hover:opacity-70 transition-opacity ${textCls}`}>{t('nav.about')}</Link>
        </div>
      )}
    </nav>
  )
}
