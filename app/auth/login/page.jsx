"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email o contrasena incorrectos");
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role === "admin" || profile?.role === "operator") {
      window.location.replace("/admin");
    } else {
      window.location.replace("/");
    }
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
            Iniciar sesion
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
            Ingresa a tu cuenta
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "#1C1917" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#E7E5E4", "--tw-ring-color": "#F97316" }}
              placeholder="tu@email.com"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#E7E5E4", "--tw-ring-color": "#F97316" }}
              placeholder="Minimo 6 caracteres"
            />
          </div>

          {error && (
            <p className="text-sm bg-red-50 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: "#F97316" }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "#78716C" }}>
          No tenes cuenta?{" "}
          <Link
            href="/auth/registro"
            className="font-bold hover:underline"
            style={{ color: "#F97316" }}
          >
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
