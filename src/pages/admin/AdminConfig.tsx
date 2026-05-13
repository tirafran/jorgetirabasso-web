import { useEffect, useRef, useState } from 'react'
import { Loader2, Save, Upload, Plus, Pencil, Trash2, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Recognition, SiteConfig } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'

const emptyForm = { title_es: '', title_en: '', subtitle_es: '', subtitle_en: '', photo_url: '', display_order: 0 }

export default function AdminConfig() {
  const [config, setConfig]       = useState<Partial<SiteConfig>>({})
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [items, setItems]         = useState<Recognition[]>([])
  const [open, setOpen]           = useState(false)
  const [editing, setEditing]     = useState<Recognition | null>(null)
  const [form, setForm]           = useState(emptyForm)
  const [savingRec, setSavingRec] = useState(false)
  const [uploadingRec, setUploadingRec] = useState(false)
  const recPhotoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('site_config').select('*').single().then(({ data }) => {
      if (data) setConfig(data as SiteConfig)
      setLoading(false)
    })
    loadRecognitions()
  }, [])

  function loadRecognitions() {
    supabase.from('recognitions').select('*').order('display_order').then(({ data }) => {
      if (data) setItems(data as Recognition[])
    })
  }

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

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, display_order: items.length })
    setOpen(true)
  }

  function openEdit(r: Recognition) {
    setEditing(r)
    setForm({
      title_es: r.title_es, title_en: r.title_en,
      subtitle_es: r.subtitle_es ?? '', subtitle_en: r.subtitle_en ?? '',
      photo_url: r.photo_url ?? '', display_order: r.display_order,
    })
    setOpen(true)
  }

  async function handleRecPhoto(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploadingRec(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `recognitions/rec-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)
      setForm((f) => ({ ...f, photo_url: publicUrl }))
    } catch {
      toast({ title: 'Error al subir la imagen', variant: 'destructive' })
    } finally {
      setUploadingRec(false)
    }
  }

  async function handleSaveRec() {
    if (!form.title_es.trim() || !form.title_en.trim()) {
      toast({ title: 'El título en ambos idiomas es requerido', variant: 'destructive' })
      return
    }
    setSavingRec(true)
    try {
      const payload = {
        title_es: form.title_es, title_en: form.title_en,
        subtitle_es: form.subtitle_es || null, subtitle_en: form.subtitle_en || null,
        photo_url: form.photo_url || null, display_order: form.display_order,
      }
      if (editing) {
        await supabase.from('recognitions').update(payload).eq('id', editing.id)
        toast({ title: 'Reconocimiento actualizado' })
      } else {
        await supabase.from('recognitions').insert(payload)
        toast({ title: 'Reconocimiento agregado' })
      }
      setOpen(false)
      loadRecognitions()
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' })
    } finally {
      setSavingRec(false)
    }
  }

  async function handleDeleteRec(id: string) {
    const { error } = await supabase.from('recognitions').delete().eq('id', id)
    if (error) toast({ title: 'Error al eliminar', variant: 'destructive' })
    else { toast({ title: 'Reconocimiento eliminado' }); loadRecognitions() }
  }

  if (loading) return (
    <div className="p-8 flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
    </div>
  )

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <h1 className="text-2xl font-light tracking-wider mb-2">Sobre mí</h1>
      <p className="text-sm text-muted-foreground mb-8">Textos biográficos, foto de perfil, Instagram y reconocimientos</p>

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

        {/* Reconocimientos */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium tracking-wider uppercase text-muted-foreground">Reconocimientos</h2>
            <Button onClick={openCreate} size="sm" variant="outline"><Plus className="h-4 w-4" /> Nuevo</Button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay reconocimientos todavía</p>
            </div>
          ) : (
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
              {items.map((r) => (
                <div key={r.id} className="flex items-center gap-4 p-4 bg-background hover:bg-accent/30 transition-colors">
                  <div className="w-12 h-12 rounded bg-muted overflow-hidden shrink-0">
                    {r.photo_url
                      ? <img src={r.photo_url} alt={r.title_es} className="h-full w-full object-cover" />
                      : <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Trophy className="h-4 w-4" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{r.title_es}</p>
                    {r.subtitle_es && <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.subtitle_es}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar reconocimiento?</AlertDialogTitle>
                          <AlertDialogDescription>Se eliminará "{r.title_es}".</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteRec(r.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editar reconocimiento' : 'Nuevo reconocimiento'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Foto</Label>
              <div
                className="relative w-24 h-24 rounded bg-muted border border-border overflow-hidden cursor-pointer group"
                onClick={() => recPhotoRef.current?.click()}
              >
                {form.photo_url ? (
                  <>
                    <img src={form.photo_url} alt="Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Upload className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <Upload className="h-5 w-5" />
                  </div>
                )}
                {uploadingRec && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                )}
              </div>
              <input
                ref={recPhotoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRecPhoto(f); e.target.value = '' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Título (ES) *</Label><Input value={form.title_es} onChange={(e) => setForm((f) => ({ ...f, title_es: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Title (EN) *</Label><Input value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Subtítulo (ES)</Label><Input value={form.subtitle_es} onChange={(e) => setForm((f) => ({ ...f, subtitle_es: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Subtitle (EN)</Label><Input value={form.subtitle_en} onChange={(e) => setForm((f) => ({ ...f, subtitle_en: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Orden</Label><Input type="number" value={form.display_order} onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))} className="w-24" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveRec} disabled={savingRec || uploadingRec}>
              {savingRec ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</> : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
