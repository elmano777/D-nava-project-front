"use client";

import { useEffect, useState, useMemo } from "react";
import { ClienteNav } from "@/components/cliente/cliente-nav";
import { ClienteFooter } from "@/components/cliente/cliente-footer";
import { ProductCardCliente } from "@/components/cliente/product-card-cliente";
import {
  ProductFiltersSheet,
  ActiveFilters,
  ProductFilters,
} from "@/components/cliente/product-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const PRODUCTS_PER_PAGE = 12;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    categories: [],
    inStock: false,
    sortBy: "default",
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
    setCurrentPage(1);
  }, [filters]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
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

    // Ordenamiento
    if (filters.sortBy === "price_asc") {
      filtered = [...filtered].sort(
        (a, b) => parseFloat(a.precio_base) - parseFloat(b.precio_base),
      );
    } else if (filters.sortBy === "price_desc") {
      filtered = [...filtered].sort(
        (a, b) => parseFloat(b.precio_base) - parseFloat(a.precio_base),
      );
    }

    return filtered;
  }, [products, filters]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleRemoveFilter = (
    type: "search" | "category" | "inStock" | "sortBy",
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
      if (type === "sortBy") {
        return { ...prev, sortBy: "default" };
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
            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Búsqueda */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="pl-9"
                  />
                </div>
                {/* Filtros */}
                <ProductFiltersSheet
                  categories={categories}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
              {/* Filtros activos */}
              <ActiveFilters
                filters={filters}
                categories={categories}
                onRemoveFilter={handleRemoveFilter}
              />
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
                        fullDescription: product.descripcion_completa || "",
                        ingredients: product.ingredientes || "",
                        price_in_cents: Math.round(
                          parseFloat(product.precio_base) * 100,
                        ),
                        image_url:
                          product.imagenes?.[0]?.url_s3 || "/placeholder.jpg",
                        images:
                          product.imagenes?.map((img) => img.url_s3) || [],
                        stock: product.control_stock
                          ? product.stock_actual || 0
                          : 999,
                      }}
                    />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          const showPage =
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1;

                          if (!showPage && page === currentPage - 2) {
                            return (
                              <span key={page} className="px-2 py-1">
                                ...
                              </span>
                            );
                          }

                          if (!showPage && page === currentPage + 2) {
                            return (
                              <span key={page} className="px-2 py-1">
                                ...
                              </span>
                            );
                          }

                          if (!showPage) return null;

                          return (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-10"
                            >
                              {page}
                            </Button>
                          );
                        },
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
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
                    setFilters({
                      search: "",
                      categories: [],
                      inStock: false,
                      sortBy: "default",
                    })
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
      <ClienteFooter />
    </div>
  );
}
