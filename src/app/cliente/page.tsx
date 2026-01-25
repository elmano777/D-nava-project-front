"use client";

import { useEffect, useState, useMemo } from "react";
import { ClienteNav } from "@/components/cliente/cliente-nav";
import { ProductCardCliente } from "@/components/cliente/product-card-cliente";
import {
  ProductFiltersSheet,
  ActiveFilters,
  ProductFilters,
} from "@/components/cliente/product-filters";
import { Button } from "@/components/ui/button";
import {
  getProductsPublicApi,
  listCategoriesApi,
  ProductWithImagesDto,
  CategoryDto,
} from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function ClienteDashboardPage() {
  const [products, setProducts] = useState<ProductWithImagesDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    categories: [],
    inStock: false,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          listCategoriesApi({ active: true }),
          getProductsPublicApi({ disponible: true }),
        ]);
        setCategories(categoriesData);
        setProducts(productsData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Reset showAll when filters change
  useEffect(() => {
    setShowAll(false);
  }, [filters]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!product.nombre.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filtro por categorías
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(product.categoria_id)) {
          return false;
        }
      }

      // Filtro por stock
      if (filters.inStock) {
        const hasStock = product.control_stock
          ? (product.stock_actual || 0) > 0
          : true;
        if (!hasStock) {
          return false;
        }
      }

      return true;
    });
  }, [products, filters]);

  const displayedProducts = showAll
    ? filteredProducts
    : filteredProducts.slice(0, 8);
  const hasMoreProducts = filteredProducts.length > 8;

  const handleRemoveFilter = (
    type: "search" | "category" | "inStock",
    value?: number,
  ) => {
    setFilters((prev) => {
      if (type === "search") {
        return { ...prev, search: "" };
      }
      if (type === "category" && value !== undefined) {
        return {
          ...prev,
          categories: prev.categories.filter((id) => id !== value),
        };
      }
      if (type === "inStock") {
        return { ...prev, inStock: false };
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <ClienteNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Nuestros Productos</h1>
          <p className="text-muted-foreground">
            Selecciona los productos que deseas agregar a tu carrito
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Filtros y badges activos */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-4">
                <ProductFiltersSheet
                  categories={categories}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
                <ActiveFilters
                  filters={filters}
                  categories={categories}
                  onRemoveFilter={handleRemoveFilter}
                />
              </div>
            </div>

            {/* Productos */}
            {filteredProducts.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedProducts.map((product) => (
                    <ProductCardCliente
                      key={product.producto_id}
                      product={{
                        id: String(product.producto_id),
                        name: product.nombre,
                        description: product.descripcion_breve || "",
                        price_in_cents: Math.round(
                          parseFloat(product.precio_base) * 100,
                        ),
                        image_url:
                          product.imagenes?.[0]?.url_s3 || "/placeholder.jpg",
                        stock: product.control_stock
                          ? product.stock_actual || 0
                          : 999,
                      }}
                    />
                  ))}
                </div>

                {hasMoreProducts && !showAll && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => setShowAll(true)}
                      size="lg"
                      variant="outline"
                    >
                      Ver todos los productos ({filteredProducts.length})
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">
                  No hay productos que coincidan con los filtros
                </p>
                <Button
                  variant="link"
                  onClick={() =>
                    setFilters({ search: "", categories: [], inStock: false })
                  }
                  className="mt-2"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
