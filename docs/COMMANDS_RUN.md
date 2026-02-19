# Comandos Ejecutados Durante la Auditoría

Fecha: 18 de Febrero, 2026  
Auditor: GitHub Copilot (Claude Sonnet 4.5)

## 1. Instalación y Setup Inicial

```powershell
# Instalación de dependencias
npm install
# Resultado: ✅ 623 packages instalados (20 vulnerabilidades detectadas)
# Warnings: peer dependency conflicts con nodemailer, next@14.2.0 deprecated
```

## 2. Prisma - Generación de Cliente

```powershell
npm run prisma:generate
# Resultado: ✅ Cliente generado exitosamente
# Prisma Client v5.22.0 generado en node_modules/@prisma/client
# Nota: Update available 5.22.0 -> 7.4.0 (major version)
```

## 3. Migración de Base de Datos

```powershell
npm run prisma:migrate
# Database: MySQL @ localhost:3306
# Migration: "init" (creada manualmente)
# Resultado: ✅ Base de datos "radeco_crm" creada
# Todas las tablas generadas correctamente
```

## 4. Seed de Base de Datos

```powershell
npm run prisma:seed
# Resultado: ✅ Seed completado
# - ✅ Roles creados
# - ✅ 5 usuarios demo creados (password: demo123)
# - ✅ Pipelines y etapas creados
# - ✅ Productos creados
# - ✅ Cuentas y contactos creados
# - ✅ Leads de ejemplo creados
# - ✅ Oportunidades creadas
# - ✅ Configuración WhatsApp (stub) creada
# - ✅ Conversación WhatsApp demo creada
```

## 5. Servidor de Desarrollo

```powershell
npm run dev
# Resultado: ✅ Servidor corriendo
# URL: http://localhost:3000
# Puerto: 3000 escuchando en :: (IPv6)
# Procesos Node.js activos: 8 procesos detectados
```

## 6. Linter (ESLint)

```powershell
npm run lint
# Resultado: ⚠️ NO COMPLETADO
# Error: ESLint requiere configuración inicial
# Se detuvo esperando input del usuario (Strict vs Base config)
# Archivo .eslintrc.json NO EXISTE
```

## 7. Build de Producción

```powershell
npm run build
# Resultado: ❌ NO EJECUTADO
# Razón: Se priorizó la reproducción del bug de Contactos
# Predicción: Probablemente falle por falta de import de 'z' (zod)
```

## 8. Tests

```powershell
npm run test
npm run test:unit
# Resultado: ❌ NO EJECUTADO
# Razón: Playwright y Jest configurados pero sin archivos de test
```

## 9. Prisma Studio

```powershell
npm run prisma:studio
# Resultado: ❌ NO EJECUTADO
# Nota: Podría ejecutarse para inspección visual de datos
```

## 10. Verificaciones del Sistema

```powershell
# Verificar procesos Node activos
Get-Process node -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, StartTime

# Verificar puerto 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
# Resultado: ✅ Puerto 3000 en estado LISTEN
```

## Errores Detectados Durante Comandos

1. **npm install**
   - 20 vulnerabilidades (1 moderate, 18 high, 1 critical)
   - next@14.2.0 deprecated (security vulnerability)
   - Conflictos de peer dependencies con nodemailer

2. **npm run prisma:seed** (primera ejecución antes del fix)
   - Error: `prisma.account.create()` requiere campo `provider`
   - Causa: Modelo `Account` duplicado (CRM vs NextAuth)
   - Fix aplicado: Renombrado `Account` → `Company` en schema

3. **npm run dev** (primera ejecución)
   - Error: MODULE_NOT_FOUND '@swc/helpers/cjs/_interop_require_default.cjs'
   - Fix aplicado: `npm install` limpio (borrar node_modules y package-lock.json)

## Comandos Recomendados (No Ejecutados)

```powershell
# Actualizar dependencias de seguridad
npm audit fix

# Actualizar Next.js a versión segura
npm install next@latest

# Configurar ESLint
npm run lint -- --ext .ts,.tsx

# Build de producción completo
npm run build

# Ejecutar Prisma Studio para inspección
npm run prisma:studio
```

## Resumen de Resultados

| Comando | Estado | Notas |
|---------|--------|-------|
| npm install | ✅ OK | 20 vulnerabilidades detectadas |
| prisma:generate | ✅ OK | v5.22.0 |
| prisma:migrate | ✅ OK | Migration "init" aplicada |
| prisma:seed | ✅ OK | Datos demo creados |
| npm run dev | ✅ OK | localhost:3000 |
| npm run lint | ⚠️ PENDIENTE | Requiere configuración |
| npm run build | ❌ NO EJECUTADO | - |
| npm run test | ❌ NO EJECUTADO | Sin tests |

## Configuración del Entorno

- **Node.js**: v24.13.1
- **npm**: (versión no capturada)
- **Base de datos**: MySQL (XAMPP) @ localhost:3306
- **Database name**: radeco_crm
- **Workspace**: F:\CRM - Radeco
- **OS**: Windows
