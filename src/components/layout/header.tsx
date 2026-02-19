"use client";

import { Bell, Search, Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="bg-white border-b border-sand-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Búsqueda global */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sand-400" />
            <Input
              placeholder="Buscar clientes, leads, oportunidades... (Ctrl+K)"
              className="pl-10 bg-sand-50 border-sand-200"
            />
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="flex items-center gap-3 ml-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>
          {/* Botón de acción rápida */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nuevo</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Crear nuevo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Lead</DropdownMenuItem>
              <DropdownMenuItem>Contacto</DropdownMenuItem>
              <DropdownMenuItem>Oportunidad</DropdownMenuItem>
              <DropdownMenuItem>Cotización</DropdownMenuItem>
              <DropdownMenuItem>Actividad</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notificaciones */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-agro-600 text-white">
                    {getInitials(user.name || "Usuario")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
