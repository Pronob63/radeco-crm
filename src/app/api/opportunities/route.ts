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

    const canReadAll =
      (await hasPermission("opportunities:read")) ||
      (await hasPermission("opportunities:*"));
    const canReadOwn = await hasPermission("opportunities:own");

    if (!canReadAll && !canReadOwn) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const where: Record<string, unknown> = q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            {
              contact: {
                fullName: { contains: q, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {};

    if (!canReadAll) {
      where.assignedToId = session.user.id;
    }

    const opportunities = await db.opportunity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        value: true,
        contact: { select: { fullName: true } },
        account: { select: { name: true } },
      },
    });

    return NextResponse.json({ data: opportunities });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      { error: "Error al obtener oportunidades" },
      { status: 500 }
    );
  }
}
