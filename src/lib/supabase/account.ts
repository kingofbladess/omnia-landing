"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./client";
import { isSupabaseConfigured } from "./config";

/**
 * Sesión del visitante en las páginas públicas (inicio, legales).
 * Esas páginas son estáticas para cargar rápido, así que la sesión se lee en el navegador.
 * La consulta se hace una sola vez y la comparten la cabecera, el formulario y el estimador.
 */
export type Account = {
  user: User;
  isAdmin: boolean;
  profile: { full_name: string | null; company: string | null; phone: string | null } | null;
};

let cached: Promise<Account | null> | null = null;
let listening = false;
const subscribers = new Set<(a: Account | null) => void>();

async function load(): Promise<Account | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = createClient();
    // getSession lee la cookie local (sin red); el middleware ya la mantiene renovada.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return null;
    const { data: p } = await supabase.from("profiles").select("full_name, company, phone, role").eq("id", user.id).maybeSingle();
    return {
      user,
      isAdmin: p?.role === "admin",
      profile: p ? { full_name: p.full_name, company: p.company, phone: p.phone } : null,
    };
  } catch {
    return null;
  }
}

/** fresh: vuelve a leer la sesión (p. ej. al volver de "Mi cuenta", donde pudo cerrarse). */
export function getAccount(fresh = false): Promise<Account | null> {
  if (!cached || fresh) cached = load();
  if (!listening && isSupabaseConfigured) {
    listening = true;
    // Si la sesión cambia (entrar, salir, otra pestaña), se vuelve a leer.
    createClient().auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      cached = load();
      cached.then((a) => subscribers.forEach((fn) => fn(a)));
    });
  }
  return cached;
}

/** undefined = todavía cargando; null = sin sesión. */
export function useAccount() {
  const [account, setAccount] = useState<Account | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    getAccount(true).then((a) => alive && setAccount(a));
    subscribers.add(setAccount);
    return () => {
      alive = false;
      subscribers.delete(setAccount);
    };
  }, []);
  return account;
}
