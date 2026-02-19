# Helper script para ejecutar Prisma en Windows
$ErrorActionPreference = "Stop"

Write-Host "Ejecutando Prisma CLI..." -ForegroundColor Green

# Intentar múltiples formas de ejecutar Prisma
try {
    # Método 1: npx con --no-install
    & npx --no-install prisma @args
} catch {
    try {
        # Método 2: Node directo
        & node "node_modules/prisma/build/index.js" @args
    } catch {
        Write-Error "No se pudo ejecutar Prisma. Ejecuta: npm install prisma --save-dev"
        exit 1
    }
}
