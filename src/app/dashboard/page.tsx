import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
} from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

async function getDashboardData(userId: string, roleName: string) {
  const isAdmin = roleName === "Admin" || roleName === "Gerencia";

  // KPIs principales
  const [
    newLeadsToday,
    pendingTasks,
    openOpportunities,
    wonOpportunitiesMonth,
    totalContacts,
    recentActivities,
    opportunitiesByStage,
  ] = await Promise.all([
    // Leads nuevos hoy
    prisma.lead.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
        ...(isAdmin ? {} : { assignedToId: userId }),
      },
    }),

    // Tareas pendientes
    prisma.task.count({
      where: {
        status: "Pendiente",
        assignedToId: userId,
      },
    }),

    // Oportunidades abiertas
    prisma.opportunity.count({
      where: {
        stage: {
          type: "open",
        },
        ...(isAdmin ? {} : { assignedToId: userId }),
      },
    }),

    // Oportunidades ganadas este mes
    prisma.opportunity.findMany({
      where: {
        stage: {
          type: "won",
        },
        actualCloseDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
        ...(isAdmin ? {} : { assignedToId: userId }),
      },
      select: {
        value: true,
      },
    }),

    // Total contactos
    prisma.contact.count(),

    // Actividades recientes
    prisma.activity.findMany({
      take: 5,
      where: isAdmin ? {} : { createdById: userId },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        contact: {
          select: {
            fullName: true,
          },
        },
        lead: {
          select: {
            title: true,
          },
        },
      },
    }),

    // Oportunidades por etapa (para el pipeline)
    prisma.stage.findMany({
      include: {
        _count: {
          select: {
            opportunities: {
              where: isAdmin ? {} : { assignedToId: userId },
            },
          },
        },
        pipeline: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    }),
  ]);

  const wonValueMonth = wonOpportunitiesMonth.reduce(
    (sum, opp) => sum + opp.value,
    0
  );

  return {
    kpis: {
      newLeadsToday,
      pendingTasks,
      openOpportunities,
      wonValueMonth,
      totalContacts,
    },
    recentActivities,
    opportunitiesByStage,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const data = await getDashboardData(
    session!.user.id,
    session!.user.roleName
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-agro-900">
          ¡Hola, {session!.user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-sand-600 mt-1">
          Resumen de tu actividad y pipelines
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Nuevos Hoy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agro-700">
              {data.kpis.newLeadsToday}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requieren seguimiento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {data.kpis.pendingTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Asignadas a ti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades Activas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.kpis.openOpportunities}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              En pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.kpis.wonValueMonth)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Oportunidades ganadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid de contenido */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Actividades Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-agro-600" />
              Actividades Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivities.length === 0 ? (
              <div className="text-center py-8 text-sand-600">
                <Phone className="h-12 w-12 mx-auto mb-3 text-sand-300" />
                <p className="text-sm">No hay actividades recientes</p>
                <p className="text-xs mt-1">Registra una llamada o reunión</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-4 border-b border-sand-100 last:border-0"
                  >
                    <div className="h-8 w-8 rounded-full bg-agro-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-agro-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sand-900">
                        {activity.subject}
                      </p>
                      <p className="text-xs text-sand-600 mt-0.5">
                        {activity.contact?.fullName || activity.lead?.title}
                      </p>
                      <p className="text-xs text-sand-500 mt-1">
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-agro-600" />
              Estado del Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.opportunitiesByStage.slice(0, 6).map((stage) => (
                <div key={stage.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: stage.color || "#94a3b8" }}
                      />
                      <span className="text-sm font-medium text-sand-900">
                        {stage.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-agro-700">
                      {stage._count.opportunities}
                    </span>
                  </div>
                  <div className="ml-5">
                    <div className="h-2 bg-sand-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-agro-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (stage._count.opportunities / Math.max(data.kpis.openOpportunities, 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Link
              href="/dashboard/leads?action=new"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-sand-200 hover:border-agro-400 hover:bg-agro-50 transition-colors"
            >
              <Target className="h-5 w-5 text-agro-600" />
              <span className="text-sm font-medium">Nuevo Lead</span>
            </Link>

            <Link
              href="/dashboard/contacts?action=new"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-sand-200 hover:border-agro-400 hover:bg-agro-50 transition-colors"
            >
              <Users className="h-5 w-5 text-agro-600" />
              <span className="text-sm font-medium">Nuevo Contacto</span>
            </Link>

            <Link
              href="/dashboard/quotes?action=new"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-sand-200 hover:border-agro-400 hover:bg-agro-50 transition-colors"
            >
              <CheckCircle2 className="h-5 w-5 text-agro-600" />
              <span className="text-sm font-medium">Crear Cotización</span>
            </Link>

            <Link
              href="/dashboard/whatsapp"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-sand-200 hover:border-agro-400 hover:bg-agro-50 transition-colors"
            >
              <Phone className="h-5 w-5 text-agro-600" />
              <span className="text-sm font-medium">Ver WhatsApp</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
