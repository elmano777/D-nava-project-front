"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { CategoryFilter } from "@/components/category-filter";
import {
  getProductsPublicApi,
  listCategoriesPublicApi,
  ProductWithImagesDto,
  CategoryDto,
} from "@/lib/api";

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoriaParam = searchParams.get("categoria");

  const [products, setProducts] = useState<ProductWithImagesDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar categorías activas
        const categoriesData = await listCategoriesPublicApi({ active: true });
        setCategories(categoriesData);

        // Buscar categoría por nombre si hay parámetro
        let categoriaId: number | undefined;
        if (categoriaParam) {
          const categoria = categoriesData.find(
            (c) => c.nombre.toLowerCase() === categoriaParam.toLowerCase(),
          );
          if (categoria) {
            categoriaId = categoria.categoria_id;
          }
        }

        // Cargar productos (filtrados por categoría si aplica)
        const productsData = await getProductsPublicApi({
          disponible: true,
          categoria_id: categoriaId,
        });
        setProducts(productsData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [categoriaParam]);

  return (
    <>
      {/* Category Filter */}
      <CategoryFilter
        categories={categories.map((c) => ({
          id: String(c.categoria_id),
          name: c.nombre,
          slug: c.nombre.toLowerCase(),
        }))}
        currentCategory={categoriaParam || undefined}
      />

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {products.map((product) => (
            <ProductCard
              key={product.producto_id}
              product={{
                id: String(product.producto_id),
                name: product.nombre,
                description: product.descripcion_breve || "",
                fullDescription: product.descripcion_completa || "",
                price_in_cents: Math.round(
                  parseFloat(product.precio_base) * 100,
                ),
                image_url: product.imagenes?.[0]?.url_s3 || "/placeholder.jpg",
                images: product.imagenes?.map((img) => img.url_s3) || [],
                stock: product.control_stock ? product.stock_actual || 0 : 999,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">
            No hay productos disponibles en esta categoría
          </p>
        </div>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">
            Nuestros Productos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Productos artesanales frescos y deliciosos
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          }
        >
          <ProductsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
