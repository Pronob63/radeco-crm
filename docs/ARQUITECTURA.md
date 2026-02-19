# Arquitectura RADECO CRM

## 📐 Visión General

RADECO CRM es una aplicación web monolítica moderna construida con Next.js 14 (App Router), que combina frontend y backend en una única aplicación optimizada para deployment containerizado.

## 🏗️ Stack Tecnológico

### Core
- **Next.js 14** (App Router): Framework fullstack React con SSR, API Routes y optimizaciones automáticas
- **TypeScript**: Type safety completo en toda la aplicación
- **React 18**: UI declarativa con Server Components por defecto

### Base de Datos y ORM
- **PostgreSQL 16**: Base de datos relacional robusta
- **Prisma 5**: ORM moderno con schema-first y type safety
- **Migrations**: Versionado de esquema con Prisma Migrate

### Autenticación y Autorización
- **NextAuth v5 (Auth.js)**: Autenticación session-based con JWT
- **bcrypt**: Hashing de contraseñas (salt rounds: 10)
- **RBAC Custom**: Sistema de roles y permisos granulares

### UI y Estilos
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Componentes React accesibles y customizables
- **Lucide React**: Iconografía moderna y ligera
- **Radix UI**: Primitivas accesibles headless

### Validación y Forms
- **Zod**: Schema validation type-safe
- **React Hook Form**: Gestión de formularios performante

### Infraestructura
- **Docker**: Containerización
- **Docker Compose**: Orquestación local y staging

## 🗂️ Estructura de Módulos

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Grupo de rutas de auth
│   │   └── login/
│   ├── dashboard/              # Aplicación principal (protegida)
│   │   ├── page.tsx           # Dashboard principal
│   │   ├── layout.tsx         # Layout con sidebar
│   │   ├── contacts/          # Módulo Contactos
│   │   ├── leads/             # Módulo Leads
│   │   ├── opportunities/     # Módulo Oportunidades + Kanban
│   │   ├── quotes/            # Módulo Cotizaciones
│   │   ├── whatsapp/          # Bandeja WhatsApp
│   │   ├── campaigns/         # Módulo Campañas
│   │   ├── reports/           # Reportes
│   │   └── settings/          # Configuración
│   ├── api/                   # API Routes
│   │   ├── auth/              # NextAuth handlers
│   │   ├── webhooks/          # Webhooks externos (WhatsApp, etc)
│   │   └── [resource]/        # REST API por recurso
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/                # Sidebar, Header
│   └── [module]/              # Componentes específicos por módulo
└── lib/
    ├── auth.ts                # NextAuth config
    ├── db.ts                  # Prisma singleton
    ├── permissions.ts         # RBAC helpers
    └── utils.ts               # Utilidades
```

## 🔄 Flujo de Datos

### 1. Autenticación (Login)

```
Usuario → LoginPage (client)
  → signIn() [next-auth/react]
  → POST /api/auth/callback/credentials
  → Credentials provider authorize()
  → Buscar usuario en DB (Prisma)
  → Verificar password (bcrypt.compare)
  → Crear JWT con user + role + permissions
  → redirect("/dashboard")
```

### 2. Protección de Rutas

```
Dashboard Layout (server component)
  → await auth() [verifica session]
  → Si no hay sesión → redirect("/login")
  → Si hay sesión → renderiza layout + children
```

### 3. Verificación de Permisos

```
Server Component o API Route
  → await requirePermission("leads:write")
  → hasPermission() verifica:
    - ¿Tiene "all:*"? → true
    - ¿Tiene "leads:*"? → true
    - ¿Tiene "leads:write"? → true
    - ¿Es owner y tiene "leads:own"? → true
    - Default → false (lanza error)
```

### 4. Operaciones CRUD

```
UI (cliente) → Server Action o API Route (servidor)
  → requireAuth() + requirePermission()
  → Validación Zod del input
  → Operación Prisma (create/update/delete)
  → Registrar AuditLog (si es crítico)
  → Retornar resultado
  → UI actualiza optimistically o revalida
```

## 🗄️ Modelo de Datos (Simplificado)

```
User ←→ Role (one-to-many)
  ↓
Lead / Opportunity / Task / etc. (assignedTo)

Contact ← → Account (many-to-one)
  ↓
Lead / Opportunity / Activity / Quote

Opportunity → Pipeline → Stage
Opportunity → Quote → QuoteItem → Product

Lead ←→ Opportunity (conversión 1:1 opcional)

WaConversation → WaMessage (one-to-many)
WaConversation ←→ Contact (many-to-one)

Campaign (segmentación JSON)
```

Ver schema completo en `prisma/schema.prisma`

## 🔐 Seguridad

### Autenticación
- Passwords hasheados con bcrypt (salt rounds: 10)
- JWT firmados con secret (`NEXTAUTH_SECRET`)
- Session server-side (cookies httpOnly)

### Autorización
- Middleware de permisos en cada route protegida
- Verificación a nivel de recurso (`canAccessResource`)
- Filtrado de datos por ownership (vendedor solo ve sus leads)

### Input Validation
- Validación Zod en todos los endpoints
- Sanitización de datos
- Type safety completo (TypeScript)

### Auditoría
- AuditLog de acciones críticas:
  - Cambios de estado en oportunidades
  - Creación/edición de cotizaciones
  - Asignaciones
  - Envíos masivos (campañas)

## 📡 API Routes

### Convención REST

```
GET    /api/leads              # Listar (con filtros query)
GET    /api/leads/[id]         # Obtener uno
POST   /api/leads              # Crear
PATCH  /api/leads/[id]         # Actualizar
DELETE /api/leads/[id]         # Eliminar
```

### Webhooks

```
POST   /api/webhooks/whatsapp  # Callback de Meta WhatsApp
GET    /api/webhooks/whatsapp  # Verificación de webhook
```

## 🚀 Optimizaciones

### Performance
- Server Components por defecto (menos JS al cliente)
- Streaming y Suspense boundaries
- Optimistic updates en mutaciones
- Paginación server-side
- Índices en DB (ver schema)

### SEO
- Metadata dinámica por página
- Titles y descriptions descriptivos

### Monitoreo (Recomendado para Producción)
- Logs estructurados
- Error tracking (Sentry sugerido)
- Performance monitoring
- Health checks

## 🐳 Deployment

### Docker Compose (Local/Staging)

```yaml
services:
  postgres: # PostgreSQL 16
  app:      # Next.js build (standalone)
```

### Producción (Sugerencias)

**Opción 1: VPS/Cloud con Docker**
- AWS EC2 / DigitalOcean Droplet
- Docker Compose similar al dev
- PostgreSQL gestionado (RDS, etc)
- Nginx reverse proxy (SSL)

**Opción 2: Vercel + PostgreSQL Externo**
- Deploy directo en Vercel
- PostgreSQL en Neon, Supabase, Railway
- Variables de entorno en Vercel Dashboard

**Opción 3: Kubernetes (Empresarial)**
- Manifests para pods (app + workers)
- PostgreSQL con StatefulSet o gestionado
- Ingress con SSL automático

## 📦 Build Process

```bash
npm run build
  → prisma generate        # Genera Prisma Client
  → next build             # Build Next.js
    → Static generation de páginas públicas
    → Server Components compilation
    → Standalone output (.next/standalone)
```

Output: `.next/standalone/` (server.js + node_modules mínimos)

## 🔧 Variables de Entorno Críticas

```bash
DATABASE_URL          # Connection string PostgreSQL
NEXTAUTH_URL          # URL pública del CRM
NEXTAUTH_SECRET       # Secret para firmar JWT (cambiar en prod)
WHATSAPP_ENABLED      # "true" para activar WhatsApp real
```

Ver todas en `.env.example`

## 📚 Dependencias Clave

### Runtime
- next: Framework
- react, react-dom: UI
- @prisma/client: ORM
- next-auth: Auth
- zod: Validación
- bcryptjs: Password hashing
- @react-pdf/renderer: PDF generation

### DevDependencies
- typescript: Compilador TS
- prisma: CLI y migrations
- tailwindcss: CSS
- eslint, prettier: Linting

## 🧩 Extensibilidad

### Agregar un Nuevo Módulo

1. Crear página en `app/dashboard/[modulo]/page.tsx`
2. Agregar rutas API en `app/api/[modulo]/route.ts`
3. Definir schema Zod para validación
4. Agregar permisos al sistema RBAC
5. Crear componentes UI en `components/[modulo]`
6. Actualizar navegación en `sidebar.tsx`

### Agregar un Nuevo Campo a un Modelo

1. Actualizar `prisma/schema.prisma`
2. Crear migración: `npx prisma migrate dev --name add_field`
3. Actualizar tipos TypeScript (regenerados automáticamente)
4. Actualizar formularios y validaciones Zod
5. Actualizar seed si aplica

---

**Última actualización**: 18 de febrero de 2026
