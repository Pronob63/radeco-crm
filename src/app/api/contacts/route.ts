import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validations";
import { hasPermission } from "@/lib/permissions";
import { z } from "zod";

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
    const search = searchParams.get("q") || searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            { whatsapp: { contains: search, mode: "insensitive" as const } },
            {
              account: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {};

    const [contacts, total] = await Promise.all([
      db.contact.findMany({
        where,
        include: {
          account: true,
          leads: { take: 1, orderBy: { createdAt: "desc" } },
          opportunities: { take: 1, orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.contact.count({ where }),
    ]);

    return NextResponse.json({
      data: contacts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Error al obtener contactos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!(await hasPermission("contacts:create"))) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = contactSchema.parse(body);

    // Si se proporciona accountId, verificar que existe
    if (validatedData.accountId) {
      const accountExists = await db.company.findUnique({
        where: { id: validatedData.accountId },
      });
      if (!accountExists) {
        return NextResponse.json(
          { error: "La cuenta especificada no existe" },
          { status: 400 }
        );
      }
    }

    const { accountId, ...contactData } = validatedData;
    const fullName = `${validatedData.firstName} ${validatedData.lastName}`.trim();
    const contact = await db.contact.create({
      data: {
        ...contactData,
        fullName,
        ...(accountId ? { account: { connect: { id: accountId } } } : {}),
      },
      include: {
        account: true,
      },
    });

    // Registrar en audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        entity: "Contact",
        entityId: contact.id,
        changes: { created: validatedData },
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Error al crear contacto" },
      { status: 500 }
    );
  }
}
