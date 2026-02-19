# Configuración WhatsApp Business API - RADECO CRM

## 📱 Visión General

RADECO CRM integra la **Meta WhatsApp Business Cloud API** para:
- 📥 Recibir mensajes de clientes en bandeja unificada
- 📤 Enviar mensajes individuales y masivos
- 📋 Usar plantillas (templates) aprobadas por Meta
- 🏷️ Etiquetar conversaciones
- 👤 Asignar conversaciones a vendedores
- 📊 Métricas de entrega y lectura

## 🛠️ Modos de Operación

### 1. Modo STUB (Por Defecto)
- ✅ **No requiere credenciales reales**
- ✅ Perfecto para desarrollo y testing
- ✅ UI completa funcionando
- ⚠️ No envía ni recibe mensajes reales
- ⚠️ Conversaciones y mensajes simulados

**Configuración**: Ya está activo. No hacer nada.

### 2. Modo PRODUCCIÓN
- ✅ WhatsApp real integrado
- ✅ Envío y recepción de mensajes
- ✅ Templates de Meta
- 📋 Requiere cuenta Meta Business
- 📋 Requiere configuración de webhook

---

## 🚀 Configuración Producción (Paso a Paso)

### Paso 1: Crear Cuenta Meta for Developers

1. Visita [developers.facebook.com](https://developers.facebook.com)
2. Crea una cuenta (si no tienes)
3. Navega a **My Apps** → **Create App**
4. Selecciona tipo: **Business**
5. Completa información de la app

### Paso 2: Agregar WhatsApp Business

1. En tu app, ve a **Add Product**
2. Selecciona **WhatsApp** → **Set Up**
3. Sigue el wizard de configuración
4. Asocia tu **Meta Business Account**

### Paso 3: Obtener Credenciales

#### 3.1 Phone Number ID

1. En la sección **WhatsApp** → **API Setup**
2. Verás una lista de números de teléfono
3. Copia el **Phone Number ID** (número largo como `103895579...`)

#### 3.2 WhatsApp Business Account ID (WABA ID)

1. En **WhatsApp** → **Getting Started**
2. Busca **WhatsApp Business Account ID**
3. Cópialo (ej: `102384567...`)

#### 3.3 Access Token (Permanente)

🎯 **Importante**: El token temporal (24h) NO sirve para producción.

**Opción A - Token de Sistema (Recomendado)**:
1. Ve a **Business Settings** → **System Users**
2. Crea un **System User** (ej: "RADECO CRM Bot")
3. Asigna rol: **Admin**
4. Genera **Access Token** con permisos:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
5. Guarda el token (se muestra **UNA SOLA VEZ**)

**Opción B - Token de Usuario**:
1. En **WhatsApp** → **API Setup**
2. Clic en **Generate Access Token**
3. ⚠️ Expira en 24h - solo para testing

#### 3.4 Verify Token (Custom)

1. Inventa un string secreto (ej: `radeco_wh_secret_2026_xyz`)
2. Guárdalo, lo usarás para configurar el webhook

### Paso 4: Configurar Webhook

#### 4.1 Exponer tu Servidor

**Opción en Desarrollo** (con ngrok):
```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto 3000
ngrok http 3000

# Output: https://abc123.ngrok.io
```

**Opción en Producción**:
- Desplegar CRM en servidor con HTTPS
- Ej: `https://crm.radeco.com`

#### 4.2 Registrar Webhook en Meta

1. En **WhatsApp** → **Configuration**
2. Sección **Webhook**
3. Clic en **Edit**

**Callback URL**:
```
https://TU_DOMINIO/api/webhooks/whatsapp
```

**Verify Token**:
```
radeco_wh_secret_2026_xyz
```
(El que inventaste en 3.4)

4. Clic en **Verify and Save**

Meta hará una petición GET a tu endpoint para verificar:
```
GET /api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=...
```

Si el token coincide, responderá con `hub.challenge`.

#### 4.3 Suscribir a Eventos

En la misma página de Webhook:

1. Marca los eventos:
   - ✅ `messages` (mensajes entrantes)
   - ✅ `message_status` (entregado, leído, fallido)
2. **Save**

### Paso 5: Configurar Variables de Entorno

Edita `.env`:

```bash
# WhatsApp Business Cloud API
WHATSAPP_PHONE_NUMBER_ID="103895579012345"
WHATSAPP_WABA_ID="102384567890123"
WHATSAPP_ACCESS_TOKEN="EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
WHATSAPP_VERIFY_TOKEN="radeco_wh_secret_2026_xyz"
WHATSAPP_API_VERSION="v18.0"
WHATSAPP_ENABLED="true"  # 👈 Cambia a "true"
```

### Paso 6: Reiniciar Servidor

```bash
# Desarrollo
npm run dev

# Producción (Docker)
docker-compose restart app
```

### Paso 7: Verificar Funcionamiento

#### Test de Envío

1. Ve a **WhatsApp** → **API Setup** en Meta
2. Usa **Send Test Message** para enviar a tu número
3. Debería llegar el mensaje

#### Test de Recepción

1. Desde tu WhatsApp personal, envía un mensaje al número de negocio
2. Ve a **RADECO CRM** → **WhatsApp** → **Inbox**
3. Deberías ver la conversación y el mensaje

---

## 🧪 Testing con Meta Test Numbers

Meta permite **números de prueba** para desarrollo:

1. En **WhatsApp** → **API Setup**
2. Agrega **Test Phone Numbers**
3. Puedes enviar/recibir hasta **1,000 mensajes gratis/mes**
4. ⚠️ Solo funciona con números agregados como "testers"

---

## 📄 Plantillas (Templates)

Para enviar mensajes proactivos (iniciar conversaciones), necesitas **templates aprobados**.

### Crear Template

1. Ve a **WhatsApp** → **Message Templates**
2. Clic en **Create Template**
3. Completa:
   - **Name**: `radeco_seguimiento_cotizacion`
   - **Category**: `MARKETING` o `UTILITY`
   - **Language**: Español (es)
   - **Body**:
     ```
     Hola {{1}}, te enviamos la cotizaci\u00f3n para {{2}}. 
     Cualquier consulta, estamos a tu disposici\u00f3n. 
     Equipo RADECO 🌾
     ```
4. Submit para aprobación

⏱️ **Tiempo de aprobación**: 5 minutos a 24 horas.

### Usar Template en el CRM

Una vez aprobado, aparecerá en:
- **Campañas** → Seleccionar template
- **Cotizaciones** → "Enviar por WhatsApp" (usa template automáticamente)

Formato en código:
```typescript
{
  template: {
    name: "radeco_seguimiento_cotizacion",
    language: { code: "es" },
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: "Juan Pérez" },  // {{1}}
          { type: "text", text: "Rastra TATU" }  // {{2}}
        ]
      }
    ]
  }
}
```

---

## 🔍 Troubleshooting

### Error: "Webhook verification failed"

**Causa**: Verify token no coincide.

**Solución**:
1. Verifica `WHATSAPP_VERIFY_TOKEN` en `.env`
2. Asegúrate que coincide con el configurado en Meta
3. Reinicia servidor

### Error: "(#100) Invalid parameter"

**Causa**: Access token incorrecto o expirado.

**Solución**:
1. Genera un **System User Token** (no caduca)
2. Actualiza `WHATSAPP_ACCESS_TOKEN` en `.env`
3. Reinicia

### No recibo mensajes en la bandeja

**Verificar**:
1. ✅ Webhook suscrito a evento `messages`
2. ✅ URL del webhook correcta (con HTTPS)
3. ✅ `WHATSAPP_ENABLED="true"` en `.env`
4. ✅ Servidor accesible públicamente

**Debug**:
```bash
# Ver logs del webhook
docker-compose logs -f app | grep webhooks
```

### Mensajes no se envían

**Verificar**:
1. ✅ Access token válido
2. ✅ Phone Number ID correcto
3. ✅ Número destinatario en formato internacional (+593...)
4. ✅ Si es mensaje proactivo, usas template aprobado

---

## 📊 Estructura de Datos en DB

### WabaConfig

```typescript
{
  phoneNumberId: "103895579012345",
  wabaId: "102384567890123",
  accessToken: "EAAxxxx", // Encriptar en prod
  verifyToken: "radeco_wh_secret",
  phoneNumber: "+593000000000",
  active: true
}
```

### WaConversation

```typescript
{
  waId: "593987654321",         // WhatsApp ID del contacto
  contactId: "...",              // Vinculado a Contact
  assignedToId: "...",           // Vendedor asignado
  status: "Abierta",
  labels: ["Cotización", "Urgente"],
  lastMessageAt: Date,
  unreadCount: 2
}
```

### WaMessage

```typescript
{
  messageId: "wamid.HBgNNTkzOTg3NjU0MzIxFQ...",
  conversationId: "...",
  direction: "inbound",         // o "outbound"
  type: "text",                 // text, image, document, etc
  from: "593987654321",
  to: "593000000000",
  text: "Hola, necesito repuestos",
  status: "delivered"           // sent, delivered, read, failed
}
```

---

## 🔐 Seguridad

### Encriptar Access Token

En producción, NO guardes tokens en plain text.

**Opción**: Usar secrets manager (AWS Secrets, HashiCorp Vault)

```typescript
const accessToken = await getSecret("WHATSAPP_ACCESS_TOKEN");
```

### Validar Webhooks (Opcional)

Meta puede firmar webhooks con `X-Hub-Signature-256`.

Validar firma:
```typescript
const signature = req.headers["x-hub-signature-256"];
const expectedSig = crypto
  .createHmac("sha256", process.env.WHATSAPP_APP_SECRET)
  .update(rawBody)
  .digest("hex");

if (signature !== `sha256=${expectedSig}`) {
  throw new Error("Invalid signature");
}
```

---

## 💰 Costos

### Conversaciones

Meta cobra por **conversaciones iniciadas** (ventanas de 24h):

- **Conversación iniciada por negocio** (proactiva con template): ~$0.005 - $0.03 USD
- **Conversación iniciada por usuario**: **GRATIS**

Una vez abierta la ventana de 24h, mensajes ilimitados sin costo adicional.

### Números de Prueba

- **Gratis**: 1,000 conversaciones/mes
- Solo con números agregados como testers

### Producción

- Requiere **Meta Business Verification**
- Costos por país: [Pricing WhatsApp](https://developers.facebook.com/docs/whatsapp/pricing)

---

## 📚 Recursos

- [Documentación Oficial Meta](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Referencia API](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [Templates Guía](https://developers.facebook.com/docs/whatsapp/message-templates)
- [Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)

---

## ✅ Checklist Pre-Producción

Antes de lanzar WhatsApp en producción:

- [ ] Cuenta Meta Business verificada
- [ ] Access Token de Sistema (permanente) generado
- [ ] Webhook configurado con HTTPS
- [ ] Templates aprobados (al menos 1-2)
- [ ] Variables de entorno configuradas
- [ ] Pruebas de envío/recepción exitosas
- [ ] Asignación automática de conversaciones definida
- [ ] SLA de respuesta establecido (ej: <1h)
- [ ] Equipo capacitado en uso del inbox

---

**Última actualización**: 18 de febrero de 2026

**Soporte**: soporte@radeco.com
