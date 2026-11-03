"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/app/actions";
import { addService, registerDocument, replyLead } from "@/app/admin/actions";
import { deleteAccount, requestMeeting, sendLeadMessage } from "@/app/cuenta/actions";
import { SERVICE_KINDS, safeFileName } from "@/lib/portal";
import { createClient } from "@/lib/supabase/client";
import { btnCls, inputCls } from "./portal";

function Status({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <span role="status" className={`text-sm ${state.ok ? "text-ok" : "text-[#ff8a8a]"}`}>
      {state.message}
    </span>
  );
}

/** Responder en el hilo de una solicitud (cliente o equipo de OMNIA). */
export function MessageForm({ leadId, staff = false }: { leadId: string; staff?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(staff ? replyLead : sendLeadMessage, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="lead_id" value={leadId} />
      <label htmlFor="body" className="sr-only">
        Mensaje
      </label>
      <textarea id="body" name="body" rows={3} required maxLength={4000} placeholder={staff ? "Responder al cliente…" : "Escribe tu mensaje…"} className={inputCls} />
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className={btnCls}>
          {pending ? "Enviando…" : staff ? "Responder" : "Enviar"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

/** Pedir una reunión. */
export function MeetingForm({ leads }: { leads: { id: string; label: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(requestMeeting, null);
  const ref = useRef<HTMLFormElement>(null);
  const [min, setMin] = useState("");
  useEffect(() => {
    // Fecha mínima = hoy (en el navegador; el servidor vuelve a validar)
    setMin(new Date().toISOString().slice(0, 10));
  }, []);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="mb-1.5 block text-xs text-muted">
            Fecha (lunes a viernes)
          </label>
          <input id="date" name="date" type="date" min={min} required className={`${inputCls} [color-scheme:dark]`} />
        </div>
        <div>
          <label htmlFor="time" className="mb-1.5 block text-xs text-muted">
            Hora (Venezuela, 8:00–17:00)
          </label>
          <input id="time" name="time" type="time" min="08:00" max="16:30" step={1800} required className={`${inputCls} [color-scheme:dark]`} />
        </div>
      </div>
      <div>
        <label htmlFor="topic" className="mb-1.5 block text-xs text-muted">
          Tema
        </label>
        <input id="topic" name="topic" required minLength={3} maxLength={300} placeholder="Ej. Revisar la propuesta de racks" className={inputCls} />
      </div>
      {leads.length > 0 && (
        <div>
          <label htmlFor="lead_id" className="mb-1.5 block text-xs text-muted">
            Relacionada con (opcional)
          </label>
          <select id="lead_id" name="lead_id" defaultValue="" className={`${inputCls} [color-scheme:dark]`}>
            <option value="">Ninguna</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className={btnCls}>
          {pending ? "Enviando…" : "Solicitar reunión"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

/** Eliminar la cuenta: hay que escribir ELIMINAR. */
export function DeleteAccountForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(deleteAccount, null);
  const [text, setText] = useState("");
  return (
    <form action={action} className="space-y-3">
      <label htmlFor="confirm" className="block text-xs text-muted">
        Escribe <strong className="text-fg">ELIMINAR</strong> para confirmar. Se borrarán tu perfil, solicitudes, mensajes, reuniones, configuraciones y documentos. No se puede deshacer.
      </label>
      <input id="confirm" name="confirm" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" className={inputCls} />
      <div className="flex flex-wrap items-center gap-3">
        <button
          disabled={pending || text !== "ELIMINAR"}
          className="rounded-full border border-[#ff8a8a]/50 px-5 py-2.5 text-sm font-semibold text-[#ff8a8a] transition hover:bg-[#ff8a8a]/10 disabled:opacity-40"
        >
          {pending ? "Eliminando…" : "Eliminar mi cuenta"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

/** Admin: dar de alta un servicio para un cliente. */
export function ServiceForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addService, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="grid gap-3 sm:grid-cols-[1.4fr_1fr_0.7fr]">
      <input type="hidden" name="user_id" value={userId} />
      <input name="name" required maxLength={120} placeholder="Nombre (ej. Rack A01 – Colocation)" aria-label="Nombre del servicio" className={inputCls} />
      <select name="kind" defaultValue="datacenter" aria-label="Tipo" className={`${inputCls} [color-scheme:dark]`}>
        {Object.entries(SERVICE_KINDS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <input name="uptime" inputMode="decimal" placeholder="Uptime %" aria-label="Uptime" className={inputCls} />
      <input name="notes" maxLength={500} placeholder="Notas para el cliente (opcional)" aria-label="Notas" className={`${inputCls} sm:col-span-3`} />
      <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
        <button disabled={pending} className={btnCls}>
          {pending ? "Guardando…" : "Agregar servicio"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.docx,.xlsx";
const MAX_MB = 20;

/** Admin: subir un documento a la carpeta privada del cliente. */
export function DocumentUpload({ userId }: { userId: string }) {
  const [state, setState] = useState<FormState>(null);
  const [pending, setPending] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = (new FormData(e.currentTarget).get("file") as File | null) ?? null;
    if (!file || !file.size) return setState({ ok: false, message: "Elige un archivo." });
    if (file.size > MAX_MB * 1024 * 1024) return setState({ ok: false, message: `Máximo ${MAX_MB} MB.` });
    setPending(true);
    setState(null);
    const path = `${userId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await createClient().storage.from("documents").upload(path, file, { contentType: file.type || undefined });
    if (error) {
      setPending(false);
      return setState({ ok: false, message: "No se pudo subir. Formatos: PDF, PNG, JPG, DOCX, XLSX." });
    }
    const res = await registerDocument(userId, path, file.name, file.size);
    setPending(false);
    setState(res);
    if (res?.ok) ref.current?.reset();
  }

  return (
    <form ref={ref} onSubmit={onSubmit} className="flex flex-wrap items-center gap-3">
      <input
        name="file"
        type="file"
        accept={ACCEPT}
        required
        aria-label="Archivo"
        className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-white/[0.08] file:px-4 file:py-2 file:text-sm file:text-fg hover:file:bg-white/[0.14]"
      />
      <button disabled={pending} className={btnCls}>
        {pending ? "Subiendo…" : "Subir documento"}
      </button>
      <Status state={state} />
    </form>
  );
}
