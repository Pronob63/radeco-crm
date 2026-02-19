# TANDA 1.1 Reporte

Fecha: 2026-02-19

## Objetivo
Eliminar warnings de Edge Runtime por bcryptjs sin romper NextAuth/Prisma.

## Busqueda de bcrypt
- Consulta: rg "bcrypt|bcryptjs" -n src
- Resultado: solo en src/lib/auth.ts

## Cambios aplicados
1) Se creo un modulo de password Node-only:
- src/lib/password.ts
- Motivo: aislar bcryptjs para uso exclusivo en runtime Node.

2) Se separo la config base de NextAuth (edge-safe):
- src/lib/auth-config.ts
- Motivo: permitir middleware sin importar bcryptjs ni adapter.

3) Se creo un helper de auth para middleware (edge-safe):
- src/lib/auth-edge.ts
- Motivo: evitar importar auth.ts en Edge.

4) auth.ts ya no importa bcryptjs:
- src/lib/auth.ts
- Motivo: mover verificacion de password a verifyPassword en password.ts.

5) Middleware usa auth-edge:
- src/middleware.ts
- Motivo: prevenir warnings de Edge runtime.

6) Ruta NextAuth fuerza Node runtime:
- src/app/api/auth/[...nextauth]/route.ts
- Motivo: garantizar ejecucion Node para credentials y Prisma.

## Comandos ejecutados y resultados
1) npm run build
- Resultado: OK, sin warnings de Edge Runtime por bcryptjs.

## Archivos tocados
- src/lib/password.ts
- src/lib/auth-config.ts
- src/lib/auth-edge.ts
- src/lib/auth.ts
- src/middleware.ts
- src/app/api/auth/[...nextauth]/route.ts

## Notas
- Middleware ya no arrastra bcryptjs.
- Auth route se fuerza a nodejs para evitar Edge runtime.
