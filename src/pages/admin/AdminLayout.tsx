import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Image, GalleryHorizontal, Settings, LogOut, Camera, Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/admin/galleries', label: 'Galerías',      icon: GalleryHorizontal },
  { to: '/admin/hero',      label: 'Imagen Hero',   icon: Image },
  { to: '/admin/config',    label: 'Configuración', icon: Settings },
]

function SidebarContent({ onNav, onLogout }: { onNav: () => void; onLogout: () => void }) {
  return (
    <>
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
            onClick={onNav}
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
        <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-muted-foreground" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 border-r border-border flex-col shrink-0">
        <SidebarContent onNav={() => {}} onLogout={handleLogout} />
      </aside>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full bg-background border-r border-border flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-medium">Menú</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent onNav={() => setSidebarOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span className="text-sm font-medium tracking-wider">Jorge Tirabasso</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
