"use client";

import Link from "next/link";
import { useCartContext } from "@/components/store/CartProvider";

function formatPrice(price) {
  return "$" + Number(price).toLocaleString("es-AR");
}

export default function ProductCard({ product }) {
  const { addItem } = useCartContext();
  const image = product.images?.[0] ?? null;
  const hasDiscount =
    product.compare_price && product.compare_price > product.price;
  const discount = hasDiscount
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  return (
    <div
      className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col group"
      style={{ borderColor: "#E7E5E4" }}
    >
      {/* Imagen */}
      <Link href={"/producto/" + product.slug} className="block relative">
        <div className="aspect-square bg-white flex items-center justify-center overflow-hidden p-3">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center rounded-lg"
              style={{ backgroundColor: "#FFF7ED" }}
            >
              <span className="text-4xl">🛒</span>
            </div>
          )}
        </div>
        {discount && (
          <span
            className="absolute top-2 left-2 text-white text-xs font-black px-2 py-0.5 rounded-md"
            style={{ backgroundColor: "#F97316" }}
          >
            -{discount}%
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="px-3 pb-3 pt-1 flex flex-col flex-1">
        {product.brand && (
          <p className="text-xs truncate" style={{ color: "#78716C" }}>
            {product.brand}
          </p>
        )}
        <Link href={"/producto/" + product.slug}>
          <p
            className="text-sm font-medium line-clamp-2 leading-snug mb-2"
            style={{ color: "#1C1917" }}
          >
            {product.name}
          </p>
        </Link>

        <div className="mt-auto">
          {hasDiscount && (
            <p
              className="text-xs line-through leading-none mb-0.5"
              style={{ color: "#78716C" }}
            >
              {formatPrice(product.compare_price)}
            </p>
          )}
          <p
            className="text-lg font-black leading-none mb-2"
            style={{ color: "#1C1917" }}
          >
            {formatPrice(product.price)}
          </p>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="w-full py-2 rounded-lg text-sm font-bold text-white transition-colors hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#F97316" }}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
