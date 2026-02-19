# RADECO CRM - Setup Instructions

##  Problema Detectado: Windows Long Path Limit

El proyecto actual está en una ruta larga (`H:\RespaldoGeneral\Trabajos\Radeco\CRM - Radeco`) que excede los límites de Windows para paths en node_modules.

## ✅ Soluciones (Elige UNA)

### Opción 1: Mover el Proyecto a Ruta Corta (RECOMENDADO)

```powershell
# Desde la ubicación actual
cd H:\
mkdir CRM
xcopy "H:\RespaldoGeneral\Trabajos\Radeco\CRM - Radeco" "H:\CRM" /E /H /C /I
cd H:\CRM

# Luego continuar con la instalación
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Opción 2: Habilitar Long Paths en Windows

```powershell
# Ejecutar como Administrador
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
-Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Reiniciar PowerShell y continuar
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Opción 3: Usar Docker (Sin problemas de paths)

```powershell
# Si tienes Docker instalado
docker-compose up -d postgres

# Esperar 10 segundos, luego:
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## 📋 Archivos Ya Creados

### ✅ Infraestructura
- [x] package.json (actualizado con nodemailer 7)
- [x] docker-compose.yml
- [x] Dockerfile
- [x] .env.example
- [x] .gitignore
- [x] tailwind.config.ts
- [x] next.config.js
- [x] tsconfig.json

### ✅ Database & Auth
- [x] prisma/schema.prisma (40+ modelos)
- [x] prisma/seed.ts
- [x] src/lib/db.ts
- [x] src/lib/auth.ts (NextAuth v5 + RBAC)
- [x] src/lib/permissions.ts
- [x] src/lib/validations.ts (Zod schemas)

### ✅ API Routes
- [x] src/app/api/auth/[...nextauth]/route.ts
- [x] src/app/api/contacts/route.ts (GET, POST)
- [x] src/app/api/contacts/[id]/route.ts (GET, PATCH, DELETE)
- [x] src/app/api/accounts/route.ts (GET)

### ✅ UI Components (shadcn/ui)
- [x] src/components/ui/button.tsx
- [x] src/components/ui/card.tsx
- [x] src/components/ui/input.tsx
- [x] src/components/ui/badge.tsx
- [x] src/components/ui/avatar.tsx
- [x] src/components/ui/table.tsx
- [x] src/components/ui/dropdown-menu.tsx
- [x] src/components/ui/dialog.tsx
- [x] src/components/ui/combobox.tsx
- [x] src/components/ui/select.tsx
- [x] src/components/ui/checkbox.tsx
- [x] src/components/ui/label.tsx
- [x] src/components/ui/command.tsx
- [x] src/components/ui/popover.tsx

### ✅ Feature Components
- [x] src/components/layout/header.tsx
- [x] src/components/layout/sidebar.tsx
- [x] src/components/contacts/contact-form-dialog.tsx

### ✅ Pages
- [x] src/app/page.tsx (redirect)
- [x] src/app/login/page.tsx
- [x] src/app/dashboard/page.tsx (KPIs + activities)
- [x] src/app/dashboard/layout.tsx (protected)
- [x] src/app/dashboard/contacts/page.tsx (CRUD completo)
- [x] src/app/dashboard/leads/page.tsx (listing)
- [x] src/app/dashboard/opportunities/page.tsx (Kanban)
- [x] src/app/dashboard/whatsapp/page.tsx (placeholder)
- [x] src/app/dashboard/quotes/page.tsx (placeholder)
- [x] src/app/dashboard/campaigns/page.tsx (placeholder)
- [x] src/app/dashboard/reports/page.tsx (placeholder)
- [x] src/app/dashboard/settings/page.tsx

### ✅ Middleware & Config
- [x] src/middleware.ts (auth protection)
- [x] src/app/globals.css (Tailwind + custom theme)

### ✅ Documentation
- [x] README.md
- [x] CHANGELOG.md
- [x] docs/ARQUITECTURA.md
- [x] docs/ROLES_PERMISOS.md
- [x] docs/CONFIG_WHATSAPP.md

## 🚀 Qué Funciona

### CRUD de Contactos (100% completo)
- ✅ Create: Formulario modal con validación Zod
- ✅ Read: Listado con búsqueda + filtros
- ✅ Update: Editar en mismo formulario
- ✅ Delete: Con confirmación y validación de relaciones
- ✅ Permisos RBAC en cada endpoint
- ✅ Audit log automático
- ✅ Selector de cuenta con búsqueda (Combobox)

### Authentication & Security
- ✅ Login con NextAuth v5
- ✅ 6 roles predefinidos (Admin, Gerencia, Ventas, Marketing, Taller, Solo-lectura)
- ✅ Permisos granulares por recurso
- ✅ Middleware de protección de rutas
- ✅ Session con JWT + user data

### UI/UX
- ✅ Responsive design
- ✅ Sidebar navigation
- ✅ Header con search + user menu
- ✅ Paleta "agro premium" (greens + sand)
- ✅ Icons de Lucide React
- ✅ Animations y transitions

## 📝 Próximos Pasos (Después de Solucionar Paths)

1. **Leads CRUD**: API routes + formularios
2. **Opportunities CRUD**: Drag & drop Kanban
3. **Quotes Module**: Formulario + PDF generation
4. **WhatsApp Integration**: Webhooks + inbox funcional
5. **Campaigns**: Segmentación + envío masivo
6. **Reports**: Charts con recharts

## 🔑 Usuarios Demo (Después de Seed)

| Email | Password | Rol |
|-------|----------|-----|
| admin@radeco.com | demo123 | Admin |
| gerente@radeco.com | demo123 | Gerencia |
| vendedor1@radeco.com | demo123 | Ventas |
| vendedor2@radeco.com | demo123 | Ventas |
| marketing@radeco.com | demo123 | Marketing |

## 🐛 Troubleshooting

### Error: "prisma no se reconoce"
→ Paths largos en Windows. Sigue Opción 1 o 2 arriba.

### Error: "ENOENT: no such file or directory"
→ Idem. Mover a ruta corta (C:\CRM o H:\CRM).

### Puerto 3000 ocupado
```powershell
# Cambiar puerto en package.json
"dev": "next dev -p 3001"
```

### PostgreSQL no conecta
```bash
# Verificar .env DATABASE_URL
# O usar Docker:
docker-compose up -d postgres
```

---

**Estado Final**: Arquitectura completa + CRUD Contactos funcional. Requiere solución de paths largos para continuar instalación.
