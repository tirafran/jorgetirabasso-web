import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Instagram } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import { supabase } from '@/lib/supabase'
import type { SiteConfig, Recognition } from '@/lib/database.types'
import Navbar from '@/components/public/Navbar'

export default function AboutPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'
  const [config, setConfig]               = useState<SiteConfig | null>(null)
  const [recognitions, setRecognitions]   = useState<Recognition[]>([])

  useEffect(() => {
    supabase.from('site_config').select('*').single().then(({ data }) => { if (data) setConfig(data as SiteConfig) })
    supabase.from('recognitions').select('*').order('display_order').then(({ data }) => { if (data) setRecognitions(data as Recognition[]) })
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
          <div className="prose prose-invert prose-base max-w-none prose-p:font-light prose-p:leading-8 prose-p:text-foreground/80 prose-headings:font-light prose-headings:tracking-wider prose-strong:text-foreground prose-a:text-foreground">
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>{bioFull}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">—</p>
        )}

        {recognitions.length > 0 && (
          <div className="mt-20">
            <h2 className="text-xl font-light tracking-[0.3em] uppercase mb-10">{t('about.recognitions')}</h2>
            <div className="space-y-8">
              {recognitions.map((r) => (
                <div key={r.id} className="flex items-center gap-6">
                  {r.photo_url && (
                    <img src={r.photo_url} alt={lang === 'es' ? r.title_es : r.title_en} className="w-20 h-20 object-cover rounded shrink-0" />
                  )}
                  <div>
                    <p className="font-light text-base text-foreground">{lang === 'es' ? r.title_es : r.title_en}</p>
                    {(lang === 'es' ? r.subtitle_es : r.subtitle_en) && (
                      <p className="text-sm text-muted-foreground mt-1">{lang === 'es' ? r.subtitle_es : r.subtitle_en}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
