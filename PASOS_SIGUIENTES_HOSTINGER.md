# 🚀 Siguientes Pasos - Deploy en Hostinger

## ✅ Estado Actual del Deploy

Según la captura de pantalla:
- ✅ Repository: `radeco-crm` conectado
- ✅ Branch: `main` 
- ✅ Commit: `734618c5`
- ✅ Framework: Next.js detectado
- ⚠️ Node version: **18.x** (debería ser 20 o 22)
- ✅ Build en proceso/completado

---

## 🔧 CONFIGURACIONES CRÍTICAS PENDIENTES

### 1. ⚠️ Actualizar Node.js Version (IMPORTANTE)

**Problema**: Node 18.x es muy antiguo para Next.js 14

**Solución**:
1. En Hostinger → Node.js App settings
2. Buscar "Node version" o "Node.js version"
3. Cambiar de **18.x** a **20.x** o **22.x** (recomendado)
4. Guardar y redeploy

---

### 2. 🗄️ Verificar Variables de Entorno

**CRÍTICO**: Revisa que estas variables estén configuradas en Hostinger:

1. Ve a: **Node.js App** → **Environment Variables**
2. Verifica que existan:

```env
DATABASE_URL=mysql://radeco_user:TU_CONTRASEÑA@localhost:3306/radeco_crm
NEXTAUTH_URL=https://crm.plan-radeco.online
NEXTAUTH_SECRET=XQwYFEzO698vP7HvUdAHyOay5iN0/IsDUfrpGPUMKeY=
NODE_ENV=production
APP_URL=https://crm.plan-radeco.online
```

**Si NO están configuradas**:
- Ejecuta en tu PC: `.\copy-env-vars.ps1`
- Pega las variables en Hostinger
- Actualiza `DATABASE_URL` con la contraseña real de MySQL
- **Reinicia la aplicación**

---

### 3. 📦 Crear Base de Datos MySQL (Si no está creada)

**Pasos**:
1. Panel Hostinger → **Bases de datos** → **MySQL Databases**
2. Click **Create Database**
3. Datos:
   ```
   Database name: radeco_crm
   Database user: radeco_user
   Password: [GENERA UNA FUERTE Y ANÓTALA]
   ```
4. Asigna todos los privilegios de `radeco_user` en `radeco_crm`
5. **IMPORTANTE**: Anota la contraseña porque la necesitas para el `DATABASE_URL`

**Formato del DATABASE_URL**:
```
mysql://radeco_user:LA_CONTRASEÑA_QUE_GENERASTE@localhost:3306/radeco_crm
```

---

### 4. 🔨 Configurar Build Settings

Verifica en **Node.js App** → **Settings**:

**Build Command**:
```bash
npm run build
```

**Start Command**:
```bash
npm start
```

**Application Startup File** (puede ser opcional):
```
server.js
```
o
```
.next/standalone/server.js
```

---

### 5. ⚙️ Configurar Pre-deployment Script (MUY IMPORTANTE)

**Sin esto, Prisma NO funcionará**

1. En Node.js App settings, busca:
   - "Pre-deployment script" 
   - o "Advanced settings"
   - o "Deploy hooks"
   
2. Agrega este script:
```bash
npx prisma generate
npx prisma migrate deploy
```

3. **¿Por qué es importante?**
   - `prisma generate`: Genera el Prisma Client necesario
   - `prisma migrate deploy`: Aplica las migraciones a la base de datos

---

### 6. 🔄 Redeploy la Aplicación

Después de configurar todo lo anterior:

1. Ve a Node.js App
2. Click en **Redeploy** o **Update**
3. Espera que termine el build (2-5 minutos)
4. Monitorea los logs

---

## 📋 Checklist de Verificación

Marca cada item mientras lo completas:

- [ ] **Node.js version actualizada a 20.x o 22.x**
- [ ] **Base de datos MySQL creada** (`radeco_crm`)
- [ ] **Usuario MySQL creado** (`radeco_user`) con privilegios
- [ ] **Variables de entorno configuradas** (especialmente DATABASE_URL)
- [ ] **DATABASE_URL tiene la contraseña correcta**
- [ ] **Build command configurado**: `npm run build`
- [ ] **Start command configurado**: `npm start`
- [ ] **Pre-deployment script configurado** (prisma generate + migrate)
- [ ] **Aplicación redeployada**
- [ ] **Logs revisados** sin errores críticos

---

## 🧪 Cómo Verificar que Funciona

### Opción A: Ver los Logs de Deploy

1. En Hostinger → Node.js App → **Logs** o **Build logs**
2. Busca estos mensajes de éxito:
   ```
   ✓ Prisma schema loaded
   ✓ Prisma Client generated
   ✓ Migrations applied
   ✓ Build completed
   ✓ Application started
   ```

3. Si ves errores como:
   ```
   Error: Cannot find module '@prisma/client'
   Error: DATABASE_URL is not set
   Error: NEXTAUTH_SECRET must be provided
   ```
   → Revisa las variables de entorno y el pre-deployment script

### Opción B: Acceder al Sitio

1. Abre en el navegador: `https://crm.plan-radeco.online`

2. **Si funciona correctamente**:
   - Deberías ver la página de login
   - Sin errores 500/502/503
   
3. **Si ves error 502/503**:
   - La app no está iniciando correctamente
   - Revisa logs en Hostinger
   - Verifica conexión a base de datos
   
4. **Si ves error "Internal Server Error"**:
   - Revisa que `DATABASE_URL` esté correcta
   - Verifica que las migraciones se aplicaron
   - Verifica que `NEXTAUTH_SECRET` esté configurado

### Opción C: Probar la API

Abre en el navegador:
```
https://crm.plan-radeco.online/api/contacts
```

- **Si funciona**: Verás un JSON (puede estar vacío `[]` o con datos)
- **Si da error**: Hay problema con la base de datos o variables de entorno

---

## 🗄️ Ejecutar Seed de Datos (Opcional)

Si todo funciona y quieres datos de prueba:

### Opción A: Via Pre-deployment Script
Agrega al final del pre-deployment script:
```bash
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```

### Opción B: Via SSH (si tienes acceso)
```bash
# Conectar por SSH
ssh usuario@tu-servidor-hostinger

# Navegar a la app
cd /home/tu_usuario/htdocs/crm.plan-radeco.online

# Ejecutar seed
npm run prisma:seed
```

### Opción C: Via Terminal de Hostinger
Si Hostinger tiene un terminal web:
```bash
npm run prisma:seed
```

**Datos de prueba que se crearán**:
```
Email: admin@radeco.com
Password: admin123
```

---

## 🆘 Errores Comunes

### Error: "Cannot find module '@prisma/client'"
**Solución**:
1. Agrega pre-deployment script: `npx prisma generate`
2. Redeploy la app

### Error: "PrismaClientInitializationError"
**Solución**:
1. Verifica que `DATABASE_URL` esté correcta
2. Verifica que la base de datos existe
3. Verifica que el usuario tiene permisos
4. Redeploy

### Error: "NEXTAUTH_URL must be provided"
**Solución**:
1. Agrega `NEXTAUTH_URL=https://crm.plan-radeco.online` en variables de entorno
2. Agrega `NEXTAUTH_SECRET=XQwYFEzO698vP7HvUdAHyOay5iN0/IsDUfrpGPUMKeY=`
3. Reinicia la app

### App se queda cargando infinitamente
**Solución**:
1. Revisa los logs de la aplicación
2. Verifica que `npm start` esté ejecutándose
3. Verifica que el puerto esté correcto
4. Reinicia la app

### Build falla
**Solución**:
1. Verifica que Node version sea 20 o 22
2. Verifica que `package.json` tenga el script `build`
3. Revisa los logs de build para ver el error específico

---

## 📞 Información de Contacto/Soporte

Si necesitas más ayuda:
- **Documentación completa**: Ver `INSTALACION_HOSTINGER_PASO_A_PASO.md`
- **Checklist rápido**: Ver `CHECKLIST_INSTALACION.md`
- **Soporte Hostinger**: Panel → Help/Support

---

## 🎯 Resumen Rápido

**LO MÁS IMPORTANTE QUE DEBES HACER AHORA**:

1. ✅ **Actualizar Node.js a version 20 o 22**
2. ✅ **Crear base de datos MySQL** (si no existe)
3. ✅ **Configurar variables de entorno** (especialmente DATABASE_URL)
4. ✅ **Agregar pre-deployment script** (prisma generate + migrate)
5. ✅ **Redeploy** la aplicación
6. ✅ **Verificar** que `https://crm.plan-radeco.online` carga

---

**¡Casi estás listo! Sigue estos pasos y tu CRM estará funcionando! 🚀**
