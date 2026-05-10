import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderStatusUpdate } from "@/lib/email/resend";

export async function POST(request) {
  try {
    const { order_id, new_status } = await request.json();
    const supabase = await createClient();

    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 },
      );
    }

    await sendOrderStatusUpdate({
      order,
      customerEmail: order.customer_snapshot.email,
      customerName: order.customer_snapshot.name,
      newStatus: new_status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
