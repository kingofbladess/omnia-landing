import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";

const PROTECTED = ["/cuenta", "/admin"];

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Refresca la sesión. No quitar: evita cierres de sesión aleatorios.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (PROTECTED.some((p) => path === p || path.startsWith(`${p}/`))) {
    // Sin sesión, o con verificación en dos pasos pendiente → a /acceso
    let blocked = !user;
    if (user) {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      blocked = aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2";
    }
    if (blocked) {
      const url = request.nextUrl.clone();
      url.pathname = "/acceso";
      url.search = `?next=${encodeURIComponent(path)}`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

// Solo donde hace falta la sesión en el servidor. La página principal y las legales
// se sirven estáticas desde la CDN, sin pasar por aquí (cargan más rápido);
// allí la sesión la lee el navegador.
export const config = {
  matcher: ["/cuenta/:path*", "/admin/:path*", "/acceso", "/auth/:path*"],
};
