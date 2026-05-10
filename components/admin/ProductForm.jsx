"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function ProductForm({ product, categories }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: product.name ?? "",
    sku: product.sku ?? "",
    barcode: product.barcode ?? "",
    brand: product.brand ?? "",
    description: product.description ?? "",
    price: product.price ?? "",
    compare_price: product.compare_price ?? "",
    unit: product.unit ?? "unidad",
    category_id: product.category_id ?? "",
    is_active: product.is_active ?? true,
    is_featured: product.is_featured ?? false,
    image_url: product.images?.[0] ?? "",
  });

  function handleChange(e) {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.price) {
      setError("Nombre y precio son obligatorios");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name: form.name.trim(),
        slug: slugify(form.name.trim()),
        sku: form.sku.trim() || null,
        barcode: form.barcode.trim() || null,
        brand: form.brand.trim() || null,
        description: form.description.trim() || null,
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        unit: form.unit,
        category_id: form.category_id || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        updated_at: new Date().toISOString(),
        images: form.image_url ? [form.image_url] : [],
      })
      .eq("id", product.id);

    if (updateError) {
      setError("Error al guardar: " + updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/admin/productos");
      router.refresh();
    }, 1000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editar producto</h1>
          <p className="text-gray-500 mt-1 text-sm truncate">{product.name}</p>
        </div>
        <a
          href="/admin/productos"
          className="text-sm text-gray-500 hover:text-black"
        >
          Volver
        </a>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Informacion general</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU
            </label>
            <input
              type="text"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Codigo de barras
            </label>
            <input
              type="text"
              name="barcode"
              value={form.barcode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marca
            </label>
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidad
            </label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="unidad">Unidad</option>
              <option value="kg">Kg</option>
              <option value="litro">Litro</option>
              <option value="pack">Pack</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen del producto (URL)
            </label>
            <input
              type="text"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="https://..."
            />
            {form.image_url && (
              <div className="mt-2">
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Sin categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripcion
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Precios</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio de venta
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio tachado
            </label>
            <input
              type="number"
              name="compare_price"
              value={form.compare_price}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        <h2 className="font-semibold">Visibilidad</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          <span className="text-sm">Producto activo</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_featured"
            checked={form.is_featured}
            onChange={handleChange}
          />
          <span className="text-sm">Destacado en el home</span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">
          Producto guardado correctamente
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading ? "Guardando..." : success ? "Guardado" : "Guardar cambios"}
      </button>
    </div>
  );
}
