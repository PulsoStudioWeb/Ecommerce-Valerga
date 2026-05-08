import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/store/ProductCard";
import Link from "next/link";

export default async function BuscarPage({ searchParams }) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let products = [];

  if (q?.trim()) {
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, price, compare_price, images, brand, unit")
      .eq("is_active", true)
      .textSearch("search_vector", q.trim(), { config: "spanish" })
      .limit(48);
    products = data ?? [];
  } else {
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, price, compare_price, images, brand, unit")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(48);
    products = data ?? [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: "#1C1917" }}>
          {q ? 'Resultados para "' + q + '"' : "Todos los productos"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "#78716C" }}>
          {products.length} {products.length === 1 ? "producto" : "productos"}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#78716C" }}>
          <p className="text-4xl mb-4">🔍</p>
          <p className="font-medium">No encontramos productos</p>
          <p className="text-sm mt-1">Proba con otro termino</p>
          <Link
            href="/buscar"
            className="text-sm mt-3 inline-block hover:underline"
            style={{ color: "#F97316" }}
          >
            Ver todos los productos
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
