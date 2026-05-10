import { createClient } from "@/lib/supabase/server";
import { ShoppingBag, Clock, CheckCircle, XCircle } from "lucide-react";

async function getStats(supabase) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: pendingCount },
    { count: todayCount },
    { count: confirmedCount },
    { count: cancelledCount },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_review"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString()),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["confirmed", "in_preparation", "ready", "delivered"])
      .gte("created_at", today.toISOString()),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled")
      .gte("created_at", today.toISOString()),
  ]);

  return { pendingCount, todayCount, confirmedCount, cancelledCount };
}

async function getRecentOrders(supabase) {
  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, total, delivery_type, created_at, customer_snapshot",
    )
    .order("created_at", { ascending: false })
    .limit(5);

  return data ?? [];
}

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

function formatCurrency(amount) {
  return "$" + Number(amount).toLocaleString("es-AR");
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

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [stats, recentOrders] = await Promise.all([
    getStats(supabase),
    getRecentOrders(supabase),
  ]);

  const statCards = [
    {
      label: "Pendientes de revision",
      value: stats.pendingCount ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Pedidos hoy",
      value: stats.todayCount ?? 0,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Confirmados hoy",
      value: stats.confirmedCount ?? 0,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Cancelados hoy",
      value: stats.cancelledCount ?? 0,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen del dia</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div
              className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}
            >
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold">Ultimos pedidos</h2>
          <a
            href="/admin/pedidos"
            className="text-sm text-gray-500 hover:text-black"
          >
            Ver todos
          </a>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No hay pedidos todavia.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => {
              const status = STATUS_LABELS[order.status];
              const deliveryLabel =
                order.delivery_type === "pickup" ? "Retiro" : "Delivery";
              const customerName = order.customer_snapshot?.name ?? "Cliente";
              const orderNumber =
                "#" + String(order.order_number).padStart(5, "0");

              return (
                <a
                  key={order.id}
                  href={`/admin/pedidos/${order.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{orderNumber}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {customerName} - {deliveryLabel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-gray-400">
                      {timeAgo(order.created_at)}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
