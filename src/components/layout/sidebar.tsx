"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Target,
  ClipboardList,
  FileText,
  MessageCircle,
  Megaphone,
  BarChart3,
  Settings,
  Tractor,
} from "lucide-react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    roleName?: string;
  };
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Contactos", href: "/dashboard/contacts" },
  { icon: Target, label: "Leads", href: "/dashboard/leads" },
  { icon: ClipboardList, label: "Oportunidades", href: "/dashboard/opportunities" },
  { icon: FileText, label: "Cotizaciones", href: "/dashboard/quotes" },
  { icon: MessageCircle, label: "WhatsApp", href: "/dashboard/whatsapp" },
  { icon: Megaphone, label: "Campañas", href: "/dashboard/campaigns" },
  { icon: BarChart3, label: "Reportes", href: "/dashboard/reports" },
  { icon: Settings, label: "Configuración", href: "/dashboard/settings" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow border-r border-sand-200 bg-white overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sand-200">
          <div className="bg-agro-600 p-2 rounded-lg">
            <Tractor className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-agro-900">RADECO</h1>
            <p className="text-xs text-sand-600">CRM</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-agro-100 text-agro-900"
                    : "text-sand-700 hover:bg-sand-100 hover:text-agro-800"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-sand-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-agro-600 flex items-center justify-center text-white font-semibold">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sand-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-sand-600 truncate">{user.roleName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
