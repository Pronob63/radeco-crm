# AG_P0_HOSTINGER_FIX — P0 Hardening RADECO CRM
**Fecha:** 2026-02-19 | **Rama:** `chore/hostinger-p0` | **Autor:** Antigravity

---

## Resumen Ejecutivo

Se aplicaron 3 cambios P0 de hardening para que el proyecto sea estable en Hostinger Node.js Apps (entorno con CPU/RAM limitados y MySQL con conexiones acotadas). **Sin features nuevas. Solo estabilidad.**

---

## Cambios Aplicados

### Cambio 1 — `.env` · Prisma connection pool

**Archivo:** `.env`  
**Qué cambió:**
```diff
- DATABASE_URL="mysql://root@localhost:3306/radeco_crm"
+ DATABASE_URL="mysql://root@localhost:3306/radeco_crm?connection_limit=3&pool_timeout=20"
```

> ⚠️ El password de producción NO está documentado aquí. En el servidor Hostinger, la variable `DATABASE_URL` completa (incluyendo credenciales reales) se configura via panel o SSH, nunca en este repo.

**Por qué:**
- Sin `connection_limit`, Prisma usa el default de 10 conexiones simultáneas al pool MySQL.
- En Hostinger MySQL tiene un límite de conexiones simultáneas por cuenta (típicamente 10-30).
- Bajo carga (ej: 3 usuarios abriendo el dashboard al mismo tiempo) → `Too many connections` → `500` en toda la app.
- `connection_limit=3`: máximo 3 conexiones al pool por instancia de la app.
- `pool_timeout=20`: espera hasta 20s por una conexión libre antes de error (en lugar de fallar inmediatamente).

---

### Cambio 2 — `next.config.js` · bodySizeLimit 10mb → 2mb

**Archivo:** `next.config.js`  
**Qué cambió:**
```diff
  serverActions: {
-   bodySizeLimit: '10mb',
+   // P0: reducido de 10mb → 2mb para evitar spikes de RAM en Hostinger
+   bodySizeLimit: '2mb',
  },
```

**Por qué:**
- `bodySizeLimit: '10mb'` significa que Next.js acepta (y lee en memoria) hasta 10MB por Server Action request.
- En Hostinger con RAM limitada, un payload de 10MB leído en memoria + SSR + Prisma puede causar OOM (Out of Memory → app crash).
- Para cotizaciones, formularios y cualquier operación del CRM, 2MB es más que suficiente.
- Si en el futuro se necesita subir archivos grandes, debe hacerse con streaming directo al storage (S3/R2), nunca por Server Actions.

---

### Cambio 3 — `next.config.js` · images.unoptimized=true (CVE workaround)

**Archivo:** `next.config.js`  
**Qué cambió:**
```diff
  images: {
-   remotePatterns: [
-     {
-       protocol: 'https',
-       hostname: '**',
-     },
-   ],
+   // P0: images.unoptimized=true — workaround CVE GHSA-h25m-26qc-wcjf
+   // (Next.js self-hosted DoS via Image Optimization, next@14.2.35)
+   // Revisitar al hacer upgrade a Next.js 15+
+   unoptimized: true,
  },
```

**Por qué (doble beneficio):**
1. **CVE GHSA-h25m-26qc-wcjf:** `next@14.2.35` es vulnerable a DoS via su endpoint de Image Optimization (`/_next/image`). Un atacante puede enviar requests malformados que hacen spikes de CPU/RAM. Con `unoptimized: true`, Next.js bypasea completamente ese endpoint y sirve las imágenes directamente → vector de ataque eliminado.
2. **hostname: '\*\*':** El wildcard total hacía que Next.js actuara como proxy de imágenes para cualquier dominio externo, consumiendo ancho de banda y RAM de Hostinger. Eliminado.

**Trade-off:** Las imágenes no estarán optimizadas automáticamente (sin WebP conversion, sin resize automático). Para un CRM interno con pocas imágenes (avatares de usuario, logos), este trade-off es totalmente aceptable.

---

### Cambio adicional — `.env.example` · corrección de DB engine

**Archivo:** `.env.example`  
**Qué cambió:**
```diff
- DATABASE_URL="postgresql://radeco:radeco_password@localhost:5432/radeco_crm?schema=public"
+ # Database (MySQL — Hostinger)
+ # IMPORTANTE: connection_limit=3 limita conexiones simultáneas (crítico en Hostinger)
+ # Reemplazar user, password, host y dbname con los valores reales
+ DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/radeco_crm?connection_limit=3&pool_timeout=20"
```

**Por qué:** El `.env.example` estaba documentando PostgreSQL pero el `schema.prisma` usa MySQL (proveedor real en Hostinger). Se corrigió y se documentaron los parámetros de pool.

---

## Comandos Ejecutados y Resultados

| Comando | Exit Code | Resultado |
|---|---|---|
| `git checkout -b chore/hostinger-p0` | 0 | ✅ Rama creada |
| `npm run lint` | 0 | ✅ 0 warnings, 0 errores |
| `npm run build` | 0 | ✅ Compiled successfully, types OK, standalone OK |
| `npm audit --omit=dev` | 1 | ⚠️ 1 high (CVE Next.js — ver nota) |

### Nota sobre `npm audit`:
El CVE `GHSA-h25m-26qc-wcjf` **seguirá apareciendo** en el reporte hasta que se haga upgrade a Next.js 15+. Sin embargo, el **vector de ataque ha sido eliminado** con `images.unoptimized: true` (el endpoint `/_next/image` ya no procesa imágenes). El audit reporta vulnerabilidades por versión, no por configuración — esto es comportamiento esperado.

**NO se usó `npm audit fix --force`** (rompería la app con upgrade a Next@16).

---

## Archivos Modificados

| Archivo | Tipo de cambio | Sensible |
|---|---|---|
| `.env` | Añadido `connection_limit=3&pool_timeout=20` a DATABASE_URL | Sí (credenciales dev locales sin password; prod se configura en servidor) |
| `.env.example` | Corregido PostgreSQL → MySQL + documentación del pool | No (es template) |
| `next.config.js` | `bodySizeLimit: '2mb'`, `images.unoptimized: true`, removed hostname wildcard | No |

---

## Riesgos Mitigados

| Riesgo ID | Descripción | Estado |
|---|---|---|
| RISK-001 | Prisma sin connection_limit → Too many connections MySQL | ✅ Mitigado |
| RISK-002 | bodySizeLimit 10mb → spikes de RAM | ✅ Mitigado |
| RISK-006 | CVE GHSA-h25m-26qc-wcjf DoS via Image Optimization | ✅ Vector eliminado (workaround) |
| RISK-008 | hostname '**' wildcard → proxy de imágenes ilimitado | ✅ Eliminado |

---

## Checklist QA

- [x] Rama `chore/hostinger-p0` creada (no se tocó `main`)
- [x] `connection_limit=3&pool_timeout=20` en DATABASE_URL (`.env` y `.env.example`)
- [x] `bodySizeLimit: '2mb'` en `next.config.js`
- [x] `images.unoptimized: true` en `next.config.js`
- [x] `.env.example` corregido: MySQL en lugar de PostgreSQL
- [x] `npm run lint` → exit 0
- [x] `npm run build` → exit 0
- [x] `npm audit --omit=dev` → 1 high (esperado, vector mitigado)
- [x] Documentación en `/docs/AG_P0_HOSTINGER_FIX.md`
- [x] Documentación en `/docs/AG_P0_HOSTINGER_FIX.json`
- [ ] **PENDIENTE MANUAL:** Actualizar `DATABASE_URL` en Hostinger con `?connection_limit=3&pool_timeout=20`
- [ ] **PENDIENTE MANUAL:** `NEXTAUTH_SECRET` en Hostinger debe ser diferente al de dev
- [ ] **PENDIENTE MANUAL:** PR de `chore/hostinger-p0` → `main` para revisión

---

## Acciones Manuales Requeridas en Hostinger (producción)

> [!IMPORTANT]
> Los cambios al `.env` local no se propagan automáticamente a producción. El `DATABASE_URL` en el panel de Hostinger debe actualizarse manualmente para incluir los parámetros de pool:
>
> ```
> mysql://USER:PASSWORD@HOST:3306/radeco_crm?connection_limit=3&pool_timeout=20
> ```
>
> Hacerlo via Panel Hostinger → Node.js App → Environment Variables (o SSH).

---

## Próximos pasos (P1)

Ver `AG_HOSTINGER_FIT.md` para las recomendaciones P1 pendientes:
- Reducir `limit=50` → `20` en contacts GET
- Usar `select` específico en `account` de contacts
- PDF con `renderToStream()`
- Extraer `computeTotals` a `lib/quote-utils.ts`
