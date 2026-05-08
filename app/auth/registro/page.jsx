"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

// Y dentro del return, antes del cierre del div principal:

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  async function handleSubmit(e) {
    console.log("1 - submit ejecutado");
    setLoading(true);

    const supabase = createClient();
    console.log("2 - cliente creado");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    console.log("3 - respuesta auth:", { data, error });

    if (error) {
      toast.error("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }

    console.log("4 - consultando perfil");
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    console.log("5 - perfil:", profile);

    if (profile?.role === "admin" || profile?.role === "operator") {
      console.log("6 - redirigiendo a admin");
      window.location.href = "/admin";
    } else {
      console.log("6 - redirigiendo a home");
      window.location.href = "/";
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Crear cuenta</h1>
          <p className="text-gray-500 mt-1">
            Registrate para hacer tus pedidos
          </p>
        </div>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Toaster position="top-center" /> {/* agregá esta línea */}
          <div className="bg-white rounded-2xl ..."></div>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Juan Perez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefono
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="2324 000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contrasena
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Minimo 6 caracteres"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="accepts_marketing"
              name="accepts_marketing"
              checked={form.accepts_marketing}
              onChange={handleChange}
              className="mt-0.5"
            />
            <label
              htmlFor="accepts_marketing"
              className="text-sm text-gray-600"
            >
              Quiero recibir ofertas y novedades de Valerga
            </label>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Ya tenes cuenta?{" "}
          <Link
            href="/auth/login"
            className="text-black font-medium hover:underline"
          >
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
