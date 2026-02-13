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

export type SortOption = "default" | "price_asc" | "price_desc";

export interface ProductFilters {
  search: string;
  categories: number[];
  inStock: boolean;
  sortBy: SortOption;
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
      sortBy: "default",
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
    filters.categories.length +
    (filters.inStock ? 1 : 0) +
    (filters.sortBy !== "default" ? 1 : 0);

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

        <div className="mt-6 space-y-6 px-4">
          {/* Ordenar por precio */}
          <div className="space-y-3">
            <Label>Ordenar por precio</Label>
            <div className="flex flex-col gap-2">
              <Button
                variant={
                  localFilters.sortBy === "price_asc" ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  setLocalFilters((prev) => ({ ...prev, sortBy: "price_asc" }))
                }
                className="justify-start"
              >
                Precio: Más barato primero
              </Button>
              <Button
                variant={
                  localFilters.sortBy === "price_desc" ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  setLocalFilters((prev) => ({ ...prev, sortBy: "price_desc" }))
                }
                className="justify-start"
              >
                Precio: Más caro primero
              </Button>
            </div>
          </div>

          <Separator />

          {/* Categorías */}
          <div className="space-y-3">
            <Label>Categorías</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = localFilters.categories.includes(
                  category.categoria_id,
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

          {/* Separator */}

          {/* Stock disponible
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
          */}

          {/* Separator */}

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
  onRemoveFilter: (
    type: "search" | "category" | "inStock" | "sortBy",
    value?: number,
  ) => void;
}

export function ActiveFilters({
  filters,
  categories,
  onRemoveFilter,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.inStock ||
    filters.sortBy !== "default";

  if (!hasActiveFilters) return null;

  const sortLabels: Record<SortOption, string> = {
    default: "",
    price_asc: "Precio: Más barato",
    price_desc: "Precio: Más caro",
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {filters.sortBy !== "default" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {sortLabels[filters.sortBy]}
          <button
            onClick={() => onRemoveFilter("sortBy")}
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
