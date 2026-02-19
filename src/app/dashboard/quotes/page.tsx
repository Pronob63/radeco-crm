import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, DollarSign, Send } from "lucide-react";
import Link from "next/link";

export default async function QuotesPage() {
  await auth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-agro-900 flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Cotizaciones
          </h1>
          <p className="text-sand-600 mt-1">
            Gestiona cotizaciones y propuestas comerciales
          </p>
        </div>
        <Link href="/dashboard/quotes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Cotización
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-sand-600">Borradores</p>
                <p className="text-2xl font-bold text-agro-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Send className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-sand-600">Enviadas</p>
                <p className="text-2xl font-bold text-amber-700">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-sand-600">Aceptadas</p>
                <p className="text-2xl font-bold text-green-700">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder */}
      <Card>
        <CardContent className="text-center py-16">
          <FileText className="h-16 w-16 mx-auto text-sand-300 mb-4" />
          <h3 className="text-lg font-semibold text-sand-900 mb-2">
            No hay cotizaciones aún
          </h3>
          <p className="text-sand-600 mb-4">
            Crea tu primera cotización para enviar a clientes
          </p>
          <Link href="/dashboard/quotes/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Cotización
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximamente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-sand-700">
          <p>✅ Creación de cotizaciones con productos del catálogo</p>
          <p>✅ Generación automática de PDF con branding RADECO</p>
          <p>✅ Envío por WhatsApp con un clic</p>
          <p>✅ Seguimiento de estado (Enviada, Aceptada, Rechazada)</p>
          <p>✅ Historial de versiones y modificaciones</p>
        </CardContent>
      </Card>
    </div>
  );
}
