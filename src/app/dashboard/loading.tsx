import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-md bg-sand-100 animate-pulse" />
        <div className="h-4 w-80 rounded-md bg-sand-100 animate-pulse" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={`kpi-${index}`}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="h-4 w-24 rounded-md bg-sand-100 animate-pulse" />
                <div className="h-8 w-16 rounded-md bg-sand-100 animate-pulse" />
                <div className="h-3 w-28 rounded-md bg-sand-100 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="h-5 w-48 rounded-md bg-sand-100 animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`row-${index}`} className="h-4 w-full rounded-md bg-sand-100 animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
