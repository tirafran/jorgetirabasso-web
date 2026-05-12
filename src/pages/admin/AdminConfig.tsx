import { useEffect, useRef, useState } from 'react'
import { Loader2, Save, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { SiteConfig } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

export default function AdminConfig() {
  const [config, setConfig]       = useState<Partial<SiteConfig>>({})
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('site_config').select('*').single().then(({ data }) => {
      if (data) setConfig(data as SiteConfig)
      setLoading(false)
    })
  }, [])

  async function handleProfilePhoto(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploadingPhoto(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `profile/profile-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('photos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)
      await supabase.from('site_config').upsert({ id: 1, profile_image_url: publicUrl })
      setConfig((c) => ({ ...c, profile_image_url: publicUrl }))
      toast({ title: 'Foto de perfil actualizada' })
    } catch {
      toast({ title: 'Error al subir la foto', variant: 'destructive' })
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        bio_short_es:  config.bio_short_es  ?? null,
        bio_short_en:  config.bio_short_en  ?? null,
        bio_full_es:   config.bio_full_es   ?? null,
        bio_full_en:   config.bio_full_en   ?? null,
        instagram_url: config.instagram_url ?? null,
      }
      if (config.id) {
        await supabase.from('site_config').update(payload).eq('id', config.id)
      } else {
        await supabase.from('site_config').insert({ id: 1, ...payload })
      }
      toast({ title: 'Configuración guardada' })
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="p-8 flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
    </div>
  )

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <h1 className="text-2xl font-light tracking-wider mb-2">Configuración del sitio</h1>
      <p className="text-sm text-muted-foreground mb-8">Textos biográficos, foto de perfil e Instagram</p>

      <div className="space-y-8">

        {/* Foto de perfil */}
        <div>
          <h2 className="text-sm font-medium tracking-wider uppercase mb-3 text-muted-foreground">Foto de perfil</h2>
          <div className="flex items-end gap-5">
            <div
              className="relative w-28 h-28 rounded-full overflow-hidden bg-muted border border-border cursor-pointer group shrink-0"
              onClick={() => photoInputRef.current?.click()}
            >
              {config.profile_image_url ? (
                <>
                  <img src={config.profile_image_url} alt="Foto de perfil" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                  <Upload className="h-5 w-5" />
                </div>
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProfilePhoto(f); e.target.value = '' }}
            />
            <Button variant="outline" size="sm" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}>
              {uploadingPhoto ? <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo…</> : <><Upload className="h-4 w-4" /> Cambiar foto</>}
            </Button>
          </div>
        </div>

        {/* Biografía breve */}
        <div>
          <h2 className="text-sm font-medium tracking-wider uppercase mb-3 text-muted-foreground">Biografía breve (portada)</h2>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Español</Label>
              <Textarea value={config.bio_short_es ?? ''} onChange={(e) => setConfig((c) => ({ ...c, bio_short_es: e.target.value }))} rows={3} placeholder="Breve descripción del fotógrafo en español…" />
            </div>
            <div className="space-y-1.5">
              <Label>English</Label>
              <Textarea value={config.bio_short_en ?? ''} onChange={(e) => setConfig((c) => ({ ...c, bio_short_en: e.target.value }))} rows={3} placeholder="Short photographer bio in English…" />
            </div>
          </div>
        </div>

        {/* Biografía completa */}
        <div>
          <h2 className="text-sm font-medium tracking-wider uppercase mb-3 text-muted-foreground">Biografía completa (página /about)</h2>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Español</Label>
              <Textarea value={config.bio_full_es ?? ''} onChange={(e) => setConfig((c) => ({ ...c, bio_full_es: e.target.value }))} rows={8} placeholder="Biografía extendida en español…" />
            </div>
            <div className="space-y-1.5">
              <Label>English</Label>
              <Textarea value={config.bio_full_en ?? ''} onChange={(e) => setConfig((c) => ({ ...c, bio_full_en: e.target.value }))} rows={8} placeholder="Extended biography in English…" />
            </div>
          </div>
        </div>

        {/* Instagram */}
        <div>
          <h2 className="text-sm font-medium tracking-wider uppercase mb-3 text-muted-foreground">Instagram</h2>
          <div className="space-y-1.5">
            <Label>URL del perfil</Label>
            <Input value={config.instagram_url ?? ''} onChange={(e) => setConfig((c) => ({ ...c, instagram_url: e.target.value }))} placeholder="https://www.instagram.com/jorgetirabasso" />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="mt-2">
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</>
            : <><Save className="h-4 w-4" /> Guardar cambios</>}
        </Button>
      </div>
    </div>
  )
}
