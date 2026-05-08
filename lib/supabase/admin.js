import { createClient } from "@supabase/supabase-js";

// Este cliente bypasea RLS — solo usar en API Routes del servidor
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
