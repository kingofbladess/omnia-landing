import { NextResponse, type NextRequest } from "next/server";
import { UUID_RE } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";

/** Descarga segura: comprueba (con RLS) que el documento es del usuario y redirige a un enlace temporal. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const back = new URL("/cuenta/documentos", request.url);
  if (!UUID_RE.test(id)) return NextResponse.redirect(back);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL(`/acceso?next=/cuenta/documentos`, request.url));

  const { data: doc } = await supabase.from("documents").select("path, name").eq("id", id).maybeSingle();
  if (!doc) return NextResponse.redirect(back);

  const { data } = await supabase.storage.from("documents").createSignedUrl(doc.path, 60, { download: doc.name });
  if (!data?.signedUrl) return NextResponse.redirect(back);
  return NextResponse.redirect(data.signedUrl);
}
