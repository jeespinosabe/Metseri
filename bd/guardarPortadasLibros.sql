-- Ejecutar después de agregarGestionBibliografica.sql y publicarLibrosActivos.sql.
begin;

create table if not exists public.portadas_libros (
  libro_id uuid primary key references public.libros(id) on delete cascade,
  datos bytea not null check (octet_length(datos) between 5 and 786432
    and substr(datos, 1, 3) = decode('ffd8ff', 'hex')
    and substr(datos, octet_length(datos) - 1) = decode('ffd9', 'hex')),
  x smallint not null check (x between 0 and 100),
  y smallint not null check (y between 0 and 100),
  version uuid not null default gen_random_uuid()
);

alter table public.portadas_libros enable row level security;
revoke all on public.portadas_libros from public, anon, authenticated;
grant select, insert, update, delete on public.portadas_libros to service_role;

create or replace function public."obtenerLibroAdministrativo"(p_id uuid)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare resultado jsonb;
begin
  select to_jsonb(l) || jsonb_build_object(
    'autores', coalesce((select jsonb_agg(jsonb_build_object(
      'id', a.id, 'nombre', a.nombre, 'orden', la.orden) order by la.orden)
      from public.libros_autores la join public.autores a on a.id = la.autor_id
      where la.libro_id = l.id), '[]'::jsonb),
    'cuerpos', coalesce((select jsonb_agg(jsonb_build_object(
      'id', c.id, 'slug', c.slug, 'nombre', c.nombre, 'orden', cl.orden,
      'es_fuente_de_ficha', cl.es_fuente_de_ficha) order by cl.orden, c.slug)
      from public.cuerpo_libro cl join public.cuerpos_celestes c on c.id = cl.cuerpo_id
      where cl.libro_id = l.id), '[]'::jsonb),
    'portada', case when p.libro_id is not null then jsonb_build_object('version', p.version, 'x', p.x, 'y', p.y) end)
  into resultado from public.libros l left join public.portadas_libros p on p.libro_id = l.id where l.id = p_id;
  if resultado is null then raise exception using errcode = 'P0002', message = 'Libro inexistente'; end if;
  return resultado;
end $$;

create or replace function public."guardarLibroConPortada"(p_id uuid, p_datos jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  identificador uuid := p_id;
  datos_libro jsonb := p_datos - 'portada';
  portada jsonb := p_datos->'portada';
begin
  if p_id is null or datos_libro <> '{}'::jsonb then
    identificador := (public."guardarLibroAdministrativo"(p_id, datos_libro)->>'id')::uuid;
  else
    perform 1 from public.libros where id = p_id for update;
    if not found then raise exception using errcode = 'P0002', message = 'Libro inexistente'; end if;
  end if;

  if portada = 'null'::jsonb then
    delete from public.portadas_libros where libro_id = identificador;
  elsif jsonb_typeof(portada) is distinct from 'object'
    or coalesce(portada->>'x', '') !~ '^(100|[0-9]{1,2})$'
    or coalesce(portada->>'y', '') !~ '^(100|[0-9]{1,2})$' then
    raise exception using errcode = '22023', message = 'Portada inválida';
  elsif portada ? 'datos' then
    if coalesce(length(portada->>'datos'), 0) not between 1 and 1048576 then
      raise exception using errcode = '22023', message = 'Tamaño de portada inválido';
    end if;
    insert into public.portadas_libros (libro_id, datos, x, y)
    values (identificador, decode(portada->>'datos', 'base64'), (portada->>'x')::smallint, (portada->>'y')::smallint)
    on conflict (libro_id) do update set datos = excluded.datos, x = excluded.x, y = excluded.y, version = excluded.version;
  else
    update public.portadas_libros
    set x = (portada->>'x')::smallint, y = (portada->>'y')::smallint, version = gen_random_uuid()
    where libro_id = identificador and version = (portada->>'version')::uuid;
    if not found then raise exception using errcode = '40001', message = 'La portada cambió durante la edición'; end if;
  end if;
  return public."obtenerLibroAdministrativo"(identificador);
end $$;

create or replace view public.v_libros_por_cuerpo
with (security_invoker = false, security_barrier = true)
as
select cl.cuerpo_id, c.slug as cuerpo_slug, l.id as libro_id, l.titulo, l.url_ficha,
  (select pg_catalog.string_agg(a.nombre, ', ' order by la.orden)
   from public.libros_autores la join public.autores a on a.id = la.autor_id
   where la.libro_id = l.id) as autor,
  l.editorial, l.anio, cl.orden,
  case when p.libro_id is not null then jsonb_build_object('version', p.version, 'x', p.x, 'y', p.y) end as portada
from public.cuerpo_libro cl
join public.cuerpos_celestes c on c.id = cl.cuerpo_id
join public.libros l on l.id = cl.libro_id
left join public.portadas_libros p on p.libro_id = l.id
where c.publicado and l.activo
order by cl.cuerpo_id, cl.orden;

create or replace function public."obtenerPortadaAdministrativa"(p_id uuid)
returns text language sql stable security invoker set search_path = '' as $$
  select replace(encode(p.datos, 'base64'), chr(10), '')
  from public.portadas_libros p where p.libro_id = p_id;
$$;

create or replace function public."obtenerPortadaPublica"(p_slug text, p_id uuid)
returns text language sql stable security definer set search_path = '' as $$
  select replace(encode(p.datos, 'base64'), chr(10), '')
  from public.portadas_libros p
  where p.libro_id = p_id and exists (
    select 1 from public.v_libros_por_cuerpo l where l.libro_id = p_id and l.cuerpo_slug = p_slug
  );
$$;

revoke all on function public."guardarLibroConPortada"(uuid, jsonb), public."obtenerPortadaAdministrativa"(uuid),
  public."obtenerPortadaPublica"(text, uuid) from public, anon, authenticated;
grant execute on function public."guardarLibroConPortada"(uuid, jsonb), public."obtenerPortadaAdministrativa"(uuid) to service_role;
grant execute on function public."obtenerPortadaPublica"(text, uuid) to anon, authenticated;

notify pgrst, 'reload schema';
commit;
