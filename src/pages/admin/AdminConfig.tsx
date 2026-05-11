import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { SiteConfig } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

export default function AdminConfig() {
  const [config, setConfig] = useState<Partial<SiteConfig>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    supabase.from('site_config').select('*').single().then(({ data }) => {
      if (data) setConfig(data as SiteConfig)
      setLoading(false)
    })
  }, [])

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
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-light tracking-wider mb-2">Configuración del sitio</h1>
      <p className="text-sm text-muted-foreground mb-8">Textos biográficos e Instagram</p>

      <div className="space-y-6">
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
