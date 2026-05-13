import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense } from 'react'
import HomePage from './pages/public/HomePage'
import GalleryPage from './pages/public/GalleryPage'
import AboutPage from './pages/public/AboutPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminHero from './pages/admin/AdminHero'
import AdminGalleries from './pages/admin/AdminGalleries'
import AdminPhotos from './pages/admin/AdminPhotos'
import AdminConfig from './pages/admin/AdminConfig'
import PrivateRoute from './components/auth/PrivateRoute'
import { Toaster } from './components/ui/toaster'

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery/:id" element={<GalleryPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin protected */}
          <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/admin/galleries" replace />} />
            <Route path="hero" element={<AdminHero />} />
            <Route path="galleries" element={<AdminGalleries />} />
            <Route path="galleries/:id/photos" element={<AdminPhotos />} />
            <Route path="recognitions" element={<Navigate to="/admin/config" replace />} />
            <Route path="config" element={<AdminConfig />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </Suspense>
    </BrowserRouter>
  )
}
