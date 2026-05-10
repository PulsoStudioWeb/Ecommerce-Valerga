"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    accepts_marketing: false,
  });

  function handleChange(e) {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  }

  async function handleSubmit() {
    if (!form.full_name || !form.email || !form.password) {
      setError("Nombre, email y contrasena son obligatorios");
      return;
    }

    if (form.password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          phone: form.phone,
          accepts_marketing: form.accepts_marketing,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    window.location.replace("/");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#FFF7ED" }}
    >
      <div
        className="bg-white rounded-2xl border p-8 w-full max-w-md shadow-sm"
        style={{ borderColor: "#E7E5E4" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#F97316" }}
          >
            <span className="text-white font-black text-lg">H</span>
          </div>
          <div>
            <p
              className="font-black text-lg leading-none"
              style={{ color: "#1C1917" }}
            >
              Horizonte
            </p>
            <p className="text-xs leading-none" style={{ color: "#78716C" }}>
              Supermercados
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: "#1C1917" }}>
            Crear cuenta
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
            Registrate para hacer tus pedidos
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "#1C1917" }}
            >
              Nombre completo
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#E7E5E4" }}
              placeholder="Juan Perez"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "#1C1917" }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#E7E5E4" }}
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "#1C1917" }}
            >
              Telefono
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#E7E5E4" }}
              placeholder="2324 000000"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "#1C1917" }}
            >
              Contrasena
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#E7E5E4" }}
              placeholder="Minimo 6 caracteres"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="accepts_marketing"
              checked={form.accepts_marketing}
              onChange={handleChange}
              className="rounded"
            />
            <span className="text-sm" style={{ color: "#78716C" }}>
              Quiero recibir ofertas y novedades
            </span>
          </label>

          {error && (
            <p className="text-sm bg-red-50 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white transition-colors disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: "#F97316" }}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "#78716C" }}>
          Ya tenes cuenta?{" "}
          <Link
            href="/auth/login"
            className="font-bold hover:underline"
            style={{ color: "#F97316" }}
          >
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
