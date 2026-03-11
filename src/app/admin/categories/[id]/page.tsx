"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { getCategoryByIdApi } from "@/lib/api"; // Asumiendo que tienes esta función

export default function EditCategoryPage() {
  const { id } = useParams();
  const [cat, setCat] = useState(null);

  useEffect(() => {
    getCategoryByIdApi(Number(id)).then(setCat);
  }, [id]);

  if (!cat) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Categoría</h1>
      <CategoryForm initialData={cat} isEditing />
    </div>
  );
}