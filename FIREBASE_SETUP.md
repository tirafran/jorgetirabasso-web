# Configuración de Firebase — paso a paso

Esta guía asume que nunca usaste Firebase. Tardás unos 10 minutos.

---

## 1. Crear el proyecto en Firebase

1. Ir a **https://console.firebase.google.com**
2. Click en **"Agregar proyecto"** (o "Create a project")
3. Nombre: `jorge-tirabasso` (o lo que quieras)
4. Google Analytics: podés desactivarlo, no es necesario
5. Click en **"Crear proyecto"** y esperá que termine

---

## 2. Registrar la app web

1. En la pantalla del proyecto, click en el ícono **`</>`** (Web)
2. Nombre de la app: `jorge-web`
3. **No** marques "Firebase Hosting" (vamos a usar Vercel)
4. Click **"Registrar app"**
5. Te va a mostrar un bloque de código con `firebaseConfig`. Copiá esos valores — los vas a necesitar en el paso 5.

---

## 3. Habilitar Authentication

1. En el menú izquierdo: **Authentication**
2. Click **"Comenzar"** / "Get started"
3. Pestaña **"Sign-in method"**
4. Habilitá **"Correo electrónico/contraseña"** → Activar → Guardar

**Crear el usuario admin:**
1. Pestaña **"Users"**
2. Click **"Agregar usuario"**
3. Ingresá el email y contraseña que vas a usar para el backoffice
4. Guardar

---

## 4. Crear la base de datos (Firestore)

1. En el menú izquierdo: **Firestore Database**
2. Click **"Crear base de datos"**
3. Elegí **"Comenzar en modo de producción"** (no modo de prueba)
4. Elegí la región más cercana (ej: `us-east1` o `southamerica-east1`)
5. Click **"Listo"**

**Configurar las reglas de seguridad:**
1. Pestaña **"Reglas"**
2. Reemplazá todo el contenido con esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publicar"**

---

## 5. Crear el Storage (para las fotos)

1. En el menú izquierdo: **Storage**
2. Click **"Comenzar"**
3. Elegí **"Comenzar en modo de producción"**
4. Misma región que elegiste para Firestore
5. Click **"Listo"**

**Configurar las reglas de Storage:**
1. Pestaña **"Reglas"**
2. Reemplazá todo el contenido con esto:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publicar"**

---

## 6. Configurar las variables de entorno

En la raíz del proyecto, copiá `.env.example` → `.env`:

```bash
cp .env.example .env
```

Completá con los valores del `firebaseConfig` que copiaste en el paso 2:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## 7. Probar en local

```bash
npm run dev
```

- Sitio público: http://localhost:5173
- Backoffice: http://localhost:5173/admin/login

---

## 8. Deploy en Vercel

1. Subir el proyecto a GitHub (si no está)
2. Ir a **https://vercel.com** → New Project → importar el repo
3. En **"Environment Variables"**, agregar las 6 variables del `.env`
4. Click **"Deploy"**

Vercel detecta automáticamente que es un proyecto Vite y configura todo.

**Para deployar después de cambios:**
```bash
git add . && git commit -m "update" && git push
```
Vercel re-deploya automáticamente.

---

## Estructura de datos en Firestore

El proyecto usa 3 colecciones:

| Colección | Descripción |
|-----------|-------------|
| `config` | Un solo documento `main` con hero image, bios e Instagram |
| `galleries` | Una galería por documento (auto-ID) |
| `photos` | Una foto por documento, con campo `gallery_id` |

No necesitás crear estas colecciones manualmente — se crean solas cuando empezás a cargar contenido desde el backoffice.
