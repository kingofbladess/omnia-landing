import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6">
        <article className="prose-legal">{children}</article>
        <p className="mt-16 rounded-xl border border-line bg-white/[0.02] p-4 text-xs text-muted">
          Este documento es una plantilla base. Antes de publicar, revísalo con un abogado y completa los datos reales de la
          empresa.
        </p>
      </main>
      <Footer />
    </>
  );
}
