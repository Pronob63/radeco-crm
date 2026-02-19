"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tractor, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales inválidas");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    const demoAccounts: Record<string, { email: string; password: string }> = {
      admin: { email: "admin@radeco.com", password: "demo123" },
      gerente: { email: "gerente@radeco.com", password: "demo123" },
      vendedor: { email: "vendedor1@radeco.com", password: "demo123" },
    };

    const account = demoAccounts[role];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-agro-50 via-white to-sand-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo y título */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-agro-600 p-3 rounded-xl">
              <Tractor className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-agro-900">RADECO CRM</h1>
          <p className="text-sand-600">
            Sistema de gestión de clientes y ventas
          </p>
        </div>

        {/* Formulario de login */}
        <Card>
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Ingresar"}
              </Button>
            </form>

            {/* Usuarios demo - SOLO EN DESARROLLO */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Acceso rápido (desarrollo):
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemo("admin")}
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemo("gerente")}
                  >
                    Gerente
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemo("vendedor")}
                  >
                    Vendedor
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center text-xs text-sand-500">
          <p>RADECO © 2026 - Implementos Agrícolas</p>
          <p className="mt-1">Ecuador</p>
        </div>
      </div>
    </div>
  );
}
