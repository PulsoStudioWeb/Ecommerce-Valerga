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
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">
        Cargando...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-2xl font-bold mb-2">Pedido no encontrado</p>
        <Link href="/" className="text-gray-500 hover:text-black text-sm">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const status = STATUS_LABELS[order.status];
  const orderNumber = "#" + String(order.order_number).padStart(5, "0");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Confirmacion nueva */}
      {isNew && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 text-center">
          <p className="text-3xl mb-2">✅</p>
          <h1 className="text-xl font-bold text-green-800 mb-1">
            Pedido recibido
          </h1>
          <p className="text-green-700 text-sm">
            Un operador va a revisar tu pedido y te va a contactar para
            coordinar el pago y la entrega.
          </p>
        </div>
      )}

      {/* Header del pedido */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">{orderNumber}</h2>
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium ${status.color}`}
          >
            {status.label}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {new Date(order.created_at).toLocaleDateString("es-AR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <h3 className="font-semibold mb-3">Productos</h3>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-gray-400">
                  {item.qty} x {formatPrice(item.unit_price)}
                </p>
              </div>
              <p className="font-medium">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="flex justify-between font-bold">
            <span>Total estimado</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Entrega */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <h3 className="font-semibold mb-3">Entrega y pago</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>
            <span className="font-medium">Tipo:</span>{" "}
            {order.delivery_type === "pickup" ? "Retiro en local" : "Delivery"}
          </p>
          {order.delivery_address?.street && (
            <p>
              <span className="font-medium">Direccion:</span>{" "}
              {order.delivery_address.street}
            </p>
          )}
          <p>
            <span className="font-medium">Pago:</span>{" "}
            {order.payment_method === "cash"
              ? "Efectivo"
              : order.payment_method === "transfer"
                ? "Transferencia"
                : "Tarjeta al momento"}
          </p>
        </div>
      </div>

      {order.customer_notes && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <h3 className="font-semibold mb-2">Notas</h3>
          <p className="text-sm text-gray-600">{order.customer_notes}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/mi-cuenta/pedidos"
          className="flex-1 text-center border border-gray-300 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Mis pedidos
        </Link>
        <Link
          href="/"
          className="flex-1 text-center bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
