import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, Upload, Loader2, Award, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Gallery, Photo } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'

const emptyForm = { title_es: '', title_en: '', description_es: '', description_en: '', awards: '', display_order: 0 }

export default function AdminPhotos() {
  const { id: galleryId } = useParams<{ id: string }>()
  const [gallery, setGallery]           = useState<Gallery | null>(null)
  const [photos, setPhotos]             = useState<Photo[]>([])
  const [open, setOpen]                 = useState(false)
  const [editing, setEditing]           = useState<Photo | null>(null)
  const [form, setForm]                 = useState(emptyForm)
  const [photoFile, setPhotoFile]       = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving]             = useState(false)
  const [uploadingMultiple, setUploadingMultiple] = useState(false)
  const fileInputRef  = useRef<HTMLInputElement>(null)
  const multiInputRef = useRef<HTMLInputElement>(null)

  function load() {
    if (!galleryId) return
    supabase.from('photos').select('*').eq('gallery_id', galleryId).order('display_order').then(({ data }) => {
      if (data) setPhotos(data as Photo[])
    })
  }

  useEffect(() => {
    if (!galleryId) return
    supabase.from('galleries').select('*').eq('id', galleryId).single().then(({ data }) => {
      if (data) setGallery(data as Gallery)
    })
    load()
  }, [galleryId])

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm, display_order: photos.length })
    setPhotoFile(null)
    setPhotoPreview(null)
    setOpen(true)
  }

  function openEdit(p: Photo) {
    setEditing(p)
    setForm({ title_es: p.title_es, title_en: p.title_en, description_es: p.description_es ?? '', description_en: p.description_en ?? '', awards: p.awards ?? '', display_order: p.display_order })
    setPhotoFile(null)
    setPhotoPreview(p.storage_path)
    setOpen(true)
  }

  async function uploadToStorage(file: File, path: string): Promise<string> {
    const { error } = await supabase.storage.from('photos').upload(path, file)
    if (error) throw error
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
  }

  async function handleSave() {
    if (!form.title_es.trim() || !form.title_en.trim()) {
      toast({ title: 'El título en ambos idiomas es requerido', variant: 'destructive' })
      return
    }
    if (!editing && !photoFile) {
      toast({ title: 'Seleccioná una imagen para subir', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      let storagePath = editing?.storage_path ?? ''
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        storagePath = await uploadToStorage(photoFile, `galleries/${galleryId}/${Date.now()}.${ext}`)
      }
      const payload = {
        gallery_id: galleryId!, title_es: form.title_es, title_en: form.title_en,
        description_es: form.description_es || null, description_en: form.description_en || null,
        awards: form.awards || null, storage_path: storagePath, display_order: form.display_order,
      }
      if (editing) {
        await supabase.from('photos').update(payload).eq('id', editing.id)
        toast({ title: 'Foto actualizada' })
      } else {
        await supabase.from('photos').insert(payload)
        toast({ title: 'Foto agregada' })
      }
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleBulkUpload(fileArray: File[]) {
    const images = fileArray.filter(f => f.type.startsWith('image/'))
    if (images.length === 0) return
    setUploadingMultiple(true)
    let count = 0
    let errors = 0
    const baseOrder = photos.length
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      try {
        const ext  = file.name.split('.').pop()
        const path = `galleries/${galleryId}/${Date.now()}-${i}.${ext}`
        const url  = await uploadToStorage(file, path)
        const name = file.name.replace(/\.[^.]+$/, '')
        const { error } = await supabase.from('photos').insert({
          gallery_id: galleryId!, title_es: name, title_en: name,
          storage_path: url, display_order: baseOrder + count,
        })
        if (error) throw error
        count++
      } catch (err) {
        errors++
        console.error('Error subiendo foto:', err)
      }
    }
    setUploadingMultiple(false)
    if (count > 0) {
      toast({ title: `${count} foto${count !== 1 ? 's' : ''} subida${count !== 1 ? 's' : ''} correctamente` })
      load()
    }
    if (errors > 0) {
      toast({ title: `${errors} foto${errors !== 1 ? 's' : ''} no se pudo${errors !== 1 ? 'ieron' : ''} subir`, variant: 'destructive' })
    }
  }

  async function handleSetCover(p: Photo) {
    const { error } = await supabase.from('galleries').update({ cover_image_url: p.storage_path }).eq('id', galleryId!)
    if (error) {
      toast({ title: 'Error al establecer portada', variant: 'destructive' })
    } else {
      setGallery((g) => g ? { ...g, cover_image_url: p.storage_path } : g)
      toast({ title: 'Imagen de portada actualizada' })
    }
  }

  async function handleDelete(p: Photo) {
    const { error } = await supabase.from('photos').delete().eq('id', p.id)
    if (error) toast({ title: 'Error al eliminar', variant: 'destructive' })
    else { toast({ title: 'Foto eliminada' }); load() }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2 text-muted-foreground">
            <Link to="/admin/galleries"><ArrowLeft className="h-4 w-4" /> Galerías</Link>
          </Button>
          <h1 className="text-2xl font-light tracking-wider mb-1">{gallery?.name_es ?? '…'}</h1>
          <p className="text-sm text-muted-foreground">{photos.length} foto{photos.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => multiInputRef.current?.click()} disabled={uploadingMultiple}>
            {uploadingMultiple ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploadingMultiple ? 'Subiendo…' : 'Subida múltiple'}
          </Button>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Agregar foto</Button>
        </div>
      </div>

      <input ref={multiInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const arr = Array.from(e.target.files ?? []); e.target.value = ''; if (arr.length) handleBulkUpload(arr) }} />

      {photos.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-lg py-20 flex flex-col items-center gap-4 text-muted-foreground cursor-pointer hover:border-foreground/30 transition-colors" onClick={() => multiInputRef.current?.click()}>
          <Upload className="h-10 w-10 opacity-30" />
          <p className="text-sm">Arrastrá imágenes o hacé click para subir</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {photos.map((p) => {
            const isCover = p.storage_path === gallery?.cover_image_url
            return (
            <div key={p.id} className="group relative">
              <div className="aspect-square overflow-hidden rounded-md bg-muted">
                <img src={p.storage_path} alt={p.title_es} className="h-full w-full object-cover" />
              </div>
              {isCover && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] text-white tracking-wider uppercase">Portada</span>
                </div>
              )}
              <div className="absolute inset-0 rounded-md bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {!isCover && (
                  <Button size="icon" variant="secondary" className="h-8 w-8" title="Usar como portada" onClick={() => handleSetCover(p)}>
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="destructive" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar foto?</AlertDialogTitle>
                      <AlertDialogDescription>Se eliminará "{p.title_es}". La imagen en Storage no se borra automáticamente.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(p)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <p className="mt-1.5 text-xs font-medium truncate">{p.title_es}</p>
              {p.awards && <div className="flex items-center gap-1 mt-0.5"><Award className="h-3 w-3 text-muted-foreground" /><p className="text-xs text-muted-foreground truncate">{p.awards}</p></div>}
            </div>
          )})}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editar foto' : 'Agregar foto'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden border border-border cursor-pointer group" onClick={() => !editing && fileInputRef.current?.click()}>
              {photoPreview
                ? <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                : <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted-foreground"><Upload className="h-5 w-5" /><span className="text-xs">Seleccionar imagen</span></div>}
              {!editing && photoPreview && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Upload className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)) }; e.target.value = '' }} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Título (ES) *</Label><Input value={form.title_es} onChange={(e) => setForm((f) => ({ ...f, title_es: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Title (EN) *</Label><Input value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Descripción (ES)</Label><Textarea value={form.description_es} onChange={(e) => setForm((f) => ({ ...f, description_es: e.target.value }))} rows={2} /></div>
            <div className="space-y-1.5"><Label>Description (EN)</Label><Textarea value={form.description_en} onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))} rows={2} /></div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5" /> Premios</Label>
              <Textarea value={form.awards} onChange={(e) => setForm((f) => ({ ...f, awards: e.target.value }))} rows={2} placeholder="1er Premio — World Press Photo 2023" />
            </div>
            <div className="space-y-1.5"><Label>Orden</Label><Input type="number" value={form.display_order} onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))} className="w-24" /></div>
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
