import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function formatPrice(price) {
  return "$" + Number(price).toLocaleString("es-AR");
}

export default async function ProductosAdminPage({ searchParams }) {
  const supabase = await createClient();
  const { q, status, category } = await searchParams;

  let query = supabase
    .from("products")
    .select(
      "id, sku, name, price, brand, is_active, is_featured, images, category_id, categories(name)",
    )
    .order("name")
    .limit(100);

  if (q?.trim()) {
    query = query.ilike("name", "%" + q.trim() + "%");
  }

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (category) {
    query = query.eq("category_id", category);
  }

  const { data: products } = await query;

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-gray-500 mt-1">
            {products?.length ?? 0} productos
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/productos/importar"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Importar CSV
          </Link>
          <Link
            href="/admin/productos/nuevo"
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Nuevo producto
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3">
        <form method="GET" className="flex flex-wrap gap-3 w-full">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre..."
            className="flex-1 min-w-48 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <select
            name="status"
            defaultValue={status ?? ""}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <select
            name="category"
            defaultValue={category ?? ""}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Todas las categorias</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Filtrar
          </button>
          {(q || status || category) && (
            <Link
              href="/admin/productos"
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </Link>
          )}
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {!products || products.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">📦</p>
            <p className="font-medium">No se encontraron productos</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Producto
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Categoria
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  SKU
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Precio
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-orange-50">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-lg">📦</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        {product.brand && (
                          <p className="text-xs text-gray-400">
                            {product.brand}
                          </p>
                        )}
                        {product.is_featured && (
                          <span className="text-xs text-orange-600 font-medium">
                            Destacado
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {product.categories?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {product.sku ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        product.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {product.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={"/admin/productos/" + product.id}
                      className="text-sm text-gray-500 hover:text-black"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
