"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { getCategoryByIdApi, type CategoryDto } from "@/lib/api";

export default function EditCategoryPage() {
  const { id } = useParams();
  const [cat, setCat] = useState<CategoryDto | null>(null);

  useEffect(() => {
    getCategoryByIdApi(Number(id)).then(setCat);
  }, [id]);

  if (!cat) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Categoría</h1>
      <CategoryForm
        initialData={{
          id: cat.categoria_id,
          nombre: cat.nombre,
          descripcion: cat.descripcion ?? undefined,
        }}
        isEditing
      />
    </div>
  );
}