"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

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

export default function PedidoDetallePage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("nuevo") === "true";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();
      setOrder(data);
      setLoading(false);
    }
    if (id) fetchOrder();
  }, [id]);

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

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-2xl font-black mb-2" style={{ color: "#1C1917" }}>
          Pedido no encontrado
        </p>
        <Link
          href="/mi-cuenta/pedidos"
          className="text-sm hover:underline"
          style={{ color: "#F97316" }}
        >
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const status = STATUS_LABELS[order.status];
  const orderNumber = "#" + String(order.order_number).padStart(5, "0");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      {isNew && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <p className="text-3xl mb-2">✅</p>
          <h1 className="text-xl font-black text-green-800 mb-1">
            Pedido recibido
          </h1>
          <p className="text-green-700 text-sm">
            Un operador va a revisar tu pedido y te va a contactar para
            coordinar el pago y la entrega.
          </p>
        </div>
      )}

      <div
        className="bg-white border rounded-xl p-5"
        style={{ borderColor: "#E7E5E4" }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black" style={{ color: "#1C1917" }}>
            {orderNumber}
          </h2>
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium ${status.color}`}
          >
            {status.label}
          </span>
        </div>
        <p className="text-sm" style={{ color: "#78716C" }}>
          {new Date(order.created_at).toLocaleDateString("es-AR")}
        </p>
      </div>

      <div
        className="bg-white border rounded-xl p-5"
        style={{ borderColor: "#E7E5E4" }}
      >
        <h3 className="font-bold mb-3" style={{ color: "#1C1917" }}>
          Productos
        </h3>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <div>
                <p className="font-medium" style={{ color: "#1C1917" }}>
                  {item.name}
                </p>
                <p style={{ color: "#78716C" }}>
                  {item.qty} x {formatPrice(item.unit_price)}
                </p>
              </div>
              <p className="font-bold" style={{ color: "#1C1917" }}>
                {formatPrice(item.subtotal)}
              </p>
            </div>
          ))}
        </div>
        <div
          className="border-t pt-3 mt-3 flex justify-between font-black"
          style={{ borderColor: "#E7E5E4" }}
        >
          <span style={{ color: "#1C1917" }}>Total estimado</span>
          <span style={{ color: "#F97316" }}>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div
        className="bg-white border rounded-xl p-5"
        style={{ borderColor: "#E7E5E4" }}
      >
        <h3 className="font-bold mb-3" style={{ color: "#1C1917" }}>
          Entrega y pago
        </h3>
        <div className="space-y-1 text-sm" style={{ color: "#78716C" }}>
          <p>
            <span className="font-medium" style={{ color: "#1C1917" }}>
              Tipo:
            </span>{" "}
            {order.delivery_type === "pickup" ? "Retiro en local" : "Delivery"}
          </p>
          {order.delivery_address?.street && (
            <p>
              <span className="font-medium" style={{ color: "#1C1917" }}>
                Direccion:
              </span>{" "}
              {order.delivery_address.street}
            </p>
          )}
          <p>
            <span className="font-medium" style={{ color: "#1C1917" }}>
              Pago:
            </span>{" "}
            {order.payment_method === "cash"
              ? "Efectivo"
              : order.payment_method === "transfer"
                ? "Transferencia"
                : "Tarjeta"}
          </p>
        </div>
      </div>

      {order.customer_notes && (
        <div
          className="bg-white border rounded-xl p-5"
          style={{ borderColor: "#E7E5E4" }}
        >
          <h3 className="font-bold mb-2" style={{ color: "#1C1917" }}>
            Notas
          </h3>
          <p className="text-sm" style={{ color: "#78716C" }}>
            {order.customer_notes}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/mi-cuenta/pedidos"
          className="flex-1 text-center border py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          style={{ borderColor: "#E7E5E4", color: "#1C1917" }}
        >
          Mis pedidos
        </Link>
        <Link
          href="/"
          className="flex-1 text-center py-3 rounded-xl text-sm font-bold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "#F97316" }}
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
