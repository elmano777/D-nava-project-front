"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface Product {
  producto_id: number;
  categoria_id: number;
  nombre: string;
  descripcion_breve: string | null;
  precio_base: string;
  stock_actual: number | null;
  control_stock: boolean;
  disponible: boolean;
}

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const formatPrice = (precio: string) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(parseFloat(precio));
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No hay productos registrados
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.producto_id}>
                <TableCell className="font-medium">{product.nombre}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {product.descripcion_breve || "-"}
                </TableCell>
                <TableCell>{formatPrice(product.precio_base)}</TableCell>
                <TableCell>
                  {product.control_stock
                    ? (product.stock_actual ?? 0)
                    : "Sin control"}
                </TableCell>
                <TableCell>
                  <Badge variant={product.disponible ? "default" : "secondary"}>
                    {product.disponible ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/products/${product.producto_id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
