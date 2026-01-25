"use client";

import { MessageCircle, Package } from "lucide-react";
import Link from "next/link";

export function WhatsAppButton() {
  const whatsappNumber = "51987654321";
  const message = encodeURIComponent(
    "Hola, me gustaría hacer una consulta sobre sus productos",
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Botón de rastrear pedido */}
      <Link
        href="/consultar-pedido"
        className="group flex items-center gap-3 bg-background border-2 border-border hover:border-primary rounded-full px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <span className="text-sm font-medium hidden sm:block">
          Rastrear pedido
        </span>
      </Link>

      {/* Botón de WhatsApp */}
      <Link
        href={`https://wa.me/${whatsappNumber}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] rounded-full px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-white" />
        </div>
        <span className="text-sm font-medium text-white hidden sm:block">
          Escríbenos
        </span>
      </Link>
    </div>
  );
}
