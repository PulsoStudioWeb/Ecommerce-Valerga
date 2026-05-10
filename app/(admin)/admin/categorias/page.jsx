import { createClient } from "@/lib/supabase/server";
import CategoriasManager from "@/components/admin/CategoriasManager";

export default async function CategoriasAdminPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, is_active, display_order, icon")
    .order("display_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categorias</h1>
        <p className="text-gray-500 mt-1">Gestion de categorias del catalogo</p>
      </div>
      <CategoriasManager initialCategories={categories ?? []} />
    </div>
  );
}
