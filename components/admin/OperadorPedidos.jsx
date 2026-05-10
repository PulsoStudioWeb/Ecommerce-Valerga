"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

function formatPrice(price) {
  return "$" + Number(price).toLocaleString("es-AR");
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return "Hace " + minutes + "min";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return "Hace " + hours + "h";
  return "Hace " + Math.floor(hours / 24) + "d";
}

const STATUS_CONFIG = {
  pending_review: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
    border: "border-yellow-300",
    next: "validated",
    nextLabel: "Validar pedido",
    nextColor: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  validated: {
    label: "Validado",
    color: "bg-blue-100 text-blue-800",
    border: "border-blue-300",
    next: "confirmed",
    nextLabel: "Confirmar pago",
    nextColor: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  confirmed: {
    label: "Confirmado",
    color: "bg-green-100 text-green-800",
    border: "border-green-300",
    next: "in_preparation",
    nextLabel: "Iniciar preparacion",
    nextColor: "bg-green-500 hover:bg-green-600 text-white",
  },
  in_preparation: {
    label: "En preparacion",
    color: "bg-purple-100 text-purple-800",
    border: "border-purple-300",
    next: "ready",
    nextLabel: "Listo para entregar",
    nextColor: "bg-purple-500 hover:bg-purple-600 text-white",
  },
  ready: {
    label: "Listo",
    color: "bg-teal-100 text-teal-800",
    border: "border-teal-300",
    next: "delivered",
    nextLabel: "Marcar entregado",
    nextColor: "bg-teal-500 hover:bg-teal-600 text-white",
  },
};

const STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "pending_review", label: "Pendientes" },
  { value: "validated", label: "Validados" },
  { value: "confirmed", label: "Confirmados" },
  { value: "in_preparation", label: "En preparacion" },
  { value: "ready", label: "Listos" },
];

function OrderCard({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const config = STATUS_CONFIG[order.status];
  const orderNumber = "#" + String(order.order_number).padStart(5, "0");

  async function handleNext() {
    setLoading(true);
    await onStatusChange(order.id, config.next);
    setLoading(false);
  }

  async function handleCancel() {
    if (!confirm("Cancelar este pedido?")) return;
    setLoading(true);
    await onStatusChange(order.id, "cancelled");
    setLoading(false);
  }

  return (
    <div
      className={`bg-white rounded-xl border-2 ${config.border} overflow-hidden`}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{orderNumber}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}
            >
              {config.label}
            </span>
            {order.delivery_type === "delivery" && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                Delivery
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold">{formatPrice(order.total)}</p>
            <p className="text-xs text-gray-400">{timeAgo(order.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {order.customer_snapshot?.name}
            </p>
            <p className="text-xs text-gray-400">
              {order.items?.length ?? 0} productos -
              {order.payment_method === "cash"
                ? " Efectivo"
                : order.payment_method === "transfer"
                  ? " Transferencia"
                  : " Tarjeta"}
            </p>
          </div>
          <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          <div className="space-y-1">
            {order.items?.map((item, i) => {
              const qty =
                item.adjusted_qty !== null && item.adjusted_qty !== undefined
                  ? item.adjusted_qty
                  : item.qty;
              return (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {qty}x {item.name}
                  </span>
                  <span className="text-gray-500">
                    {formatPrice(item.unit_price * qty)}
                  </span>
                </div>
              );
            })}
          </div>

          {order.delivery_type === "delivery" &&
            order.delivery_address?.street && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-700 mb-0.5">
                  Direccion de entrega
                </p>
                <p className="text-gray-600">{order.delivery_address.street}</p>
              </div>
            )}

          {order.customer_notes && (
            <div className="bg-yellow-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-yellow-800 mb-0.5">
                Nota del cliente
              </p>
              <p className="text-yellow-700">{order.customer_notes}</p>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>{order.customer_snapshot?.email}</p>
            {order.customer_snapshot?.phone && (
              <p>{order.customer_snapshot.phone}</p>
            )}
          </div>
        </div>
      )}

      <div className="px-4 pb-4 flex gap-2">
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${config.nextColor}`}
        >
          {loading ? "..." : config.nextLabel}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="px-3 py-2.5 rounded-lg text-sm font-medium border border-red-300 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function OperadorPedidos({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(null);

  const refreshOrders = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, total, delivery_type, created_at, customer_snapshot, items, customer_notes, delivery_address, payment_method",
      )
      .in("status", [
        "pending_review",
        "validated",
        "confirmed",
        "in_preparation",
        "ready",
      ])
      .order("created_at", { ascending: true });

    if (data) {
      setOrders(data);
      setLastUpdate(new Date());
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshOrders, 30000);
    return () => clearInterval(interval);
  }, [refreshOrders]);

  async function handleStatusChange(orderId, newStatus) {
    const supabase = createClient();
    await supabase
      .from("orders")
      .update({ status: newStatus, reviewed_at: new Date().toISOString() })
      .eq("id", orderId);
    await refreshOrders();
  }

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const pendingCount = orders.filter(
    (o) => o.status === "pending_review",
  ).length;

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Pedidos activos</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {lastUpdate
              ? "Actualizado " +
                lastUpdate.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Cargando..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {pendingCount} nuevo{pendingCount > 1 ? "s" : ""}
            </span>
          )}
          <button
            type="button"
            onClick={refreshOrders}
            className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              filter === f.value
                ? "bg-black text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-medium">No hay pedidos en este estado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
