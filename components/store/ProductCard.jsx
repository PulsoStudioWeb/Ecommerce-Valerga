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
      <Link href={"/producto/" + product.slug} className="block">
        <div
          className="aspect-square flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: "#FFF7ED" }}
        >
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-5xl">🛒</span>
          )}
          {discount && (
            <span
              className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#F97316" }}
            >
              -{discount}%
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {product.brand && (
          <p
            className="text-xs font-medium mb-0.5"
            style={{ color: "#78716C" }}
          >
            {product.brand}
          </p>
        )}
        <Link href={"/producto/" + product.slug}>
          <p
            className="text-sm font-medium line-clamp-2 hover:underline mb-0.5"
            style={{ color: "#1C1917" }}
          >
            {product.name}
          </p>
        </Link>
        <p className="text-xs mb-2" style={{ color: "#78716C" }}>
          {product.unit}
        </p>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-black" style={{ color: "#1C1917" }}>
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span
                className="text-xs line-through"
                style={{ color: "#78716C" }}
              >
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="w-full py-2 rounded-lg text-sm font-bold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#F97316" }}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
