import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import BannerSlider from "@/components/store/BannerSlider";

async function getOffers(supabase) {
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_price, images, brand, unit")
    .eq("is_active", true)
    .not("compare_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(8);
  return data ?? [];
}

async function getFeatured(supabase) {
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_price, images, brand, unit")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("name")
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
  const [offers, featured, categories] = await Promise.all([
    getOffers(supabase),
    getFeatured(supabase),
    getCategories(supabase),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
      {/* Banner rotativo */}
      <BannerSlider />

      {/* Propuesta de valor */}
      {/* Franja de servicios */}
      <div
        className="rounded-xl px-6 py-3 flex flex-wrap items-center justify-center gap-6 text-sm font-medium"
        style={{ backgroundColor: "#1C1917", color: "white" }}
      >
        <span>🚚 Delivery a domicilio</span>
        <span style={{ color: "#78716C" }}>|</span>
        <span>🏪 Retiro sin costo</span>
        <span style={{ color: "#78716C" }}>|</span>
        <span>✅ Stock confirmado por operador</span>
      </div>

      {/* Ofertas de la semana */}
      {offers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black" style={{ color: "#1C1917" }}>
                Ofertas de la semana
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "#78716C" }}>
                Precios especiales por tiempo limitado
              </p>
            </div>
            <Link
              href="/buscar"
              className="text-sm font-bold hover:underline hidden sm:block"
              style={{ color: "#F97316" }}
            >
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {offers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Categorias */}
      {categories.length > 0 && (
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-black" style={{ color: "#1C1917" }}>
              Compra por categoria
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "#78716C" }}>
              Encontra lo que buscas rapido
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {categories.map((cat, index) => {
              const palettes = [
                { bg: "#FEE2E2", text: "#DC2626" },
                { bg: "#FEF3C7", text: "#D97706" },
                { bg: "#D1FAE5", text: "#059669" },
                { bg: "#DBEAFE", text: "#2563EB" },
                { bg: "#EDE9FE", text: "#7C3AED" },
                { bg: "#FCE7F3", text: "#DB2777" },
                { bg: "#FFF7ED", text: "#EA580C" },
                { bg: "#F0FDF4", text: "#16A34A" },
                { bg: "#E0F2FE", text: "#0284C7" },
                { bg: "#F5F3FF", text: "#6D28D9" },
                { bg: "#ECFDF5", text: "#047857" },
                { bg: "#FEF9C3", text: "#CA8A04" },
              ];
              const palette = palettes[index % palettes.length];

              return (
                <Link
                  key={cat.id}
                  href={"/categoria/" + cat.slug}
                  className="border rounded-2xl p-4 text-center hover:shadow-md transition-all group"
                  style={{
                    borderColor: palette.bg,
                    backgroundColor: palette.bg,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform bg-white"
                    style={{ color: palette.text }}
                  >
                    {cat.name[0].toUpperCase()}
                  </div>
                  <p
                    className="text-xs font-bold leading-tight"
                    style={{ color: palette.text }}
                  >
                    {cat.name}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Lo mas vendido */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black" style={{ color: "#1C1917" }}>
                Lo mas vendido
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "#78716C" }}>
                Los favoritos de nuestros clientes
              </p>
            </div>
            <Link
              href="/buscar"
              className="text-sm font-bold hover:underline hidden sm:block"
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

      {/* Banner delivery */}
      <div
        className="rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{ backgroundColor: "#1C1917" }}
      >
        <div>
          <p className="text-orange-400 text-sm font-bold mb-1">
            Delivery disponible
          </p>
          <h3 className="text-white text-2xl font-black mb-2">
            Te llevamos el super a tu puerta
          </h3>
          <p className="text-gray-400 text-sm">
            Zona de cobertura dentro de la ciudad. Coordina el horario con el
            operador.
          </p>
        </div>
        <Link
          href="/buscar"
          className="shrink-0 font-bold px-6 py-3 rounded-xl transition-colors hover:opacity-90 whitespace-nowrap"
          style={{ backgroundColor: "#F97316", color: "#ffffff" }}
        >
          Hacer mi pedido
        </Link>
      </div>
    </div>
  );
}
