-- =============================================================
-- OMNIA · Esquema de base de datos para Supabase
-- Cómo usarlo: Supabase > SQL Editor > New query > pega todo > Run
-- Es seguro ejecutarlo más de una vez.
-- =============================================================

-- ---------- Perfiles (usuarios y administradores) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ¿El usuario actual es administrador?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Crea el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un usuario normal no puede cambiarse el rol a sí mismo
create or replace function public.protect_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Solo un administrador puede cambiar roles';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_role on public.profiles;
create trigger protect_role
  before update on public.profiles
  for each row execute function public.protect_role();

drop policy if exists "perfil propio: leer" on public.profiles;
create policy "perfil propio: leer" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "perfil propio: editar" on public.profiles;
create policy "perfil propio: editar" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- ---------- Solicitudes de contacto (leads) ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200),
  company text check (char_length(company) <= 160),
  phone text check (char_length(phone) <= 40),
  message text not null check (char_length(message) between 10 and 4000),
  status text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'cerrado')),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

drop policy if exists "leads: cualquiera envía" on public.leads;
create policy "leads: cualquiera envía" on public.leads
  for insert to anon, authenticated
  with check (status = 'nuevo' and (user_id is null or user_id = auth.uid()));

drop policy if exists "leads: admin lee" on public.leads;
create policy "leads: admin lee" on public.leads
  for select using (public.is_admin() or user_id = auth.uid());

drop policy if exists "leads: admin edita" on public.leads;
create policy "leads: admin edita" on public.leads
  for update using (public.is_admin());

drop policy if exists "leads: admin borra" on public.leads;
create policy "leads: admin borra" on public.leads
  for delete using (public.is_admin());

-- =============================================================
-- PRIMER ADMINISTRADOR
-- 1) Regístrate en la web (/acceso) con tu correo.
-- 2) Ejecuta esta línea cambiando el correo:
-- update public.profiles set role = 'admin' where email = 'tu-correo@ejemplo.com';
-- =============================================================
