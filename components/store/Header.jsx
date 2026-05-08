"use client";

import Link from "next/link";
import { useCartContext } from "@/components/store/CartProvider";
import { ShoppingCart, Search, User, Menu } from "lucide-react";
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl shrink-0">
            Valerga
          </Link>

          {/* Buscador */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </form>

          {/* Acciones */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/mi-cuenta"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-black px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <User size={18} />
              <span className="hidden sm:inline">Mi cuenta</span>
            </Link>

            <Link
              href="/carrito"
              className="relative flex items-center gap-1.5 text-sm font-medium bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Carrito</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
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
