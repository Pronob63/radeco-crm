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

const generateQuoteNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;
  const latest = await db.quote.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });

  const last = latest?.number?.split("-").pop();
  const next = last ? Number.parseInt(last, 10) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
};

const getQuoteScope = async (userId: string) => {
  const canReadAll =
    (await hasPermission("quotes:*")) || (await hasPermission("quotes:read"));
  const canReadOwn = await hasPermission("quotes:own");

  return { canReadAll, canReadOwn, userId };
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const scope = await getQuoteScope(session.user.id);
    if (!scope.canReadAll && !scope.canReadOwn) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";
    const contactId = searchParams.get("contactId") || "";
    const accountId = searchParams.get("accountId") || "";
    const opportunityId = searchParams.get("opportunityId") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const page = Number.parseInt(searchParams.get("page") || "1", 10) || 1;
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10) || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (!scope.canReadAll) {
      where.createdById = scope.userId;
    }

    if (q) {
      where.OR = [
        { number: { contains: q, mode: "insensitive" as const } },
        { title: { contains: q, mode: "insensitive" as const } },
        {
          contact: {
            fullName: { contains: q, mode: "insensitive" as const },
          },
        },
        {
          account: {
            name: { contains: q, mode: "insensitive" as const },
          },
        },
      ];
    }

    if (status) where.status = status;
    if (contactId) where.contactId = contactId;
    if (accountId) where.accountId = accountId;
    if (opportunityId) where.opportunityId = opportunityId;

    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const [quotes, total] = await Promise.all([
      db.quote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          contact: { select: { id: true, fullName: true } },
          account: { select: { id: true, name: true } },
          opportunity: { select: { id: true, title: true } },
        },
      }),
      db.quote.count({ where }),
    ]);

    return NextResponse.json({
      data: quotes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json(
      { error: "Error al obtener cotizaciones" },
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

    const canCreate =
      (await hasPermission("quotes:create")) ||
      (await hasPermission("quotes:*"));
    if (!canCreate) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await req.json();
    const validated = quoteSchema.parse(body);

    const contactId = validated.contactId || undefined;
    const accountId = validated.accountId || undefined;
    const opportunityId = validated.opportunityId || undefined;

    let resolvedContactId = contactId;
    let resolvedAccountId = accountId;

    if (!contactId && !accountId && !opportunityId) {
      return NextResponse.json(
        { error: "Selecciona un cliente u oportunidad" },
        { status: 400 }
      );
    }

    if (opportunityId) {
      const opportunity = await db.opportunity.findUnique({
        where: { id: opportunityId },
        select: {
          id: true,
          contactId: true,
          accountId: true,
          assignedToId: true,
        },
      });
      if (!opportunity) {
        return NextResponse.json(
          { error: "Oportunidad no encontrada" },
          { status: 400 }
        );
      }
      if (
        !(await hasPermission("quotes:*")) &&
        opportunity.assignedToId &&
        opportunity.assignedToId !== session.user.id
      ) {
        return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
      }
      resolvedContactId = resolvedContactId || opportunity.contactId || undefined;
      resolvedAccountId = resolvedAccountId || opportunity.accountId || undefined;
    }

    const normalizedItems = normalizeItems(
      validated.items.map((item) => ({
        ...item,
        productId: item.productId || null,
      }))
    );
    const totals = computeTotals(
      normalizedItems,
      validated.discount ?? 0,
      validated.taxRate ?? 0
    );

    const status = (validated.status || QuoteStatus.BORRADOR) as QuoteStatus;

    const quote = await db.quote.create({
      data: {
        number: await generateQuoteNumber(),
        title: validated.title,
        status,
        subtotal: totals.subtotal,
        discount: validated.discount ?? 0,
        tax: validated.taxRate ?? 0,
        total: totals.total,
        notes: validated.notes || undefined,
        statusUpdatedAt: new Date(),
        ...(status === QuoteStatus.ENVIADA ? { sentAt: new Date() } : {}),
        ...(status === QuoteStatus.NEGOCIACION ? { negotiatedAt: new Date() } : {}),
        ...(status === QuoteStatus.ACEPTADA ? { acceptedAt: new Date() } : {}),
        ...(status === QuoteStatus.PERDIDA ? { lostAt: new Date() } : {}),
        contact: resolvedContactId
          ? { connect: { id: resolvedContactId } }
          : undefined,
        account: resolvedAccountId
          ? { connect: { id: resolvedAccountId } }
          : undefined,
        opportunity: opportunityId ? { connect: { id: opportunityId } } : undefined,
        createdBy: { connect: { id: session.user.id } },
        items: {
          create: normalizedItems,
        },
        statusHistory: {
          create: [
            {
              status,
              note: "Cotizacion creada",
              createdById: session.user.id,
            },
          ],
        },
      },
      include: {
        contact: { select: { id: true, fullName: true } },
        account: { select: { id: true, name: true } },
        opportunity: { select: { id: true, title: true } },
        items: true,
      },
    });

    return NextResponse.json({ data: quote }, { status: 201 });
  } catch (error) {
    console.error("Error creating quote:", error);
    return NextResponse.json(
      { error: "Error al crear cotizacion" },
      { status: 500 }
    );
  }
}
