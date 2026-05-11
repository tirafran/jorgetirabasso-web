---
shaping: true
---

# Jorge Tirabasso — Photographer Portfolio & Backoffice

## Requirements (R)

| ID | Requirement | Status |
|----|-------------|--------|
| R0 | Portfolio website showcasing Jorge Tirabasso's photography, fully manageable from a backoffice | Core goal |
| R1 | Hero section con imagen full-bleed editable desde el backoffice | Must-have |
| R2 | Galerías por categoría; cada una abre `/gallery/:id` dedicada | Must-have |
| R3 | Bio breve en `/` + link "Conocer más" navega a `/about` con bio completa | Must-have |
| R4 | Link a Instagram al pie de la página pública | Must-have |
| R5 | Backoffice: CRUD de galerías (nombre ES+EN, descripción ES+EN, cover manual) | Must-have |
| R6 | Backoffice: subida de fotos por galería con título ES+EN, descripción ES+EN, premios (texto libre), orden | Must-have |
| R7 | Stack: React + Vite + Supabase + shadcn/ui | Must-have |
| R8 | Switch de idioma ES/EN en el sitio público; backoffice solo en español | Must-have |

---

## Decisiones cerradas

| # | Decisión |
|---|----------|
| D1 | Cover de galería: imagen elegida manualmente en el admin (no auto-first) |
| D2 | Fotos en `/gallery/:id`: modal lightbox con navegación secuencial anterior/siguiente |
| D3 | Backoffice UI: solo español |
| D4 | Supabase: RLS estándar — **publishable key** para lecturas públicas (anon key deprecada), sesión auth (JWT) para escrituras en admin |

---

## Selected Shape: A — Single SPA

Una sola app Vite/React. Rutas públicas y `/admin/**` en un mismo build y deploy.

| Part | Mechanism |
|------|-----------|
| A1 | **React Router v6** — rutas públicas (`/`, `/gallery/:id`, `/about`) + árbol `/admin` protegido por `<PrivateRoute>` que redirige a `/admin/login` si no hay sesión |
| A2 | **Supabase Auth** — email/password; un único usuario admin provisionado desde el dashboard de Supabase |
| A3 | **Supabase DB** — `site_config` (id, hero_image_url, bio_short_es, bio_short_en, bio_full_es, bio_full_en, instagram_url); `galleries` (id, name_es, name_en, description_es, description_en, cover_image_url, display_order); `photos` (id, gallery_id, title_es, title_en, description_es, description_en, awards, storage_path, display_order) |
| A4 | **Supabase Storage** — bucket `photos` (público, read-only para todos); uploads desde admin devuelven URL pública guardada en `storage_path` y `hero_image_url` |
| A5 | **Supabase RLS** — SELECT abierto a todos (publishable key); INSERT/UPDATE/DELETE requieren `auth.role() = 'authenticated'`; no se usa service-role key en el cliente |
| A6 | **i18n** — `react-i18next` con namespaces `es` / `en`; toggle ES/EN persistido en `localStorage`; solo en la app pública |
| A7 | **Público `/`** — Hero full-bleed (desde `site_config`), grid de tarjetas de galería, bio breve + "Conocer más" → `/about`, link Instagram al pie |
| A8 | **Público `/gallery/:id`** — grid de fotos; click abre **lightbox modal** con título, descripción, premios; botones anterior/siguiente navegan entre fotos de la galería |
| A9 | **Público `/about`** — bio completa desde `site_config.bio_full_es/en`, mismo switch de idioma |
| A10 | **Admin `/admin/login`** — formulario email/password, redirige a dashboard tras auth |
| A11 | **Admin `/admin`** — layout con sidebar shadcn; ítems: Hero, Galerías, Config del sitio |
| A12 | **Admin `/admin/hero`** — upload/reemplazo de imagen hero (Supabase Storage), preview |
| A13 | **Admin `/admin/galleries`** — DataTable de galerías; Dialog para crear/editar (nombre ES+EN, descripción ES+EN, cover image, orden); confirmar antes de borrar |
| A14 | **Admin `/admin/galleries/:id/photos`** — lista de fotos de la galería; subida drag-drop; formulario por foto (título ES+EN, descripción ES+EN, premios, orden); borrar |
| A15 | **Admin `/admin/config`** — edición de bio_short y bio_full en ambos idiomas, URL de Instagram |

---

## Fit Check: R × A

| Req | Requirement | Status | A |
|-----|-------------|--------|---|
| R0 | Portfolio manageable desde backoffice | Core goal | ✅ |
| R1 | Hero full-bleed editable desde backoffice | Must-have | ✅ |
| R2 | Galerías por categoría con `/gallery/:id` dedicada | Must-have | ✅ |
| R3 | Bio breve en `/` + "Conocer más" → `/about` con bio completa | Must-have | ✅ |
| R4 | Link Instagram al pie | Must-have | ✅ |
| R5 | CRUD galerías con cover manual | Must-have | ✅ |
| R6 | Subida de fotos con título/descripción ES+EN, premios, orden | Must-have | ✅ |
| R7 | Stack React + Vite + Supabase + shadcn/ui | Must-have | ✅ |
| R8 | Switch ES/EN en público; backoffice solo español | Must-have | ✅ |

Todos los requisitos satisfechos. **Shape A seleccionada y cerrada.**

---

## Próximo paso: Slices

Propuesta de slices verticales para implementación incremental:

| Slice | Nombre | Demo al terminar |
|-------|--------|-----------------|
| V1 | Fundación + Home público | `/` con hero, grilla de galerías placeholder, bio, Instagram |
| V2 | Gallery detail + About | `/gallery/:id` con lightbox; `/about` |
| V3 | Admin auth + shell | Login funcional, sidebar, rutas protegidas |
| V4 | Admin: Config del sitio + Hero | Editar bio ES/EN, URL Instagram, subir hero image |
| V5 | Admin: Galerías | CRUD completo de galerías con cover |
| V6 | Admin: Fotos | Subida, metadata, orden por galería |

¿Arrancamos con V1 o querés ajustar algo antes?
