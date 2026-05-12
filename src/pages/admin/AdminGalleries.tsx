import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Images, Upload, Loader2, GripVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Gallery } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'

const emptyForm = { name_es: '', name_en: '', description_es: '', description_en: '', cover_image_url: '', display_order: 0 }

export default function AdminGalleries() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [open, setOpen]           = useState(false)
  const [editing, setEditing]     = useState<Gallery | null>(null)
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  function load() {
    supabase.from('galleries').select('*').order('display_order').then(({ data }) => {
      if (data) setGalleries(data as Gallery[])
    })
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, display_order: galleries.length })
    setOpen(true)
  }

  function openEdit(g: Gallery) {
    setEditing(g)
    setForm({ name_es: g.name_es, name_en: g.name_en, description_es: g.description_es ?? '', description_en: g.description_en ?? '', cover_image_url: g.cover_image_url ?? '', display_order: g.display_order })
    setOpen(true)
  }

  async function handleCoverUpload(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploadingCover(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `covers/cover-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('photos').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)
      setForm((f) => ({ ...f, cover_image_url: publicUrl }))
    } catch {
      toast({ title: 'Error al subir la imagen', variant: 'destructive' })
    } finally {
      setUploadingCover(false)
    }
  }

  async function handleSave() {
    if (!form.name_es.trim() || !form.name_en.trim()) {
      toast({ title: 'El nombre en ambos idiomas es requerido', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        name_es: form.name_es, name_en: form.name_en,
        description_es: form.description_es || null, description_en: form.description_en || null,
        cover_image_url: form.cover_image_url || null,
        display_order: form.display_order,
      }
      if (editing) {
        await supabase.from('galleries').update(payload).eq('id', editing.id)
        toast({ title: 'Galería actualizada' })
      } else {
        await supabase.from('galleries').insert(payload)
        toast({ title: 'Galería creada' })
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
    const { error } = await supabase.from('galleries').delete().eq('id', id)
    if (error) toast({ title: 'Error al eliminar', variant: 'destructive' })
    else { toast({ title: 'Galería eliminada' }); load() }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wider mb-1">Galerías</h1>
          <p className="text-sm text-muted-foreground">{galleries.length} galería{galleries.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4" /> Nueva galería</Button>
      </div>

      {galleries.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <GripVertical className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay galerías todavía</p>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {galleries.map((g) => (
            <div key={g.id} className="flex items-center gap-4 p-4 bg-background hover:bg-accent/30 transition-colors">
              <div className="w-16 h-12 rounded bg-neutral-100 overflow-hidden shrink-0">
                {g.cover_image_url
                  ? <img src={g.cover_image_url} alt={g.name_es} className="h-full w-full object-cover" />
                  : <div className="h-full w-full flex items-center justify-center text-neutral-300"><Images className="h-5 w-5" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{g.name_es}</p>
                <p className="text-xs text-muted-foreground">{g.name_en}</p>
                {g.description_es && <p className="text-xs text-muted-foreground mt-0.5 truncate">{g.description_es}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link to={`/admin/galleries/${g.id}/photos`}><Images className="h-4 w-4" /> Fotos</Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="sm:hidden">
                  <Link to={`/admin/galleries/${g.id}/photos`}><Images className="h-4 w-4" /></Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar galería?</AlertDialogTitle>
                      <AlertDialogDescription>Se eliminará "{g.name_es}". Las imágenes en Storage no se borran automáticamente.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(g.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
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
          <DialogHeader><DialogTitle>{editing ? 'Editar galería' : 'Nueva galería'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Nombre (ES) *</Label><Input value={form.name_es} onChange={(e) => setForm((f) => ({ ...f, name_es: e.target.value }))} placeholder="Paisajes" /></div>
              <div className="space-y-1.5"><Label>Name (EN) *</Label><Input value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} placeholder="Landscapes" /></div>
            </div>
            <div className="space-y-1.5"><Label>Descripción (ES)</Label><Textarea value={form.description_es} onChange={(e) => setForm((f) => ({ ...f, description_es: e.target.value }))} rows={2} /></div>
            <div className="space-y-1.5"><Label>Description (EN)</Label><Textarea value={form.description_en} onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))} rows={2} /></div>
            <div className="space-y-1.5"><Label>Orden</Label><Input type="number" value={form.display_order} onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))} className="w-24" /></div>
            <div className="space-y-1.5">
              <Label>Imagen de portada</Label>
              <div className="relative aspect-video w-full bg-neutral-100 rounded-md overflow-hidden border border-border cursor-pointer group" onClick={() => coverInputRef.current?.click()}>
                {form.cover_image_url ? (
                  <>
                    <img src={form.cover_image_url} alt="Cover" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Upload className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Upload className="h-5 w-5" /><span className="text-xs">Subir imagen</span>
                  </div>
                )}
                {uploadingCover && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="h-6 w-6 text-white animate-spin" /></div>}
              </div>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = '' }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</> : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
