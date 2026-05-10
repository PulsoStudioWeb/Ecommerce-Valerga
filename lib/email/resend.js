import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendOrderConfirmation({
  order,
  customerEmail,
  customerName,
}) {
  const orderNumber = "#" + String(order.order_number).padStart(5, "0");
  const deliveryLabel =
    order.delivery_type === "pickup"
      ? "Retiro en local"
      : "Delivery a domicilio";
  const paymentLabel =
    order.payment_method === "cash"
      ? "Efectivo"
      : order.payment_method === "transfer"
        ? "Transferencia bancaria"
        : "Tarjeta al momento";

  const itemsHtml = order.items
    .map((item) => {
      const qty = item.adjusted_qty ?? item.qty;
      return `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #f0f0f0; font-size:14px; color:#1C1917;">${item.name}</td>
        <td style="padding:8px 0; border-bottom:1px solid #f0f0f0; font-size:14px; color:#78716C; text-align:center;">${qty}</td>
        <td style="padding:8px 0; border-bottom:1px solid #f0f0f0; font-size:14px; color:#1C1917; text-align:right;">$${Number(item.unit_price * qty).toLocaleString("es-AR")}</td>
      </tr>
    `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background:#f9f8f7; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
      
      <div style="max-width:560px; margin:0 auto; padding:24px 16px;">
        
        <!-- Header -->
        <div style="background:#F97316; border-radius:16px 16px 0 0; padding:32px 32px 24px; text-align:center;">
          <p style="margin:0; color:rgba(255,255,255,0.8); font-size:12px; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px;">Horizonte Supermercados</p>
          <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:800;">Pedido recibido</h1>
          <p style="margin:12px 0 0; color:rgba(255,255,255,0.9); font-size:16px;">${orderNumber}</p>
        </div>

        <!-- Body -->
        <div style="background:#ffffff; padding:32px; border-radius:0 0 16px 16px; border:1px solid #E7E5E4; border-top:none;">
          
          <p style="margin:0 0 24px; color:#1C1917; font-size:16px; line-height:1.6;">
            Hola <strong>${customerName}</strong>, recibimos tu pedido correctamente.<br>
            Un operador va a revisar el stock y te va a contactar para coordinar el pago y la entrega.
          </p>

          <!-- Productos -->
          <div style="margin-bottom:24px;">
            <p style="margin:0 0 12px; font-size:13px; font-weight:700; color:#78716C; text-transform:uppercase; letter-spacing:1px;">Productos</p>
            <table style="width:100%; border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left; font-size:12px; color:#78716C; padding-bottom:8px; border-bottom:2px solid #E7E5E4;">Producto</th>
                  <th style="text-align:center; font-size:12px; color:#78716C; padding-bottom:8px; border-bottom:2px solid #E7E5E4;">Cant.</th>
                  <th style="text-align:right; font-size:12px; color:#78716C; padding-bottom:8px; border-bottom:2px solid #E7E5E4;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Total -->
          <div style="background:#FFF7ED; border-radius:12px; padding:16px 20px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:15px; font-weight:700; color:#1C1917;">Total estimado</span>
            <span style="font-size:20px; font-weight:800; color:#F97316;">$${Number(order.total).toLocaleString("es-AR")}</span>
          </div>

          <!-- Detalles -->
          <div style="margin-bottom:24px;">
            <p style="margin:0 0 12px; font-size:13px; font-weight:700; color:#78716C; text-transform:uppercase; letter-spacing:1px;">Detalles</p>
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0; font-size:14px; color:#78716C; width:40%;">Entrega</td>
                <td style="padding:8px 0; font-size:14px; color:#1C1917; font-weight:600;">${deliveryLabel}</td>
              </tr>
              ${
                order.delivery_address?.street
                  ? `
              <tr>
                <td style="padding:8px 0; font-size:14px; color:#78716C;">Direccion</td>
                <td style="padding:8px 0; font-size:14px; color:#1C1917; font-weight:600;">${order.delivery_address.street}</td>
              </tr>`
                  : ""
              }
              <tr>
                <td style="padding:8px 0; font-size:14px; color:#78716C;">Pago</td>
                <td style="padding:8px 0; font-size:14px; color:#1C1917; font-weight:600;">${paymentLabel}</td>
              </tr>
            </table>
          </div>

          ${
            order.customer_notes
              ? `
          <div style="background:#f9f8f7; border-radius:10px; padding:14px 16px; margin-bottom:24px;">
            <p style="margin:0 0 4px; font-size:12px; color:#78716C; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Tu nota</p>
            <p style="margin:0; font-size:14px; color:#1C1917;">${order.customer_notes}</p>
          </div>`
              : ""
          }

          <!-- Aviso -->
          <div style="background:#FFF7ED; border-left:3px solid #F97316; padding:14px 16px; border-radius:0 10px 10px 0; margin-bottom:24px;">
            <p style="margin:0; font-size:13px; color:#78716C; line-height:1.6;">
              <strong style="color:#1C1917;">Proximo paso:</strong> un operador va a validar la disponibilidad de tus productos y te va a contactar a este email o por telefono para confirmar el pedido.
            </p>
          </div>

          <p style="margin:0; font-size:13px; color:#78716C; text-align:center; line-height:1.6;">
            Horizonte Supermercados · Mercedes, Buenos Aires
          </p>

        </div>
      </div>

    </body>
    </html>
  `;

  const { data, error } = await getResend().emails.send({
    from: "Horizonte Supermercados <onboarding@resend.dev>",
    to: customerEmail,
    subject: `${orderNumber} - Pedido recibido`,
    html,
  });

  console.log("Resend response data:", JSON.stringify(data));
  console.log("Resend response error:", JSON.stringify(error));

  if (error) {
    console.error("Error enviando email:", error);
    return false;
  }

  return true;

  if (error) {
    console.error("Error enviando email:", error);
    return false;
  }

  return true;
}

export async function sendOrderStatusUpdate({
  order,
  customerEmail,
  customerName,
  newStatus,
}) {
  const orderNumber = "#" + String(order.order_number).padStart(5, "0");

  const statusMessages = {
    validated: {
      subject: `${orderNumber} - Tu pedido fue validado`,
      title: "Pedido validado",
      message:
        "Tu pedido fue revisado y el stock esta confirmado. Pronto te contactamos para coordinar el pago.",
      color: "#2563EB",
    },
    modified: {
      subject: `${orderNumber} - Tu pedido fue modificado`,
      title: "Pedido modificado",
      message:
        "Tuvimos que ajustar tu pedido por disponibilidad de stock. Revisa los cambios abajo.",
      color: "#D97706",
    },
    confirmed: {
      subject: `${orderNumber} - Pago confirmado`,
      title: "Pago recibido",
      message: "Recibimos tu pago. Tu pedido ya esta en preparacion.",
      color: "#059669",
    },
    in_preparation: {
      subject: `${orderNumber} - En preparacion`,
      title: "Preparando tu pedido",
      message: "Estamos armando tu pedido. En breve estara listo.",
      color: "#7C3AED",
    },
    ready: {
      subject: `${orderNumber} - Listo para entregar`,
      title:
        order.delivery_type === "pickup"
          ? "Listo para retirar"
          : "Listo para entrega",
      message:
        order.delivery_type === "pickup"
          ? "Tu pedido esta listo. Ya podes pasar a retirarlo por el local."
          : "Tu pedido esta listo y sale para tu domicilio.",
      color: "#0D9488",
    },
    delivered: {
      subject: `${orderNumber} - Entregado`,
      title: "Pedido entregado",
      message: "Tu pedido fue entregado. Gracias por comprar en Horizonte.",
      color: "#059669",
    },
    cancelled: {
      subject: `${orderNumber} - Pedido cancelado`,
      title: "Pedido cancelado",
      message: "Tu pedido fue cancelado. Si tenes dudas contactanos.",
      color: "#DC2626",
    },
  };

  const statusInfo = statusMessages[newStatus];
  if (!statusInfo) return false;

  const modificationHtml =
    order.was_modified && order.modification_notes
      ? `
    <div style="background:#FEF3C7; border-left:3px solid #D97706; padding:14px 16px; border-radius:0 10px 10px 0; margin-bottom:24px;">
      <p style="margin:0 0 4px; font-size:12px; color:#92400E; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Cambios en tu pedido</p>
      <p style="margin:0; font-size:14px; color:#78350F;">${order.modification_notes}</p>
    </div>
  `
      : "";

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background:#f9f8f7; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
      
      <div style="max-width:560px; margin:0 auto; padding:24px 16px;">
        
        <div style="background:${statusInfo.color}; border-radius:16px 16px 0 0; padding:32px 32px 24px; text-align:center;">
          <p style="margin:0; color:rgba(255,255,255,0.8); font-size:12px; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px;">Horizonte Supermercados</p>
          <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:800;">${statusInfo.title}</h1>
          <p style="margin:12px 0 0; color:rgba(255,255,255,0.9); font-size:16px;">${orderNumber}</p>
        </div>

        <div style="background:#ffffff; padding:32px; border-radius:0 0 16px 16px; border:1px solid #E7E5E4; border-top:none;">
          
          <p style="margin:0 0 24px; color:#1C1917; font-size:16px; line-height:1.6;">
            Hola <strong>${customerName}</strong>,<br>
            ${statusInfo.message}
          </p>

          ${modificationHtml}

          <p style="margin:0; font-size:13px; color:#78716C; text-align:center; line-height:1.6;">
            Horizonte Supermercados · Mercedes, Buenos Aires
          </p>

        </div>
      </div>

    </body>
    </html>
  `;

  const { data, error } = await getResend().emails.send({
    from: "Horizonte Supermercados <onboarding@resend.dev>",
    to: "contacto@pulsowebstudio.com.ar", // cambiá esto por el email con que te registraste
    subject: `${orderNumber} - Pedido recibido`,
    html,
  });

  if (error) {
    console.error("Error enviando email de estado:", error);
    return false;
  }

  return true;
}
