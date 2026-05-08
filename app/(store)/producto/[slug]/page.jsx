import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProductDetail from "@/components/store/ProductDetail";

export default async function ProductoPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) redirect("/");

  return <ProductDetail product={product} />;
}
