# 🏠 ACM Pro · Propertia
### Análisis Comparativo de Mercado con Claude AI + Supabase

---

## 🗺️ MAPA RÁPIDO — ¿Qué es cada cosa?

| Herramienta | Qué hace | Dónde vive |
|-------------|----------|------------|
| **Cursor** | Donde editas el código | Tu computador |
| **GitHub** | Donde guardas el código en la nube | github.com |
| **Vercel** | Donde se publica el sitio | vercel.com |
| **Supabase** | La base de datos | supabase.com |
| **Anthropic** | La IA que hace el análisis | console.anthropic.com |

---

## PASO 1 — Abrir el proyecto en Cursor

1. Descarga e instala **Cursor** desde cursor.com
2. Abre Cursor
3. File → Open Folder → selecciona la carpeta `acm-propertia`
4. Abre la terminal dentro de Cursor: **Terminal → New Terminal**
5. Ejecuta:
```bash
npm install
```

---

## PASO 2 — Crear cuenta en Supabase (base de datos)

1. Ve a **supabase.com** → Sign Up (gratis)
2. Clic en **"New Project"**
   - Organization: tu nombre
   - Name: `acm-propertia`
   - Database Password: inventa una contraseña (guárdala)
   - Region: **South America (São Paulo)** — es la más cercana a Colombia
3. Espera ~2 minutos mientras crea el proyecto

### Crear las tablas:
4. En Supabase, ve a **SQL Editor** → **New Query**
5. Abre el archivo `supabase-schema.sql` desde Cursor
6. Copia TODO el contenido y pégalo en Supabase
7. Clic en **"Run"** — verás "Success" en verde

### Obtener las credenciales:
8. Ve a **Settings → API**
9. Copia y guarda estos dos valores:
   - **Project URL**: `https://xxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJxxxxxxxx...`
   - **service_role key** (en "Service role"): `eyJxxxxxxxx...` ⚠️ Esta es secreta

---

## PASO 3 — Crear cuenta en Anthropic (la IA)

1. Ve a **console.anthropic.com** → Sign Up
2. Ve a **API Keys** → **Create Key**
3. Nombre: `acm-propertia`
4. Copia la key: `sk-ant-api03-xxxxxxxxx`
   ⚠️ Solo la verás una vez, guárdala

---

## PASO 4 — Crear archivo de variables locales

En la carpeta `acm-propertia`, crea un archivo llamado **`.env.local`** con este contenido:

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...tu-anon-key...
```

⚠️ Reemplaza los valores con los tuyos de Supabase.
Este archivo NUNCA se sube a GitHub (ya está en .gitignore).

---

## PASO 5 — Probar localmente

En la terminal de Cursor:
```bash
npm run dev
```
Abre `http://localhost:5173` — verás la app con diseño verde/negro.

---

## PASO 6 — Subir a GitHub

1. Ve a **github.com** → New repository
   - Name: `acm-propertia`
   - Public
   - Create repository

2. En la terminal de Cursor:
```bash
git init
git add .
git commit -m "ACM Propertia - versión inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/acm-propertia.git
git push -u origin main
```

---

## PASO 7 — Publicar en Vercel

1. Ve a **vercel.com** → Sign Up with GitHub
2. **Add New Project** → selecciona `acm-propertia`
3. Clic en **Deploy** (deja todo por defecto)

### ⚠️ CONFIGURAR VARIABLES DE ENTORNO EN VERCEL (obligatorio):
4. Ve al proyecto en Vercel → **Settings → Environment Variables**
5. Agrega UNA POR UNA:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-xxxxxxx` |
| `SUPABASE_URL` | `https://xxxxxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJ...service-role-key...` |
| `VITE_SUPABASE_URL` | `https://xxxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...anon-key...` |

6. Ve a **Deployments** → clic en `···` del último deploy → **Redeploy**

---

## ✅ ¡LISTO! Tu sitio está en vivo

URL pública: `https://acm-propertia-tuusuario.vercel.app`

---

## 🔄 Cómo actualizar el sitio

Cada vez que hagas cambios en Cursor:
```bash
git add .
git commit -m "descripción del cambio"
git push
```
Vercel actualiza automáticamente en ~1 minuto.

---

## 💰 Costos

| Servicio | Costo |
|----------|-------|
| Vercel | **Gratis** (hasta 100GB bandwidth) |
| Supabase | **Gratis** (hasta 500MB base de datos) |
| Claude API | ~$0.003 por análisis generado |

Con $5 USD en Anthropic puedes hacer ~1,500 análisis.

---

## 📁 Estructura del proyecto

```
acm-propertia/
├── api/
│   ├── analyze.js          ← Llama a Claude AI (protegido)
│   └── save-analysis.js    ← Guarda en Supabase (protegido)
├── src/
│   ├── App.jsx             ← Toda la interfaz verde/negro
│   ├── main.jsx            ← Entrada React
│   └── lib/
│       └── supabase.js     ← Cliente Supabase
├── supabase-schema.sql     ← Tablas de la base de datos
├── index.html
├── package.json
├── vite.config.js
└── README.md               ← Este archivo
```
