import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image, GalleryHorizontal, Camera, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [galleryCount, setGalleryCount] = useState(0)
  const [photoCount, setPhotoCount]     = useState(0)

  useEffect(() => {
    supabase.from('galleries').select('id', { count: 'exact', head: true }).then(({ count }) => setGalleryCount(count ?? 0))
    supabase.from('photos').select('id', { count: 'exact', head: true }).then(({ count }) => setPhotoCount(count ?? 0))
  }, [])

  const cards = [
    { to: '/admin/hero',      icon: Image,             label: 'Imagen Hero',   description: 'Cambiar la imagen de portada',                                        color: 'bg-blue-50' },
    { to: '/admin/galleries', icon: GalleryHorizontal, label: 'Galerías',      description: `${galleryCount} galería${galleryCount !== 1 ? 's' : ''}`,             color: 'bg-green-50' },
    { to: '/admin/galleries', icon: Camera,            label: 'Fotos',         description: `${photoCount} foto${photoCount !== 1 ? 's' : ''}`,                    color: 'bg-orange-50' },
    { to: '/admin/config',    icon: Settings,          label: 'Configuración', description: 'Textos e Instagram',                                                  color: 'bg-purple-50' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-light tracking-wider mb-2">Panel de control</h1>
      <p className="text-sm text-muted-foreground mb-10">Gestión del sitio de Jorge Tirabasso</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ to, icon: Icon, label, description, color }) => (
          <Link key={label} to={to} className="flex flex-col gap-3 rounded-lg border border-border p-5 hover:border-foreground/30 transition-colors">
            <div className={`w-10 h-10 rounded-md ${color} flex items-center justify-center`}>
              <Icon className="h-5 w-5 text-foreground/60" />
            </div>
            <div>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
