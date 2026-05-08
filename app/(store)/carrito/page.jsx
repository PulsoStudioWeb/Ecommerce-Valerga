"use client";

import { useCartContext } from "@/components/store/CartProvider";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";

function formatPrice(price) {
  return "$" + Number(price).toLocaleString("es-AR");
}

export default function CarritoPage() {
  const { items, itemCount, subtotal, removeItem, updateQuantity } =
    useCartContext();

  if (itemCount === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold mb-2">Tu carrito esta vacio</h1>
        <p className="text-gray-500 mb-6">
          Agrega productos para comenzar tu pedido
        </p>
        <Link
          href="/"
          className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors inline-block"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Tu carrito ({itemCount} {itemCount === 1 ? "producto" : "productos"})
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de items */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
            >
              {/* Imagen */}
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-2xl">🛒</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {item.brand && (
                  <p className="text-xs text-gray-400">{item.brand}</p>
                )}
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-sm font-bold mt-0.5">
                  {formatPrice(item.price)}
                </p>
              </div>

              {/* Controles de cantidad */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.qty - 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.qty}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.qty + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Subtotal y eliminar */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold">
                  {formatPrice(item.price * item.qty)}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-600 mt-1 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
            <h2 className="font-bold mb-4">Resumen</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className="text-gray-400">A confirmar</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 mb-5">
              <div className="flex justify-between font-bold">
                <span>Total estimado</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                El total final se confirma con el operador
              </p>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors text-center block"
            >
              Confirmar pedido
            </Link>

            <Link
              href="/"
              className="w-full text-center text-sm text-gray-500 hover:text-black mt-3 block"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
