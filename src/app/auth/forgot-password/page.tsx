"use client";

import type React from "react";

import { forgotPasswordApi } from "@/lib/api";
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
import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await forgotPasswordApi(email);
      setSuccess(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al enviar el enlace de recuperación";
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
              <Mail className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
            </div>
            <CardDescription>
              Ingresa tu correo y te enviaremos un enlace para recuperar tu
              contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>¡Correo enviado!</strong>
                    <p className="mt-2">
                      Hemos enviado un enlace de recuperación a{" "}
                      <strong>{email}</strong>. Por favor revisa tu bandeja de
                      entrada y sigue las instrucciones.
                    </p>
                  </AlertDescription>
                </Alert>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong>¿No recibiste el correo?</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Revisa tu carpeta de spam o correo no deseado</li>
                    <li>Verifica que el correo esté escrito correctamente</li>
                    <li>El enlace expirará en 1 hora</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                >
                  Enviar a otro correo
                </Button>
                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-sm text-primary hover:underline"
                  >
                    Volver al inicio de sesión
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@correo.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                  </Button>

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
