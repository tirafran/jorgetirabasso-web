import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Image, GalleryHorizontal, Settings, LogOut, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/admin',           label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/hero',      label: 'Imagen Hero',   icon: Image },
  { to: '/admin/galleries', label: 'Galerías',      icon: GalleryHorizontal },
  { to: '/admin/config',    label: 'Configuración', icon: Settings },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-56 border-r border-border flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-border flex items-center gap-2">
          <Camera className="h-5 w-5" />
          <span className="text-sm font-medium tracking-wider">Jorge Tirabasso</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
