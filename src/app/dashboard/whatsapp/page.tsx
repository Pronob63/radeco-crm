import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Filter } from "lucide-react";

export default async function WhatsAppPage() {
  await auth();

  const whatsappEnabled = process.env.WHATSAPP_ENABLED === "true";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-agro-900 flex items-center gap-3">
            <MessageCircle className="h-8 w-8" />
            WhatsApp Business
          </h1>
          <p className="text-sand-600 mt-1">
            Bandeja de mensajes y gestión de conversaciones
          </p>
        </div>
        <Badge variant={whatsappEnabled ? "success" : "outline"}>
          {whatsappEnabled ? "Activo" : "Modo Stub"}
        </Badge>
      </div>

      {/* Mensaje modo stub */}
      {!whatsappEnabled && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  WhatsApp en Modo Desarrollo (Stub)
                </h3>
                <p className="text-sm text-amber-800 mb-3">
                  El módulo de WhatsApp está funcionando en modo simulado. Para
                  activar la integración real con Meta WhatsApp Business API,
                  consulta la documentación en{" "}
                  <code className="bg-amber-100 px-1 rounded">
                    docs/CONFIG_WHATSAPP.md
                  </code>
                </p>
                <p className="text-xs text-amber-700">
                  Configura <code>WHATSAPP_ENABLED=true</code> en tu archivo{" "}
                  <code>.env</code> una vez tengas las credenciales.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Button variant="outline" disabled className="gap-2">
              <Filter className="h-4 w-4" />
              Todas
            </Button>
            <Button variant="ghost" disabled>
              No leídas
            </Button>
            <Button variant="ghost" disabled>
              Urgentes
            </Button>
            <Button variant="ghost" disabled>
              Asignadas a mí
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inbox - Simulado */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Lista de conversaciones */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-sand-400">
              <MessageCircle className="h-12 w-12 mx-auto mb-3" />
              <p className="text-sm">No hay conversaciones</p>
              <p className="text-xs mt-1">
                Las conversaciones aparecerán aquí cuando WhatsApp esté activo
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vista de mensajes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Mensajes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-sand-400">
              <MessageCircle className="h-12 w-12 mx-auto mb-3" />
              <p className="text-sm">Selecciona una conversación</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximamente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-sand-700">
          <p>✅ Bandeja de conversaciones con filtros y búsqueda</p>
          <p>✅ Vista de mensajes en tiempo real</p>
          <p>✅ Envío de mensajes y templates</p>
          <p>✅ Etiquetas y asignación a vendedores</p>
          <p>✅ Métricas de respuesta y conversión</p>
        </CardContent>
      </Card>
    </div>
  );
}
