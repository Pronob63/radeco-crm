import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validations";
import { hasPermission } from "@/lib/permissions";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!(await hasPermission("contacts:read"))) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const contact = await db.contact.findUnique({
      where: { id: params.id },
      include: {
        account: true,
        leads: {
          orderBy: { createdAt: "desc" },
          include: { assignedTo: true },
        },
        opportunities: {
          orderBy: { createdAt: "desc" },
          include: { pipeline: true, stage: true, assignedTo: true },
        },
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      { error: "Error al obtener contacto" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!(await hasPermission("contacts:update"))) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const existingContact = await db.contact.findUnique({
      where: { id: params.id },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = contactSchema.parse(body);

    // Si se cambia accountId, verificar que existe
    if (
      validatedData.accountId &&
      validatedData.accountId !== existingContact.accountId
    ) {
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
    const contact = await db.contact.update({
      where: { id: params.id },
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
        action: "UPDATE",
        entity: "Contact",
        entityId: contact.id,
        changes: {
          before: existingContact,
          after: validatedData,
        },
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Error al actualizar contacto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!(await hasPermission("contacts:delete"))) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const contact = await db.contact.findUnique({
      where: { id: params.id },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si tiene leads u oportunidades asociadas
    const hasRelations = await db.contact.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { leads: true, opportunities: true },
        },
      },
    });

    if (
      hasRelations &&
      (hasRelations._count.leads > 0 || hasRelations._count.opportunities > 0)
    ) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar un contacto con leads u oportunidades asociadas",
        },
        { status: 400 }
      );
    }

    await db.contact.delete({
      where: { id: params.id },
    });

    // Registrar en audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        entity: "Contact",
        entityId: params.id,
        changes: { deleted: contact },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { error: "Error al eliminar contacto" },
      { status: 500 }
    );
  }
}
