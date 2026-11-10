-- Ejecutar UNA VEZ como postgres después del módulo 01 y las correcciones existentes.
-- Se puede repetir. No vuelve a cargar cuerpos ni modifica las políticas públicas.
begin;

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
      where cl.libro_id = l.id), '[]'::jsonb)) into resultado
  from public.libros l where l.id = p_id;
  if resultado is null then raise exception using errcode = 'P0002', message = 'Libro inexistente'; end if;
  return resultado;
end $$;

create or replace function public."listarLibrosAdministrativos"(p_limite integer default 50, p_desplazamiento integer default 0)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
begin
  if p_limite is null or p_limite not between 1 and 100 or p_desplazamiento is null
    or p_desplazamiento not between 0 and 9999999 then
    raise exception using errcode = '22023', message = 'Paginación inválida';
  end if;
  return coalesce((select jsonb_agg(public."obtenerLibroAdministrativo"(t.id) order by t.creado_en desc, t.id)
    from (select id, creado_en from public.libros order by creado_en desc, id
      limit p_limite offset p_desplazamiento) t), '[]'::jsonb);
end $$;

create or replace function public."guardarLibroAdministrativo"(p_id uuid, p_datos jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  anterior public.libros%rowtype;
  identificador uuid := p_id;
  datos jsonb;
  autor record;
  id_autor uuid;
  relacion jsonb;
  id_cuerpo uuid;
  verificar boolean;
begin
  if p_datos is null or jsonb_typeof(p_datos) <> 'object' or p_datos = '{}'::jsonb
    or exists (select 1 from jsonb_object_keys(p_datos) k where k not in
      ('titulo', 'editorial', 'anio', 'url_ficha', 'activo', 'verificado', 'autores', 'cuerpos')) then
    raise exception using errcode = '22023', message = 'Campos inválidos';
  end if;
  if identificador is null then
    if not (p_datos ? 'autores') then
      raise exception using errcode = '23514', message = 'Faltan autores';
    end if;
    insert into public.libros(titulo) values (btrim(p_datos->>'titulo')) returning id into identificador;
  end if;
  select * into anterior from public.libros where id = identificador for update;
  if not found then raise exception using errcode = 'P0002', message = 'Libro inexistente'; end if;
  datos := to_jsonb(anterior) || p_datos;
  verificar := (datos->>'verificado')::boolean;
  -- Cambiar datos bibliográficos invalida una verificación previa salvo confirmación explícita.
  if not (p_datos ? 'verificado') and (
    (datos->>'titulo', datos->>'editorial', datos->>'anio', datos->>'url_ficha') is distinct from
    (anterior.titulo, anterior.editorial, anterior.anio::text, anterior.url_ficha)
    or p_datos ? 'autores') then verificar := false; end if;

  if p_datos ? 'autores' then
    if jsonb_typeof(p_datos->'autores') <> 'array' then
      raise exception using errcode = '23514', message = 'Autoría inválida';
    end if;
    if jsonb_array_length(p_datos->'autores') not between 1 and 50
      or exists (select 1 from jsonb_array_elements(p_datos->'autores') a
        where jsonb_typeof(a) <> 'string' or length(btrim(a #>> '{}')) not between 1 and 200)
      or (select count(*) <> count(distinct lower(btrim(a))) from jsonb_array_elements_text(p_datos->'autores') a) then
      raise exception using errcode = '23514', message = 'Autoría vacía o duplicada';
    end if;
    delete from public.libros_autores where libro_id = identificador;
    -- Ordenar los bloqueos por nombre evita invertirlos entre operaciones concurrentes.
    for autor in select btrim(a.nombre) nombre, a.orden from
      jsonb_array_elements_text(p_datos->'autores') with ordinality a(nombre, orden)
      order by lower(btrim(a.nombre)) loop
      insert into public.autores(nombre) values (autor.nombre)
        on conflict ((lower(btrim(nombre)))) do update set nombre = public.autores.nombre
        returning id into id_autor;
      insert into public.libros_autores(libro_id, autor_id, orden)
        values (identificador, id_autor, autor.orden);
    end loop;
  end if;

  if p_datos ? 'cuerpos' then
    if jsonb_typeof(p_datos->'cuerpos') <> 'array' then
      raise exception using errcode = '23514', message = 'Relaciones inválidas';
    end if;
    if jsonb_array_length(p_datos->'cuerpos') > 100 or exists (
      select 1 from jsonb_array_elements(p_datos->'cuerpos') r
      where jsonb_typeof(r) <> 'object' or r->>'slug' is null or r->>'orden' is null
        or r->>'slug' !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
        or r->>'orden' !~ '^[0-9]+$')
      or (select count(*) <> count(distinct r->>'slug') from jsonb_array_elements(p_datos->'cuerpos') r) then
      raise exception using errcode = '23514', message = 'Relaciones inválidas o duplicadas';
    end if;
    if exists (select 1 from public.cuerpo_libro cl join public.cuerpos_celestes c on c.id = cl.cuerpo_id
      where cl.libro_id = identificador and cl.es_fuente_de_ficha
      and not exists (select 1 from jsonb_array_elements(p_datos->'cuerpos') r where r->>'slug' = c.slug)) then
      raise exception using errcode = 'P0001', message = 'Libro utilizado como fuente';
    end if;
    -- Conservar la marca de fuente de las relaciones que permanecen.
    delete from public.cuerpo_libro cl where cl.libro_id = identificador
      and not exists (select 1 from jsonb_array_elements(p_datos->'cuerpos') r
        join public.cuerpos_celestes c on c.slug = r->>'slug' where c.id = cl.cuerpo_id);
    for relacion in select value from jsonb_array_elements(p_datos->'cuerpos') loop
      select id into id_cuerpo from public.cuerpos_celestes where slug = relacion->>'slug';
      if not found then raise exception using errcode = '23503', message = 'Cuerpo inexistente'; end if;
      insert into public.cuerpo_libro(cuerpo_id, libro_id, orden)
        values (id_cuerpo, identificador, (relacion->>'orden')::smallint)
        on conflict (cuerpo_id, libro_id) do update set orden = excluded.orden;
    end loop;
  end if;

  if verificar and not exists (select 1 from public.libros_autores where libro_id = identificador) then
    raise exception using errcode = '23514', message = 'Un libro verificado requiere autores';
  end if;
  update public.libros set titulo = btrim(datos->>'titulo'), editorial = datos->>'editorial',
    anio = (datos->>'anio')::smallint, url_ficha = datos->>'url_ficha',
    activo = (datos->>'activo')::boolean, verificado = verificar,
    verificado_en = case when verificar then
      case when p_datos ? 'verificado' then now() else anterior.verificado_en end else null end,
    verificado_por = case when verificar and not (p_datos ? 'verificado') then anterior.verificado_por else null end
    where id = identificador;
  return public."obtenerLibroAdministrativo"(identificador);
end $$;

create or replace function public."eliminarLibroAdministrativo"(p_id uuid)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.libros where id = p_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Libro inexistente'; end if;
  if exists (select 1 from public.cuerpo_libro where libro_id = p_id and es_fuente_de_ficha) then
    raise exception using errcode = 'P0001', message = 'Libro utilizado como fuente';
  end if;
  delete from public.libros where id = p_id;
  return true;
end $$;

revoke all on function public."obtenerLibroAdministrativo"(uuid), public."listarLibrosAdministrativos"(integer, integer),
  public."guardarLibroAdministrativo"(uuid, jsonb), public."eliminarLibroAdministrativo"(uuid) from public, anon, authenticated;
grant usage on schema public to service_role;
grant select on public.cuerpos_celestes to service_role;
grant select, insert, update, delete on public.libros, public.autores, public.libros_autores, public.cuerpo_libro to service_role;
grant execute on function public."obtenerLibroAdministrativo"(uuid), public."listarLibrosAdministrativos"(integer, integer),
  public."guardarLibroAdministrativo"(uuid, jsonb), public."eliminarLibroAdministrativo"(uuid) to service_role;

notify pgrst, 'reload schema';
commit;
