import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmation } from "@/lib/email/resend";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert(body)
      .select("*, order_number")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enviar email de confirmacion
    // Enviar email — si falla no interrumpe el pedido
    try {
      console.log("Intentando enviar email a:", body.customer_snapshot.email);
      const emailResult = await sendOrderConfirmation({
        order,
        customerEmail: body.customer_snapshot.email,
        customerName: body.customer_snapshot.name,
      });
      console.log("Resultado email:", emailResult);
    } catch (emailError) {
      console.error("Error enviando email:", emailError.message);
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
