"use client";

import type React from "react";

import { resetPasswordApi } from "@/lib/api";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, Lock, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");

  const [token, setToken] = useState(tokenParam || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!tokenParam) {
      setError(
        "Token inválido o expirado. Por favor solicita un nuevo enlace de recuperación.",
      );
    }
  }, [tokenParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Validaciones
    if (!token) {
      setError("Token no encontrado. Por favor solicita un nuevo enlace.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      await resetPasswordApi(token, password);
      setSuccess(true);

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al restablecer la contraseña";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/auth/login">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio de sesión
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
            </div>
            <CardDescription>
              Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>¡Contraseña restablecida!</strong>
                    <p className="mt-2">
                      Tu contraseña ha sido actualizada exitosamente.
                      Redirigiendo al inicio de sesión...
                    </p>
                  </AlertDescription>
                </Alert>
                <Button asChild className="w-full">
                  <Link href="/auth/login">Ir al inicio de sesión</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  {!tokenParam && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Token inválido o expirado</strong>
                        <p className="mt-2">
                          El enlace de recuperación no es válido o ha expirado.
                          Por favor solicita un nuevo enlace.
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={!tokenParam}
                      autoFocus
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">
                      Confirmar Nueva Contraseña
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Repite la contraseña"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={!tokenParam}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !tokenParam}
                  >
                    {isLoading ? "Restableciendo..." : "Restablecer Contraseña"}
                  </Button>

                  {!tokenParam && (
                    <div className="text-center">
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Solicitar nuevo enlace de recuperación
                      </Link>
                    </div>
                  )}

                  <div className="text-center text-sm text-muted-foreground">
                    ¿Recordaste tu contraseña?{" "}
                    <Link
                      href="/auth/login"
                      className="text-primary hover:underline"
                    >
                      Iniciar sesión
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Cargando...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
