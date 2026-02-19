# ✅ CHECKLIST RÁPIDO - Instalación Hostinger

## Pre-requisitos
- [ ] Cuenta de Hostinger activa
- [ ] Acceso al panel de Hostinger
- [ ] Dominio `crm.plan-radeco.online` configurado

---

## PASO 1: Base de Datos MySQL
- [ ] Ir a Hostinger → Bases de datos → MySQL
- [ ] Crear base de datos: `radeco_crm`
- [ ] Crear usuario: `radeco_user`
- [ ] Asignar permisos al usuario
- [ ] Copiar datos de conexión (host, puerto, usuario, contraseña)
- [ ] Anotar la contraseña en un lugar seguro

---

## PASO 2: Variables de Entorno
- [ ] Ejecutar: `.\copy-env-vars.ps1` (copia vars al portapapeles)
- [ ] Ir a Hostinger → Node.js Apps → Environment Variables
- [ ] Pegar las variables
- [ ] **IMPORTANTE**: Actualizar `DATABASE_URL` con la contraseña real de MySQL
- [ ] Guardar cambios

---

## PASO 3: Configurar Node.js App
- [ ] Ir a Hostinger → Node.js Apps → Create Application
- [ ] Application URL: `https://crm.plan-radeco.online`
- [ ] Node.js version: **22** (o 20)
- [ ] Source: **GitHub**
- [ ] Repository: **Pronob63/radeco-crm**
- [ ] Branch: **main**
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`

---

## PASO 4: Pre-deployment Script
- [ ] En Advanced Settings, agregar Pre-deployment script:
```bash
npx prisma generate
npx prisma migrate deploy
```
- [ ] Guardar configuración

---

## PASO 5: Deploy
- [ ] Click en "Deploy" o "Update"
- [ ] Esperar el build (2-5 minutos)
- [ ] Monitorear logs en tiempo real
- [ ] Esperar mensaje de "Application started successfully"

---

## PASO 6: Verificación
- [ ] Abrir: `https://crm.plan-radeco.online`
- [ ] Verificar que el sitio carga
- [ ] Verificar que aparece la página de login
- [ ] Revisar que no hay errores en consola del navegador

---

## PASO 7: Seed (Opcional)
- [ ] Conectar por SSH a Hostinger
- [ ] Navegar al directorio de la app
- [ ] Ejecutar: `npm run prisma:seed`
- [ ] Verificar que los datos se crearon

---

## PASO 8: Primer Login
- [ ] Email: `admin@radeco.com` (si hiciste seed)
- [ ] Password: `admin123` (si hiciste seed)
- [ ] Cambiar contraseña inmediatamente
- [ ] Verificar acceso al dashboard
- [ ] Probar módulos principales (Contactos, Leads, Oportunidades)

---

## ✨ Post-Instalación (Opcional)
- [ ] Configurar WhatsApp API (docs/CONFIG_WHATSAPP.md)
- [ ] Configurar SMTP para emails
- [ ] Crear usuarios adicionales
- [ ] Configurar roles y permisos
- [ ] Importar datos reales

---

## 🛠️ En Caso de Errores

### Error de conexión a la base de datos
1. Verificar DATABASE_URL en variables de entorno
2. Verificar que el usuario MySQL tiene permisos
3. Reiniciar la aplicación

### Error "NEXTAUTH_URL must be provided"
1. Verificar que NEXTAUTH_URL está en variables de entorno
2. Verificar que NEXTAUTH_SECRET está presente
3. Reiniciar la aplicación

### App no inicia
1. Revisar logs en Node.js App → Logs
2. Verificar que el build terminó correctamente
3. Verificar que las migraciones se aplicaron
4. Contactar soporte de Hostinger si persiste

---

## 📞 Recursos
- Guía completa: `INSTALACION_HOSTINGER_PASO_A_PASO.md`
- Documentación de deploy: `DEPLOY_HOSTINGER.md`
- Configuración WhatsApp: `docs/CONFIG_WHATSAPP.md`
- Repositorio: `https://github.com/Pronob63/radeco-crm.git`

---

**¡Good luck con el deploy! 🚀**
