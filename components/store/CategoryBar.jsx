"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CategoryBar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug, icon")
        .eq("is_active", true)
        .is("parent_id", null)
        .order("display_order")
        .limit(20);
      setCategories(data ?? []);
    }
    fetchCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div
      className="bg-white border-b sticky top-16 z-40"
      style={{ borderColor: "#E7E5E4" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="flex items-center gap-1 overflow-x-auto py-2"
          style={{ scrollbarWidth: "none" }}
        >
          <Link
            href="/buscar"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0"
            style={{
              backgroundColor:
                pathname === "/buscar" ? "#F97316" : "transparent",
              color: pathname === "/buscar" ? "#ffffff" : "#78716C",
            }}
          >
            Todos
          </Link>

          {categories.map((cat) => {
            const isActive = pathname === "/" + cat.slug;
            return (
              <Link
                key={cat.id}
                href={"/categoria/" + cat.slug}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0"
                style={{
                  backgroundColor: isActive ? "#F97316" : "transparent",
                  color: isActive ? "#ffffff" : "#78716C",
                }}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
