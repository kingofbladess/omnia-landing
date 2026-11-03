# OMNIA · Landing

Landing corporativa de OMNIA (data center, software, IA y cloud) con cuentas de usuario, panel de administración y páginas legales.

**Tecnología:** Next.js 15 · React 19 · Tailwind CSS 4 · Supabase (base de datos y login) · Vercel (hosting)

---

## 1. Abrir el proyecto en Cursor

1. Instala [Node.js 20 o superior](https://nodejs.org) y [Cursor](https://cursor.com).
2. En Cursor: **File → Clone Repository** y pega `https://github.com/kingofbladess/omnia-landing`.
3. Abre la terminal de Cursor (`Ctrl + ñ` o **View → Terminal**) y ejecuta:

```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
npm run dev
```

4. Abre <http://localhost:3000>.

## 2. Conectar Supabase

1. En [supabase.com](https://supabase.com) crea un proyecto.
2. Ve a **SQL Editor → New query**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**.
3. Ve a **Project Settings → API** y copia **Project URL** y **anon public key** dentro de `.env.local`.
4. En **Authentication → URL Configuration** pon como *Site URL* `https://omnia.ia.ve` (o tu dominio) y agrega `http://localhost:3000/**` en *Redirect URLs*.
5. Reinicia `npm run dev`, entra a `/acceso` y crea tu cuenta.
6. Hazte administrador ejecutando en el SQL Editor (con tu correo):

```sql
update public.profiles set role = 'admin' where email = 'tu-correo@ejemplo.com';
```

> Nunca pongas la clave `service_role` en el código ni la compartas.

## 3. Publicar en Vercel y conectar el dominio

1. Entra a [vercel.com](https://vercel.com) con tu cuenta de GitHub → **Add New → Project** → elige `omnia-landing`.
2. En **Environment Variables** agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **Deploy**.
Mientras no haya dominio propio, el sitio funciona en `https://omnia-landing-odp7.vercel.app`.

### Conectar `omnia.ia.ve` (cuando el titular lo autorice)

El dominio está registrado en NIC.VE por un tercero y su DNS está en una cuenta de Cloudflare de ese titular (`hassan` / `evelyn.ns.cloudflare.com`).

1. En Vercel → proyecto → **Settings → Domains → Add Existing** → `omnia.ia.ve`. Vercel mostrará los registros DNS exactos que necesita.
2. El titular crea esos registros en **su** Cloudflare (**DNS → Records**), con el proxy en **DNS only** (nube gris). Normalmente:
   - `CNAME` · `@` · el valor `…vercel-dns-017.com` que muestre Vercel (o `A` · `@` · `76.76.21.21`)
   - `TXT` · `_vercel` · el valor `vc-domain-verify=…`, solo si Vercel lo pide
3. Cuando Vercel marque el dominio como **Valid Configuration**, en **Settings → Environment Variables** agrega `NEXT_PUBLIC_SITE_DOMAIN` = `omnia.ia.ve` y haz **Redeploy**. Con eso los metadatos, el sitemap, el robots y las páginas legales pasan a usar el dominio.
4. En Supabase → **Authentication → URL Configuration**: *Site URL* `https://omnia.ia.ve` y agrega `https://omnia.ia.ve/**` en *Redirect URLs*.

Alternativa: si el titular prefiere no usar Cloudflare, puede cambiar los nameservers en [nic.ve](https://nic.ve) a `ns1.vercel-dns.com` y `ns2.vercel-dns.com`, y Vercel gestiona todo el DNS.

## Estructura

| Ruta | Qué es |
| --- | --- |
| `/` | Landing (hero interactivo, soluciones, configurador de racks, método, contacto) |
| `/acceso` | Iniciar sesión, crear cuenta y recuperar contraseña |
| `/cuenta` | Panel del usuario: perfil, contraseña y sus solicitudes |
| `/admin` | Panel admin: solicitudes (estado, eliminar) y usuarios (roles) |
| `/terminos`, `/privacidad`, `/cookies` | Páginas legales |

- **Textos editables:** `src/content/site.ts` (nombre legal, RIF, correo, cifras, servicios). Los actuales son provisionales.
- **Colores:** variables al inicio de `src/app/globals.css`.
- **Base de datos y permisos:** `supabase/schema.sql` (seguridad por filas: solo admins ven y editan solicitudes).

## Comandos

```bash
npm run dev     # desarrollo
npm run lint    # revisar errores de código
npm run build   # compilar para producción
```

## Antes de lanzar

- [ ] Reemplazar textos, RIF, correo y cifras en `src/content/site.ts`
- [ ] Revisar Términos, Privacidad y Cookies con un abogado
- [ ] Configurar el correo `contacto@` del dominio
- [ ] Crear el primer administrador
