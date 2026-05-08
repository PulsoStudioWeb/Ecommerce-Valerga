import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrderReviewPanel from "@/components/admin/OrderReviewPanel";

export default async function PedidoDetallePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) redirect("/admin/pedidos");

  return <OrderReviewPanel order={order} />;
}
