"use client";

import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCartDrawer } from "@/components/shopping-cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/dnava-logo2.png"
              alt="D'Nava Logo"
              width={70}
              height={70}
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2 rounded-lg hover:bg-muted/50"
            >
              Inicio
            </Link>
            <Link
              href="/productos"
              className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2 rounded-lg hover:bg-muted/50"
            >
              Productos
            </Link>
            <Link
              href="/#nosotros"
              className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2 rounded-lg hover:bg-muted/50"
            >
              Nosotros
            </Link>
            <Link
              href="/#contacto"
              className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2 rounded-lg hover:bg-muted/50"
            >
              Contacto
            </Link>
          </div>

          {/* Cart & Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden md:flex"
            >
              <Link href="/auth/login">
                <User className="h-4 w-4 mr-2" />
                Ingresar
              </Link>
            </Button>

            <ShoppingCartDrawer />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-foreground hover:bg-muted rounded-md transition-colors font-medium"
            >
              Inicio
            </Link>
            <Link
              href="/productos"
              className="block px-4 py-2 text-foreground hover:bg-muted rounded-md transition-colors font-medium"
            >
              Productos
            </Link>
            <Link
              href="/#nosotros"
              className="block px-4 py-2 text-foreground hover:bg-muted rounded-md transition-colors font-medium"
            >
              Nosotros
            </Link>
            <Link
              href="/#contacto"
              className="block px-4 py-2 text-foreground hover:bg-muted rounded-md transition-colors font-medium"
            >
              Contacto
            </Link>
            <Link
              href="/auth/login"
              className="block px-4 py-2 text-foreground hover:bg-muted rounded-md transition-colors font-medium"
            >
              Ingresar
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
