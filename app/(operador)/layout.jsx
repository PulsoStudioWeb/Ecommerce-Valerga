import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OperadorLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "operator"].includes(profile.role)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Panel Operador
          </p>
          <p className="font-bold">Horizonte</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-600 hidden sm:block">
            {profile.full_name ?? "Operador"}
          </p>
          <a
            href="/auth/login"
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Salir
          </a>
        </div>
      </header>
      <main className="p-4 max-w-4xl mx-auto">{children}</main>
    </div>
  );
}
