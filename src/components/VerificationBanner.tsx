"use client";

import { useState } from "react";
import { sendVerificationCodeApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface VerificationBannerProps {
  userEmail: string;
}

export function VerificationBanner({ userEmail }: VerificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    setIsSending(true);
    try {
      await sendVerificationCodeApi(userEmail);
      router.push(`/auth/verify-email?email=${encodeURIComponent(userEmail)}`);
    } catch (error) {
      console.error("Error al enviar código:", error);
      alert("Hubo un error al enviar el código. Intenta nuevamente.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Guardar en localStorage que el usuario cerró el banner
    localStorage.setItem("verification_banner_dismissed", "true");
  };

  // Verificar si el usuario ya cerró el banner anteriormente
  if (typeof window !== "undefined") {
    const dismissed = localStorage.getItem("verification_banner_dismissed");
    if (dismissed === "true" && isVisible) {
      return null;
    }
  }

  if (!isVisible) return null;

  return (
    <Alert className="relative mb-6 bg-blue-50 border-blue-200">
      <Mail className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900">
        Verifica tu correo electrónico
      </AlertTitle>
      <AlertDescription className="text-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
          <p className="text-sm">
            Aún no has verificado tu email. Hazlo para acceder a funciones
            adicionales y mantener tu cuenta segura.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="default"
              onClick={handleVerify}
              disabled={isSending}
            >
              {isSending ? "Enviando..." : "Verificar ahora"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
