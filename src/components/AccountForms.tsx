"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { updateProfile, type FormState } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
import { btnCls, btnGhostCls, inputCls } from "./portal";

type Msg = { ok: boolean; text: string } | null;

function Note({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <span role="status" className={`text-sm ${msg.ok ? "text-ok" : "text-[#ff8a8a]"}`}>
      {msg.text}
    </span>
  );
}

type ProfileData = { full_name: string; company: string; rif: string; phone: string; job_title: string };

/** Perfil y datos de empresa (se usan para llenar solos los formularios). */
export function ProfileForm({ data }: { data: ProfileData }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, null);
  const fields: { name: keyof ProfileData; label: string; max: number; placeholder?: string; auto?: string }[] = [
    { name: "full_name", label: "Nombre completo", max: 120, auto: "name" },
    { name: "job_title", label: "Cargo", max: 120, placeholder: "Ej. Gerente de TI", auto: "organization-title" },
    { name: "company", label: "Empresa", max: 160, auto: "organization" },
    { name: "rif", label: "RIF", max: 20, placeholder: "J-12345678-9" },
    { name: "phone", label: "Teléfono", max: 40, placeholder: "+58 …", auto: "tel" },
  ];
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.name === "full_name" ? "sm:col-span-2" : ""}>
            <label htmlFor={f.name} className="mb-1.5 block text-xs text-muted">
              {f.label}
            </label>
            <input id={f.name} name={f.name} defaultValue={data[f.name]} maxLength={f.max} placeholder={f.placeholder} autoComplete={f.auto} className={inputCls} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className={btnCls}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {state && <Note msg={{ ok: state.ok, text: state.message }} />}
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [msg, setMsg] = useState<Msg>(null);
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
      <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={inputCls} />
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className={btnCls}>
          {pending ? "Guardando…" : "Cambiar contraseña"}
        </button>
        <Note msg={msg} />
      </div>
    </form>
  );
}

/** Cambiar el correo: Supabase envía un enlace de confirmación. */
export function EmailForm({ current }: { current: string }) {
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, setPending] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setMsg({ ok: false, text: "El correo no parece válido." });
    if (email === current.toLowerCase()) return setMsg({ ok: false, text: "Es el mismo correo que ya usas." });
    setPending(true);
    const { error } = await createClient().auth.updateUser({ email }, { emailRedirectTo: `${location.origin}/auth/callback?next=/cuenta/ajustes` });
    setPending(false);
    setMsg(error ? { ok: false, text: "No se pudo cambiar el correo." } : { ok: true, text: "Te enviamos un enlace de confirmación. Revisa tu correo." });
  }
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label htmlFor="new-email" className="block text-xs text-muted">
        Correo actual: <span className="text-fg">{current}</span>
      </label>
      <input id="new-email" name="email" type="email" autoComplete="email" required placeholder="Nuevo correo" className={inputCls} />
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className={btnGhostCls}>
          {pending ? "Enviando…" : "Cambiar correo"}
        </button>
        <Note msg={msg} />
      </div>
    </form>
  );
}

type Factor = { id: string; friendly_name?: string | null; status: string; created_at: string };

/** Verificación en dos pasos (TOTP con Google Authenticator, Authy, 1Password…). */
export function MfaPanel() {
  const [factors, setFactors] = useState<Factor[] | null>(null);
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    const { data } = await createClient().auth.mfa.listFactors();
    setFactors(((data?.totp ?? []) as Factor[]).filter((f) => f.status === "verified"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function start() {
    setPending(true);
    setMsg(null);
    const supabase = createClient();
    // Limpiar intentos anteriores sin terminar
    const { data } = await supabase.auth.mfa.listFactors();
    for (const f of (data?.all ?? []) as Factor[]) if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data: en, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `OMNIA ${new Date().toLocaleDateString("es-VE")}` });
    setPending(false);
    if (error || !en) return setMsg({ ok: false, text: "No se pudo iniciar la configuración." });
    setEnroll({ id: en.id, qr: en.totp.qr_code, secret: en.totp.secret });
  }

  async function verify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!enroll) return;
    const code = String(new FormData(e.currentTarget).get("code") ?? "").replace(/\s/g, "");
    if (!/^\d{6}$/.test(code)) return setMsg({ ok: false, text: "El código tiene 6 dígitos." });
    setPending(true);
    const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId: enroll.id, code });
    setPending(false);
    if (error) return setMsg({ ok: false, text: "Código incorrecto. Prueba con el siguiente." });
    setEnroll(null);
    setMsg({ ok: true, text: "Verificación en dos pasos activada." });
    load();
  }

  async function disable(id: string) {
    if (!window.confirm("¿Desactivar la verificación en dos pasos?")) return;
    setPending(true);
    const { error } = await createClient().auth.mfa.unenroll({ factorId: id });
    setPending(false);
    setMsg(error ? { ok: false, text: "Para desactivarla, cierra sesión y vuelve a entrar con tu código." } : { ok: true, text: "Verificación en dos pasos desactivada." });
    load();
  }

  if (factors === null) return <p className="text-sm text-muted">Cargando…</p>;

  return (
    <div className="space-y-4">
      {factors.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ok/30 bg-ok/10 px-4 py-3">
          <span className="text-sm text-ok">Activada · se pedirá un código al iniciar sesión</span>
          <button type="button" onClick={() => disable(factors[0].id)} disabled={pending} className={btnGhostCls}>
            Desactivar
          </button>
        </div>
      ) : enroll ? (
        <form onSubmit={verify} className="space-y-4">
          <p className="text-sm text-muted">1. Escanea este código con tu app de autenticación (Google Authenticator, Authy, 1Password…).</p>
          {/* El QR lo genera Supabase como imagen SVG */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enroll.qr} alt="Código QR para la app de autenticación" className="h-44 w-44 rounded-xl bg-white p-2" />
          <p className="text-xs text-muted">
            ¿No puedes escanear? Escribe esta clave: <code className="break-all font-mono text-fg">{enroll.secret}</code>
          </p>
          <label htmlFor="mfa-code" className="block text-sm text-muted">
            2. Escribe el código de 6 dígitos que muestra la app:
          </label>
          <input id="mfa-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required className={`${inputCls} max-w-[12rem] tracking-[0.3em]`} />
          <div className="flex flex-wrap gap-3">
            <button disabled={pending} className={btnCls}>
              {pending ? "Verificando…" : "Activar"}
            </button>
            <button type="button" onClick={() => setEnroll(null)} className={btnGhostCls}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={start} disabled={pending} className={btnGhostCls}>
          {pending ? "Preparando…" : "Activar verificación en dos pasos"}
        </button>
      )}
      <Note msg={msg} />
    </div>
  );
}

/** Cerrar la sesión en todos los demás dispositivos. */
export function SignOutOthers() {
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, setPending] = useState(false);
  async function run() {
    setPending(true);
    const { error } = await createClient().auth.signOut({ scope: "others" });
    setPending(false);
    setMsg(error ? { ok: false, text: "No se pudo cerrar las otras sesiones." } : { ok: true, text: "Listo: solo queda abierta esta sesión." });
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={run} disabled={pending} className={btnGhostCls}>
        {pending ? "Cerrando…" : "Cerrar sesión en otros dispositivos"}
      </button>
      <Note msg={msg} />
    </div>
  );
}
