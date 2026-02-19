# Script de Diagnostico - Verificar Configuracion de Hostinger

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTICO RADECO CRM - HOSTINGER" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Variables esperadas
$expectedVars = @(
    "DATABASE_URL",
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
    "NODE_ENV",
    "APP_URL"
)

Write-Host "CHECKLIST DE CONFIGURACION" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Repositorio GitHub" -ForegroundColor Green
Write-Host "   URL: https://github.com/Pronob63/radeco-crm.git" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Configuracion en Hostinger" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Debes verificar en Hostinger -> Node.js App:" -ForegroundColor White
Write-Host ""
Write-Host "   a) Node.js Version:" -ForegroundColor Cyan
Write-Host "      [X] Actual: 18.x (segun captura)" -ForegroundColor Red
Write-Host "      [OK] Requerido: 20.x o 22.x" -ForegroundColor Green
Write-Host ""

Write-Host "   b) Build Settings:" -ForegroundColor Cyan
Write-Host "      Build command: npm run build" -ForegroundColor Gray
Write-Host "      Start command: npm start" -ForegroundColor Gray
Write-Host ""

Write-Host "   c) Pre-deployment Script:" -ForegroundColor Cyan
Write-Host "      npx prisma generate" -ForegroundColor Gray
Write-Host "      npx prisma migrate deploy" -ForegroundColor Gray
Write-Host ""

Write-Host "   d) Variables de Entorno REQUERIDAS:" -ForegroundColor Cyan
Write-Host ""
foreach ($var in $expectedVars) {
    Write-Host "      - $var" -ForegroundColor White
}
Write-Host ""

Write-Host "3. Base de Datos MySQL" -ForegroundColor Yellow
Write-Host ""
Write-Host "   En Hostinger -> Bases de datos -> MySQL:" -ForegroundColor White
Write-Host "   - Database: radeco_crm" -ForegroundColor Gray
Write-Host "   - User: radeco_user" -ForegroundColor Gray
Write-Host "   - Password: [TU_CONTRASENA_SEGURA]" -ForegroundColor Gray
Write-Host ""

Write-Host "4. NEXTAUTH_SECRET Generado" -ForegroundColor Green
Write-Host "   XQwYFEzO698vP7HvUdAHyOay5iN0/IsDUfrpGPUMKeY=" -ForegroundColor Gray
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "PROXIMOS PASOS INMEDIATOS" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$steps = @(
    "1. Actualizar Node.js version a 20.x o 22.x en Hostinger",
    "2. Crear base de datos MySQL (si no existe): radeco_crm",
    "3. Verificar/agregar variables de entorno en Hostinger",
    "4. Configurar Pre-deployment Script en Hostinger",
    "5. Redeploy la aplicacion",
    "6. Verificar logs de build y deploy",
    "7. Acceder a https://crm.plan-radeco.online"
)

foreach ($step in $steps) {
    Write-Host "   $step" -ForegroundColor White
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "COMANDOS UTILES" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Copiar variables de entorno al portapapeles:" -ForegroundColor Yellow
Write-Host ".\copy-env-vars.ps1" -ForegroundColor Green
Write-Host ""

Write-Host "Ver documentacion completa:" -ForegroundColor Yellow
Write-Host "code PASOS_SIGUIENTES_HOSTINGER.md" -ForegroundColor Green
Write-Host ""

Write-Host "Ver checklist detallado:" -ForegroundColor Yellow
Write-Host "code CHECKLIST_INSTALACION.md" -ForegroundColor Green
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "URL DE PRODUCCION ESPERADA" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "https://crm.plan-radeco.online" -ForegroundColor Green
Write-Host ""
Write-Host ""
