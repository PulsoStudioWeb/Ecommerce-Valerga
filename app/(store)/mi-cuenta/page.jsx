"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function MiCuentaPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/auth/login?redirect=/mi-cuenta";
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, phone, created_at")
        .eq("id", session.user.id)
        .single();

      setProfile(data);
      setLoading(false);
    }

    fetchProfile();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 py-16 text-center"
        style={{ color: "#78716C" }}
      >
        Cargando...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-black" style={{ color: "#1C1917" }}>
        Mi cuenta
      </h1>

      <div
        className="bg-white border rounded-xl p-5"
        style={{ borderColor: "#E7E5E4" }}
      >
        <h2 className="font-bold mb-3" style={{ color: "#1C1917" }}>
          Mis datos
        </h2>
        <div className="space-y-2 text-sm" style={{ color: "#78716C" }}>
          <p>
            <span className="font-medium" style={{ color: "#1C1917" }}>
              Nombre:
            </span>{" "}
            {profile?.full_name ?? "Sin nombre"}
          </p>
          <p>
            <span className="font-medium" style={{ color: "#1C1917" }}>
              Email:
            </span>{" "}
            {profile?.email}
          </p>
          {profile?.phone && (
            <p>
              <span className="font-medium" style={{ color: "#1C1917" }}>
                Telefono:
              </span>{" "}
              {profile.phone}
            </p>
          )}
        </div>
      </div>

      <div
        className="bg-white border rounded-xl p-5"
        style={{ borderColor: "#E7E5E4" }}
      >
        <h2 className="font-bold mb-3" style={{ color: "#1C1917" }}>
          Accesos rapidos
        </h2>
        <Link
          href="/mi-cuenta/pedidos"
          className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 transition-colors"
        >
          <span className="text-sm font-medium" style={{ color: "#1C1917" }}>
            Mis pedidos
          </span>
          <span style={{ color: "#F97316" }}>→</span>
        </Link>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full border py-3 rounded-xl text-sm font-medium transition-colors hover:bg-red-50"
        style={{ borderColor: "#fca5a5", color: "#dc2626" }}
      >
        Cerrar sesion
      </button>
    </div>
  );
}
