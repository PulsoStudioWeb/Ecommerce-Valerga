"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useCartContext } from "@/components/store/CartProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

function formatPrice(price) {
  return "$" + Number(price).toLocaleString("es-AR");
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartContext();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    delivery_type: "pickup",
    address: "",
    payment_method: "cash",
    notes: "",
  });

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth/login?redirect=/checkout");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, email")
        .eq("id", session.user.id)
        .single();

      setUser({ ...session.user, ...profile });
      setLoading(false);
    }

    checkUser();
  }, [router]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (items.length === 0) {
      setError("Tu carrito esta vacio");
      return;
    }

    if (form.delivery_type === "delivery" && !form.address.trim()) {
      setError("Ingresa tu direccion de entrega");
      return;
    }

    setSubmitting(true);
    setError("");

    const orderItems = items.map((item) => ({
      product_id: item.id,
      sku: item.sku,
      name: item.name,
      brand: item.brand ?? null,
      unit: item.unit,
      unit_price: item.price,
      qty: item.qty,
      adjusted_qty: null,
      image_url: item.image_url ?? null,
      subtotal: item.price * item.qty,
    }));

    const response = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        customer_snapshot: {
          name: user.full_name ?? user.email,
          email: user.email,
          phone: user.phone ?? null,
        },
        items: orderItems,
        subtotal: subtotal,
        delivery_fee: 0,
        total: subtotal,
        status: "pending_review",
        delivery_type: form.delivery_type,
        delivery_address:
          form.delivery_type === "delivery" ? { street: form.address } : null,
        payment_method: form.payment_method,
        customer_notes: form.notes || null,
        placed_outside_hours: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError("Error al crear el pedido. Intenta de nuevo.");
      setSubmitting(false);
      return;
    }

    clearCart();
    router.replace("/mi-cuenta/pedidos/" + data.order.id + "?nuevo=true");
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">
        Cargando...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-2xl font-bold mb-2">Tu carrito esta vacio</h1>
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
      <h1 className="text-2xl font-bold mb-6">Confirmar pedido</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold mb-3">Tus datos</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Nombre:</span>{" "}
                {user.full_name ?? "Sin nombre"}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              {user.phone && (
                <p>
                  <span className="font-medium">Telefono:</span> {user.phone}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold mb-3">Tipo de entrega</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, delivery_type: "pickup" }))
                }
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  form.delivery_type === "pickup"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium text-sm">Retiro en local</p>
                <p
                  className={`text-xs mt-0.5 ${form.delivery_type === "pickup" ? "text-gray-300" : "text-gray-400"}`}
                >
                  Sin costo adicional
                </p>
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, delivery_type: "delivery" }))
                }
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  form.delivery_type === "delivery"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium text-sm">Delivery</p>
                <p
                  className={`text-xs mt-0.5 ${form.delivery_type === "delivery" ? "text-gray-300" : "text-gray-400"}`}
                >
                  Dentro de Mercedes
                </p>
              </button>
            </div>

            {form.delivery_type === "delivery" && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direccion de entrega
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Calle y numero"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold mb-3">Forma de pago</h2>
            <div className="space-y-2">
              {[
                { value: "cash", label: "Efectivo" },
                { value: "transfer", label: "Transferencia bancaria" },
                {
                  value: "card_on_delivery",
                  label: "Tarjeta al momento de la entrega",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={option.value}
                    checked={form.payment_method === option.value}
                    onChange={handleChange}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold mb-3">Notas adicionales</h2>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Instrucciones especiales, horario preferido, etc."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              {error}
            </p>
          )}
        </div>

        <div className="lg:w-72 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
            <h2 className="font-bold mb-4">Tu pedido</h2>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1 mr-2">
                    {item.qty}x {item.name}
                  </span>
                  <span className="font-medium shrink-0">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 mb-2">
              <div className="flex justify-between text-sm mb-1">
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
                Un operador validara tu pedido y te contactara
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Enviando pedido..." : "Enviar pedido"}
            </button>

            <Link
              href="/carrito"
              className="w-full text-center text-sm text-gray-500 hover:text-black mt-3 block"
            >
              Volver al carrito
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
