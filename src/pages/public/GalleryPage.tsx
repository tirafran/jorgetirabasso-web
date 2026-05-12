import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, X, ChevronLeft, ChevronRight, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Gallery, Photo } from '@/lib/database.types'
import Navbar from '@/components/public/Navbar'

export default function GalleryPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'

  const [gallery, setGallery]             = useState<Gallery | null>(null)
  const [photos, setPhotos]               = useState<Photo[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    supabase.from('galleries').select('*').eq('id', id).single().then(({ data }) => { if (data) setGallery(data as Gallery) })
    supabase.from('photos').select('*').eq('gallery_id', id).order('display_order').then(({ data }) => { if (data) setPhotos(data as Photo[]) })
  }, [id])

  const prev = useCallback(() => setLightboxIndex((i) => i === null ? null : (i - 1 + photos.length) % photos.length), [photos.length])
  const next = useCallback(() => setLightboxIndex((i) => i === null ? null : (i + 1) % photos.length), [photos.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     setLightboxIndex(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, prev, next])

  const galleryName = gallery ? (lang === 'es' ? gallery.name_es : gallery.name_en) : ''
  const galleryDesc = gallery ? (lang === 'es' ? gallery.description_es : gallery.description_en) : ''
  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-6 max-w-7xl mx-auto">
        <div className="py-10">
          <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-3 w-3" />{t('galleries.back')}
          </Link>
          <h1 className="text-3xl font-light tracking-[0.3em] uppercase">{galleryName}</h1>
          {galleryDesc && <p className="mt-3 text-muted-foreground max-w-2xl">{galleryDesc}</p>}
          <p className="mt-2 text-xs text-muted-foreground tracking-widest">{photos.length} {t('galleries.photos')}</p>
        </div>

        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4 pb-20">
          {photos.map((photo, index) => (
            <button key={photo.id} onClick={() => setLightboxIndex(index)} className="group relative aspect-square overflow-hidden bg-muted focus:outline-none">
              <img src={photo.storage_path} alt={lang === 'es' ? photo.title_es : photo.title_en} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-3">
                <p className="text-white text-xs tracking-wider opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1">
                  {lang === 'es' ? photo.title_es : photo.title_en}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && currentPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10">
            <X className="h-6 w-6" />
          </button>
          {photos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-2">
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}
          <div className="flex flex-col md:flex-row items-start gap-6 px-12 py-8 max-h-screen max-w-6xl w-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Foto + pie de foto */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <img src={currentPhoto.storage_path} alt={lang === 'es' ? currentPhoto.title_es : currentPhoto.title_en} className="max-h-[70vh] max-w-full object-contain self-start" />
              <h2 className="text-base font-light tracking-widest uppercase text-white">
                {lang === 'es' ? currentPhoto.title_es : currentPhoto.title_en}
              </h2>
              {currentPhoto.awards && (
                <div className="flex items-start gap-2">
                  <Award className="h-4 w-4 text-white/50 mt-0.5 shrink-0" />
                  <p className="text-xs text-white/60 leading-relaxed">{currentPhoto.awards}</p>
                </div>
              )}
              <p className="text-xs text-white/30 tracking-widest">{lightboxIndex + 1} {t('photo.of')} {photos.length}</p>
              {/* Descripción en mobile */}
              {(lang === 'es' ? currentPhoto.description_es : currentPhoto.description_en) && (
                <p className="md:hidden text-sm text-white/60 leading-relaxed">
                  {lang === 'es' ? currentPhoto.description_es : currentPhoto.description_en}
                </p>
              )}
            </div>
            {/* Descripción en desktop — columna derecha */}
            {(lang === 'es' ? currentPhoto.description_es : currentPhoto.description_en) && (
              <div className="hidden md:flex w-56 shrink-0 self-stretch items-center">
                <p className="text-sm text-white/60 leading-relaxed">
                  {lang === 'es' ? currentPhoto.description_es : currentPhoto.description_en}
                </p>
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-2">
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
