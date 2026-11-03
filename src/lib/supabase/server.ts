import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Llamado desde un Server Component: el middleware se encarga de refrescar la sesión.
        }
      },
    },
  });
}

export type Role = "user" | "admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
  company: string | null;
  rif: string | null;
  phone: string | null;
  job_title: string | null;
};

/** Devuelve el usuario actual y su rol (o null si no hay sesión). */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at, company, rif, phone, job_title")
    .eq("id", user.id)
    .single();
  return { supabase, user, profile: profile as Profile | null };
}
