"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  currentCategory?: string;
}

export function CategoryFilter({
  categories,
  currentCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button asChild variant={!currentCategory ? "default" : "outline"}>
        <Link href="/productos">Todos</Link>
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          asChild
          variant={currentCategory === category.slug ? "default" : "outline"}
        >
          <Link href={`/productos?categoria=${category.slug}`}>
            {category.name}
          </Link>
        </Button>
      ))}
    </div>
  );
}
