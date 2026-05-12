import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, Upload, Loader2, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Recognition } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'

const emptyForm = { title_es: '', title_en: '', subtitle_es: '', subtitle_en: '', photo_url: '', display_order: 0 }

export default function AdminRecognitions() {
  const [items, setItems]         = useState<Recognition[]>([])
  const [open, setOpen]           = useState(false)
  const [editing, setEditing]     = useState<Recognition | null>(null)
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  function load() {
    supabase.from('recognitions').select('*').order('display_order').then(({ data }) => {
      if (data) setItems(data as Recognition[])
    })
  }

  useEffect(() => { load() }, [])

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

  async function handlePhotoUpload(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploadingPhoto(true)
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
      setUploadingPhoto(false)
    }
  }

  async function handleSave() {
    if (!form.title_es.trim() || !form.title_en.trim()) {
      toast({ title: 'El título en ambos idiomas es requerido', variant: 'destructive' })
      return
    }
    setSaving(true)
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
      load()
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('recognitions').delete().eq('id', id)
    if (error) toast({ title: 'Error al eliminar', variant: 'destructive' })
    else { toast({ title: 'Reconocimiento eliminado' }); load() }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wider mb-1">Reconocimientos</h1>
          <p className="text-sm text-muted-foreground">{items.length} reconocimiento{items.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4" /> Nuevo</Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay reconocimientos todavía</p>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {items.map((r) => (
            <div key={r.id} className="flex items-center gap-4 p-4 bg-background hover:bg-accent/30 transition-colors">
              <div className="w-14 h-14 rounded bg-muted overflow-hidden shrink-0">
                {r.photo_url
                  ? <img src={r.photo_url} alt={r.title_es} className="h-full w-full object-cover" />
                  : <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Trophy className="h-5 w-5" /></div>}
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
                      <AlertDialogAction onClick={() => handleDelete(r.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editar reconocimiento' : 'Nuevo reconocimiento'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {/* Foto */}
            <div className="space-y-1.5">
              <Label>Foto</Label>
              <div
                className="relative w-24 h-24 rounded bg-muted border border-border overflow-hidden cursor-pointer group"
                onClick={() => photoInputRef.current?.click()}
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
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); e.target.value = '' }}
              />
            </div>
            {/* Títulos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Título (ES) *</Label><Input value={form.title_es} onChange={(e) => setForm((f) => ({ ...f, title_es: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Title (EN) *</Label><Input value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} /></div>
            </div>
            {/* Subtítulos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Subtítulo (ES)</Label><Input value={form.subtitle_es} onChange={(e) => setForm((f) => ({ ...f, subtitle_es: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Subtitle (EN)</Label><Input value={form.subtitle_en} onChange={(e) => setForm((f) => ({ ...f, subtitle_en: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Orden</Label><Input type="number" value={form.display_order} onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))} className="w-24" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || uploadingPhoto}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</> : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
