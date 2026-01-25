"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { OrdersTable } from "@/components/admin/orders-table";
import { getStoredUser } from "@/lib/auth";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.rol !== "administrador") {
      router.push("/auth/login");
      return;
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestionar Pedidos</h1>
          <p className="text-muted-foreground">
            Administra y actualiza el estado de los pedidos
          </p>
        </div>

        <OrdersTable />
      </main>
    </div>
  );
}
