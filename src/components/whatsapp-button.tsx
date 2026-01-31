"use client";

import { Package } from "lucide-react";
import Link from "next/link";

export function WhatsAppButton() {
  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-3">
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
    </div>
  );
}
