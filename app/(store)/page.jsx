import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";

async function getFeaturedProducts(supabase) {
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_price, images, brand, unit")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(8);
  return data ?? [];
}

async function getCategories(supabase) {
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, icon")
    .eq("is_active", true)
    .is("parent_id", null)
    .order("display_order")
    .limit(12);
  return data ?? [];
}

export default async function HomePage() {
  const supabase = await createClient();
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(supabase),
    getCategories(supabase),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* Banner principal */}
      <div
        className="rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
        style={{ backgroundColor: "#F97316" }}
      >
        <div className="relative z-10">
          <p className="text-orange-100 text-sm font-medium mb-2">
            Bienvenido a Horizonte
          </p>
          <h1 className="text-white text-3xl md:text-4xl font-black mb-3 leading-tight">
            Tu super, ahora online
          </h1>
          <p className="text-orange-100 mb-6 max-w-md">
            Hace tu pedido desde casa y retiralo en el local o recibilo en tu
            domicilio.
          </p>
          <Link
            href="/buscar"
            className="inline-block bg-white font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors"
            style={{ color: "#F97316" }}
          >
            Ver todos los productos
          </Link>
        </div>
        <div className="text-8xl md:text-9xl relative z-10 hidden md:block">
          🛒
        </div>
        {/* Decoracion de fondo */}
        <div
          className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-20"
          style={{
            backgroundColor: "#EA580C",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute right-32 bottom-0 w-40 h-40 rounded-full opacity-20"
          style={{ backgroundColor: "#EA580C", transform: "translateY(40%)" }}
        />
      </div>

      {/* Banner secundario — propuesta de valor */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: "🚚",
            title: "Delivery a domicilio",
            desc: "Dentro de la ciudad",
          },
          { icon: "🏪", title: "Retiro en local", desc: "Sin costo adicional" },
          {
            icon: "✅",
            title: "Pedido validado",
            desc: "Un operador confirma tu stock",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-4 bg-white rounded-xl p-4 border"
            style={{ borderColor: "#E7E5E4" }}
          >
            <span className="text-3xl">{item.icon}</span>
            <div>
              <p className="font-bold text-sm" style={{ color: "#1C1917" }}>
                {item.title}
              </p>
              <p className="text-xs" style={{ color: "#78716C" }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Categorias */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-xl font-black mb-4" style={{ color: "#1C1917" }}>
            Categorias
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={"/categoria/" + cat.slug}
                className="bg-white border rounded-xl p-3 text-center hover:shadow-md transition-all group"
                style={{ borderColor: "#E7E5E4" }}
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: "#FFF7ED" }}
                >
                  {cat.icon ?? "🏪"}
                </div>
                <p
                  className="text-xs font-medium leading-tight"
                  style={{ color: "#1C1917" }}
                >
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Productos destacados */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black" style={{ color: "#1C1917" }}>
              Ofertas y destacados
            </h2>
            <Link
              href="/buscar"
              className="text-sm font-medium hover:underline"
              style={{ color: "#F97316" }}
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
    </div>
  );
}
