import { z } from "zod";

export const contactSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido").max(100),
  lastName: z.string().min(1, "El apellido es requerido").max(100),
  email: z.string().email("Email inválido").max(200).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  whatsapp: z.string().max(50).optional().or(z.literal("")),
  position: z.string().max(100).optional().or(z.literal("")),
  accountId: z.string().optional(),
  province: z.string().max(100).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  source: z.enum([
    "Web",
    "WhatsApp",
    "Telefono",
    "Referido",
    "Feria",
    "Visita",
    "Otro",
  ]).optional(),
  tags: z.array(z.string()).optional().default([]),
  optIn: z.boolean().optional().default(true),
});

export const accountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  type: z.enum(["Productor", "Distribuidor", "Cooperativa", "Otro"]),
  taxId: z.string().max(50).optional().or(z.literal("")),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  province: z.string().max(100).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
});

export const leadSchema = z.object({
  contactId: z.string().min(1, "El contacto es requerido"),
  source: z.enum([
    "Web",
    "WhatsApp",
    "Telefono",
    "Referido",
    "Feria",
    "Visita",
    "Otro",
  ]),
  interest: z.string().max(500).optional().or(z.literal("")),
  budget: z.number().optional(),
  assignedToId: z.string().optional(),
  priority: z.enum(["Baja", "Media", "Alta", "Urgente"]).default("Media"),
  status: z.enum(["Nuevo", "Contactado", "Calificado", "Descalificado", "Convertido"]).default("Nuevo"),
  notes: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
});

export const quoteItemSchema = z.object({
  productId: z.string().optional().or(z.literal("")),
  description: z.string().min(1, "La descripcion es requerida"),
  quantity: z.coerce.number().min(0.01, "Cantidad invalida"),
  unitPrice: z.coerce.number().min(0, "Precio invalido"),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
});

export const quoteSchema = z.object({
  title: z.string().min(1, "El titulo es requerido").max(200),
  contactId: z.string().optional().or(z.literal("")),
  accountId: z.string().optional().or(z.literal("")),
  opportunityId: z.string().optional().or(z.literal("")),
  status: z
    .enum(["BORRADOR", "ENVIADA", "NEGOCIACION", "ACEPTADA", "PERDIDA"])
    .optional(),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  taxRate: z.coerce.number().min(0).max(100).optional().default(12),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(quoteItemSchema).min(1, "Agrega al menos un item"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type AccountFormData = z.infer<typeof accountSchema>;
export type LeadFormData = z.infer<typeof leadSchema>;
export type QuoteFormData = z.infer<typeof quoteSchema>;
