import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
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
                href="#"
                className="w-10 h-10 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="#"
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
              <li>
                <Link
                  href="/productos?categoria=pasteles"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Pasteles
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?categoria=panes"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Panes
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?categoria=tortas"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Tortas
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?categoria=galletas"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Galletas
                </Link>
              </li>
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
                  href="tel:+51987654321"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  +51 987 654 321
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a
                  href="mailto:contacto@dnava.pe"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  contacto@dnava.pe
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} D`Nava Panadería y Pastelería.
            Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
