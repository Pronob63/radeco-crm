# RADECO CRM

Sistema CRM premium para RADECO - Gestión integral de clientes, leads, oportunidades, cotizaciones, WhatsApp y campañas para el sector agrícola ecuatoriano.

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Características Principales

- **Dashboard Ejecutivo**: KPIs en tiempo real, actividades recientes, estado de pipelines
- **Gestión de Contactos y Cuentas**: Base de datos completa de clientes (agricultores, camaroneros, agroindustria)
- **Leads Omnicanal**: Captura desde WhatsApp, web, Instagram, Facebook, ferias y llamadas
- **Pipeline de Oportunidades**: Gestión visual tipo Kanban con múltiples pipelines (Implementos, Repuestos, Tractores)
- **Cotizaciones PDF**: Generación y envío automático por WhatsApp
- **WhatsApp Business API**: Inbox integrado, plantillas, etiquetas y asignación a vendedores
- **Campañas Segmentadas**: Envíos masivos con segmentación avanzada
- **Reportes y Analytics**: Conversión, tiempo de respuesta, performance por vendedor/producto
- **RBAC Completo**: 6 roles predefinidos con permisos granulares
- **Auditoría**: Log completo de acciones críticas

## 🚀 Inicio Rápido (10 minutos)

### Prerequisitos

- **Node.js** 18+ y npm 9+
- **Docker** y Docker Compose
- **Git**

### Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd CRM\ -\ Radeco

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env

# 4. Levantar la base de datos con Docker
docker-compose up -d postgres

# 5. Ejecutar migraciones de Prisma
npx prisma migrate dev

# 6. Poblar con datos de ejemplo
npm run prisma:seed

# 7. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en **http://localhost:3000**

### Usuarios Demo (Development Mode)

| Rol       | Email                   | Password | Permisos                           |
|-----------|-------------------------|----------|------------------------------------|
| Admin     | admin@radeco.com        | demo123  | Acceso total                       |
| Gerencia  | gerente@radeco.com      | demo123  | Supervisión y reportes             |
| Ventas    | vendedor1@radeco.com    | demo123  | Propio pipeline y leads            |
| Ventas    | vendedor2@radeco.com    | demo123  | Propio pipeline y leads            |
| Marketing | marketing@radeco.com    | demo123  | Campañas y leads                   |

## 🐳 Docker Compose (Producción)

```bash
# Construir y levantar todo (Postgres + App)
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Detener
docker-compose down
```

Visita **http://localhost:3000** tras el inicio.

## 📁 Estructura del Proyecto

```
├── prisma/
│   ├── schema.prisma          # Modelos de base de datos
│   ├── seed.ts                # Datos iniciales
│   └── migrations/            # Migraciones
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── dashboard/         # Páginas del CRM
│   │   ├── api/               # API Routes
│   │   ├── login/             # Autenticación
│   │   └── layout.tsx         # Layout raíz
│   ├── components/
│   │   ├── ui/                # Componentes shadcn/ui
│   │   └── layout/            # Layout components
│   └── lib/
│       ├── auth.ts            # NextAuth config
│       ├── db.ts              # Prisma client
│       ├── permissions.ts     # RBAC helpers
│       └── utils.ts           # Utilidades
├── docs/                      # Documentación
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 🔐 Autenticación y RBAC

El sistema utiliza **NextAuth (Auth.js v5)** con estrategia de credenciales y bcrypt para hashing de contraseñas.

### Roles Predefinidos

1. **Admin**: Acceso completo al sistema
2. **Gerencia**: Supervisión, reportes, gestión de equipos
3. **Ventas**: Gestión de propio pipeline
4. **Marketing**: Campañas y leads
5. **Taller**: Soporte técnico y postventa
6. **Solo-lectura**: Visualización únicamente

Ver más en [`docs/ROLES_PERMISOS.md`](docs/ROLES_PERMISOS.md)

## 📊 Pipelines Predefinidos

### 1. Implementos Agrícolas
Nuevo → Calificado → Cotización Enviada → Negociación → Ganado/Perdido

### 2. Repuestos
Consulta → Identificación de Pieza → Cotización → Confirmación → Despacho → Cerrado/Perdido

### 3. Tractores y Maquinaria
Lead → Demo/Visita → Cotización → Crédito/Negociación → Ganado/Perdido

## 💬 Integración WhatsApp Business

Ver guía completa en [`docs/CONFIG_WHATSAPP.md`](docs/CONFIG_WHATSAPP.md)

**Modo Stub** (Por defecto):
- Permite desarrollo sin credenciales reales
- Conversaciones simuladas para probar la UI

**Modo Producción**:
- Requiere Meta WhatsApp Business Cloud API
- Configurar `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, etc.

## 🛠️ Scripts Disponibles

```bash
npm run dev              # Desarrollo
npm run build            # Build para producción
npm start                # Iniciar producción
npm run lint             # Linting
npm run format          # Prettier
npm run prisma:studio   # Prisma Studio (GUI)
npm run prisma:migrate  # Crear migración
npm run prisma:seed     # Poblar DB
npm run db:reset        # Reset completo de DB
```

## 📦 Stack Tecnológico

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui + Lucide Icons
- **Base de Datos**: PostgreSQL 16
- **ORM**: Prisma
- **Auth**: NextAuth (Auth.js) v5
- **Validación**: Zod + React Hook Form
- **PDF**: @react-pdf/renderer
- **WhatsApp**: Meta Business Cloud API
- **Deployment**: Docker + Docker Compose

## 📖 Documentación Adicional

- **[Arquitectura](docs/ARQUITECTURA.md)**: Decisiones técnicas y módulos
- **[Roles y Permisos](docs/ROLES_PERMISOS.md)**: Sistema RBAC detallado
- **[WhatsApp Config](docs/CONFIG_WHATSAPP.md)**: Setup de Meta Business API

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt**
- Sesiones JWT con **NextAuth**
- Validación de inputs con **Zod**
- Permisos granulares por recurso y acción
- Auditoría de acciones críticas
- CORS configurado
- Rate limiting (recomendado para producción)

## 🚢 Deployment en Producción

1. Configurar variables de entorno de producción
2. Cambiar `NEXTAUTH_SECRET` (usar `openssl rand -base64 32`)
3. Configurar `DATABASE_URL` apuntando a Postgres de producción
4. Build: `npm run build`
5. Deploy vía Docker: `docker-compose up -d`

**Recomendaciones**:
- Usar PostgreSQL gestionado (AWS RDS, DigitalOcean, etc.)
- Configurar backups automáticos
- HTTPS obligatorio
- Variables secretas en secrets manager
- Monitoring y alertas

## 🤝 Soporte

Para issues o consultas:
- Email: soporte@radeco.com
- Documentación interna: `/docs`

## 📄 Licencia

Propiedad de RADECO - Ecuador © 2026

---

**Desarrollado con ❤️ para el sector agrícola ecuatoriano 🌾🚜**
