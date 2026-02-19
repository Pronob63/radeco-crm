import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!(await hasPermission("contacts:read"))) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          name: { contains: search, mode: "insensitive" as const },
        }
      : {};

    const accounts = await db.company.findMany({
      where,
      orderBy: { name: "asc" },
      take: 50,
      select: {
        id: true,
        name: true,
        type: true,
        province: true,
        city: true,
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Error al obtener cuentas" },
      { status: 500 }
    );
  }
}
