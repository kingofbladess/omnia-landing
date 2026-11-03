"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitLead, type FormState } from "@/app/actions";
import { getAccount } from "@/lib/supabase/account";
import { MagneticButton } from "./interactive";

const input =
  "peer w-full rounded-xl border border-line bg-white/[0.03] px-4 pb-2.5 pt-6 text-sm text-fg placeholder-transparent outline-none transition-colors focus:border-accent focus:bg-white/[0.05]";
const label =
  "pointer-events-none absolute left-4 top-2 text-[11px] uppercase tracking-[0.12em] text-muted transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-[0.12em] peer-focus:text-accent-2";

function Field({ name, text, type = "text", required, autoComplete }: { name: string; text: string; type?: string; required?: boolean; autoComplete?: string }) {
  return (
    <div className="relative">
      <input id={name} name={name} type={type} placeholder={text} required={required} autoComplete={autoComplete} className={input} />
      <label htmlFor={name} className={label}>
        {text}
        {required && " *"}
      </label>
    </div>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(submitLead, null);
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Si hay sesión, llena solo los campos vacíos con los datos del perfil (empresa, teléfono…).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const account = await getAccount();
        if (!account || cancelled) return;
        const { user, profile: p } = account;
        const form = formRef.current;
        if (!form || cancelled) return;
        const fill = (name: string, value?: string | null) => {
          const el = form.elements.namedItem(name) as HTMLInputElement | null;
          if (el && !el.value && value) el.value = value;
        };
        fill("name", p?.full_name);
        fill("email", user.email);
        fill("company", p?.company);
        fill("phone", p?.phone);
      } catch {
        /* sin sesión o sin conexión: el formulario funciona igual */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Recibe el mensaje pre-armado desde el configurador de racks.
  useEffect(() => {
    const onPrefill = (e: Event) => setMessage((e as CustomEvent<string>).detail);
    window.addEventListener("omnia:prefill", onPrefill);
    return () => window.removeEventListener("omnia:prefill", onPrefill);
  }, []);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setMessage("");
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4" noValidate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" text="Nombre" required autoComplete="name" />
        <Field name="email" text="Correo" type="email" required autoComplete="email" />
        <Field name="company" text="Empresa" autoComplete="organization" />
        <Field name="phone" text="Teléfono" type="tel" autoComplete="tel" />
      </div>
      <div className="relative">
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={10}
          maxLength={4000}
          placeholder="¿Qué necesitas?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${input} resize-y`}
        />
        <label htmlFor="message" className={label}>
          ¿Qué necesitas? *
        </label>
      </div>

      {/* Trampa para bots: oculto a personas */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Sitio web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-3 text-sm text-muted">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-[var(--accent)]" />
        <span>
          Acepto la{" "}
          <Link href="/privacidad" className="text-accent-2 underline-offset-4 hover:underline">
            Política de Privacidad
          </Link>{" "}
          y el tratamiento de mis datos para responder a esta solicitud.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <MagneticButton type="submit" disabled={pending}>
          {pending ? "Enviando…" : "Enviar solicitud"}
        </MagneticButton>
        <p role="status" aria-live="polite" className={`text-sm ${state?.ok ? "text-ok" : "text-[#ff8a8a]"}`}>
          {state?.message}
        </p>
      </div>
    </form>
  );
}
