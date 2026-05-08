import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUS_LABELS = {
  pending_review: {
    label: "Pendiente",
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

export default async function PedidosAdminPage({ searchParams }) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const filter = resolvedParams?.status ?? "all";

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, status, total, delivery_type, created_at, customer_snapshot, items",
    )
    .order("created_at", { ascending: false });

  if (filter !== "all") {
    query = query.eq("status", filter);
  }

  const { data: orders } = await query.limit(50);

  const filters = [
    { value: "all", label: "Todos" },
    { value: "pending_review", label: "Pendientes" },
    { value: "validated", label: "Validados" },
    { value: "confirmed", label: "Confirmados" },
    { value: "in_preparation", label: "En preparacion" },
    { value: "ready", label: "Listos" },
    { value: "delivered", label: "Entregados" },
    { value: "cancelled", label: "Cancelados" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-gray-500 mt-1">Gestion de pedidos de clientes</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === "all"
                ? "/admin/pedidos"
                : "/admin/pedidos?status=" + f.value
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-black text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Lista */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {!orders || orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">📋</p>
            <p className="font-medium">No hay pedidos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status];
              const orderNumber =
                "#" + String(order.order_number).padStart(5, "0");
              const customerName = order.customer_snapshot?.name ?? "Cliente";
              const itemCount = order.items?.length ?? 0;
              const deliveryLabel =
                order.delivery_type === "pickup" ? "Retiro" : "Delivery";

              return (
                <Link
                  key={order.id}
                  href={"/admin/pedidos/" + order.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{orderNumber}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{customerName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {itemCount} {itemCount === 1 ? "producto" : "productos"} -{" "}
                      {deliveryLabel}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold">{formatPrice(order.total)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {timeAgo(order.created_at)}
                    </p>
                  </div>
                  <div className="text-gray-300 shrink-0">→</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
