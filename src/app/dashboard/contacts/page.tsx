"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryState = useMemo(() => {
    const q = searchParams.get("q") || "";
    const page = Number.parseInt(searchParams.get("page") || "1", 10) || 1;
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10) || 10;
    return {
      q,
      page: page < 1 ? 1 : page,
      limit: limit < 1 ? 10 : limit,
    };
  }, [searchParams]);

  const readErrorMessage = useCallback(async (res: Response) => {
    try {
      const data = await res.json();
      if (data?.error) return data.error as string;
    } catch {
      // ignore json parse
    }
    try {
      const text = await res.text();
      if (text) return text;
    } catch {
      // ignore text parse
    }
    return "Error inesperado";
  }, []);

  const loadContacts = useCallback(async (q: string, page: number, limit: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await fetch(`/api/contacts?${params.toString()}`);
      if (!res.ok) {
        const message = await readErrorMessage(res);
        toast.error(message);
        setContacts([]);
        setMeta((prev) => ({ ...prev, total: 0, totalPages: 1 }));
        return;
      }

      const data = await res.json();
      setContacts(data.data || []);
      setMeta(data.meta || { page, limit, total: 0, totalPages: 1 });
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast.error("No se pudieron cargar los contactos");
    } finally {
      setIsLoading(false);
    }
  }, [readErrorMessage]);

  const updateParams = useCallback((next: { q?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.page !== undefined) params.set("page", String(next.page));
    if (next.limit !== undefined) params.set("limit", String(next.limit));
    if (!params.get("limit")) params.set("limit", String(queryState.limit));
    if (!params.get("page")) params.set("page", String(queryState.page));
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, queryState.limit, queryState.page, router, searchParams]);

  useEffect(() => {
    setSearchQuery(queryState.q);
    loadContacts(queryState.q, queryState.page, queryState.limit);
  }, [queryState, loadContacts]);

  useEffect(() => {
    const hasPage = searchParams.get("page");
    const hasLimit = searchParams.get("limit");
    if (!hasPage || !hasLimit) {
      updateParams({ q: queryState.q, page: queryState.page, limit: queryState.limit });
    }
  }, [queryState, searchParams, updateParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateParams({ q: searchQuery, page: 1 });
  };

  const handleCreateNew = () => {
    setSelectedContact(null);
    setFormOpen(true);
  };

  const handleEdit = (contact: any) => {
    setSelectedContact(contact);
    setFormOpen(true);
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm("¿Estás seguro de eliminar este contacto?")) return;

    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const message = await readErrorMessage(res);
        throw new Error(message);
      }

      toast.success("Contacto eliminado");
      loadContacts(queryState.q, queryState.page, queryState.limit);
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar contacto");
    }
  };

  const handleFormSuccess = () => {
    loadContacts(queryState.q, queryState.page, queryState.limit);
  };

  const canGoPrev = meta.page > 1;
  const canGoNext = meta.page < meta.totalPages;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contactos"
        subtitle="Gestiona tu base de datos de clientes"
        actions={
          <Button className="gap-2" onClick={handleCreateNew}>
            <Plus className="h-4 w-4" />
            Nuevo Contacto
          </Button>
        }
      />

      {/* Búsqueda y filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sand-400" />
              <form onSubmit={handleSearch}>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, email, teléfono o empresa..."
                  className="pl-10"
                />
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de contactos */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading
              ? "Cargando..."
              : `${meta.total} Contacto${meta.total !== 1 ? "s" : ""}`}
            {queryState.q && ` - Busqueda: "${queryState.q}"`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton rows={6} columns={6} />
          ) : contacts.length === 0 ? (
            <EmptyState
              icon={<Building2 className="h-8 w-8" />}
              title={
                queryState.q
                  ? "No se encontraron contactos"
                  : "No hay contactos aun"
              }
              description={
                queryState.q
                  ? "Intenta con otros terminos de busqueda"
                  : "Crea tu primer contacto para empezar"
              }
              action={
                !queryState.q ? (
                  <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Contacto
                  </Button>
                ) : null
              }
            />
          ) : (
            <>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Leads/Opp</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-sand-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-agro-800">
                          {contact.firstName} {contact.lastName}
                        </div>
                        {contact.position && (
                          <div className="text-sm text-sand-500">
                            {contact.position}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.account ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-sand-400" />
                          <span>{contact.account.name}</span>
                        </div>
                      ) : (
                        <span className="text-sand-400 text-sm">
                          Sin empresa
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-sand-400" />
                            <span className="truncate max-w-[200px]">
                              {contact.email}
                            </span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-sand-400" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.province || contact.city ? (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-sand-400" />
                          <span>
                            {[contact.city, contact.province]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sand-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {contact.leads && contact.leads.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {contact.leads.length} Lead{contact.leads.length > 1 ? "s" : ""}
                          </Badge>
                        )}
                        {contact.opportunities && contact.opportunities.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-green-50">
                            {contact.opportunities.length} Opp
                          </Badge>
                        )}
                        {(!contact.leads || contact.leads.length === 0) &&
                          (!contact.opportunities || contact.opportunities.length === 0) && (
                            <span className="text-sand-400 text-sm">-</span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-sand-600">
                      {formatDate(contact.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(contact)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(contact.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-sand-600">
                Pagina {meta.page} de {meta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canGoPrev}
                  onClick={() => updateParams({ page: meta.page - 1 })}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canGoNext}
                  onClick={() => updateParams({ page: meta.page + 1 })}
                >
                  Siguiente
                </Button>
              </div>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de formulario */}
      <ContactFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={selectedContact}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
