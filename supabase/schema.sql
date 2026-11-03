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

-- Un usuario normal no puede cambiarse el rol a sí mismo.
-- (Si no hay usuario en la sesión, la orden viene del SQL Editor de Supabase: se permite,
--  así puedes nombrar al primer administrador.)
create or replace function public.protect_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
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

-- Desde la web no se pueden cambiar el correo, el id ni la fecha (así nadie se hace pasar por otro).
-- Las columnas editables se conceden más abajo, en "Datos de empresa".

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

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (lower(email), created_at desc);

-- Quien envía el formulario solo puede llenar estos campos (no el estado ni la fecha).
revoke insert, update on public.leads from anon, authenticated;
grant insert (name, email, company, phone, message, user_id) on public.leads to anon, authenticated;
grant update (status) on public.leads to authenticated;

-- Anti-spam: máximo 3 solicitudes por correo por hora y 30 en total cada 10 minutos.
create or replace function public.leads_throttle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.leads
      where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'rate_limit_email' using errcode = 'P0001';
  end if;
  if (select count(*) from public.leads where created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'rate_limit_global' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists leads_throttle on public.leads;
create trigger leads_throttle
  before insert on public.leads
  for each row execute function public.leads_throttle();

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
-- ÁREA DE CLIENTES
-- =============================================================

-- ---------- Datos de empresa en el perfil ----------
alter table public.profiles add column if not exists company text check (char_length(company) <= 160);
alter table public.profiles add column if not exists rif text check (char_length(rif) <= 20);
alter table public.profiles add column if not exists phone text check (char_length(phone) <= 40);
alter table public.profiles add column if not exists job_title text check (char_length(job_title) <= 120);
revoke update on public.profiles from anon, authenticated;
grant update (full_name, role, company, rif, phone, job_title) on public.profiles to authenticated;

-- ---------- Notificaciones (las crean los triggers, nunca la web) ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
revoke insert, update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;
drop policy if exists "avisos: propios" on public.notifications;
create policy "avisos: propios" on public.notifications for select using (user_id = auth.uid());
drop policy if exists "avisos: marcar leído" on public.notifications;
create policy "avisos: marcar leído" on public.notifications for update using (user_id = auth.uid());
drop policy if exists "avisos: borrar" on public.notifications;
create policy "avisos: borrar" on public.notifications for delete using (user_id = auth.uid());

create or replace function public.notify(uid uuid, t text, b text, l text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (user_id, title, body, link) values (uid, t, b, l);
$$;

-- ---------- Mensajes de cada solicitud ----------
create table if not exists public.lead_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  is_staff boolean not null default false,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists lead_messages_lead_idx on public.lead_messages (lead_id, created_at);
alter table public.lead_messages enable row level security;
revoke update, delete on public.lead_messages from anon, authenticated;
drop policy if exists "mensajes: leer" on public.lead_messages;
create policy "mensajes: leer" on public.lead_messages for select using (
  public.is_admin() or exists (select 1 from public.leads l where l.id = lead_id and l.user_id = auth.uid())
);
drop policy if exists "mensajes: escribir" on public.lead_messages;
create policy "mensajes: escribir" on public.lead_messages for insert to authenticated with check (
  author_id = auth.uid() and (
    (is_staff and public.is_admin())
    or (not is_staff and exists (select 1 from public.leads l where l.id = lead_id and l.user_id = auth.uid()))
  )
);

-- ---------- Configuraciones guardadas del estimador ----------
create table if not exists public.saved_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  data jsonb not null check (pg_column_size(data) < 4000),
  created_at timestamptz not null default now()
);
alter table public.saved_configs enable row level security;
drop policy if exists "configuraciones: propias" on public.saved_configs;
create policy "configuraciones: propias" on public.saved_configs for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and (select count(*) from public.saved_configs c where c.user_id = auth.uid()) < 30);

-- ---------- Reuniones ----------
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  starts_at timestamptz not null,
  topic text not null check (char_length(topic) between 3 and 300),
  status text not null default 'solicitada' check (status in ('solicitada', 'confirmada', 'cancelada')),
  created_at timestamptz not null default now()
);
create index if not exists meetings_user_idx on public.meetings (user_id, starts_at desc);
alter table public.meetings enable row level security;
revoke insert, update on public.meetings from anon, authenticated;
grant insert (user_id, lead_id, starts_at, topic) on public.meetings to authenticated;
grant update (status) on public.meetings to authenticated;
drop policy if exists "reuniones: leer" on public.meetings;
create policy "reuniones: leer" on public.meetings for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "reuniones: pedir" on public.meetings;
create policy "reuniones: pedir" on public.meetings for insert to authenticated with check (
  user_id = auth.uid() and starts_at > now()
  and (select count(*) from public.meetings m where m.user_id = auth.uid() and m.status = 'solicitada') < 5
);
drop policy if exists "reuniones: cambiar estado" on public.meetings;
create policy "reuniones: cambiar estado" on public.meetings for update
  using (user_id = auth.uid() or public.is_admin())
  with check (public.is_admin() or status = 'cancelada');

-- ---------- Servicios activos (los gestiona el admin) ----------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  kind text not null default 'otro' check (kind in ('datacenter', 'servidores', 'software', 'ia', 'cloud', 'otro')),
  status text not null default 'activo' check (status in ('activo', 'mantenimiento', 'suspendido')),
  uptime numeric(5, 2) check (uptime between 0 and 100),
  notes text check (char_length(notes) <= 500),
  created_at timestamptz not null default now()
);
alter table public.services enable row level security;
drop policy if exists "servicios: leer" on public.services;
create policy "servicios: leer" on public.services for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "servicios: admin" on public.services;
create policy "servicios: admin" on public.services for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Documentos (archivos privados en Storage) ----------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  path text not null unique,
  size bigint,
  created_at timestamptz not null default now()
);
alter table public.documents enable row level security;
drop policy if exists "documentos: leer" on public.documents;
create policy "documentos: leer" on public.documents for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "documentos: admin" on public.documents;
create policy "documentos: admin" on public.documents for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 20971520, array[
  'application/pdf', 'image/png', 'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
])
on conflict (id) do nothing;

-- Cada cliente solo ve su carpeta (documents/<su id>/...); el admin ve y sube todo.
drop policy if exists "documentos storage: leer" on storage.objects;
create policy "documentos storage: leer" on storage.objects for select to authenticated using (
  bucket_id = 'documents' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
);
drop policy if exists "documentos storage: subir" on storage.objects;
create policy "documentos storage: subir" on storage.objects for insert to authenticated with check (
  bucket_id = 'documents' and public.is_admin()
);
drop policy if exists "documentos storage: borrar" on storage.objects;
create policy "documentos storage: borrar" on storage.objects for delete to authenticated using (
  bucket_id = 'documents' and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
);

-- ---------- Avisos automáticos ----------
create or replace function public.on_lead_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.user_id is not null and new.status is distinct from old.status then
    perform public.notify(new.user_id, 'Tu solicitud cambió de estado',
      case new.status
        when 'contactado' then 'Un especialista está en conversación contigo.'
        when 'cerrado' then 'Tu solicitud fue cerrada.'
        else 'Tu solicitud fue recibida.'
      end,
      '/cuenta/solicitudes/' || new.id);
  end if;
  return new;
end;
$$;
drop trigger if exists on_lead_status on public.leads;
create trigger on_lead_status after update of status on public.leads
  for each row execute function public.on_lead_status();

create or replace function public.on_lead_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  if new.is_staff then
    select user_id into owner from public.leads where id = new.lead_id;
    if owner is not null then
      perform public.notify(owner, 'Nuevo mensaje de OMNIA', left(new.body, 140), '/cuenta/solicitudes/' || new.lead_id);
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists on_lead_message on public.lead_messages;
create trigger on_lead_message after insert on public.lead_messages
  for each row execute function public.on_lead_message();

create or replace function public.on_meeting_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and auth.uid() is distinct from new.user_id then
    perform public.notify(new.user_id,
      case new.status when 'confirmada' then 'Reunión confirmada' else 'Reunión cancelada' end,
      new.topic, '/cuenta/reuniones');
  end if;
  return new;
end;
$$;
drop trigger if exists on_meeting_status on public.meetings;
create trigger on_meeting_status after update of status on public.meetings
  for each row execute function public.on_meeting_status();

create or replace function public.on_document()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(new.user_id, 'Nuevo documento disponible', new.name, '/cuenta/documentos');
  return new;
end;
$$;
drop trigger if exists on_document on public.documents;
create trigger on_document after insert on public.documents
  for each row execute function public.on_document();

create or replace function public.on_service()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    perform public.notify(new.user_id, 'Nuevo servicio activo', new.name, '/cuenta');
  elsif new.status is distinct from old.status then
    perform public.notify(new.user_id, 'Cambio en tu servicio', new.name || ': ' || new.status, '/cuenta');
  end if;
  return new;
end;
$$;
drop trigger if exists on_service on public.services;
create trigger on_service after insert or update of status on public.services
  for each row execute function public.on_service();

-- ---------- Eliminar mi cuenta (derecho de supresión) ----------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'No autenticado';
  end if;
  delete from public.leads where user_id = uid;
  delete from auth.users where id = uid;
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Las funciones internas no se pueden llamar desde la API pública.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_role() from public, anon, authenticated;
revoke execute on function public.leads_throttle() from public, anon, authenticated;
revoke execute on function public.notify(uuid, text, text, text) from public, anon, authenticated;
revoke execute on function public.on_lead_status() from public, anon, authenticated;
revoke execute on function public.on_lead_message() from public, anon, authenticated;
revoke execute on function public.on_meeting_status() from public, anon, authenticated;
revoke execute on function public.on_document() from public, anon, authenticated;
revoke execute on function public.on_service() from public, anon, authenticated;

-- =============================================================
-- PRIMER ADMINISTRADOR
-- 1) Regístrate en la web (/acceso) con tu correo.
-- 2) Ejecuta esta línea cambiando el correo:
-- update public.profiles set role = 'admin' where email = 'tu-correo@ejemplo.com';
-- =============================================================
