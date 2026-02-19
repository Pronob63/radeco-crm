"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: any;
  onSuccess: () => void;
}

export function ContactFormDialog({
  open,
  onOpenChange,
  contact,
  onSuccess,
}: ContactFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const isEdit = !!contact;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      whatsapp: "",
      position: "",
      accountId: "",
      province: "",
      city: "",
      source: undefined,
      tags: [],
      optIn: true,
    },
  });

  const accountId = watch("accountId");

  const readErrorMessage = async (res: Response) => {
    try {
      const data = await res.json();
      if (data?.error) return data.error as string;
    } catch {
      // ignore json parse
    }
    try {
      const text = await res.text();
      if (text) return text;
    } catch {
      // ignore text parse
    }
    return "Error inesperado";
  };

  // Cargar cuentas
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("/api/accounts");
        if (!res.ok) {
          const message = await readErrorMessage(res);
          toast.error(message);
          return;
        }
        const data = await res.json();
        setAccounts(data);
      } catch (error) {
        console.error("Error loading accounts:", error);
        toast.error("No se pudieron cargar las cuentas");
      }
    }
    if (open) {
      fetchAccounts();
    }
  }, [open]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      reset(
        contact || {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          whatsapp: "",
          position: "",
          accountId: "",
          province: "",
          city: "",
          source: undefined,
          tags: [],
          optIn: true,
        }
      );
    }
  }, [open, contact, reset]);

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    try {
      const url = isEdit ? `/api/contacts/${contact.id}` : "/api/contacts";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const message = await readErrorMessage(res);
        throw new Error(message || "Error al guardar contacto");
      }

      toast.success(isEdit ? "Contacto actualizado" : "Contacto creado");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar contacto");
    } finally {
      setIsLoading(false);
    }
  };

  const accountOptions = accounts.map((acc) => ({
    value: acc.id,
    label: `${acc.name} (${acc.type})`,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Contacto" : "Nuevo Contacto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <Label htmlFor="firstName">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Juan"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <Label htmlFor="lastName">
                Apellido <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Pérez"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="juan.perez@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Teléfono */}
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+54 9 11 1234-5678"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                {...register("whatsapp")}
                placeholder="+54 9 11 1234-5678"
              />
            </div>
          </div>

          {/* Cargo */}
          <div>
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              {...register("position")}
              placeholder="Gerente de Producción"
            />
          </div>

          {/* Cuenta */}
          <div>
            <Label htmlFor="accountId">Cuenta</Label>
            <Combobox
              value={accountId}
              onValueChange={(value) => setValue("accountId", value)}
              options={accountOptions}
              placeholder="Seleccionar cuenta..."
              searchPlaceholder="Buscar cuenta..."
              emptyText="No se encontraron cuentas"
            />
            <p className="text-xs text-sand-500 mt-1">
              Asocia este contacto a una empresa/organización
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Provincia */}
            <div>
              <Label htmlFor="province">Provincia</Label>
              <Input
                id="province"
                {...register("province")}
                placeholder="Buenos Aires"
              />
            </div>

            {/* Ciudad */}
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" {...register("city")} placeholder="La Plata" />
            </div>
          </div>

          {/* Fuente */}
          <div>
            <Label htmlFor="source">Fuente de Contacto</Label>
            <Select
              value={watch("source")}
              onValueChange={(value: any) => setValue("source", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar fuente..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Web">Web</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Telefono">Teléfono</SelectItem>
                <SelectItem value="Referido">Referido</SelectItem>
                <SelectItem value="Feria">Feria/Evento</SelectItem>
                <SelectItem value="Visita">Visita</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opt-in */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="optIn"
              checked={watch("optIn")}
              onCheckedChange={(checked) => setValue("optIn", !!checked)}
            />
            <Label htmlFor="optIn" className="cursor-pointer">
              Acepta recibir comunicaciones (WhatsApp, email)
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Guardar Cambios" : "Crear Contacto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
