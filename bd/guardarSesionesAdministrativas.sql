-- Ejecutar en el SQL Editor de Supabase antes de desplegar la API de sesiones compartidas.
begin;

create table if not exists public.sesiones_administrativas (
  huella text primary key check (huella ~ '^[0-9a-f]{64}$'),
  vence_en timestamptz not null default (now() + interval '8 hours')
);
create index if not exists sesiones_administrativas_vence_en_idx on public.sesiones_administrativas (vence_en);

alter table public.sesiones_administrativas enable row level security;
revoke all on public.sesiones_administrativas from public, anon, authenticated;
grant select, insert, delete on public.sesiones_administrativas to service_role;

create or replace function public."crearSesionAdministrativa"(p_huella text)
returns boolean language sql security invoker set search_path = '' as $$
  delete from public.sesiones_administrativas where vence_en <= now();
  insert into public.sesiones_administrativas(huella) values (p_huella);
  select true;
$$;

create or replace function public."consultarSesionAdministrativa"(p_huella text)
returns boolean language sql stable security invoker set search_path = '' as $$
  select exists (
    select 1 from public.sesiones_administrativas where huella = p_huella and vence_en > now()
  );
$$;

create or replace function public."revocarSesionAdministrativa"(p_huella text)
returns boolean language sql security invoker set search_path = '' as $$
  delete from public.sesiones_administrativas where huella = p_huella;
  select true;
$$;

revoke all on function public."crearSesionAdministrativa"(text), public."consultarSesionAdministrativa"(text),
  public."revocarSesionAdministrativa"(text) from public, anon, authenticated;
grant usage on schema public to service_role;
grant execute on function public."crearSesionAdministrativa"(text), public."consultarSesionAdministrativa"(text),
  public."revocarSesionAdministrativa"(text) to service_role;

notify pgrst, 'reload schema';
commit;
