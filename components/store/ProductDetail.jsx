"use client";

import { useState } from "react";
import { useCartContext } from "@/components/store/CartProvider";
import Link from "next/link";

function formatPrice(price) {
  return "$" + Number(price).toLocaleString("es-AR");
}

export default function ProductDetail({ product }) {
  const { addItem } = useCartContext();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const image = product.images?.[0] ?? null;
  const hasDiscount =
    product.compare_price && product.compare_price > product.price;
  const discount = hasDiscount
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 text-sm mb-6"
        style={{ color: "#78716C" }}
      >
        <Link href="/" className="hover:underline">
          Inicio
        </Link>
        <span>→</span>
        {product.categories && (
          <>
            <Link
              href={"/categoria/" + product.categories.slug}
              className="hover:underline"
            >
              {product.categories.name}
            </Link>
            <span>→</span>
          </>
        )}
        <span style={{ color: "#1C1917" }} className="truncate">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Imagen */}
        <div
          className="aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: "#FFF7ED" }}
        >
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-8xl">🛒</span>
          )}
          {discount && (
            <span
              className="absolute top-4 left-4 text-white text-sm font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: "#F97316" }}
            >
              -{discount}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          {product.brand && (
            <p
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: "#F97316" }}
            >
              {product.brand}
            </p>
          )}

          <h1 className="text-2xl font-black" style={{ color: "#1C1917" }}>
            {product.name}
          </h1>

          {product.description && (
            <p className="text-sm leading-relaxed" style={{ color: "#78716C" }}>
              {product.description}
            </p>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black" style={{ color: "#1C1917" }}>
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span
                className="text-lg line-through"
                style={{ color: "#78716C" }}
              >
                {formatPrice(product.compare_price)}
              </span>
            )}
            <span className="text-sm" style={{ color: "#78716C" }}>
              / {product.unit}
            </span>
          </div>

          {/* Cantidad */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: "#1C1917" }}>
              Cantidad:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold transition-colors hover:bg-orange-50"
                style={{ borderColor: "#E7E5E4", color: "#1C1917" }}
              >
                -
              </button>
              <span
                className="w-10 text-center font-black"
                style={{ color: "#1C1917" }}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold transition-colors hover:bg-orange-50"
                style={{ borderColor: "#E7E5E4", color: "#1C1917" }}
              >
                +
              </button>
            </div>
          </div>

          {/* Botones */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleAdd}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-colors"
              style={{ backgroundColor: added ? "#16a34a" : "#F97316" }}
            >
              {added ? "Agregado al carrito" : "Agregar al carrito"}
            </button>

            <Link
              href="/carrito"
              className="w-full py-3.5 rounded-xl font-bold border text-center block transition-colors hover:bg-orange-50"
              style={{ borderColor: "#F97316", color: "#F97316" }}
            >
              Ver carrito
            </Link>
          </div>

          {/* Info adicional */}
          <div
            className="border-t pt-4 space-y-1 text-sm"
            style={{ borderColor: "#E7E5E4", color: "#78716C" }}
          >
            {product.sku && <p>SKU: {product.sku}</p>}
            {product.barcode && <p>Codigo de barras: {product.barcode}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
