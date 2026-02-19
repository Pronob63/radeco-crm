"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  console.error(error);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-agro-900">Algo salio mal</h1>
        <p className="mt-2 text-sand-600">
          No pudimos cargar el dashboard. Intenta de nuevo.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Reintentar</Button>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Volver al Dashboard
        </Button>
      </div>
    </div>
  );
}
