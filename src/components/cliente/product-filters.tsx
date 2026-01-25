"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { CategoryDto } from "@/lib/api";

export interface ProductFilters {
  search: string;
  categories: number[];
  inStock: boolean;
}

interface ProductFiltersProps {
  categories: CategoryDto[];
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export function ProductFiltersSheet({
  categories,
  filters,
  onFiltersChange,
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const cleared: ProductFilters = {
      search: "",
      categories: [],
      inStock: false,
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
    setIsOpen(false);
  };

  const toggleCategory = (categoryId: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    filters.categories.length +
    (filters.inStock ? 1 : 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <SlidersHorizontal className="h-5 w-5" />
            Filtros
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Búsqueda por nombre */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar por nombre</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Ej: Torta de chocolate..."
                value={localFilters.search}
                onChange={(e) =>
                  setLocalFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-9"
              />
            </div>
          </div>

          <Separator />

          {/* Categorías */}
          <div className="space-y-3">
            <Label>Categorías</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = localFilters.categories.includes(
                  category.categoria_id
                );
                return (
                  <Button
                    key={category.categoria_id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(category.categoria_id)}
                  >
                    {category.nombre}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Stock disponible */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="stock">Solo con stock disponible</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar solo productos disponibles
              </p>
            </div>
            <Switch
              id="stock"
              checked={localFilters.inStock}
              onCheckedChange={(checked) =>
                setLocalFilters((prev) => ({ ...prev, inStock: checked }))
              }
            />
          </div>

          <Separator />

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClearFilters}
            >
              Limpiar
            </Button>
            <Button className="flex-1" onClick={handleApplyFilters}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface ActiveFiltersProps {
  filters: ProductFilters;
  categories: CategoryDto[];
  onRemoveFilter: (type: "search" | "category" | "inStock", value?: number) => void;
}

export function ActiveFilters({
  filters,
  categories,
  onRemoveFilter,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.search || filters.categories.length > 0 || filters.inStock;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {filters.search && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Búsqueda: {filters.search}
          <button
            onClick={() => onRemoveFilter("search")}
            className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {filters.categories.map((categoryId) => {
        const category = categories.find((c) => c.categoria_id === categoryId);
        if (!category) return null;
        return (
          <span
            key={categoryId}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
          >
            {category.nombre}
            <button
              onClick={() => onRemoveFilter("category", categoryId)}
              className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}

      {filters.inStock && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Con stock
          <button
            onClick={() => onRemoveFilter("inStock")}
            className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
    </div>
  );
}
