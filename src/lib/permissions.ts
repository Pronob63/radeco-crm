import { auth } from "@/lib/auth";

export type Permission = string;

/**
 * Verifica si el usuario tiene un permiso específico
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.permissions) return false;

  const permissions = session.user.permissions;

  // Admin tiene todos los permisos
  if (permissions.includes("all:*")) return true;

  // Verificar permiso exacto
  if (permissions.includes(permission)) return true;

  // Verificar wildcard
  const [resource] = permission.split(":");
  if (permissions.includes(`${resource}:*`)) return true;

  return false;
}

/**
 * Verifica si el usuario tiene alguno de los permisos listados
 */
export async function hasAnyPermission(permissionsToCheck: Permission[]): Promise<boolean> {
  for (const permission of permissionsToCheck) {
    if (await hasPermission(permission)) return true;
  }
  return false;
}

/**
 * Verifica si el usuario tiene todos los permisos listados
 */
export async function hasAllPermissions(permissionsToCheck: Permission[]): Promise<boolean> {
  for (const permission of permissionsToCheck) {
    if (!(await hasPermission(permission))) return false;
  }
  return true;
}

/**
 * Verifica si el usuario puede acceder a un recurso
 * - Admin puede acceder a todo
 * - Si tiene permiso `resource:*` o `resource:read` puede leer
 * - Si es el owner del recurso y tiene permiso `resource:own` puede acceder
 */
export async function canAccessResource(
  resource: string,
  action: "read" | "write" | "delete",
  ownerId?: string
): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const permissions = session.user.permissions;

  // Admin tiene acceso total
  if (permissions.includes("all:*")) return true;

  // Verificar permiso completo del recurso
  if (permissions.includes(`${resource}:*`)) return true;

  // Verificar permiso de acción específica
  if (permissions.includes(`${resource}:${action}`)) return true;

  // Verificar si es owner y tiene permiso "own"
  if (ownerId && ownerId === session.user.id && permissions.includes(`${resource}:own`)) {
    return true;
  }

  return false;
}

/**
 * Middleware helper - lanza error si no tiene permiso
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const allowed = await hasPermission(permission);
  if (!allowed) {
    throw new Error("No tienes permisos para realizar esta acción");
  }
}

/**
 * Obtiene la sesión actual o lanza error
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Debes iniciar sesión");
  }
  return session;
}
