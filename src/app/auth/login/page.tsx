"use client";

import type React from "react";

import { loginApi } from "@/lib/api";
import { saveAuthData, isAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Login en backend NestJS
      const authResponse = await loginApi(email, password);

      // Validar que la respuesta tenga la estructura esperada
      if (!authResponse.user) {
        setError(
          "Ocurrió un problema al procesar la respuesta del servidor. Intenta nuevamente.",
        );
        return;
      }

      // Guardar tokens y datos del usuario en localStorage
      saveAuthData(authResponse);

      // También guardar en cookie para que el middleware pueda leerlo
      document.cookie = `access_token=${authResponse.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
      document.cookie = `backend_user=${encodeURIComponent(JSON.stringify(authResponse.user))}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;

      // Redirigir según el rol
      if (authResponse.user.rol === "administrador") {
        router.push("/admin");
      } else if (authResponse.user.rol === "cliente") {
        router.push("/cliente");
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesión";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tu correo y contraseña</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Ingresando..." : "Ingresar"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                ¿No tienes cuenta?{" "}
                <Link
                  href="/auth/sign-up"
                  className="underline underline-offset-4"
                >
                  Regístrate
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
