"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
  ready: { label: "Listo", color: "bg-teal-100 text-teal-800" },
  delivered: { label: "Entregado", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  modified: { label: "Modificado", color: "bg-pink-100 text-pink-800" },
};

const NEXT_STATUSES = {
  pending_review: ["validated", "modified", "cancelled"],
  validated: ["pending_payment", "confirmed", "cancelled"],
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["in_preparation", "cancelled"],
  in_preparation: ["ready"],
  ready: ["delivered"],
  delivered: [],
  cancelled: [],
  modified: ["validated", "cancelled"],
};

const STATUS_BUTTON_LABELS = {
  validated: "Validar pedido",
  modified: "Guardar con modificaciones",
  cancelled: "Cancelar pedido",
  pending_payment: "Marcar pago pendiente",
  confirmed: "Confirmar pago recibido",
  in_preparation: "En preparacion",
  ready: "Listo para entregar",
  delivered: "Marcar como entregado",
};

export default function OrderReviewPanel({ order }) {
  const router = useRouter();
  const [items, setItems] = useState(order.items);
  const [operatorNotes, setOperatorNotes] = useState(
    order.operator_notes ?? "",
  );
  const [modificationNotes, setModificationNotes] = useState(
    order.modification_notes ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const status = STATUS_LABELS[order.status];
  const orderNumber = "#" + String(order.order_number).padStart(5, "0");
  const nextStatuses = NEXT_STATUSES[order.status] ?? [];

  function updateItemQty(index, newQty) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, adjusted_qty: newQty <= 0 ? 0 : newQty }
          : item,
      ),
    );
  }

  function removeItem(index) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, adjusted_qty: 0 } : item,
      ),
    );
  }

  function getEffectiveQty(item) {
    return item.adjusted_qty !== null && item.adjusted_qty !== undefined
      ? item.adjusted_qty
      : item.qty;
  }

  const totalAjustado = items.reduce(
    (acc, item) => acc + item.unit_price * getEffectiveQty(item),
    0,
  );

  const wasModified = items.some(
    (item) =>
      item.adjusted_qty !== null &&
      item.adjusted_qty !== undefined &&
      item.adjusted_qty !== item.qty,
  );

  async function handleStatusChange(newStatus) {
    setLoading(true);
    setError("");

    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("sesion:", session?.user?.email ?? "SIN SESION");

    if (!session) {
      setError("No hay sesion activa");
      setLoading(false);
      return;
    }

    const finalStatus =
      wasModified && newStatus === "validated" ? "modified" : newStatus;

    console.log("actualizando orden:", order.id, "nuevo status:", finalStatus);

    const { data, error: updateError } = await supabase
      .from("orders")
      .update({ status: finalStatus })
      .eq("id", order.id)
      .select();

    console.log("resultado:", { data, updateError });

    if (updateError) {
      setError("Error: " + updateError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/pedidos");
    router.refresh();
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{orderNumber}</h1>
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${status.color}`}
            >
              {status.label}
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            {new Date(order.created_at).toLocaleDateString("es-AR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <a
          href="/admin/pedidos"
          className="text-sm text-gray-500 hover:text-black"
        >
          Volver a pedidos
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Items del pedido */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold mb-4">
              Productos
              {order.status === "pending_review" && (
                <span className="text-xs text-gray-400 font-normal ml-2">
                  Ajusta cantidades si hay faltantes
                </span>
              )}
            </h2>
            <div className="space-y-3">
              {items.map((item, index) => {
                const effectiveQty = getEffectiveQty(item);
                const isRemoved = effectiveQty === 0;
                const isModified =
                  item.adjusted_qty !== null &&
                  item.adjusted_qty !== undefined &&
                  item.adjusted_qty !== item.qty;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${
                      isRemoved
                        ? "border-red-200 bg-red-50 opacity-60"
                        : isModified
                          ? "border-orange-200 bg-orange-50"
                          : "border-gray-100"
                    }`}
                  >
                    {/* Info del producto */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatPrice(item.unit_price)} x unidad
                      </p>
                      {isModified && !isRemoved && (
                        <p className="text-xs text-orange-600 font-medium">
                          Cantidad original: {item.qty}
                        </p>
                      )}
                      {isRemoved && (
                        <p className="text-xs text-red-600 font-medium">
                          Sin stock - eliminado
                        </p>
                      )}
                    </div>

                    {/* Controles */}
                    {order.status === "pending_review" ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateItemQty(index, effectiveQty - 1)}
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-bold">
                          {effectiveQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateItemQty(index, effectiveQty + 1)}
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg font-bold"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-medium shrink-0">
                        x{effectiveQty}
                      </span>
                    )}

                    {/* Subtotal */}
                    <div className="text-right shrink-0 w-20">
                      <p className="text-sm font-bold">
                        {formatPrice(item.unit_price * effectiveQty)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between font-bold">
              <span>Total{wasModified ? " ajustado" : ""}</span>
              <span>{formatPrice(totalAjustado)}</span>
            </div>
          </div>

          {/* Notas de modificacion */}
          {order.status === "pending_review" && wasModified && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <h3 className="font-semibold text-orange-800 mb-2">
                Nota para el cliente sobre modificaciones
              </h3>
              <textarea
                value={modificationNotes}
                onChange={(e) => setModificationNotes(e.target.value)}
                placeholder="Ej: No habia stock de Coca 500ml, se ajusto a 2 unidades de Coca 1.5L"
                rows={3}
                className="w-full border border-orange-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white resize-none"
              />
            </div>
          )}

          {/* Notas internas */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold mb-2">Notas internas del operador</h3>
            <textarea
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              placeholder="Notas internas — el cliente no las ve"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Datos del cliente */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold mb-3">Cliente</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-black">
                {order.customer_snapshot?.name}
              </p>
              <p>{order.customer_snapshot?.email}</p>
              {order.customer_snapshot?.phone && (
                <p>{order.customer_snapshot.phone}</p>
              )}
            </div>
          </div>

          {/* Entrega */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold mb-3">Entrega</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Tipo:</span>{" "}
                {order.delivery_type === "pickup"
                  ? "Retiro en local"
                  : "Delivery"}
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
                    : "Tarjeta"}
              </p>
            </div>
          </div>

          {/* Notas del cliente */}
          {order.customer_notes && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold mb-2">Notas del cliente</h3>
              <p className="text-sm text-gray-600">{order.customer_notes}</p>
            </div>
          )}

          {/* Acciones */}
          {nextStatuses.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
              <h3 className="font-semibold mb-3">Acciones</h3>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-2">
                  {error}
                </p>
              )}

              {nextStatuses.map((nextStatus) => (
                <button
                  key={nextStatus}
                  type="button"
                  onClick={() => handleStatusChange(nextStatus)}
                  disabled={loading}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    nextStatus === "cancelled"
                      ? "border border-red-300 text-red-600 hover:bg-red-50"
                      : nextStatus === "validated" || nextStatus === "confirmed"
                        ? "bg-black text-white hover:bg-gray-800"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {loading ? "Guardando..." : STATUS_BUTTON_LABELS[nextStatus]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
