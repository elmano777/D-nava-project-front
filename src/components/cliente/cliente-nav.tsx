"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, LogOut, User, Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { clearAuthData, getStoredUser } from "@/lib/auth";
import { AuthUser } from "@/lib/api";
import { ShoppingCartCliente } from "@/components/cliente/shopping-cart-cliente";

export function ClienteNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = () => {
    clearAuthData();
    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "backend_user=; path=/; max-age=0";
    router.replace("/");
  };

  const navItems = [
    { href: "/cliente", label: "Productos", icon: ShoppingBag },
    { href: "/cliente/mis-pedidos", label: "Mis Pedidos", icon: Package },
    {
      href: "/cliente/consultar-pedido",
      label: "Consultar Pedido",
      icon: Search,
    },
  ];

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/cliente" className="flex items-center gap-2">
              <Image
                src="/images/dnava-logo2.png"
                alt="D'Nava Logo"
                width={60}
                height={60}
                className="h-12 w-auto"
              />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShoppingCartCliente />

            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.nombre_completo || user?.email || "Cliente"}</span>
            </div>

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
