import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: cat } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!cat) redirect("/");

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_price, images, brand, unit")
    .eq("category_id", cat.id)
    .eq("is_active", true)
    .order("name")
    .limit(48);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div
        className="flex items-center gap-2 text-sm mb-6"
        style={{ color: "#78716C" }}
      >
        <Link href="/" className="hover:underline">
          Inicio
        </Link>
        <span>→</span>
        <span style={{ color: "#1C1917" }}>{cat.name}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: "#1C1917" }}>
          {cat.name}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
          {products?.length ?? 0}{" "}
          {products?.length === 1 ? "producto" : "productos"}
        </p>
      </div>

      {!products || products.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#78716C" }}>
          <p className="text-4xl mb-4">📦</p>
          <p className="font-medium">No hay productos en esta categoria</p>
          <Link
            href="/"
            className="text-sm mt-2 inline-block hover:underline"
            style={{ color: "#F97316" }}
          >
            Volver al inicio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
