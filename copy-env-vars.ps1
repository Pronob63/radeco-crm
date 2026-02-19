# Script para copiar variables de entorno al portapapeles
# Uso: .\copy-env-vars.ps1

$envVars = @"
DATABASE_URL=mysql://radeco_user:TU_CONTRASEÑA@localhost:3306/radeco_crm
NEXTAUTH_URL=https://crm.plan-radeco.online
NEXTAUTH_SECRET=XQwYFEzO698vP7HvUdAHyOay5iN0/IsDUfrpGPUMKeY=
NODE_ENV=production
APP_NAME=RADECO CRM
APP_URL=https://crm.plan-radeco.online
LOG_LEVEL=info
WHATSAPP_ENABLED=false
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WABA_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_API_VERSION=v18.0
SMTP_HOST=localhost
SMTP_PORT=465
SMTP_USER=noreply@plan-radeco.online
SMTP_PASS=
EMAIL_FROM=RADECO CRM <noreply@plan-radeco.online>
"@

Set-Clipboard -Value $envVars

Write-Host "✅ Variables de entorno copiadas al portapapeles!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Ve a Hostinger → Node.js App → Environment Variables"
Write-Host "2. Pega las variables (Ctrl+V)"
Write-Host "3. IMPORTANTE: Reemplaza 'TU_CONTRASEÑA' con la contraseña de MySQL"
Write-Host ""
Write-Host "Contenido copiado:" -ForegroundColor Yellow
Write-Host $envVars
