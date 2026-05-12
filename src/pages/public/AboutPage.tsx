import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Instagram } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { SiteConfig } from '@/lib/database.types'
import Navbar from '@/components/public/Navbar'

export default function AboutPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'
  const [config, setConfig] = useState<SiteConfig | null>(null)

  useEffect(() => {
    supabase.from('site_config').select('*').single().then(({ data }) => { if (data) setConfig(data as SiteConfig) })
  }, [])

  const bioFull = config ? (lang === 'es' ? config.bio_full_es : config.bio_full_en) : ''

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors mb-12">
          <ArrowLeft className="h-3 w-3" />{t('nav.backToHome')}
        </Link>
        {config?.profile_image_url && (
          <div className="mb-12">
            <img src={config.profile_image_url} alt="Jorge Tirabasso" className="w-32 h-32 rounded-full object-cover" />
          </div>
        )}
        <h1 className="text-3xl font-light tracking-[0.3em] uppercase mb-12">{t('about.title')}</h1>
        {bioFull ? (
          <div>
            {bioFull.split('\n').map((paragraph, i) =>
              paragraph.trim()
                ? <p key={i} className="text-base leading-8 text-foreground/80 mb-6 font-light">{paragraph}</p>
                : null
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">—</p>
        )}
        {config?.instagram_url && (
          <div className="mt-16 pt-10 border-t border-border">
            <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-sm tracking-[0.2em] uppercase hover:opacity-70 transition-opacity">
              <Instagram className="h-5 w-5" />{t('about.instagram')}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
