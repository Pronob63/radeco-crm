# AG_BASELINE_AUDIT — RADECO CRM
**Fecha:** 2026-02-19 | **Auditor:** Antigravity | **Entorno:** Local (Windows) → Prod: crm.plan-radeco.online

---

## 1. Resultados de Comandos Baseline

| Comando | Resultado | Exit Code | Notas |
|---|---|---|---|
| `npm ci` | ✅ OK | 0 | 624 paquetes instalados en ~3min. 20 vulns totales, 1 en prod deps |
| `npm run lint` | ✅ OK | 0 | 0 warnings, 0 errors |
| `npm run build` | ✅ OK | 0 | Compiled successfully, tipos OK |
| `npx prisma generate` | ✅ OK | 0 | Prisma Client v5.22.0 generado |
| `npm audit --omit=dev` | ⚠️ WARN | 1 | 1 high severity (Next.js CVE) |

### 1.1 npm ci — Warnings relevantes
```
npm warn ERESOLVE overriding peer dependency
npm warn Found: nodemailer@7.0.13 (instalado en proyecto)
npm warn peerOptional nodemailer@"^6.8.0" from @auth/core@0.41.0
```
**Impacto:** nodemailer v7 se instaló pero `@auth/core` espera v6. Si se usa nodemailer dentro del flujo auth (email magic links), podría romperse. En este proyecto se usa solo Credentials provider → **riesgo bajo por ahora, pero es deuda técnica**.

### 1.2 npm audit --omit=dev — Vulnerabilidades en Producción

```
Package: next 10.0.0 - 15.5.9 (instalado: 14.2.35)
Severity: HIGH
Título: Next.js self-hosted applications vulnerable to DoS via Image Optimization
Advisory: GHSA-XXX (https://github.com/advisories/GHSA-h25m-26qc-wcjf)
Fix: npm audit fix --force → instalaría next@16.1.6 (BREAKING CHANGE)
```

> **Nota:** El fix automático requiere Next.js 16, que es un breaking change. NO se puede aplicar con `--force` sin testing exhaustivo. Ver recomendaciones en sección 4.

### 1.3 npm run build — Bundle Output

```
First Load JS shared by all: 87.3 kB
├ chunks/117-...         31.7 kB
├ chunks/fd9d1056-...    53.6 kB
└ other shared chunks     1.95 kB

Middleware: 78.4 kB
```

Todas las rutas dinámicas (ƒ). Sin rutas estáticas problemáticas. Output: standalone ✅.

---

## 2. Análisis de Rutas Críticas (por código fuente)

### 2.1 Login / Autenticación ✅

| Aspecto | Estado | Detalle |
|---|---|---|
| Ruta login | ✅ | `app/login/` existe |
| Middleware protección | ✅ | `middleware.ts` usa `auth-edge` (JWT, sin Prisma en Edge) |
| Credentials provider | ✅ | `auth.ts` → bcrypt verify → `prisma.user.findUnique` |
| JWT con roles | ✅ | `auth-config.ts` → token incluye `id`, `roleId`, `roleName`, `permissions[]` |
| Separación edge/node | ✅ | `auth-edge.ts` sin Prisma/bcrypt; `auth.ts` solo en Node routes |
| Update lastLoginAt | ✅ | Se actualiza en cada login exitoso |

**Riesgo detectado:** En `auth.ts` se hacen **2 queries al login** (findUnique + update lastLoginAt). En alta concurrencia, la segunda query puede fallar silenciosamente, pero no rompe el flujo. Aceptable.

### 2.2 Contactos CRUD ✅ (con observaciones)

| Aspecto | Estado | Detalle |
|---|---|---|
| GET `/api/contacts` | ✅ | Con paginación server-side |
| POST `/api/contacts` | ✅ | Validación Zod + AuditLog |
| Paginación | ⚠️ | Default `limit=50` — alto para Hostinger. Recomendado: 20-25 |
| Include en GET | ⚠️ | `account: true` (tabla completa), `leads: {take:1}`, `opportunities: {take:1}` — 3 JOINs por request |
| Búsqueda texto | ⚠️ | `mode: "insensitive"` en MySQL puede no funcionar (MySQL case-insensitive por defecto, pero la flag de Prisma genera `LIKE` vs `ILIKE`) |
| CRUD completo | ❓ | `/api/contacts/[id]` existe pero no se verificó si tiene PUT/PATCH/DELETE |

### 2.3 Cotizaciones (Quotes) ✅

| Aspecto | Estado | Detalle |
|---|---|---|
| GET `/api/quotes` | ✅ | Paginación correcta (default limit=10) |
| POST `/api/quotes` | ✅ | Genera número QT-YYYY-NNNN, calcula totales |
| PATCH `/api/quotes/[id]` | ✅ | Actualiza ítems con deleteMany+create, status history |
| DELETE `/api/quotes/[id]` | ✅ | Simple delete |
| Permisos por ownership | ✅ | `canAccessQuote` verifica `createdById` |
| PDF Generation | ❓ | No se detectó ruta PDF en `/api/quotes/[id]`. Puede estar en dashboard o pendiente |
| computeTotals duplicado | ⚠️ | La función `computeTotals` y `normalizeItems` están duplicadas en `route.ts` y `[id]/route.ts` |
| bodySizeLimit | ⚠️ | `next.config.js` lo fija en `10mb` — innecesariamente alto para cotizaciones |

---

## 3. Funciona / No Funciona

### ✅ Funciona
- Instalación limpia (`npm ci` exit 0)
- Lint sin errores
- Build de producción exitoso (standalone)
- Prisma Client generado correctamente
- Separación correcta Edge/Node en auth
- Sistema RBAC con permisos en JWT (sin DB queries en cada request)
- Paginación en contacts y quotes
- Validación Zod en todos los endpoints analizados
- AuditLog en creación de contactos

### ⚠️ Observaciones / Riesgos

| Item | Severidad | Descripción |
|---|---|---|
| CVE Next.js DoS (Image Optimization) | HIGH | Self-hosted aplica. Fix = next@16 (breaking) |
| nodemailer v7 vs peer v6 | LOW | Solo riesgo si se usa magic links (no es el caso actual) |
| `limit=50` default en contacts | MEDIUM | Pesado para RAM limitada de Hostinger |
| 3 JOINs en contacts GET | MEDIUM | `account:true` carga toda la fila; usar `select` específico |
| `computeTotals` duplicada | LOW | Code smell; no bug pero dificulta mantenimiento |
| `bodySizeLimit: 10mb` | LOW | Reducir a 2mb para Server Actions normales |
| PDF route no encontrada | UNKNOWN | No se detectó. Verificar si existe o está pendiente |
| Sin `/api/leads` | MEDIUM | El módulo `dashboard/leads` probablemente no tiene API funcional |
| `hostname: '**'` en images | LOW | Demasiado permisivo; acotar a dominios reales |
| `mode: "insensitive"` en MySQL | LOW | Prisma genera LOWER() wrapper; funciona pero es menos eficiente |

### ❌ No Funciona / Pendiente
- Módulo Leads: sin ruta API (`/api/leads` no existe)
- PDF de cotizaciones: ruta no encontrada en auditoría de código
- WhatsApp / Campañas: sin implementación de lógica de negocio

---

## 4. Checklist QA Baseline

- [x] `npm ci` — exit 0
- [x] `npm run lint` — 0 errores
- [x] `npm run build` — exit 0, standalone OK
- [x] `npx prisma generate` — v5.22.0 OK
- [x] Auth: separación Edge/Node correcta
- [x] Contacts: GET/POST con paginación
- [x] Quotes: CRUD completo con permisos
- [ ] Test manual: Login en crm.plan-radeco.online
- [ ] Test manual: Crear contacto y verificar en DB
- [ ] Test manual: Crear cotización y descargar PDF
- [ ] Confirmar existencia de `/api/leads`
- [ ] Confirmar ruta de generación PDF cotizaciones
- [ ] Review `/api/contacts/[id]` (PUT/PATCH/DELETE)

---

## 5. Acciones Recomendadas

Ver `AG_HOSTINGER_FIT.md` para recomendaciones priorizadas P0/P1/P2.
