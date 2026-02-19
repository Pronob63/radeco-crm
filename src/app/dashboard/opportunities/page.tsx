import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  DollarSign,
  TrendingUp,
  Target,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

async function getOpportunitiesData(userId: string, roleName: string) {
  const isAdmin = roleName === "Admin" || roleName === "Gerencia";

  const where = isAdmin ? {} : { assignedToId: userId };

  const [opportunities, pipelines] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      include: {
        contact: {
          select: {
            fullName: true,
          },
        },
        account: {
          select: {
            name: true,
          },
        },
        stage: {
          select: {
            id: true,
            name: true,
            color: true,
            type: true,
            order: true,
          },
        },
        pipeline: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    }),

    prisma.pipeline.findMany({
      where: { active: true },
      include: {
        stages: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  // Calcular stats
  const stats = {
    total: opportunities.length,
    totalValue: opportunities.reduce((sum, o) => sum + o.value, 0),
    open: opportunities.filter((o) => o.stage.type === "open").length,
    won: opportunities.filter((o) => o.stage.type === "won").length,
    avgValue: opportunities.length
      ? opportunities.reduce((sum, o) => sum + o.value, 0) / opportunities.length
      : 0,
  };

  return { opportunities, pipelines, stats };
}

export default async function OpportunitiesPage() {
  const session = await auth();
  const { opportunities, pipelines, stats } = await getOpportunitiesData(
    session!.user.id,
    session!.user.roleName
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-agro-900">Oportunidades</h1>
          <p className="text-sand-600 mt-1">
            Pipeline de ventas y gestión de negocios
          </p>
        </div>
        <Link href="/dashboard/opportunities/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Oportunidad
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-sand-600">Total Activas</p>
                <p className="text-2xl font-bold text-agro-900">{stats.open}</p>
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
                <p className="text-sm text-sand-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-sand-600">Ganadas</p>
                <p className="text-2xl font-bold text-purple-700">{stats.won}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-sand-600">Valor Promedio</p>
                <p className="text-2xl font-bold text-amber-700">
                  {formatCurrency(stats.avgValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista Kanban por Pipeline */}
      {pipelines.map((pipeline) => {
        const pipelineOpps = opportunities.filter(
          (o) => o.pipeline.id === pipeline.id
        );

        return (
          <div key={pipeline.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-agro-900">
                {pipeline.name}
              </h2>
              <Badge variant="outline">
                {pipelineOpps.length} oportunidades
              </Badge>
            </div>

            {/* Kanban Board */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {pipeline.stages.map((stage) => {
                  const stageOpps = pipelineOpps.filter(
                    (o) => o.stage.id === stage.id
                  );
                  const stageValue = stageOpps.reduce(
                    (sum, o) => sum + o.value,
                    0
                  );

                  return (
                    <div
                      key={stage.id}
                      className="flex-shrink-0 w-80"
                      style={{
                        minWidth: "320px",
                      }}
                    >
                      <Card className="h-full">
                        <CardHeader
                          className="pb-3"
                          style={{
                            borderLeft: `4px solid ${stage.color || "#94a3b8"}`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold">
                              {stage.name}
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {stageOpps.length}
                            </Badge>
                          </div>
                          <p className="text-xs text-sand-600 mt-1">
                            {formatCurrency(stageValue)}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                          {stageOpps.length === 0 ? (
                            <div className="text-center py-8 text-sand-400">
                              <Target className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-xs">Sin oportunidades</p>
                            </div>
                          ) : (
                            stageOpps.map((opp) => (
                              <Link
                                key={opp.id}
                                href={`/dashboard/opportunities/${opp.id}`}
                              >
                                <Card className="hover:shadow-md transition-shadow cursor-pointer border-sand-200">
                                  <CardContent className="p-4">
                                    <h3 className="font-semibold text-sm text-agro-900 mb-2 line-clamp-2">
                                      {opp.title}
                                    </h3>

                                    {opp.account && (
                                      <p className="text-xs text-sand-600 mb-1">
                                        {opp.account.name}
                                      </p>
                                    )}

                                    <div className="flex items-center justify-between mt-3">
                                      <span className="text-sm font-bold text-green-700">
                                        {formatCurrency(opp.value)}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {opp.probability}%
                                      </Badge>
                                    </div>

                                    {opp.expectedCloseDate && (
                                      <div className="flex items-center gap-1 text-xs text-sand-600 mt-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                          {formatDate(opp.expectedCloseDate)}
                                        </span>
                                      </div>
                                    )}

                                    {opp.assignedTo && (
                                      <div className="flex items-center gap-2 mt-3">
                                        <Avatar className="h-6 w-6">
                                          <AvatarFallback className="text-xs bg-agro-100 text-agro-700">
                                            {getInitials(opp.assignedTo.name)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-sand-700">
                                          {opp.assignedTo.name}
                                        </span>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </Link>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {opportunities.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-16 w-16 mx-auto text-sand-300 mb-4" />
            <h3 className="text-lg font-semibold text-sand-900 mb-2">
              No hay oportunidades aún
            </h3>
            <p className="text-sand-600 mb-4">
              Crea tu primera oportunidad para empezar a gestionar tu pipeline
            </p>
            <Link href="/dashboard/opportunities/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Oportunidad
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
