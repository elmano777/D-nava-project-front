"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";
import {
  getProductByIdApi,
  updateProductApi,
  listCategoriesApi,
  CategoryDto,
  CreateProductPayload,
} from "@/lib/api";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [nombre, setNombre] = useState("");
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [descripcionBreve, setDescripcionBreve] = useState("");
  const [descripcionCompleta, setDescripcionCompleta] = useState("");
  const [ingredientes, setIngredientes] = useState("");
  const [precioBase, setPrecioBase] = useState("");
  const [controlStock, setControlStock] = useState(false);
  const [stockActual, setStockActual] = useState("");
  const [disponible, setDisponible] = useState(true);
  const [tienePersonalizacion, setTienePersonalizacion] = useState(false);
  const [opcionesPersonalizacion, setOpcionesPersonalizacion] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.rol !== "administrador") {
      router.push("/auth/login");
      return;
    }

    const loadData = async () => {
      try {
        const [product, cats] = await Promise.all([
          getProductByIdApi(productId),
          listCategoriesApi({ active: true }),
        ]);

        setCategories(cats);

        // Llenar el formulario con los datos del producto
        setNombre(product.nombre);
        setCategoriaId(String(product.categoria_id));
        setDescripcionBreve(product.descripcion_breve || "");
        setDescripcionCompleta(product.descripcion_completa || "");
        setIngredientes(product.ingredientes || "");
        setPrecioBase(product.precio_base);
        setControlStock(product.control_stock);
        setStockActual(product.stock_actual?.toString() || "");
        setDisponible(product.disponible);
        setTienePersonalizacion(product.tiene_personalizacion);
        if (product.opciones_personalizacion) {
          setOpcionesPersonalizacion(
            JSON.stringify(product.opciones_personalizacion, null, 2)
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar producto");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload: Partial<CreateProductPayload> = {
        categoria_id: parseInt(categoriaId),
        nombre,
        precio_base: parseFloat(precioBase),
        disponible,
        descripcion_breve: descripcionBreve || undefined,
        descripcion_completa: descripcionCompleta || undefined,
        ingredientes: ingredientes || undefined,
        control_stock: controlStock,
        stock_actual: controlStock ? (parseInt(stockActual) || 0) : undefined,
        tiene_personalizacion: tienePersonalizacion,
      };

      if (tienePersonalizacion && opcionesPersonalizacion) {
        try {
          payload.opciones_personalizacion = JSON.parse(opcionesPersonalizacion);
        } catch {
          setError("El JSON de opciones de personalización no es válido");
          setIsSaving(false);
          return;
        }
      }

      await updateProductApi(productId, payload);
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar producto");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando producto...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a productos
            </Link>
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Editar Producto</CardTitle>
            <CardDescription>
              Modifica los datos del producto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Torta de Chocolate"
                  required
                />
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Select value={categoriaId} onValueChange={setCategoriaId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.categoria_id} value={String(cat.categoria_id)}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <Label htmlFor="precio">Precio (S/) *</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioBase}
                  onChange={(e) => setPrecioBase(e.target.value)}
                  placeholder="45.00"
                  required
                />
              </div>

              {/* Descripción breve */}
              <div className="space-y-2">
                <Label htmlFor="descripcion_breve">Descripción breve</Label>
                <Input
                  id="descripcion_breve"
                  value={descripcionBreve}
                  onChange={(e) => setDescripcionBreve(e.target.value)}
                  placeholder="Descripción corta para listados"
                />
              </div>

              {/* Descripción completa */}
              <div className="space-y-2">
                <Label htmlFor="descripcion_completa">Descripción completa</Label>
                <Textarea
                  id="descripcion_completa"
                  value={descripcionCompleta}
                  onChange={(e) => setDescripcionCompleta(e.target.value)}
                  placeholder="Descripción detallada del producto"
                  rows={3}
                />
              </div>

              {/* Ingredientes */}
              <div className="space-y-2">
                <Label htmlFor="ingredientes">Ingredientes</Label>
                <Textarea
                  id="ingredientes"
                  value={ingredientes}
                  onChange={(e) => setIngredientes(e.target.value)}
                  placeholder="Harina, azúcar, huevos..."
                  rows={2}
                />
              </div>

              {/* Disponible */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Disponible</Label>
                  <p className="text-sm text-muted-foreground">
                    El producto está disponible para la venta
                  </p>
                </div>
                <Switch checked={disponible} onCheckedChange={setDisponible} />
              </div>

              {/* Control de stock */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Control de stock</Label>
                  <p className="text-sm text-muted-foreground">
                    Activar control de inventario
                  </p>
                </div>
                <Switch checked={controlStock} onCheckedChange={setControlStock} />
              </div>

              {/* Stock actual */}
              {controlStock && (
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock actual</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={stockActual}
                    onChange={(e) => setStockActual(e.target.value)}
                    placeholder="10"
                  />
                </div>
              )}

              {/* Personalización */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tiene personalización</Label>
                  <p className="text-sm text-muted-foreground">
                    El cliente puede personalizar el producto
                  </p>
                </div>
                <Switch
                  checked={tienePersonalizacion}
                  onCheckedChange={setTienePersonalizacion}
                />
              </div>

              {/* Opciones de personalización */}
              {tienePersonalizacion && (
                <div className="space-y-2">
                  <Label htmlFor="opciones">Opciones de personalización (JSON)</Label>
                  <Textarea
                    id="opciones"
                    value={opcionesPersonalizacion}
                    onChange={(e) => setOpcionesPersonalizacion(e.target.value)}
                    placeholder='{"tamaños": ["pequeño", "mediano", "grande"]}'
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/products">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
