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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Imagen */}
      <Link href={"/producto/" + product.slug} className="block">
        <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl">🛒</span>
          )}
          {discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {product.brand && (
          <p className="text-xs text-gray-400 mb-0.5">{product.brand}</p>
        )}
        <Link href={"/producto/" + product.slug}>
          <p className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-black">
            {product.name}
          </p>
        </Link>
        <p className="text-xs text-gray-400 mb-2">{product.unit}</p>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
