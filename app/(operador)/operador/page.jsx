import { createClient } from "@/lib/supabase/server";
import OperadorPedidos from "@/components/admin/OperadorPedidos";

export default async function OperadorPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
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

  return <OperadorPedidos initialOrders={orders ?? []} />;
}
