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

    const canReadAll = await hasPermission("products:read");
    if (!canReadAll) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { code: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

    const products = await db.product.findMany({
      where,
      orderBy: { name: "asc" },
      take: 200,
      select: {
        id: true,
        code: true,
        name: true,
        price: true,
        category: true,
        brand: true,
      },
    });

    return NextResponse.json({ data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}
