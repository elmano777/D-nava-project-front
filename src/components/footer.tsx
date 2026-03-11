"use client";

import { useEffect, useState } from "react";
import { Instagram, Mail, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { listCategoriesPublicApi } from "@/lib/api";
import type { CategoryDto } from "@/lib/api";

export function Footer() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  useEffect(() => {
    listCategoriesPublicApi({ active: true })
      .then((data) => setCategories(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Image
              src="/images/dnava-logo2.png"
              alt="D'Nava Logo"
              width={100}
              height={100}
              className="h-16 w-auto"
            />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Panadería y pastelería artesanal con tradición familiar desde
              1995.
            </p>
            <div className="flex gap-3">
              <Link
                href="https://www.instagram.com/dnava.pasteleria/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Navegación
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/productos"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link
                  href="/#nosotros"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/#contacto"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Categorías
            </h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.categoria_id}>
                  <Link
                    href={`/productos?categoria=${encodeURIComponent(cat.nombre.toLowerCase())}`}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {cat.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Contacto
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a
                  href="tel:+51940241024"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  +51 940 241 024
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a
                  href="mailto:dnavapasteleria@gmail.com"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  dnavapasteleria@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} D`Nava Panadería y Pastelería.
              Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-end">
              <Link
                href="/libro-de-reclamaciones"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Libro de Reclamaciones
              </Link>
              <Link
                href="/terminos-y-condiciones"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Términos y Condiciones
              </Link>
              <Link
                href="/politica-de-privacidad"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Política de Privacidad
              </Link>
              <Link
                href="/politica-de-cambios-y-devoluciones"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cambios y Devoluciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
