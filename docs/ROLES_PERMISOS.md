# Roles y Permisos - RADECO CRM

## 📋 Visión General

RADECO CRM implementa un sistema de **Control de Acceso Basado en Roles (RBAC)** que permite gestión granular de permisos por recurso y acción.

## 👥 Roles Predefinidos

### 1. Admin (Nivel 100)

**Descripción**: Acceso total al sistema. Configuración, gestión de usuarios, auditoría.

**Permisos**:
```json
["all:*", "users:*", "roles:*", "settings:*", "audit:read"]
```

**Puede**:
- ✅ Todas las operaciones en todos los módulos
- ✅ Crear y editar usuarios
- ✅ Modificar roles y permisos
- ✅ Acceder a logs de auditoría
- ✅ Configurar integraciones (WhatsApp, Email)
- ✅ Ver datos de todos los usuarios

**No puede**:
- ❌ Ninguna restricción

---

### 2. Gerencia (Nivel 80)

**Descripción**: Gerente de ventas. Supervisión de equipos, acceso a reportes completos, gestión de pipeline.

**Permisos**:
```json
[
  "leads:*",
  "opportunities:*",
  "contacts:*",
  "accounts:*",
  "quotes:*",
  "activities:*",
  "tasks:*",
  "campaigns:*",
  "reports:*",
  "whatsapp:read"
]
```

**Puede**:
- ✅ Ver y gestionar todos los leads y oportunidades del equipo
- ✅ Asignar leads a vendedores
- ✅ Ver todas las cotizaciones
- ✅ Acceder a reportes completos (conversión, performance, etc.)
- ✅ Crear y gestionar campañas
- ✅ Ver conversaciones de WhatsApp (solo lectura)
- ✅ Ver actividades de todo el equipo

**No puede**:
- ❌ Modificar usuarios o roles
- ❌ Responder en WhatsApp de otros vendedores
- ❌ Modificar configuración del sistema

---

### 3. Ventas (Nivel 50)

**Descripción**: Vendedor de campo. Gestiona su propio pipeline, crea cotizaciones, responde WhatsApp.

**Permisos**:
```json
[
  "leads:own",
  "leads:create",
  "opportunities:own",
  "opportunities:create",
  "contacts:read",
  "contacts:create",
  "accounts:read",
  "quotes:own",
  "quotes:create",
  "activities:own",
  "tasks:own",
  "whatsapp:own",
  "products:read"
]
```

**Puede**:
- ✅ Ver y gestionar **solo sus leads y oportunidades asignadas**
- ✅ Crear nuevos leads y contactos
- ✅ Crear cotizaciones para sus oportunidades
- ✅ Enviar cotizaciones por WhatsApp
- ✅ Responder mensajes de WhatsApp asignados a él
- ✅ Ver catálogo de productos (solo lectura)
- ✅ Registrar actividades (llamadas, visitas, etc.)
- ✅ Gestionar sus tareas

**No puede**:
- ❌ Ver leads u oportunidades de otros vendedores
- ❌ Reasignar leads
- ❌ Crear campañas masivas
- ❌ Acceder a reportes completos del equipo
- ❌ Editar productos del catálogo

---

### 4. Marketing (Nivel 50)

**Descripción**: Equipo de marketing. Gestión de campañas, creación de leads, análisis de conversión.

**Permisos**:
```json
[
  "leads:read",
  "leads:create",
  "contacts:read",
  "contacts:create",
  "campaigns:*",
  "whatsapp:send",
  "reports:marketing"
]
```

**Puede**:
- ✅ Ver todos los leads (lectura)
- ✅ Crear nuevos leads y contactos
- ✅ Crear, editar y ejecutar campañas
- ✅ Enviar mensajes masivos por WhatsApp (campañas)
- ✅ Ver reportes de marketing (conversión, fuentes, etc.)
- ✅ Segmentar audiencias para campañas

**No puede**:
- ❌ Crear o gestionar oportunidades
- ❌ Ver conversaciones individuales de WhatsApp
- ❌ Crear cotizaciones
- ❌ Ver reportes de ventas por vendedor

---

### 5. Taller (Nivel 30)

**Descripción**: Soporte técnico y servicio postventa. Acceso limitado para registro de servicios.

**Permisos**:
```json
[
  "contacts:read",
  "activities:create",
  "tasks:own",
  "products:read",
  "whatsapp:own"
]
```

**Puede**:
- ✅ Ver información de contactos
- ✅ Registrar actividades de servicio técnico
- ✅ Gestionar sus tareas de soporte
- ✅ Ver catálogo de repuestos (lectura)
- ✅ Responder mensajes de WhatsApp asignados (soporte)

**No puede**:
- ❌ Crear leads u oportunidades
- ❌ Crear cotizaciones
- ❌ Ver reportes de ventas
- ❌ Crear campañas

---

### 6. Solo-lectura (Nivel 10)

**Descripción**: Acceso de consulta. Para ejecutivos que solo necesitan visibilidad sin editar.

**Permisos**:
```json
[
  "leads:read",
  "opportunities:read",
  "contacts:read",
  "accounts:read",
  "reports:basic"
]
```

**Puede**:
- ✅ Ver leads, oportunidades y contactos
- ✅ Ver reportes básicos (dashboard)

**No puede**:
- ❌ Crear, editar o eliminar nada
- ❌ Enviar mensajes
- ❌ Acceder a configuración

---

## 🔑 Sintaxis de Permisos

Los permisos siguen el formato: `<recurso>:<acción>`

### Recursos
- `leads`: Leads
- `opportunities`: Oportunidades
- `contacts`: Contactos
- `accounts`: Cuentas/Empresas
- `quotes`: Cotizaciones
- `activities`: Actividades
- `tasks`: Tareas
- `campaigns`: Campañas
- `whatsapp`: WhatsApp
- `products`: Productos
- `reports`: Reportes
- `users`: Usuarios
- `roles`: Roles
- `settings`: Configuración
- `audit`: Auditoría

### Acciones
- `read`: Leer/Ver
- `create`: Crear
- `write`: Crear y editar
- `delete`: Eliminar
- `*`: Todas las acciones del recurso
- `own`: Solo recursos asignados/propios
- `send`: Enviar (WhatsApp, emails)

### Ejemplos

| Permiso             | Significado                                        |
|---------------------|----------------------------------------------------|
| `leads:read`        | Ver todos los leads                                |
| `leads:own`         | Ver/editar **solo sus leads asignados**            |
| `leads:*`           | Todas las acciones en leads                        |
| `all:*`             | Dios mode (Admin)                                  |
| `reports:marketing` | Acceso a reportes de marketing (custom)            |

---

## 🛡️ Implementación Técnica

### 1. En Base de Datos (Prisma)

```prisma
model Role {
  id          String   @id
  name        String   @unique
  permissions Json     // Array de strings
  level       Int      // Jerarquía
  users       User[]
}

model User {
  roleId      String
  role        Role     @relation(fields: [roleId])
}
```

### 2. En Session (JWT)

```typescript
session.user = {
  id: "...",
  email: "...",
  roleName: "Ventas",
  permissions: ["leads:own", "opportunities:own", ...]
}
```

### 3. Helper Functions

```typescript
// Verificar permiso simple
await hasPermission("leads:write") // → true/false

// Verificar acceso a recurso específico
await canAccessResource("leads", "write", ownerId)

// Lanzar error si no tiene permiso
await requirePermission("quotes:create")
```

### 4. En Server Components

```typescript
export default async function LeadsPage() {
  const session = await requireAuth();
  
  // Filtrar por ownership si no es admin/gerencia
  const leads = await prisma.lead.findMany({
    where: {
      ...(session.user.permissions.includes("leads:*")
        ? {} // Ver todos
        : { assignedToId: session.user.id } // Solo suyos
      )
    }
  });
}
```

### 5. En API Routes

```typescript
export async function POST(req: Request) {
  await requirePermission("leads:create");
  
  // ... lógica de creación
}
```

---

## 📊 Matriz de Permisos

| Recurso      | Admin | Gerencia | Ventas | Marketing | Taller | Solo-lectura |
|--------------|-------|----------|--------|-----------|--------|--------------|
| Leads        | ✅ *  | ✅ *     | 🟨 own | 🟦 read   | ❌     | 🟦 read      |
| Oportunidades| ✅ *  | ✅ *     | 🟨 own | ❌        | ❌     | 🟦 read      |
| Contactos    | ✅ *  | ✅ *     | 🟦 +create | 🟦 +create | 🟦 read | 🟦 read |
| Cotizaciones | ✅ *  | ✅ *     | 🟨 own | ❌        | ❌     | ❌           |
| Campañas     | ✅ *  | ✅ *     | ❌     | ✅ *      | ❌     | ❌           |
| WhatsApp     | ✅ *  | 🟦 read  | 🟨 own | 🟧 send   | 🟨 own | ❌           |
| Reportes     | ✅ *  | ✅ *     | ❌     | 🟦 marketing | ❌  | 🟦 basic     |
| Usuarios     | ✅ *  | ❌       | ❌     | ❌        | ❌     | ❌           |

**Leyenda**:
- ✅ *: Acceso completo
- 🟨 own: Solo recursos asignados
- 🟦 read: Solo lectura
- 🟦 +create: Lectura + creación
- 🟧 send: Solo envío (no conversaciones)
- ❌: Sin acceso

---

## 🔧 Modificar Permisos

### Opción 1: Seed Script (Desarrollo)

Editar `prisma/seed.ts` y recrear:

```bash
npm run db:reset
npm run prisma:seed
```

### Opción 2: Prisma Studio (UI)

```bash
npm run prisma:studio
```

Navegar a `Role` y editar el campo `permissions` (JSON).

### Opción 3: Sistema Admin (Futuro)

UI de administración para gestionar roles y permisos sin tocar código.

---

## 🎯 Casos de Uso

### Vendedor Juan crea un lead
1. Juan (rol: Ventas) crea lead
2. Lead se asigna automáticamente a Juan (`assignedToId`)
3. Juan puede ver/editar este lead (permiso `leads:own`)
4. Gerente también puede verlo (permiso `leads:*`)

### Marketing crea campaña
1. Ana (rol: Marketing) crea campaña
2. Segmenta contactos por provincia + cultivo
3. Programa envío WhatsApp con template
4. Sistema verifica `campaigns:*` (✅ permitido)
5. Envía mensajes masivos

### Admin asigna lead a vendedor
1. Admin ve todos los leads sin asignar
2. Asigna lead a María (vendedor)
3. María ahora lo ve en su dashboard
4. Vendedor Pedro NO lo ve (no es suyo)

---

**Última actualización**: 18 de febrero de 2026
