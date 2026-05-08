"use client";

import Link from "next/link";
import { useCartContext } from "@/components/store/CartProvider";
import { ShoppingCart, Search, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { itemCount } = useCartContext();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push("/buscar?q=" + encodeURIComponent(search.trim()));
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#F97316" }}
            >
              <span className="text-white font-black text-sm">H</span>
            </div>
            <div className="hidden sm:block">
              <p
                className="font-black text-base leading-none"
                style={{ color: "#1C1917" }}
              >
                Horizonte
              </p>
              <p className="text-xs leading-none" style={{ color: "#78716C" }}>
                Supermercados
              </p>
            </div>
          </Link>

          {/* Buscador */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#78716C" }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busca productos, marcas..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: "#E7E5E4",
                  "--tw-ring-color": "#F97316",
                }}
              />
            </div>
          </form>

          {/* Acciones */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/mi-cuenta"
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl hover:bg-orange-50 transition-colors"
              style={{ color: "#78716C" }}
            >
              <User size={18} />
              <span className="hidden sm:inline font-medium">Mi cuenta</span>
            </Link>

            <Link
              href="/carrito"
              className="relative flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-colors text-white"
              style={{ backgroundColor: "#F97316" }}
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Carrito</span>
              {itemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  style={{ backgroundColor: "#EA580C" }}
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
