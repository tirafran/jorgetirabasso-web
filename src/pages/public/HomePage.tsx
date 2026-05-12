import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Instagram, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { SiteConfig, Gallery } from '@/lib/database.types'
import Navbar from '@/components/public/Navbar'

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'

  const [config, setConfig]       = useState<SiteConfig | null>(null)
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [heroLoaded, setHeroLoaded] = useState(false)

  useEffect(() => {
    supabase.from('site_config').select('*').single().then(({ data }) => { if (data) setConfig(data as SiteConfig) })
    supabase.from('galleries').select('*').order('display_order').then(({ data }) => { if (data) setGalleries(data as Gallery[]) })
  }, [])

  const bioShort = config ? (lang === 'es' ? config.bio_short_es : config.bio_short_en) : null

  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-screen w-full overflow-hidden">
        <Navbar transparent />
        {config?.hero_image_url ? (
          <img
            src={config.hero_image_url}
            alt="Hero"
            onLoad={() => setHeroLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="absolute inset-0 bg-background" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative flex h-full flex-col items-center justify-center text-white">
          <h1 className="text-5xl font-light tracking-[0.3em] uppercase md:text-7xl">Jorge Tirabasso</h1>
          <p className="mt-4 text-sm tracking-[0.5em] uppercase opacity-80">Fotografía</p>
        </div>
        <a href="#galleries" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white opacity-70 hover:opacity-100 transition-opacity">
          <span className="text-xs tracking-[0.3em] uppercase">{t('hero.scrollDown')}</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </a>
      </section>

      <section id="galleries" className="px-6 py-20 max-w-7xl mx-auto">
        <h2 className="text-2xl font-light tracking-[0.3em] uppercase text-center mb-16">{t('galleries.title')}</h2>
        {galleries.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">—</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {galleries.map((g) => <GalleryCard key={g.id} gallery={g} lang={lang} />)}
          </div>
        )}
      </section>

      <section className="border-t border-border px-6 py-20 max-w-4xl mx-auto text-center">
        <p className="text-lg font-light leading-relaxed text-muted-foreground mb-8">{bioShort ?? ''}</p>
        <Link to="/about" className="inline-block text-sm tracking-[0.3em] uppercase border-b border-foreground pb-0.5 hover:opacity-70 transition-opacity">
          {t('about.knowMore')}
        </Link>
      </section>

      <footer className="border-t border-border py-12 flex flex-col items-center gap-4">
        {config?.instagram_url && (
          <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm tracking-[0.2em] uppercase hover:opacity-70 transition-opacity">
            <Instagram className="h-5 w-5" />
            {t('about.instagram')}
          </a>
        )}
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Jorge Tirabasso. {t('footer.rights')}.</p>
      </footer>
    </div>
  )
}

function GalleryCard({ gallery, lang }: { gallery: Gallery; lang: 'es' | 'en' }) {
  const { t } = useTranslation()
  const name        = lang === 'es' ? gallery.name_es : gallery.name_en
  const description = lang === 'es' ? gallery.description_es : gallery.description_en

  return (
    <Link to={`/gallery/${gallery.id}`} className="group block overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {gallery.cover_image_url ? (
          <img src={gallery.cover_image_url} alt={name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-xs tracking-widest uppercase">Sin imagen</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
      </div>
      <div className="pt-4">
        <h3 className="text-base font-light tracking-widest uppercase">{name}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{description}</p>}
        <span className="mt-3 inline-block text-xs tracking-[0.3em] uppercase border-b border-foreground pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {t('galleries.viewGallery')}
        </span>
      </div>
    </Link>
  )
}
