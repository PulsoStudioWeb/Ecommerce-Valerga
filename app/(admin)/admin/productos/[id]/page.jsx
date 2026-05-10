import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditarProductoPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) redirect("/admin/productos");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return <ProductForm product={product} categories={categories ?? []} />;
}
