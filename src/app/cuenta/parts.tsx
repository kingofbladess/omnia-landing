import { PasswordForm, ProfileForm } from "@/components/AccountForms";

export function AccountForms({ fullName }: { fullName: string }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-panel/60 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-fg">Perfil</h2>
        <ProfileForm fullName={fullName} />
      </section>
      <section className="rounded-2xl border border-line bg-panel/60 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-fg">Seguridad</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
