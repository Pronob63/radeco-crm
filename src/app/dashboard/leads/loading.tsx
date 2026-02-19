import { Card, CardContent } from "@/components/ui/card";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { PageHeader } from "@/components/ui/page-header";

export default function LeadsLoading() {
  return (
    <div className="space-y-6">
      <PageHeader title="Leads" subtitle="Cargando oportunidades..." />

      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={`stat-${index}`}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="h-4 w-24 rounded-md bg-sand-100 animate-pulse" />
                <div className="h-8 w-16 rounded-md bg-sand-100 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="h-10 w-full rounded-md bg-sand-100 animate-pulse" />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <DataTableSkeleton rows={6} columns={6} />
        </CardContent>
      </Card>
    </div>
  );
}
