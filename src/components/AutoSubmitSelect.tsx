"use client";

/** Select que envía su formulario al cambiar (para el panel admin). */
export function AutoSubmitSelect({ name, defaultValue, options, label }: { name: string; defaultValue: string; options: { value: string; label: string }[]; label: string }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      aria-label={label}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="rounded-lg border border-line bg-bg px-2 py-1.5 text-xs text-fg outline-none focus:border-accent"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ConfirmButton({ children, message, className }: { children: React.ReactNode; message: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
