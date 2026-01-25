"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ShoppingCartDrawer() {
  const router = useRouter();

  const handleClick = () => {
    toast.info("Necesitas iniciar sesión para acceder al carrito", {
      action: {
        label: "Iniciar sesión",
        onClick: () => router.push("/auth/login"),
      },
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={handleClick}
    >
      <ShoppingCart className="h-5 w-5" />
    </Button>
  );
}
