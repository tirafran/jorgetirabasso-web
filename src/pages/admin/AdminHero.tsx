import { useEffect, useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

export default function AdminHero() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [uploading, setUploading]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('site_config').select('hero_image_url').single().then(({ data }) => {
      if (data) setCurrentUrl((data as { hero_image_url: string | null }).hero_image_url)
    })
  }, [])

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `hero/hero-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('photos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)
      await supabase.from('site_config').upsert({ id: 1, hero_image_url: publicUrl })
      setCurrentUrl(publicUrl)
      toast({ title: 'Imagen actualizada correctamente' })
    } catch {
      toast({ title: 'Error al subir la imagen', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-light tracking-wider mb-2">Imagen Hero</h1>
      <p className="text-sm text-muted-foreground mb-8">Esta imagen ocupa toda la pantalla en la portada del sitio.</p>

      <div
        className="relative aspect-video w-full bg-neutral-100 rounded-lg overflow-hidden mb-6 border border-border cursor-pointer group"
        onClick={() => inputRef.current?.click()}
      >
        {currentUrl ? (
          <>
            <img src={currentUrl} alt="Hero actual" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <Upload className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <p className="text-sm">Click para subir imagen</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
      />

      <Button onClick={() => inputRef.current?.click()} disabled={uploading} variant="outline">
        {uploading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo…</>
          : <><Upload className="h-4 w-4" /> Cambiar imagen</>}
      </Button>
    </div>
  )
}
