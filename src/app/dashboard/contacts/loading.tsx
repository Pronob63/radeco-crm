import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { PageHeader } from "@/components/ui/page-header";

export default function ContactsLoading() {
  return (
    <div className="space-y-6">
      <PageHeader title="Contactos" subtitle="Cargando contactos..." />

      <Card>
        <CardContent className="pt-6">
          <div className="h-10 w-full rounded-md bg-sand-100 animate-pulse" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader />
        <CardContent>
          <DataTableSkeleton rows={6} columns={6} />
        </CardContent>
      </Card>
    </div>
  );
}
