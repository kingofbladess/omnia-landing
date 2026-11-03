import type { Metadata } from "next";
import Link from "next/link";
import { EmailForm, MfaPanel, PasswordForm, ProfileForm, SignOutOthers } from "@/components/AccountForms";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Panel, btnGhostCls } from "@/components/portal";
import { DeleteAccountForm } from "@/components/PortalForms";
import { pageUser } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ajustes", robots: { index: false } };

export default async function Ajustes() {
  const { user, profile } = await pageUser("/cuenta/ajustes");

  return (
    <AppShell isAdmin={profile?.role === "admin"} active="cuenta" tab="/cuenta/ajustes">
      <PageHeader kicker="Cuenta" title="Ajustes" text="Tus datos, la seguridad de tu cuenta y tu privacidad." />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Perfil y empresa" text="Con estos datos llenamos solos tus formularios y preparamos tus propuestas." className="lg:row-span-2">
          <ProfileForm
            data={{
              full_name: profile?.full_name ?? "",
              company: profile?.company ?? "",
              rif: profile?.rif ?? "",
              phone: profile?.phone ?? "",
              job_title: profile?.job_title ?? "",
            }}
          />
        </Panel>

        <Panel title="Contraseña" text="Usa al menos 8 caracteres.">
          <PasswordForm />
        </Panel>

        <Panel title="Correo de acceso" text="Te enviaremos un enlace para confirmar el nuevo correo.">
          <EmailForm current={user.email ?? ""} />
        </Panel>

        <Panel title="Verificación en dos pasos" text="Además de tu contraseña, se pedirá un código de tu teléfono al iniciar sesión.">
          <MfaPanel />
        </Panel>

        <Panel title="Sesiones" text="Si usaste tu cuenta en otro equipo, puedes cerrarla allí desde aquí.">
          <SignOutOthers />
        </Panel>

        <Panel title="Mis datos" text="Descarga una copia de toda la información que guardamos sobre ti.">
          <a href="/cuenta/exportar" className={btnGhostCls}>
            Descargar mis datos (JSON)
          </a>
          <p className="mt-3 text-xs text-muted">
            Más detalles en la{" "}
            <Link href="/privacidad" className="text-accent-2 hover:underline">
              Política de Privacidad
            </Link>
            .
          </p>
        </Panel>

        <Panel title="Eliminar mi cuenta" text="Borra tu cuenta y todos tus datos de forma permanente." className="border-[#ff8a8a]/25 lg:col-span-2">
          <DeleteAccountForm />
        </Panel>
      </div>
    </AppShell>
  );
}
