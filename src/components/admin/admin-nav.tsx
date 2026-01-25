"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  LogOut,
  Tags,
  Search,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { clearAuthData } from "@/lib/auth";

export function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    // Limpiar localStorage
    clearAuthData();

    // Limpiar cookies
    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "backend_user=; path=/; max-age=0";

    router.replace("/");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Productos", icon: Package },
    { href: "/admin/categories", label: "Categorías", icon: Tags },
    { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
    { href: "/admin/consultar-pedido", label: "Buscar Pedido", icon: Search },
    { href: "/admin/reports", label: "Reportes", icon: BarChart3 },
  ];

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2">
              <Image
                src="/images/dnava-logo2.png"
                alt="D'Nava Logo"
                width={60}
                height={60}
                className="h-12 w-auto"
              />
              <span className="font-bold text-lg">Admin</span>
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

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">Ver Sitio</Link>
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
