import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Users, Target } from "lucide-react";

export default async function ReportsPage() {
  await auth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-agro-900 flex items-center gap-3">
          <BarChart3 className="h-8 w-8" />
          Reportes y Analytics
        </h1>
        <p className="text-sand-600 mt-1">
          Análisis de performance, conversión y resultados
        </p>
      </div>

      {/* Categorías de reportes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-75">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Pipeline</CardTitle>
                <p className="text-sm text-sand-600">Conversión y velocidad</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-sand-700">
              <li>• Tasa de conversión por etapa</li>
              <li>• Tiempo promedio en pipeline</li>
              <li>• Tasa de cierre (win rate)</li>
              <li>• Bottlenecks identificados</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-75">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Ventas</CardTitle>
                <p className="text-sm text-sand-600">Ingresos y proyecciones</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-sand-700">
              <li>• Revenue por mes/trimestre</li>
              <li>• Forecast de cierre</li>
              <li>• Top productos vendidos</li>
              <li>• Ticket promedio</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-75">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Vendedores</CardTitle>
                <p className="text-sm text-sand-600">Performance del equipo</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-sand-700">
              <li>• Ranking de vendedores</li>
              <li>• Oportunidades por vendedor</li>
              <li>• Cumplimiento de cuotas</li>
              <li>• Actividades registradas</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-75">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Fuentes</CardTitle>
                <p className="text-sm text-sand-600">Origen de leads</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-sand-700">
              <li>• Leads por fuente (WhatsApp, Web, etc.)</li>
              <li>• Conversión por fuente</li>
              <li>• ROI de marketing</li>
              <li>• Costo por lead</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-75">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg">WhatsApp</CardTitle>
                <p className="text-sm text-sand-600">Métricas de comunicación</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-sand-700">
              <li>• Tiempo promedio de respuesta</li>
              <li>• Conversaciones activas</li>
              <li>• Tasa de respuesta</li>
              <li>• Conversión a oportunidad</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-not-allowed opacity-75">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Productos</CardTitle>
                <p className="text-sm text-sand-600">Catálogo y demanda</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-sand-700">
              <li>• Productos más cotizados</li>
              <li>• Productos más vendidos</li>
              <li>• Margen por producto</li>
              <li>• Estacionalidad</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Reportes en Desarrollo
              </h3>
              <p className="text-sm text-blue-800">
                Los reportes están en construcción. Estarán disponibles en la
                próxima versión con gráficos interactivos, exportación a Excel/PDF
                y filtros avanzados por fecha, vendedor y región.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
