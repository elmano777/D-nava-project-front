"use client";

import type React from "react";

import { registerApi, sendVerificationCodeApi } from "@/lib/api";
import { saveAuthData } from "@/lib/auth";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Mail, X } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const telefonoDigits = telefono.replace(/\s/g, "");
    if (telefonoDigits.length !== 9) {
      setError("El teléfono debe tener 9 dígitos");
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
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
      // Registrar en backend NestJS
      const authResponse = await registerApi({
        email,
        password,
        nombre_completo: nombreCompleto,
        telefono: `+51${telefono.replace(/\s/g, "")}`,
      });

      // Guardar tokens y datos del usuario
      saveAuthData(authResponse);

      // También guardar en cookie para el middleware
      document.cookie = `access_token=${authResponse.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
      document.cookie = `backend_user=${encodeURIComponent(JSON.stringify(authResponse.user))}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;

      // Mostrar diálogo de verificación opcional
      setShowVerificationDialog(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al registrarse";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    setIsSendingCode(true);
    try {
      await sendVerificationCodeApi(email);
      // Redirigir a la página de verificación
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      console.error("Error al enviar código:", error);
      // Si falla, igual redirigir al dashboard
      router.push("/cliente");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSkipVerification = () => {
    setShowVerificationDialog(false);
    router.push("/cliente");
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
            <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
            <CardDescription>Regístrate para hacer pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Tu nombre completo"
                    required
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                  />
                </div>
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
                  <Label htmlFor="telefono">Teléfono</Label>
                  <div className="flex gap-2">
                    <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground select-none">
                      +51
                    </div>
                    <Input
                      id="telefono"
                      type="tel"
                      placeholder="928 750 445"
                      required
                      maxLength={11}
                      value={telefono}
                      onChange={(e) => {
                        // Solo permitir dígitos y espacios
                        const raw = e.target.value.replace(/[^\d]/g, "");
                        // Formatear con espacios: XXX XXX XXX
                        const formatted = raw
                          .slice(0, 9)
                          .replace(/(\d{3})(\d{0,3})(\d{0,3})/, (_, a, b, c) =>
                            [a, b, c].filter(Boolean).join(" "),
                          );
                        setTelefono(formatted);
                      }}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">Repetir Contraseña</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creando cuenta..." : "Registrarse"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  Inicia sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de verificación opcional */}
      <Dialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <DialogTitle>¿Verificar tu email?</DialogTitle>
            </div>
            <DialogDescription>
              Te enviaremos un código de verificación a <strong>{email}</strong>
              . Esto te permitirá acceder a funciones adicionales en el futuro.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <div className="text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>Recuperación de contraseña más segura</li>
                <li>Notificaciones importantes sobre tus pedidos</li>
                <li>Acceso a promociones exclusivas</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={handleSendVerificationCode}
              disabled={isSendingCode}
              className="w-full"
            >
              {isSendingCode ? "Enviando código..." : "Sí, enviar código"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkipVerification}
              disabled={isSendingCode}
              className="w-full"
            >
              Ahora no, continuar sin verificar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
