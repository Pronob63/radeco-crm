# Changelog - RADECO CRM

Registro de cambios y avances del proyecto.

## [1.0.0] - 2026-02-18

### ✅ Completado

#### Infraestructura y Base
- ✓ Configuración inicial Next.js 14 con TypeScript
- ✓ Docker y docker-compose para PostgreSQL
- ✓ Tailwind CSS + shadcn/ui configurado
- ✓ ESLint + Prettier configurados

#### Base de Datos y ORM
- ✓ Schema completo de Prisma con todos los modelos
- ✓ Migraciones configuradas
- ✓ Seed script con datos de ejemplo:
  - 6 roles predefinidos (Admin, Gerencia, Ventas, Marketing, Taller, Solo-lectura)
  - 5 usuarios demo
  - 3 pipelines (Implementos, Repuestos, Maquinaria) con sus etapas
  - 8 productos de catálogo (TATU, BALDAN, CHANGFA, etc.)
  - Contactos y cuentas de ejemplo
  - Leads y oportunidades de prueba
  - Conversación WhatsApp simulada

#### Autenticación y Seguridad
- ✓ NextAuth v5 (Auth.js) con credenciales
- ✓ Hashing de contraseñas con bcrypt
- ✓ Sistema RBAC completo con permisos granulares
- ✓ Helpers de permisos para verificación (`hasPermission`, `canAccessResource`)
- ✓ Protección de rutas del dashboard

#### UI y Componentes
- ✓ Layout responsivo con sidebar y header
- ✓ Componentes shadcn/ui base:
  - Button, Input, Card, Badge, Avatar
  - Table, Label, Dropdown Menu
- ✓ Paleta de colores "agro premium" (verdes/arena)
- ✓ Navegación lateral con iconos
- ✓ Header con búsqueda y acciones rápidas

#### Dashboard Principal
- ✓ Página de dashboard con KPIs:
  - Leads nuevos hoy
  - Tareas pendientes
  - Oportunidades activas
  - Ventas del mes
- ✓ Widget de actividades recientes
- ✓ Vista de estado del pipeline
- ✓ Acciones rápidas
- ✓ 100% responsive

#### Página de Login
- ✓ Formulario de login funcional
- ✓ Integración con NextAuth
- ✓ Botones de acceso rápido demo (solo dev)
- ✓ Diseño premium con branding RADECO

### 🚧 En Progreso
- Módulo de Contactos y Leads (iniciando)

### 📋 Pendiente
- [ ] Módulo de Contactos completo (crear, editar, listar)
- [ ] Módulo de Leads completo
- [ ] Módulo de Oportunidades con vista Kanban
- [ ] Generación de cotizaciones PDF
- [ ] Bandeja de WhatsApp (inbox)
- [ ] Webhooks de WhatsApp
- [ ] Módulo de campañas
- [ ] Reportes básicos
- [ ] Testing (Playwright)
- [ ] Documentación técnica completa

### 🐛 Issues Conocidos
- Ninguno actualmente

### 📝 Notas
- Todos los usuarios demo usan password: `demo123`
- WhatsApp en modo stub (funciona sin credenciales reales)
- Base de datos se resetea con `npm run db:reset`

---

**Próximos pasos**: Completar módulo de Contacts/Leads con CRUD completo.
