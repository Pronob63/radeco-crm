# AG_HOSTINGER_FIT — Hosting Fit Check RADECO CRM
**Fecha:** 2026-02-19 | **Entorno destino:** Hostinger Node.js Apps (recursos limitados)

> [!IMPORTANT]
> Este documento evalúa si el proyecto es **"hosting-fit"** para Hostinger Node.js Apps y prioriza acciones para estabilidad antes de cualquier feature nueva.

---

## Contexto del Hosting

- **Tipo:** Managed Node.js App (no VPS)
- **Runtime:** Node 22, Next.js 14 standalone
- **DB:** MySQL en Hostinger
- **Limitaciones:** CPU/RAM acotados, sin procesos eternos en background, sin fork de workers pesados dentro de requests

---

## Evaluación por Área de Riesgo

### 1. Consumo de RAM — SSR y Dependencias Pesadas

| Item | Riesgo | Estado |
|---|---|---|
| Next.js standalone | ✅ Bajo | `output: 'standalone'` correcto, minimiza node_modules en deploy |
| React Server Components | ✅ Bajo | Dashboard usa Server Components por defecto (menos hydration) |
| `@react-pdf/renderer` | ⚠️ Medio | Carga ~3-4MB de assets (fonts, layout engine) en memoria por render |
| `recharts` en bundle | ⚠️ Bajo-Medio | 87.3 kB shared JS ya es alto para mobile, pero no es el problema principal |
| `prisma` en runtime | ✅ OK | Singleton global correcto para Node.js. En dev no persiste, en prod sí |
| `zustand` | ✅ Bajo | Micro librería, sin impacto |

**Diagnóstico:** La RAM en reposo debería ser manejable. El pico ocurrirá en generación de PDF (ver punto 2).

---

### 2. PDF Generation — `@react-pdf/renderer`

**Este es el mayor riesgo de memoria/CPU individual.**

```js
// Patrón típico de react-pdf (riesgo si se hace en SSR/API route sin cuidado)
const doc = <Document>...</Document>
const stream = await renderToStream(doc) // Carga fonts en memoria
```

| Riesgo | Descripción | Severidad |
|---|---|---|
| Font caching | react-pdf carga y cachea fonts en memoria. Si hay muchas peticiones simultáneas de PDF, el caché crece | HIGH |
| Sin streaming encontrado aún | No se encontró ruta PDF en auditoría. Si se usa `renderToBuffer()` en lugar de `renderToStream()`, carga todo en RAM | HIGH |
| bodySizeLimit 10mb | `next.config.js` tiene `bodySizeLimit: '10mb'` en Server Actions — innecesario y permite payloads gigantes | MEDIUM |
| Concurrencia sin throttle | Si 3 usuarios generan PDF simultáneamente → 3x spike de RAM/CPU | HIGH |

---

### 3. Conexiones MySQL / Prisma

| Item | Estado | Recomendación |
|---|---|---|
| Singleton Prisma | ✅ Correcto | `globalThis` pattern OK para Next.js standalone |
| Pool de conexiones | ⚠️ Sin configurar | No hay `connection_limit` explícito en DATABASE_URL ni en PrismaClient |
| Log en producción | ✅ OK | `log: ['error']` en prod — correcto |
| Queries con JOINs pesados | ⚠️ | Contacts GET: `account: true` (full row) + `leads:{take:1}` + `opportunities:{take:1}` — 3 JOINs |
| Prisma Accelerate | ❌ No usado | No es necesario ahora pero podría ayudar si hay bottleneck |

**Riesgo real:** Sin `connection_limit`, Prisma puede abrir hasta 10 conexiones por defecto a MySQL.
En Hostinger, MySQL tiene límites de conexiones simultáneas. Con varios requests paralelos → posible `Too many connections`.

---

### 4. Caché y Paginación

| Item | Estado | Detalle |
|---|---|---|
| Paginación en Contacts | ⚠️ | Default `limit=50` — alto. Cada fila incluye 3 JOINs |
| Paginación en Quotes | ✅ | Default `limit=10` — correcto |
| Cache de Next.js | ✅ | `force-dynamic` en todas las API routes (correcto para datos en tiempo real) |
| Server Component caching | ✅ | Dashboard data se fetcha fresco (no stale) |
| Sin cache de sesión en DB | ✅ | JWT strategy — sin queries a DB por sesión activa |
| Image domains `hostname: '**'` | ⚠️ | Wildcard total en `next.config.js images`. Hostinger servirá proxies de cualquier dominio externo → potencial abuso |

---

### 5. Edge vs Node Runtimes

| Archivo | Runtime | ¿Correcto? |
|---|---|---|
| `middleware.ts` | Edge (exporta de `auth-edge`) | ✅ **Correcto** — sin Prisma ni bcrypt |
| `auth-edge.ts` | Edge | ✅ Solo NextAuth JWT config sin dependencias Node-only |
| `auth-config.ts` | Edge-compatible | ✅ Solo tipos y callbacks puros |
| `auth.ts` | Node | ✅ Tiene Prisma + bcrypt — nunca llamado desde Edge |
| `api/*/route.ts` | Node (default) | ✅ Correcto — usan Prisma |
| `app/dashboard/*` | Server Component (Node) | ✅ Correcto |

**Veredicto Edge/Node:** La separación está bien implementada. Sin mezcla de runtimes.

---

## Recomendaciones Priorizadas

### 🔴 P0 — Crítico (hacer antes del próximo deploy)

#### P0-1: Limitar pool de conexiones MySQL en Prisma
```
# En .env, añadir al DATABASE_URL:
DATABASE_URL="mysql://user:pass@host/db?connection_limit=3&pool_timeout=20"
```
O en `db.ts`:
```ts
new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
  // connection_limit se configura en el URL
})
```
**Por qué P0:** Sin límite, bajo carga podrías agotar conexiones MySQL en Hostinger → caída total de la app.

#### P0-2: Reducir `bodySizeLimit` en `next.config.js`
```js
// next.config.js
serverActions: {
  bodySizeLimit: '2mb', // Era 10mb — innecesario
}
```
**Por qué P0:** 10mb permite que cualquier request malformado consuma 10MB de RAM. En Hostinger esto puede causar OOM.

---

### 🟠 P1 — Importante (próximo sprint)

#### P1-1: Reducir default limit en Contacts GET
```ts
// api/contacts/route.ts — línea 24
const limit = parseInt(searchParams.get("limit") || "20"); // Era 50
```
**Por qué P1:** 50 contactos × 3 JOINs = query pesada en DB y response grande en RAM.

#### P1-2: Usar `select` específico en Contacts GET (no `account: true`)
```ts
// Cambiar:
account: true,
// Por:
account: { select: { id: true, name: true, type: true } },
```
**Por qué P1:** `account: true` carga todas las columnas de la tabla Company. Innecesario para un listado.

#### P1-3: Verificar e implementar PDF con streaming
Cuando se implemente/revise la ruta PDF de cotizaciones:
```ts
// ✅ Usar renderToStream (en memoria gradual)
import { renderToStream } from '@react-pdf/renderer';
const stream = await renderToStream(<QuotePDF data={quote} />);
return new Response(stream as unknown as ReadableStream, {
  headers: { 'Content-Type': 'application/pdf' }
});
// ❌ Evitar renderToBuffer() — carga el PDF completo en RAM
```
**Por qué P1:** En Hostinger con RAM limitada, `renderToBuffer` en concurrencia puede causar OOM.

#### P1-4: Refactorizar `computeTotals` y `normalizeItems` a un módulo compartido
```
# Crear: src/lib/quote-utils.ts
# Eliminar duplicados de api/quotes/route.ts y api/quotes/[id]/route.ts
```
**Por qué P1:** Código duplicado → riesgo de bugs de desincronización al modificar la lógica de cálculo.

#### P1-5: Acotar `images.remotePatterns` en `next.config.js`
```js
// Cambiar hostname: '**' por dominios reales (ej: solo WhatsApp CDN, S3, etc.)
remotePatterns: [
  { protocol: 'https', hostname: '*.whatsapp.net' },
  // agregar solo dominios reales usados
]
```

---

### 🟡 P2 — Mejora (backlog técnico)

#### P2-1: Upgrade path Next.js (CVE Image DoS)
La vulnerabilidad `GHSA-h25m-26qc-wcjf` afecta self-hosted con Image Optimization.
- **Fix temporal:** Deshabilitar Image Optimization si no se usa (`images: { unoptimized: true }`)
- **Fix definitivo:** Planificar upgrade a Next.js 15+ con testing en rama `feat/nextjs-upgrade`
- **NO usar `npm audit fix --force`** — rompería la app.

#### P2-2: Implementar `/api/leads` 
El módulo `dashboard/leads/` tiene UI pero no tiene ruta API. Sin esto los datos de leads no persistirán.

#### P2-3: Añadir `CONNECTION_POOL_TIMEOUT` a variables de entorno documentadas
Actualizar `.env.example` con el parámetro de connection_limit.

#### P2-4: Error boundaries en todos los módulos Dashboard
Verificar que `dashboard/leads/`, `dashboard/opportunities/`, `dashboard/whatsapp/`, `dashboard/campaigns/` tengan su `error.tsx` y `loading.tsx`.

#### P2-5: Limitar búsqueda en Contacts a campos indexados
El `OR` de búsqueda incluye campos no indexados. Añadir índice en `firstName` o usar `fullName` (ya indexado).

---

## Resumen de Riesgo Global

| Área | Riesgo Actual | Después de P0+P1 |
|---|---|---|
| RAM (reposo) | 🟡 Medio | 🟢 Bajo |
| RAM (PDF concurrente) | 🔴 Alto | 🟡 Medio |
| Conexiones MySQL | 🔴 Alto (sin límite) | 🟢 Bajo |
| Bundle size | 🟡 Medio | 🟡 Medio |
| Seguridad (CVE) | 🟠 Alto | 🟡 Medio (tras fix temporal) |
| Edge/Node split | 🟢 OK | 🟢 OK |
| Paginación | 🟡 Medio | 🟢 Bajo |

---

## Checklist QA — Hosting Fit

- [ ] ✅ P0-1: `connection_limit` en DATABASE_URL
- [ ] ✅ P0-2: `bodySizeLimit: '2mb'` en next.config.js
- [ ] ✅ P1-1: `limit=20` default en contacts
- [ ] ✅ P1-2: `select` específico en account de contacts
- [ ] ✅ P1-3: PDF con `renderToStream`
- [ ] ✅ P1-4: Extraer `computeTotals` a `lib/quote-utils.ts`
- [ ] ✅ P1-5: Acotar `images.remotePatterns`
- [ ] 🔲 P2-1: Plan upgrade Next.js 15
- [ ] 🔲 P2-2: Implementar `/api/leads`
- [ ] 🔲 P2-4: Error/loading boundaries en todos los módulos
