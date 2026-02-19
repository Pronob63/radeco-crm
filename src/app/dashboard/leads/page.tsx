import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Target, TrendingUp, MapPin } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime, getInitials } from "@/lib/utils";

async function getLeads(userId: string, roleName: string, searchQuery?: string) {
  const isAdmin = roleName === "Admin" || roleName === "Gerencia";

  const where = {
    ...(searchQuery
      ? {
          OR: [
            { title: { contains: searchQuery, mode: "insensitive" as const } },
            { contact: { fullName: { contains: searchQuery, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(isAdmin ? {} : { assignedToId: userId }),
  };

  return prisma.lead.findMany({
    where,
    include: {
      contact: {
        select: {
          fullName: true,
          phone: true,
        },
      },
      assignedTo: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });
}

const statusColors: Record<string, string> = {
  Nuevo: "bg-blue-100 text-blue-800",
  Contactado: "bg-yellow-100 text-yellow-800",
  Calificado: "bg-green-100 text-green-800",
  Convertido: "bg-purple-100 text-purple-800",
  Descartado: "bg-red-100 text-red-800",
};

const priorityColors: Record<string, string> = {
  Alta: "text-red-600",
  Media: "text-yellow-600",
  Baja: "text-green-600",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await auth();
  const leads = await getLeads(
    session!.user.id,
    session!.user.roleName,
    searchParams.q
  );

  // Stats rápidas
  const stats = {
    total: leads.length,
    nuevos: leads.filter((l) => l.status === "Nuevo").length,
    calificados: leads.filter((l) => l.status === "Calificado").length,
    convertidos: leads.filter((l) => l.status === "Convertido").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        subtitle="Gestiona oportunidades de venta nuevas"
        actions={
          <Link href="/dashboard/leads/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Lead
            </Button>
          </Link>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-sand-600">Total</p>
                <p className="text-2xl font-bold text-agro-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-sand-600">Nuevos</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.nuevos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-sand-600">Calificados</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats.calificados}
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
                <p className="text-sm text-sand-600">Convertidos</p>
                <p className="text-2xl font-bold text-purple-700">
                  {stats.convertidos}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sand-400" />
              <form action="/dashboard/leads" method="get">
                <Input
                  name="q"
                  placeholder="Buscar por título o contacto..."
                  className="pl-10"
                  defaultValue={searchParams.q}
                />
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de leads */}
      <Card>
        <CardHeader>
          <CardTitle>
            {leads.length} Lead{leads.length !== 1 ? "s" : ""}
            {searchParams.q && ` - Búsqueda: "${searchParams.q}"`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <EmptyState
              icon={<Target className="h-8 w-8" />}
              title={searchParams.q ? "No se encontraron leads" : "No hay leads aun"}
              description={
                searchParams.q
                  ? "Intenta con otros terminos de busqueda"
                  : "Crea tu primer lead para empezar"
              }
              action={
                !searchParams.q ? (
                  <Link href="/dashboard/leads/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Lead
                    </Button>
                  </Link>
                ) : null
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Interés</TableHead>
                  <TableHead>Asignado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-sand-50">
                    <TableCell>
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="font-medium text-agro-800 hover:text-agro-600"
                      >
                        {lead.title}
                      </Link>
                      {lead.city && (
                        <div className="flex items-center gap-1 text-xs text-sand-600 mt-1">
                          <MapPin className="h-3 w-3" />
                          {lead.city}, {lead.province}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.contact ? (
                        <div>
                          <p className="text-sm font-medium">
                            {lead.contact.fullName}
                          </p>
                          {lead.contact.phone && (
                            <p className="text-xs text-sand-600">
                              {lead.contact.phone}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sand-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {lead.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{lead.interest || "-"}</span>
                      {lead.crop && (
                        <p className="text-xs text-sand-600">{lead.crop}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-agro-100 text-agro-700">
                              {getInitials(lead.assignedTo.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{lead.assignedTo.name}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Sin asignar
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-medium ${
                          priorityColors[lead.priority]
                        }`}
                      >
                        {lead.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusColors[lead.status]} border-0`}
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-sand-600">
                      {formatRelativeTime(lead.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/leads/${lead.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
