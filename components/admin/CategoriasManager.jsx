"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function CategoriasManager({ initialCategories }) {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({
    name: "",
    icon: "",
    display_order: 0,
    is_active: true,
  });

  const filtered = categories.filter((cat) => {
    const matchSearch = cat.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && cat.is_active) ||
      (filterStatus === "inactive" && !cat.is_active);
    return matchSearch && matchStatus;
  });

  function openCreate() {
    setEditingCategory(null);
    setForm({
      name: "",
      icon: "",
      display_order: categories.length + 1,
      is_active: true,
    });
    setError("");
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      icon: cat.icon ?? "",
      display_order: cat.display_order ?? 0,
      is_active: cat.is_active,
    });
    setError("");
    setModalOpen(true);
  }

  function handleChange(e) {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setLoading(true);
    setError("");
    const supabase = createClient();

    if (editingCategory) {
      const { error: updateError } = await supabase
        .from("categories")
        .update({
          name: form.name.trim(),
          slug: slugify(form.name.trim()),
          icon: form.icon.trim() || null,
          display_order: Number(form.display_order),
          is_active: form.is_active,
        })
        .eq("id", editingCategory.id);

      if (updateError) {
        setError("Error al guardar: " + updateError.message);
        setLoading(false);
        return;
      }

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? { ...cat, ...form, slug: slugify(form.name.trim()) }
            : cat,
        ),
      );
    } else {
      const { data: newCat, error: insertError } = await supabase
        .from("categories")
        .insert({
          name: form.name.trim(),
          slug: slugify(form.name.trim()),
          icon: form.icon.trim() || null,
          display_order: Number(form.display_order),
          is_active: form.is_active,
        })
        .select()
        .single();

      if (insertError) {
        setError("Error al crear: " + insertError.message);
        setLoading(false);
        return;
      }

      setCategories((prev) => [...prev, newCat]);
    }

    setLoading(false);
    setModalOpen(false);
  }

  async function handleToggleActive(cat) {
    const supabase = createClient();
    await supabase
      .from("categories")
      .update({ is_active: !cat.is_active })
      .eq("id", cat.id);

    setCategories((prev) =>
      prev.map((c) =>
        c.id === cat.id ? { ...c, is_active: !c.is_active } : c,
      ),
    );
  }

  async function handleDelete(cat) {
    if (
      !confirm(
        "Eliminar la categoria " +
          cat.name +
          "? Los productos no seran eliminados.",
      )
    )
      return;

    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", cat.id);
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
  }

  return (
    <>
      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoria..."
          className="flex-1 min-w-48 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
        <button
          type="button"
          onClick={openCreate}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Nueva categoria
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">🏷️</p>
            <p className="font-medium">No se encontraron categorias</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Slug
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Orden
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {cat.icon && <span className="text-xl">{cat.icon}</span>}
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {cat.display_order}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(cat)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                        cat.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {cat.is_active ? "Activa" : "Inactiva"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(cat)}
                        className="text-sm text-gray-500 hover:text-black transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        className="text-sm text-red-400 hover:text-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">
              {editingCategory ? "Editar categoria" : "Nueva categoria"}
            </h2>

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
                placeholder="Ej: Bebidas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icono (emoji)
              </label>
              <input
                type="text"
                name="icon"
                value={form.icon}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ej: 🥤"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden de display
              </label>
              <input
                type="number"
                name="display_order"
                value={form.display_order}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
              <span className="text-sm">Categoria activa</span>
            </label>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 border border-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
