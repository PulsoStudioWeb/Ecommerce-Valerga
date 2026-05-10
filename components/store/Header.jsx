"use client";

import Link from "next/link";
import { useCartContext } from "@/components/store/CartProvider";
import { ShoppingCart, Search, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { itemCount } = useCartContext();
  const [search, setSearch] = useState("");
  const router = useRouter();

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push("/buscar?q=" + encodeURIComponent(search.trim()));
  }

  return (
    <header
      className="bg-white border-b sticky top-0 z-50"
      style={{ borderColor: "#E7E5E4" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center">
            <div className="flex items-baseline gap-0.5">
              <span
                className="font-black text-2xl tracking-tight leading-none"
                style={{ color: "#F97316" }}
              >
                horizonte
              </span>
              <span
                className="hidden sm:inline text-xs font-semibold ml-1.5 px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "#FFF7ED", color: "#EA580C" }}
              >
                super
              </span>
            </div>
          </Link>

          {/* Buscador */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "#78716C" }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busca productos, marcas..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border-2 focus:outline-none transition-colors"
                style={{ borderColor: "#E7E5E4", backgroundColor: "#F9F8F7" }}
                onFocus={(e) => (e.target.style.borderColor = "#F97316")}
                onBlur={(e) => (e.target.style.borderColor = "#E7E5E4")}
              />
            </div>
          </form>

          {/* Acciones */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/mi-cuenta"
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-colors hover:bg-gray-100"
              style={{ color: "#78716C" }}
            >
              <User size={18} />
              <span className="hidden md:inline font-medium">Mi cuenta</span>
            </Link>

            <Link
              href="/carrito"
              className="relative flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "#F97316" }}
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Carrito</span>
              {itemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-black"
                  style={{ backgroundColor: "#1C1917" }}
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
