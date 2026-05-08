"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  ImageIcon,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingBag,
  },
  {
    label: "Productos",
    href: "/admin/productos",
    icon: Package,
    children: [
      { label: "Ver todos", href: "/admin/productos" },
      { label: "Nuevo producto", href: "/admin/productos/nuevo" },
      { label: "Importar CSV", href: "/admin/productos/importar" },
    ],
  },
  {
    label: "Categorias",
    href: "/admin/categorias",
    icon: Tag,
  },
  {
    label: "Banners",
    href: "/admin/banners",
    icon: ImageIcon,
  },
  {
    label: "Configuracion",
    href: "/admin/configuracion",
    icon: Settings,
  },
];

function NavItem({ item, pathname }) {
  const isActive =
    pathname === item.href ||
    (item.children && item.children.some((c) => pathname === c.href));

  return (
    <div>
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-black text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <item.icon size={18} />
        <span className="flex-1">{item.label}</span>
        {item.children && <ChevronRight size={14} />}
      </Link>

      {item.children && isActive && (
        <div className="ml-9 mt-1 space-y-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === child.href
                  ? "text-black font-medium"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSidebar({ profile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
          Panel Admin
        </p>
        <p className="font-bold text-lg">Valerga</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
            {profile.full_name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile.full_name ?? "Operador"}
            </p>
            <p className="text-xs text-gray-400 capitalize">{profile.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full"
        >
          <LogOut size={16} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
