import { PrismaClient, QuoteStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // ============================================
  // ROLES Y PERMISOS
  // ============================================
  
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "Admin" },
      update: {},
      create: {
        name: "Admin",
        description: "Acceso total al sistema",
        level: 100,
        permissions: [
          "all:*",
          "users:*",
          "roles:*",
          "settings:*",
          "audit:read",
        ],
      },
    }),
    prisma.role.upsert({
      where: { name: "Gerencia" },
      update: {},
      create: {
        name: "Gerencia",
        description: "Gerente de ventas con acceso a reportes y supervisión",
        level: 80,
        permissions: [
          "leads:*",
          "opportunities:*",
          "contacts:*",
          "accounts:*",
          "quotes:*",
          "activities:*",
          "tasks:*",
          "campaigns:*",
          "reports:*",
          "whatsapp:read",
        ],
      },
    }),
    prisma.role.upsert({
      where: { name: "Ventas" },
      update: {},
      create: {
        name: "Ventas",
        description: "Vendedor con acceso a sus leads y oportunidades",
        level: 50,
        permissions: [
          "leads:own",
          "leads:create",
          "opportunities:own",
          "opportunities:create",
          "contacts:read",
          "contacts:create",
          "accounts:read",
          "quotes:own",
          "quotes:create",
          "activities:own",
          "tasks:own",
          "whatsapp:own",
          "products:read",
        ],
      },
    }),
    prisma.role.upsert({
      where: { name: "Marketing" },
      update: {},
      create: {
        name: "Marketing",
        description: "Marketing con acceso a campañas y leads",
        level: 50,
        permissions: [
          "leads:read",
          "leads:create",
          "contacts:read",
          "contacts:create",
          "campaigns:*",
          "whatsapp:send",
          "reports:marketing",
        ],
      },
    }),
    prisma.role.upsert({
      where: { name: "Taller" },
      update: {},
      create: {
        name: "Taller",
        description: "Soporte técnico y servicio postventa",
        level: 30,
        permissions: [
          "contacts:read",
          "activities:create",
          "tasks:own",
          "products:read",
          "whatsapp:own",
        ],
      },
    }),
    prisma.role.upsert({
      where: { name: "Solo-lectura" },
      update: {},
      create: {
        name: "Solo-lectura",
        description: "Acceso de solo lectura",
        level: 10,
        permissions: [
          "leads:read",
          "opportunities:read",
          "contacts:read",
          "accounts:read",
          "reports:basic",
        ],
      },
    }),
  ]);

  console.log("✅ Roles creados");

  // ============================================
  // USUARIOS DEMO
  // ============================================

  const adminRole = roles.find((r) => r.name === "Admin")!;
  const gerenciaRole = roles.find((r) => r.name === "Gerencia")!;
  const ventasRole = roles.find((r) => r.name === "Ventas")!;
  const marketingRole = roles.find((r) => r.name === "Marketing")!;

  const hashedPassword = await bcrypt.hash("demo123", 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@radeco.com" },
      update: {},
      create: {
        email: "admin@radeco.com",
        name: "Admin RADECO",
        password: hashedPassword,
        roleId: adminRole.id,
        active: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "gerente@radeco.com" },
      update: {},
      create: {
        email: "gerente@radeco.com",
        name: "Carlos Mendoza",
        password: hashedPassword,
        roleId: gerenciaRole.id,
        active: true,
        phone: "+593987654321",
      },
    }),
    prisma.user.upsert({
      where: { email: "vendedor1@radeco.com" },
      update: {},
      create: {
        email: "vendedor1@radeco.com",
        name: "María López",
        password: hashedPassword,
        roleId: ventasRole.id,
        active: true,
        phone: "+593987654322",
      },
    }),
    prisma.user.upsert({
      where: { email: "vendedor2@radeco.com" },
      update: {},
      create: {
        email: "vendedor2@radeco.com",
        name: "Jorge Vera",
        password: hashedPassword,
        roleId: ventasRole.id,
        active: true,
        phone: "+593987654323",
      },
    }),
    prisma.user.upsert({
      where: { email: "marketing@radeco.com" },
      update: {},
      create: {
        email: "marketing@radeco.com",
        name: "Ana Torres",
        password: hashedPassword,
        roleId: marketingRole.id,
        active: true,
      },
    }),
  ]);

  console.log("✅ Usuarios demo creados (password: demo123)");

  // ============================================
  // PIPELINES Y STAGES
  // ============================================

  const pipelineImplementos = await prisma.pipeline.upsert({
    where: { id: "pipeline-implementos" },
    update: {},
    create: {
      id: "pipeline-implementos",
      name: "Implementos",
      description: "Pipeline para venta de implementos agrícolas",
      type: "Implementos",
      order: 1,
      stages: {
        create: [
          { name: "Nuevo", order: 1, probability: 10, type: "open", color: "#94a3b8" },
          { name: "Calificado", order: 2, probability: 30, type: "open", color: "#60a5fa" },
          { name: "Cotización Enviada", order: 3, probability: 50, type: "open", color: "#fbbf24" },
          { name: "Negociación", order: 4, probability: 70, type: "open", color: "#fb923c" },
          { name: "Ganado", order: 5, probability: 100, type: "won", color: "#10b981" },
          { name: "Perdido", order: 6, probability: 0, type: "lost", color: "#ef4444" },
        ],
      },
    },
  });

  await prisma.pipeline.upsert({
    where: { id: "pipeline-repuestos" },
    update: {},
    create: {
      id: "pipeline-repuestos",
      name: "Repuestos",
      description: "Pipeline para venta de repuestos",
      type: "Repuestos",
      order: 2,
      stages: {
        create: [
          { name: "Consulta", order: 1, probability: 20, type: "open", color: "#94a3b8" },
          { name: "Identificación de Pieza", order: 2, probability: 40, type: "open", color: "#60a5fa" },
          { name: "Cotización", order: 3, probability: 60, type: "open", color: "#fbbf24" },
          { name: "Confirmación", order: 4, probability: 80, type: "open", color: "#fb923c" },
          { name: "Despacho", order: 5, probability: 90, type: "open", color: "#a78bfa" },
          { name: "Cerrado", order: 6, probability: 100, type: "won", color: "#10b981" },
          { name: "Perdido", order: 7, probability: 0, type: "lost", color: "#ef4444" },
        ],
      },
    },
  });

  await prisma.pipeline.upsert({
    where: { id: "pipeline-maquinaria" },
    update: {},
    create: {
      id: "pipeline-maquinaria",
      name: "Tractores y Maquinaria",
      description: "Pipeline para venta de tractores y maquinaria pesada",
      type: "Maquinaria",
      order: 3,
      stages: {
        create: [
          { name: "Lead", order: 1, probability: 10, type: "open", color: "#94a3b8" },
          { name: "Demo/Visita", order: 2, probability: 30, type: "open", color: "#60a5fa" },
          { name: "Cotización", order: 3, probability: 40, type: "open", color: "#fbbf24" },
          { name: "Crédito/Negociación", order: 4, probability: 60, type: "open", color: "#fb923c" },
          { name: "Ganado", order: 5, probability: 100, type: "won", color: "#10b981" },
          { name: "Perdido", order: 6, probability: 0, type: "lost", color: "#ef4444" },
        ],
      },
    },
  });

  console.log("✅ Pipelines y etapas creados");

  // ============================================
  // PRODUCTOS CATÁLOGO
  // ============================================

  await Promise.all([
    // Implementos TATU
    prisma.product.upsert({
      where: { code: "TATU-RASTRA-18" },
      update: {},
      create: {
        code: "TATU-RASTRA-18",
        name: "Rastra de Discos TATU 18 Discos",
        description: "Rastra de discos pesada para preparación de suelo. 18 discos de 22 pulgadas.",
        category: "Implementos",
        brand: "TATU",
        price: 3500,
        cost: 2800,
        stock: 5,
        active: true,
        featured: true,
        specifications: {
          discos: 18,
          diametroDiscos: "22 pulgadas",
          peso: "850 kg",
          anchoTrabajo: "2.10 m",
        },
      },
    }),
    prisma.product.upsert({
      where: { code: "TATU-ARADO-3D" },
      update: {},
      create: {
        code: "TATU-ARADO-3D",
        name: "Arado de Discos TATU 3 Discos",
        description: "Arado reversible de 3 discos para volteo de suelo",
        category: "Implementos",
        brand: "TATU",
        price: 2200,
        cost: 1750,
        stock: 8,
        active: true,
      },
    }),
    // Implementos BALDAN
    prisma.product.upsert({
      where: { code: "BALDAN-SEMBRADORA-5L" },
      update: {},
      create: {
        code: "BALDAN-SEMBRADORA-5L",
        name: "Sembradora BALDAN 5 Líneas",
        description: "Sembradora de precisión neumática para maíz, soya, arroz",
        category: "Implementos",
        brand: "BALDAN",
        price: 4800,
        cost: 3900,
        stock: 3,
        active: true,
        featured: true,
      },
    }),
    // Tractores
    prisma.product.upsert({
      where: { code: "CHANGFA-60HP" },
      update: {},
      create: {
        code: "CHANGFA-60HP",
        name: "Tractor CHANGFA 60HP 4x4",
        description: "Tractor agrícola 60HP con tracción 4x4, ideal para cultivos de arroz y banano",
        category: "Tractores",
        brand: "CHANGFA",
        price: 28500,
        cost: 23000,
        stock: 2,
        active: true,
        featured: true,
        specifications: {
          potencia: "60 HP",
          traccion: "4x4",
          transmision: "8+8",
          motor: "Diesel 4 cilindros",
        },
      },
    }),
    prisma.product.upsert({
      where: { code: "MINOS-80HP" },
      update: {},
      create: {
        code: "MINOS-80HP",
        name: "Tractor MINOS 80HP",
        description: "Tractor de alta potencia para trabajos pesados",
        category: "Tractores",
        brand: "MINOS",
        price: 38900,
        cost: 32000,
        stock: 1,
        active: true,
        featured: true,
      },
    }),
    // Repuestos
    prisma.product.upsert({
      where: { code: "REP-FILTRO-ACEITE-01" },
      update: {},
      create: {
        code: "REP-FILTRO-ACEITE-01",
        name: "Filtro de Aceite Universal",
        description: "Filtro de aceite compatible con motores diesel agrícolas",
        category: "Repuestos",
        brand: "AEMCO",
        price: 15,
        cost: 9,
        stock: 50,
        active: true,
      },
    }),
    prisma.product.upsert({
      where: { code: "REP-DISCO-RASTRA-22" },
      update: {},
      create: {
        code: "REP-DISCO-RASTRA-22",
        name: "Disco para Rastra 22 pulgadas",
        description: "Disco de reemplazo para rastras, acero endurecido",
        category: "Repuestos",
        brand: "FULLAS",
        price: 45,
        cost: 32,
        stock: 30,
        active: true,
      },
    }),
    prisma.product.upsert({
      where: { code: "REP-LLANTA-TRACTOR-14" },
      update: {},
      create: {
        code: "REP-LLANTA-TRACTOR-14",
        name: "Llanta Tractor 14.9-28",
        description: "Llanta agrícola radial para tractor",
        category: "Repuestos",
        brand: "FULLAS",
        price: 380,
        cost: 280,
        stock: 12,
        active: true,
      },
    }),
  ]);

  console.log("✅ Productos creados");

  // ============================================
  // CONTACTOS Y CUENTAS DE EJEMPLO
  // ============================================

  const account1 = await prisma.company.create({
    data: {
      name: "Hacienda El Progreso",
      type: "Agricultor",
      industry: "Arroz",
      taxId: "0992345678001",
      phone: "+593987111222",
      province: "Guayas",
      city: "Yaguachi",
      size: "50-200 ha",
      tags: ["VIP", "Arroz"],
    },
  });

  const account2 = await prisma.company.create({
    data: {
      name: "Camaronera Los Delfines",
      type: "Camaronero",
      industry: "Camarón",
      taxId: "0991234567001",
      phone: "+593988222333",
      province: "El Oro",
      city: "Machala",
      size: ">200 ha",
      tags: ["Camarón", "Grande"],
    },
  });

  const contact1 = await prisma.contact.create({
    data: {
      firstName: "Juan",
      lastName: "Pérez",
      fullName: "Juan Pérez",
      email: "juan.perez@elprogreso.com",
      phone: "+593987111222",
      whatsapp: "+593987111222",
      position: "Administrador",
      accountId: account1.id,
      province: "Guayas",
      city: "Yaguachi",
      source: "Feria",
      tags: ["Agricultor", "Interesado-Implementos"],
      optIn: true,
    },
  });

  await prisma.contact.create({
    data: {
      firstName: "María",
      lastName: "González",
      fullName: "María González",
      email: "maria.gonzalez@camaronerasd.com",
      phone: "+593988222333",
      whatsapp: "+593988222333",
      position: "Propietaria",
      accountId: account2.id,
      province: "El Oro",
      city: "Machala",
      source: "Referido",
      tags: ["Camaronera"],
      optIn: true,
    },
  });

  const contact3 = await prisma.contact.create({
    data: {
      firstName: "Carlos",
      lastName: "Ramírez",
      fullName: "Carlos Ramírez",
      phone: "+593990333444",
      whatsapp: "+593990333444",
      province: "Los Ríos",
      city: "Babahoyo",
      source: "WhatsApp",
      tags: ["Banano"],
      optIn: true,
    },
  });

  console.log("✅ Cuentas y contactos creados");

  // ============================================
  // LEADS DE EJEMPLO
  // ============================================

  const vendedor1 = users.find((u) => u.email === "vendedor1@radeco.com")!;
  const vendedor2 = users.find((u) => u.email === "vendedor2@radeco.com")!;

  const lead1 = await prisma.lead.create({
    data: {
      title: "Consulta rastra para preparación de arrozal",
      contactId: contact1.id,
      accountId: account1.id,
      source: "Feria",
      status: "Calificado",
      interest: "Implementos",
      crop: "Arroz",
      province: "Guayas",
      city: "Yaguachi",
      assignedToId: vendedor1.id,
      priority: "Alta",
      score: 75,
      tags: ["Feria Agrícola 2026", "Arroz"],
    },
  });

  await prisma.lead.create({
    data: {
      title: "Interés en tractor 60HP para banano",
      contactId: contact3.id,
      source: "WhatsApp",
      status: "Nuevo",
      interest: "Tractores",
      crop: "Banano",
      province: "Los Ríos",
      assignedToId: vendedor2.id,
      priority: "Media",
      score: 50,
    },
  });

  console.log("✅ Leads de ejemplo creados");

  // ============================================
  // OPORTUNIDAD DE EJEMPLO
  // ============================================

  const stageCalificado = await prisma.stage.findFirst({
    where: {
      pipelineId: pipelineImplementos.id,
      name: "Calificado",
    },
  });

  let demoOpportunityId: string | null = null;
  if (stageCalificado) {
    const demoOpportunity = await prisma.opportunity.create({
      data: {
        title: "Venta rastra TATU - Hacienda El Progreso",
        contactId: contact1.id,
        accountId: account1.id,
        pipelineId: pipelineImplementos.id,
        stageId: stageCalificado.id,
        value: 3500,
        probability: 30,
        expectedCloseDate: new Date("2026-03-15"),
        assignedToId: vendedor1.id,
        priority: "Alta",
        products: ["TATU-RASTRA-18"],
        leadId: lead1.id,
      },
    });
    demoOpportunityId = demoOpportunity.id;
  }

  console.log("✅ Oportunidades creadas");

  // ============================================
  // COTIZACION DEMO
  // ============================================

  const demoQuote = await prisma.quote.create({
    data: {
      number: "QT-2026-0001",
      title: "Cotizacion inicial rastra TATU",
      contactId: contact1.id,
      accountId: account1.id,
      opportunityId: demoOpportunityId || undefined,
      status: QuoteStatus.BORRADOR,
      subtotal: 3500,
      discount: 0,
      tax: 12,
      total: 3920,
      notes: "Incluye entrega en Yaguachi",
      createdById: vendedor1.id,
      items: {
        create: [
          {
            description: "Rastra de Discos TATU 18 Discos",
            quantity: 1,
            unitPrice: 3500,
            discount: 0,
            total: 3500,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: QuoteStatus.BORRADOR,
            note: "Cotizacion creada",
            createdById: vendedor1.id,
          },
        ],
      },
    },
  });

  console.log("✅ Cotizacion demo creada", demoQuote.number);

  // ============================================
  // CONFIGURACIÓN WHATSAPP (STUB)
  // ============================================

  await prisma.wabaConfig.upsert({
    where: { phoneNumberId: "STUB_PHONE_NUMBER_ID" },
    update: {},
    create: {
      phoneNumberId: "STUB_PHONE_NUMBER_ID",
      wabaId: "STUB_WABA_ID",
      accessToken: "STUB_ACCESS_TOKEN",
      verifyToken: "radeco_verify_token_2026",
      phoneNumber: "+593000000000",
      displayName: "RADECO (Demo Mode)",
      active: false,
      metadata: {
        mode: "stub",
        note: "Configurar credenciales reales en producción",
      },
    },
  });

  console.log("✅ Configuración WhatsApp (stub) creada");

  // ============================================
  // CONVERSACIÓN WHATSAPP  (DEMO)
  // ============================================

  const waConversation = await prisma.waConversation.create({
    data: {
      waId: "593987111222",
      contactId: contact1.id,
      assignedToId: vendedor1.id,
      status: "Abierta",
      priority: "Normal",
      labels: ["Implementos", "Arroz"],
      lastMessageAt: new Date(),
      lastMessagePreview: "Buenos días, necesito información sobre rastras",
      unreadCount: 0,
    },
  });

  await prisma.waMessage.createMany({
    data: [
      {
        messageId: "wamid.demo001",
        conversationId: waConversation.id,
        direction: "inbound",
        type: "text",
        from: "593987111222",
        to: "593000000000",
        text: "Buenos días, necesito información sobre rastras para arrozales",
        status: "delivered",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        messageId: "wamid.demo002",
        conversationId: waConversation.id,
        direction: "outbound",
        type: "text",
        from: "593000000000",
        to: "593987111222",
        text: "¡Hola Juan! Claro, con gusto. Tenemos rastras TATU de 18 discos ideales para arroz. ¿Cuántas hectáreas trabajas?",
        status: "read",
        timestamp: new Date(Date.now() - 3000000),
      },
    ],
  });

  console.log("✅ Conversación WhatsApp demo creada");

  console.log("\n🎉 ¡Seed completado exitosamente!\n");
  console.log("📧 Usuarios demo:");
  console.log("   - admin@radeco.com (Admin)");
  console.log("   - gerente@radeco.com (Gerencia)");
  console.log("   - vendedor1@radeco.com (Ventas)");
  console.log("   - vendedor2@radeco.com (Ventas)");
  console.log("   - marketing@radeco.com (Marketing)");
  console.log("   🔑 Password: demo123\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error en seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
