import { AdminNav } from "@/components/admin/admin-nav";
import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <div className="container mx-auto py-8">
      <AdminNav />
      <h1 className="text-2xl font-bold mb-6">Nueva Categoría</h1>
      <CategoryForm /> 
    </div>
  );
}