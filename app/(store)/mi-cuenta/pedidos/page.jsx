"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useCartContext } from "@/components/store/CartProvider";

function formatPrice(price) {
  return "$" + Number(price).toLocaleString("es-AR");
}

const STATUS_LABELS = {
  pending_review: {
    label: "Pendiente de revision",
    color: "bg-yellow-100 text-yellow-800",
  },
  validated: { label: "Validado", color: "bg-blue-100 text-blue-800" },
  pending_payment: {
    label: "Pago pendiente",
    color: "bg-orange-100 text-orange-800",
  },
  confirmed: { label: "Confirmado", color: "bg-green-100 text-green-800" },
  in_preparation: {
    label: "En preparacion",
    color: "bg-purple-100 text-purple-800",
  },
  ready: { label: "Listo para entregar", color: "bg-teal-100 text-teal-800" },
  delivered: { label: "Entregado", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  modified: { label: "Modificado", color: "bg-pink-100 text-pink-800" },
};

export default function MisPedidosPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { repeatOrder } = useCartContext();

  useEffect(() => {
    async function fetchOrders() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/auth/login?redirect=/mi-cuenta/pedidos";
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, total, items, delivery_type, created_at",
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setOrders(data ?? []);
      setLoading(false);
    }

    fetchOrders();
  }, []);

  function handleRepeatOrder(items) {
    repeatOrder(items);
    window.location.href = "/carrito";
  }

  if (loading) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 py-16 text-center"
        style={{ color: "#78716C" }}
      >
        Cargando...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/mi-cuenta"
          className="hover:underline"
          style={{ color: "#78716C" }}
        >
          Mi cuenta
        </Link>
        <span style={{ color: "#78716C" }}>→</span>
        <h1 className="text-xl font-black" style={{ color: "#1C1917" }}>
          Mis pedidos
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16" style={{ color: "#78716C" }}>
          <p className="text-4xl mb-4">📋</p>
          <p className="font-medium">Todavia no hiciste pedidos</p>
          <Link
            href="/"
            className="text-sm mt-2 inline-block hover:underline"
            style={{ color: "#F97316" }}
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status];
            const orderNumber =
              "#" + String(order.order_number).padStart(5, "0");
            const itemCount = order.items?.length ?? 0;
            const deliveryLabel =
              order.delivery_type === "pickup" ? "Retiro" : "Delivery";
            const date = new Date(order.created_at).toLocaleDateString("es-AR");

            return (
              <div
                key={order.id}
                className="bg-white border rounded-xl p-4"
                style={{ borderColor: "#E7E5E4" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black" style={{ color: "#1C1917" }}>
                      {orderNumber}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <span className="font-black" style={{ color: "#1C1917" }}>
                    {formatPrice(order.total)}
                  </span>
                </div>

                <p className="text-sm" style={{ color: "#78716C" }}>
                  {date} - {itemCount}{" "}
                  {itemCount === 1 ? "producto" : "productos"} - {deliveryLabel}
                </p>

                <div className="flex gap-2 mt-3">
                  <Link
                    href={"/mi-cuenta/pedidos/" + order.id}
                    className="flex-1 text-center border py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "#E7E5E4", color: "#1C1917" }}
                  >
                    Ver detalle
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRepeatOrder(order.items)}
                    className="flex-1 text-center py-2 rounded-lg text-sm font-bold text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: "#F97316" }}
                  >
                    Repetir pedido
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
