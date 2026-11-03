import { NextResponse, type NextRequest } from "next/server";
import { safeRedirect } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

/** Recibe el enlace de confirmación / recuperación enviado por correo. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirect(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/acceso?error=link`);
}
