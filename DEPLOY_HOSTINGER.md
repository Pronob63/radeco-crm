# Deploy RADECO CRM en Hostinger Business Web Hosting

## 📋 Datos de Deploy
- **URL**: `crm.plan-radeco.online`
- **Node.js**: 18/20/22/24 (recomendado: 22)
- **MySQL**: En Hostinger (misma cuenta)
- **Método**: GitHub auto-deploy
- **Output Mode**: `standalone` (activado en next.config.js)

---

## ✅ PASO 1: Preparar GitHub

### 1.1 Crear repositorio en GitHub (si no existe)
```bash
git init
git add .
git commit -m "Initial commit RADECO CRM"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/radeco-crm.git
git push -u origin main
```

### 1.2 Crear token de GitHub (para acceso desde Hostinger)
1. Ir a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Darle nombre: `hostinger-deploy`
4. Scopes requeridos: `repo`, `workflow`
5. Copiar el token (lo usarás en Hostinger)

---

## 📦 PASO 2: Configurar MySQL en Hostinger

### 2.1 Crear base de datos en Hostinger
1. Panel Hostinger → Bases de datos → MySQL
2. Crear base de datos: `radeco_crm`
3. Crear usuario: `radeco_user` con contraseña fuerte
4. Hacer que `radeco_user` tenga permisos en `radeco_crm`
5. **Copiar datos de conexión:**
   - `DATABASE_URL`: `mysql://radeco_user:PASSWORD@localhost:3306/radeco_crm`
   - (si es remota: `mysql://radeco_user:PASSWORD@BD_HOST:3306/radeco_crm`)

### 2.2 Verificar acceso local (en tu PC)
```bash
# Instalar MySQL CLI o usar un GUI (DBeaver, MySQL Workbench)
# Probar conexión con los datos que copiaste
```

---

## 🔧 PASO 3: Configurar Variables de Entorno en Hostinger

En el **Node.js App** settings de Hostinger, agregar estas variables:

```env
# Database
DATABASE_URL=mysql://radeco_user:PASSWORD@localhost:3306/radeco_crm

# NextAuth
NEXTAUTH_URL=https://crm.plan-radeco.online
NEXTAUTH_SECRET=xxxxx_GENERAR_UNA_FUERTE_xxxxx

# Email (si usas SMTP de Hostinger)
SMTP_HOST=localhost
SMTP_PORT=465
SMTP_USER=noreply@plan-radeco.online
SMTP_PASS=PASSWORD_HOSTINGER
SMTP_FROM=noreply@plan-radeco.online

# WhatsApp (opcional, agregar después)
# WHATSAPP_API_URL=xxx
# WHATSAPP_API_KEY=xxx
```

### ⚙️ Generar NEXTAUTH_SECRET
```bash
# En tu terminal local
openssl rand -base64 32
# Copiar el resultado a NEXTAUTH_SECRET en Hostinger
```

---

## 🚀 PASO 4: Deploy en Hostinger

### 4.1 Conectar GitHub a Hostinger
1. Panel Hostinger → Node.js Apps → Crear app / Editar app
2. Seleccionar `GitHub` como origen
3. Authorizar GitHub con el token personal (o login)
4. Seleccionar repositorio: `radeco-crm`
5. Branch: `main`
6. Build command: `npm run build` (ya en package.json)
7. Start command: `npm start` (ya en package.json)
8. Aplicar y guardar

### 4.2 Los pasos que Hostinger hace automáticamente
- Clona el repo
- Instala dependencias (`npm install`)
- Ejecuta build (`npm run build`)
- Inicia con `npm start`

---

## 🗄️ PASO 5: Migraciones de Prisma

### 5.1 Opción A: Aplicar migraciones en Hostinger (recomendado)
Hostinger permite ejecutar comandos antes de start. En Node.js App settings:

**Pre-deployment script:**
```bash
npm run prisma:migrate:deploy
npm run prisma:generate
```

### 5.2 Opción B: Manual antes de deploy
En tu PC local:
```bash
# Generar migración de los cambios recientes
npm run prisma:migrate:deploy
```
Luego hacer push a GitHub. Hostinger lo toma automáticamente.

---

## 🌱 PASO 6: Seed de Datos (si quieres demo data)

### 6.1 Opción A: Via terminal de Hostinger
1. Panel Hostinger → Terminal (SSH)
2. Navegar a la app
3. Ejecutar:
```bash
cd /home/xxx/crm.plan-radeco.online
npm run prisma:seed
```

### 6.2 Opción B: Via npm en local y sync
```bash
npm run prisma:seed
git push origin main
# Hostinger redeploy automático
```

---

## ✅ PASO 7: Verificar Deploy

1. Entrar a `https://crm.plan-radeco.online`
2. Ver que carga sin errores
3. Intentar login (prueba con usuario de seed)
4. Verificar que las páginas (Dashboard, Contacts, Quotes, etc.) cargan

### 📋 Checklist:
- [ ] Sitio carga correctamente
- [ ] Login funciona
- [ ] Dashboard muestra datos
- [ ] Crear contacto/oportunidad/cotización
- [ ] Ver que la API responde (/api/contacts, /api/quotes, etc.)
- [ ] Revisar logs de Hostinger si hay errores

---

## 🔄 PASO 8: Despliegues Futuros

Cada vez que hagas cambios en GitHub:
```bash
git add .
git commit -m "Descripcion del cambio"
git push origin main
```

**Automáticamente Hostinger:**
1. Detecta el push
2. Clona los cambios
3. Compila (`npm run build`)
4. Reinicia la app

**OJO:** Si cambias el schema de Prisma:
```bash
npm run prisma:migrate dev
git add .
git commit -m "Add new DB fields"
git push origin main
# Hostinger hace build + deploy + migraciones automáticas
```

---

## 🛠️ Troubleshooting

### Error: "Cannot find module 'next'"
- Verifica que `npm install` se ejecutó (deberia ser automático)
- En Hostinger, ve a Settings y click "Reinstall dependencies"

### Error: "DATABASE_URL not set"
- Verifica que la variable está en Hostinger Node.js App → Environment variables
- Reinicia la app después de agregar variables

### Error: "Prisma schema validation"
- Genera Prisma: `npm run prisma:generate`
- Haz push a GitHub
- Hostinger redeploy automático

### App se cuelga / no responde
- Revisa logs en Hostinger Console
- Verifica conexión MySQL (ping al host)
- Reinicia la app en Hostinger panel

### NextAuth login no funciona
- Verifica `NEXTAUTH_URL` exacta (sin trailing slash)
- Verifica `NEXTAUTH_SECRET` está configurado
- Revisa logs de error en browser DevTools

---

## 📌 URL Importante
- **Producción**: `https://crm.plan-radeco.online`
- **GitHub Webhook**: Auto-configurado por Hostinger

---

## 🎯 Resumen
Tu CRM estará live en `crm.plan-radeco.online` con:
- ✅ Base de datos MySQL en Hostinger
- ✅ Next.js + NextAuth + Prisma
- ✅ API completa (Contacts, Opportunities, Quotes, etc.)
- ✅ Auto-deploy cada que hagas push a GitHub

**¡Éxito con RADECO CRM!** 🚀
