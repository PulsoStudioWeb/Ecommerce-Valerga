import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";

async function getFeaturedProducts(supabase) {
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_price, images, brand, unit")
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(8);
  return data ?? [];
}

export default async function HomePage() {
  const supabase = await createClient();
  const featured = await getFeaturedProducts(supabase);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Banner */}
      <div className="bg-black rounded-2xl p-8 text-white flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">Supermercado Valerga</p>
          <h1 className="text-3xl font-bold mb-3">Hace tu pedido online</h1>
          <p className="text-gray-300 mb-6">
            Retiro en local o delivery en Mercedes
          </p>
          <Link
            href="/buscar"
            className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors inline-block"
          >
            Ver todos los productos
          </Link>
        </div>
        <div className="text-8xl hidden md:block">🛒</div>
      </div>

      {/* Productos destacados */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Productos destacados</h2>
            <Link
              href="/buscar"
              className="text-sm text-gray-500 hover:text-black"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {featured.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">🏪</p>
          <p className="text-lg font-medium">Estamos cargando el catalogo</p>
          <p className="text-sm mt-1">Volvé pronto</p>
        </div>
      )}
    </div>
  );
}
