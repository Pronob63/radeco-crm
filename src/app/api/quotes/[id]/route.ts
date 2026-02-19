import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { quoteSchema } from "@/lib/validations";
import { QuoteStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const computeTotals = (
  items: Array<{
    quantity: number;
    unitPrice: number;
    discount: number;
  }>,
  quoteDiscount: number,
  taxRate: number
) => {
  const subtotal = items.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
    return sum + lineTotal;
  }, 0);
  const discountAmount = subtotal * (quoteDiscount / 100);
  const taxableBase = subtotal - discountAmount;
  const taxAmount = taxableBase * (taxRate / 100);
  const total = taxableBase + taxAmount;

  return { subtotal, total };
};

const normalizeItems = (
  items: Array<{
    productId?: string | null;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>
) => {
  return items.map((item, index) => ({
    productId: item.productId || null,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount ?? 0,
    total: item.quantity * item.unitPrice * (1 - (item.discount ?? 0) / 100),
    order: index,
  }));
};

const canAccessQuote = async (quoteId: string, userId: string) => {
  const canReadAll =
    (await hasPermission("quotes:*")) || (await hasPermission("quotes:read"));
  const canReadOwn = await hasPermission("quotes:own");

  if (canReadAll) return { allowed: true, quote: null };
  if (!canReadOwn) return { allowed: false, quote: null };

  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    select: { id: true, createdById: true },
  });

  if (!quote) return { allowed: false, quote: null };
  return { allowed: quote.createdById === userId, quote };
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const access = await canAccessQuote(params.id, session.user.id);
    if (!access.allowed) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const quote = await db.quote.findUnique({
      where: { id: params.id },
      include: {
        contact: { select: { id: true, fullName: true, email: true, phone: true } },
        account: { select: { id: true, name: true } },
        opportunity: { select: { id: true, title: true } },
        items: { orderBy: { order: "asc" } },
        createdBy: { select: { id: true, name: true } },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: { select: { id: true, name: true } } },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: "Cotizacion no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: quote });
  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json(
      { error: "Error al obtener cotizacion" },
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

    const access = await canAccessQuote(params.id, session.user.id);
    if (!access.allowed) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const existing = await db.quote.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Cotizacion no encontrada" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validated = quoteSchema.partial().parse(body);

    const status = validated.status as QuoteStatus | undefined;
    const statusChanged = status && status !== existing.status;

    const incomingItems = validated.items
      ? normalizeItems(validated.items.map((item) => ({
          ...item,
          productId: item.productId || null,
        })))
      : existing.items.map((item) => ({
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
        }));

    const quoteDiscount = validated.discount ?? existing.discount;
    const taxRate = validated.taxRate ?? existing.tax;
    const totals = computeTotals(incomingItems, quoteDiscount, taxRate);

    const updates: Record<string, unknown> = {
      title: validated.title ?? existing.title,
      subtotal: totals.subtotal,
      discount: quoteDiscount,
      tax: taxRate,
      total: totals.total,
      notes: validated.notes ?? existing.notes,
    };

    if (statusChanged) {
      updates.status = status;
      updates.statusUpdatedAt = new Date();
      if (status === QuoteStatus.ENVIADA) updates.sentAt = new Date();
      if (status === QuoteStatus.NEGOCIACION) updates.negotiatedAt = new Date();
      if (status === QuoteStatus.ACEPTADA) updates.acceptedAt = new Date();
      if (status === QuoteStatus.PERDIDA) updates.lostAt = new Date();
    }

    if (validated.contactId !== undefined) {
      updates.contact = validated.contactId
        ? { connect: { id: validated.contactId } }
        : { disconnect: true };
    }

    if (validated.accountId !== undefined) {
      updates.account = validated.accountId
        ? { connect: { id: validated.accountId } }
        : { disconnect: true };
    }

    if (validated.opportunityId !== undefined) {
      updates.opportunity = validated.opportunityId
        ? { connect: { id: validated.opportunityId } }
        : { disconnect: true };
    }

    const quote = await db.quote.update({
      where: { id: params.id },
      data: {
        ...updates,
        ...(validated.items
          ? {
              items: {
                deleteMany: {},
                create: incomingItems,
              },
            }
          : {}),
        ...(statusChanged
          ? {
              statusHistory: {
                create: [
                  {
                    status: status as QuoteStatus,
                    note: "Cambio de estado",
                    createdById: session.user.id,
                  },
                ],
              },
            }
          : {}),
      },
      include: {
        contact: { select: { id: true, fullName: true } },
        account: { select: { id: true, name: true } },
        opportunity: { select: { id: true, title: true } },
        items: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({ data: quote });
  } catch (error) {
    console.error("Error updating quote:", error);
    return NextResponse.json(
      { error: "Error al actualizar cotizacion" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const access = await canAccessQuote(params.id, session.user.id);
    if (!access.allowed) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    await db.quote.delete({ where: { id: params.id } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return NextResponse.json(
      { error: "Error al eliminar cotizacion" },
      { status: 500 }
    );
  }
}
