"use client";

import type React from "react";

import { confirmEmailApi, sendVerificationCodeApi } from "@/lib/api";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendCode = async () => {
    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    setIsResending(true);
    setError(null);
    setSuccess(null);

    try {
      await sendVerificationCodeApi(email);
      setSuccess("Código reenviado. Revisa tu correo.");
      setCanResend(false);
      setCountdown(60); // 60 segundos de espera
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al reenviar el código";
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!email || !codigo) {
      setError("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }

    if (codigo.length !== 6) {
      setError("El código debe tener 6 dígitos");
      setIsLoading(false);
      return;
    }

    try {
      await confirmEmailApi(email, codigo);
      setSuccess("¡Email verificado exitosamente!");

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push("/auth/login?verified=true");
      }, 2000);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al verificar el email";
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
              <CardTitle className="text-2xl">Verifica tu Email</CardTitle>
            </div>
            <CardDescription>
              Ingresa el código de 6 dígitos que enviamos a tu correo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify}>
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
                    disabled={!!emailParam}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="codigo">Código de Verificación</Label>
                  <Input
                    id="codigo"
                    type="text"
                    placeholder="123456"
                    required
                    maxLength={6}
                    value={codigo}
                    onChange={(e) => {
                      // Solo permitir números
                      const value = e.target.value.replace(/\D/g, "");
                      setCodigo(value);
                    }}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {success}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verificando..." : "Verificar Email"}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleResendCode}
                    disabled={!canResend || isResending}
                  >
                    {isResending
                      ? "Reenviando..."
                      : canResend
                        ? "Reenviar código"
                        : `Reenviar en ${countdown}s`}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              ¿No recibiste el código? Revisa tu carpeta de spam o reenvía el
              código.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
