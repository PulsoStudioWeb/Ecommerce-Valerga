import { createClient } from "@/lib/supabase/server";

export default async function ConfiguracionAdminPage() {
  const supabase = await createClient();

  const { data: config } = await supabase
    .from("store_config")
    .select("*")
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuracion</h1>
        <p className="text-gray-500 mt-1">Datos generales de la tienda</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Informacion de la tienda</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Nombre</p>
            <p className="font-medium">{config?.store_name ?? "Horizonte"}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Radio de delivery</p>
            <p className="font-medium">{config?.delivery_radius_km ?? 2} km</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Costo de delivery</p>
            <p className="font-medium">
              ${Number(config?.delivery_fee ?? 0).toLocaleString("es-AR")}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Pedido minimo</p>
            <p className="font-medium">
              ${Number(config?.min_order_amount ?? 0).toLocaleString("es-AR")}
            </p>
          </div>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            La edicion de configuracion estara disponible en la siguiente etapa
          </p>
        </div>
      </div>
    </div>
  );
}
