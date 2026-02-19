import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Users, Shield, Database, MessageCircle } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  const isAdmin = session?.user.roleName === "Admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-agro-900 flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          Configuración
        </h1>
        <p className="text-sand-600 mt-1">
          Personaliza y configura el sistema
        </p>
      </div>

      {!isAdmin && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-800">
              Solo los usuarios con rol Admin pueden acceder a la configuración
              del sistema. Contacta a tu administrador.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Categorías de configuración */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className={!isAdmin ? "opacity-50" : ""}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Usuarios y Equipos</CardTitle>
                <p className="text-sm text-sand-600">Gestionar accesos</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-sand-700">
              <li>• Crear y editar usuarios</li>
              <li>• Asignar roles</li>
              <li>• Gestionar permisos</li>
              <li>• Ver actividades de usuarios</li>
            </ul>
          </CardContent>
        </Card>

        <Card className={!isAdmin ? "opacity-50" : ""}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Roles y Permisos</CardTitle>
                <p className="text-sm text-sand-600">RBAC</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-sand-700">
              <li>• Definir roles personalizados</li>
              <li>• Configurar permisos granulares</li>
              <li>• Jerarquía de roles</li>
            </ul>
          </CardContent>
        </Card>

        <Card className={!isAdmin ? "opacity-50" : ""}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">WhatsApp Business</CardTitle>
                <p className="text-sm text-sand-600">Meta Cloud API</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-sand-700">
              <li>• Configurar credenciales</li>
              <li>• Gestionar templates</li>
              <li>• Webhook settings</li>
            </ul>
            <p className="text-xs text-sand-500 mt-3">
              Ver: docs/CONFIG_WHATSAPP.md
            </p>
          </CardContent>
        </Card>

        <Card className={!isAdmin ? "opacity-50" : ""}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Database className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Base de Datos</CardTitle>
                <p className="text-sm text-sand-600">Backup y mantenimiento</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-sand-700">
              <li>• Backups automáticos</li>
              <li>• Exportar datos</li>
              <li>• Limpieza de logs antiguos</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Información del sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-sand-600">Versión:</span>
            <span className="font-semibold">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sand-600">Entorno:</span>
            <span className="font-semibold">
              {process.env.NODE_ENV || "development"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sand-600">WhatsApp:</span>
            <span className="font-semibold">
              {process.env.WHATSAPP_ENABLED === "true" ? "Activo" : "Stub Mode"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sand-600">Usuario actual:</span>
            <span className="font-semibold">{session?.user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sand-600">Rol:</span>
            <span className="font-semibold">{session?.user.roleName}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
