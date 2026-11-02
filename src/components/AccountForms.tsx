"use client";

import { useActionState, useState } from "react";
import { updateProfile, type FormState } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";

const input =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-fg outline-none transition-colors focus:border-accent";
const btn = "rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50";

export function ProfileForm({ fullName }: { fullName: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, null);
  return (
    <form action={action} className="space-y-3">
      <label htmlFor="full_name" className="block text-xs text-muted">
        Nombre completo
      </label>
      <input id="full_name" name="full_name" defaultValue={fullName} maxLength={120} className={input} />
      <div className="flex items-center gap-3">
        <button disabled={pending} className={btn}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {state && <span className={`text-sm ${state.ok ? "text-ok" : "text-[#ff8a8a]"}`}>{state.message}</span>}
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const password = String(new FormData(form).get("password") ?? "");
    if (password.length < 8) return setMsg({ ok: false, text: "Mínimo 8 caracteres." });
    setPending(true);
    const { error } = await createClient().auth.updateUser({ password });
    setPending(false);
    if (error) setMsg({ ok: false, text: "No se pudo cambiar la contraseña." });
    else {
      form.reset();
      setMsg({ ok: true, text: "Contraseña actualizada." });
    }
  }
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label htmlFor="password" className="block text-xs text-muted">
        Nueva contraseña
      </label>
      <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={input} />
      <div className="flex items-center gap-3">
        <button disabled={pending} className={btn}>
          {pending ? "Guardando…" : "Cambiar contraseña"}
        </button>
        {msg && <span className={`text-sm ${msg.ok ? "text-ok" : "text-[#ff8a8a]"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
