# 🚀 Instalación RADECO CRM en Hostinger - Guía Paso a Paso

**Fecha**: 19 de Febrero de 2026  
**URL de Producción**: `https://crm.plan-radeco.online`  
**Repositorio**: `https://github.com/Pronob63/radeco-crm.git`

---

## ✅ PASO 1: Verificación de Repositorio GitHub
- **Estado**: ✅ COMPLETADO
- **Repositorio**: `https://github.com/Pronob63/radeco-crm.git`
- **Branch**: `main`
- **Último commit**: Sincronizado y listo

---

## 📦 PASO 2: Crear Base de Datos MySQL en Hostinger

### 2.1 Acceder al Panel de Hostinger
1. Ir a [Hostinger Panel](https://hpanel.hostinger.com/)
2. Navegar a: **Bases de datos** → **MySQL Databases**

### 2.2 Crear Nueva Base de Datos
```
Nombre de la base de datos: radeco_crm
Nombre de usuario: radeco_user
Contraseña: [GENERAR UNA CONTRASEÑA FUERTE]
```

### 2.3 Asignar Permisos
- Hacer que el usuario `radeco_user` tenga **TODOS los privilegios** en `radeco_crm`

### 2.4 Copiar Datos de Conexión
**IMPORTANTE**: Anota estos datos, los necesitarás para las variables de entorno:

```
Host: localhost (o el host que te proporcione Hostinger)
Puerto: 3306
Base de datos: radeco_crm
Usuario: radeco_user
Contraseña: [LA QUE GENERASTE]
```

**DATABASE_URL (formato Prisma)**:
```
mysql://radeco_user:TU_CONTRASEÑA@localhost:3306/radeco_crm
```

---

## 🔐 PASO 3: Variables de Entorno Generadas

### 3.1 NEXTAUTH_SECRET (YA GENERADO)
```
XQwYFEzO698vP7HvUdAHyOay5iN0/IsDUfrpGPUMKeY=
```

### 3.2 Variables de Entorno Completas para Hostinger

Copia y pega estas variables en **Hostinger → Node.js App → Environment Variables**:

```env
# Database (ACTUALIZAR con tus datos del PASO 2)
DATABASE_URL=mysql://radeco_user:TU_CONTRASEÑA@localhost:3306/radeco_crm

# NextAuth (URL de producción)
NEXTAUTH_URL=https://crm.plan-radeco.online
NEXTAUTH_SECRET=XQwYFEzO698vP7HvUdAHyOay5iN0/IsDUfrpGPUMKeY=

# App Config
NODE_ENV=production
APP_NAME=RADECO CRM
APP_URL=https://crm.plan-radeco.online

# Logging
LOG_LEVEL=info

# WhatsApp (OPCIONAL - Configurar después)
WHATSAPP_ENABLED=false
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WABA_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_API_VERSION=v18.0

# Email SMTP (OPCIONAL - Configurar si usas SMTP de Hostinger)
SMTP_HOST=localhost
SMTP_PORT=465
SMTP_USER=noreply@plan-radeco.online
SMTP_PASS=
EMAIL_FROM=RADECO CRM <noreply@plan-radeco.online>
```

---

## 🚀 PASO 4: Configurar Node.js App en Hostinger

### 4.1 Crear o Editar Node.js App
1. Panel Hostinger → **Node.js Apps** → **Create Application** (o editar si ya existe)

### 4.2 Configuración de la Aplicación
```
Application root: /
Application URL: https://crm.plan-radeco.online
Application startup file: server.js (o .next/standalone/server.js)
Node.js version: 22 (recomendado) o 20
```

### 4.3 GitHub Configuration
```
Source: GitHub
Repository: Pronob63/radeco-crm
Branch to deploy: main
```

### 4.4 Build & Start Commands
```
Build command: npm run build
Start command: npm start
```

### 4.5 Pre-deployment Script (MUY IMPORTANTE)
En la sección "Advanced settings" o "Pre-deployment script", agrega:
```bash
npx prisma generate
npx prisma migrate deploy
```

Esto asegura que:
- Prisma Client se genere antes de iniciar
- Las migraciones de base de datos se apliquen automáticamente

---

## 🗄️ PASO 5: Aplicar Migraciones y Seed

### 5.1 Opción A: Automático (Recomendado)
Las migraciones se aplicarán automáticamente con el pre-deployment script del PASO 4.5

### 5.2 Opción B: Manual via SSH (si es necesario)
```bash
# Conectar por SSH a Hostinger
ssh usuario@YOUR_HOSTINGER_SERVER

# Navegar al directorio de la app
cd /home/YOUR_USER/crm.plan-radeco.online

# Aplicar migraciones
npm run prisma:migrate:deploy

# Generar Prisma Client
npm run prisma:generate

# (OPCIONAL) Seed de datos de prueba
npm run prisma:seed
```

---

## ✅ PASO 6: Deploy y Verificación

### 6.1 Iniciar Deploy
1. En Hostinger Node.js App, click en **Update** o **Deploy**
2. Hostinger automáticamente:
   - Clonará el repositorio
   - Ejecutará `npm install`
   - Ejecutará el pre-deployment script (migraciones)
   - Ejecutará `npm run build`
   - Iniciará con `npm start`

### 6.2 Monitorear el Deploy
- Ve a **Node.js App** → **Logs** para ver el proceso
- Espera a que termine el build (puede tomar 2-5 minutos)

### 6.3 Verificar el Sitio
1. Abre: `https://crm.plan-radeco.online`
2. Deberías ver la página de login
3. Intenta iniciar sesión (si hiciste seed, usa: `admin@radeco.com`)

### 6.4 Checklist de Verificación
- [ ] Sitio carga sin errores 502/503
- [ ] Página de login aparece correctamente
- [ ] Login funciona (si tienes usuarios)
- [ ] Dashboard carga
- [ ] Módulos principales funcionan (Contacts, Leads, Opportunities)
- [ ] API responde: `https://crm.plan-radeco.online/api/contacts`

---

## 🔄 PASO 7: Deploys Futuros

### 7.1 Proceso Automático
Cada vez que hagas cambios:
```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

**Hostinger detectará el push automáticamente y redesplegarĂ¡**

### 7.2 Si Cambias el Schema de Prisma
```bash
# EN LOCAL
npm run prisma:migrate dev
# Esto creará una nueva migración

git add .
git commit -m "Update database schema"
git push origin main

# Hostinger aplicará automáticamente las nuevas migraciones
```

---

## 🛠️ Troubleshooting

### Error: "Cannot connect to database"
1. Verifica que `DATABASE_URL` esté correcta en las variables de entorno
2. Verifica que el usuario MySQL tenga permisos
3. Reinicia la aplicación en Hostinger

### Error: "NEXTAUTH_URL must be provided"
1. Verifica que `NEXTAUTH_URL` y `NEXTAUTH_SECRET` estén en las variables de entorno
2. Reinicia la app

### Error: "Prisma Client did not initialize"
1. Verifica que el pre-deployment script se ejecute
2. Manualmente ejecuta: `npx prisma generate` vía SSH
3. Reinicia la app

### App se queda cargando
1. Revisa los logs en Hostinger → Node.js App → Logs
2. Verifica que el build haya terminado correctamente
3. Verifica que `npm start` esté ejecutándose

---

## 📞 Datos de Usuario Admin (si hiciste seed)

```
Email: admin@radeco.com
Password: admin123
```

**IMPORTANTE**: Cambia la contraseña inmediatamente después del primer login.

---

## 🎯 Resumen de lo que tienes

✅ **Repositorio GitHub**: `https://github.com/Pronob63/radeco-crm.git`  
✅ **NEXTAUTH_SECRET**: Generado y listo  
✅ **Configuración de Next.js**: `standalone` mode activo  
✅ **Base de datos**: MySQL configurado en Prisma  
✅ **Scripts de deploy**: Listos en package.json  

---

## 📋 Lista de Tareas

- [x] Verificar repositorio GitHub
- [x] Generar NEXTAUTH_SECRET
- [ ] Crear base de datos MySQL en Hostinger
- [ ] Configurar variables de entorno en Hostinger
- [ ] Conectar GitHub a Hostinger
- [ ] Configurar Node.js App
- [ ] Aplicar migraciones
- [ ] Verificar deploy

---

## ✨ Próximos Pasos Opcionales

1. **Configurar WhatsApp API** (ver [CONFIG_WHATSAPP.md](docs/CONFIG_WHATSAPP.md))
2. **Configurar SMTP** para envío de emails
3. **SSL/HTTPS** (Hostinger lo hace automáticamente)
4. **Configurar dominio personalizado** (si lo deseas)
5. **Monitoreo y logs** con herramientas de Hostinger

---

**¡Tu CRM estará en producción en `https://crm.plan-radeco.online`!** 🚀
