-- Ejecutar en el SQL Editor del proyecto Metseri con el rol postgres, DESPUÉS de
-- agregarGestionBibliografica.sql, publicarLibrosActivos.sql y guardarPortadasLibros.sql.
-- Es transaccional y se puede repetir. No modifica datos de libros ni de autores.
-- Si aparece un error, no ejecutes partes sueltas: ejecuta ROLLBACK; (el editor puede dejar la
-- transacción abierta), corrige lo que indique el mensaje y vuelve a ejecutar el archivo completo.
--
-- Reglas (openspec/changes/validar-libros-y-agregar-menu):
--   libros.titulo     1 a 200 caracteres, sin caracteres de control ni espacios consecutivos,
--                     con al menos una letra o dígito.
--   libros.editorial  obligatoria, 1 a 100 caracteres, con las mismas reglas de texto.
--   libros.anio       opcional; entre 1450 y 2100 en la tabla. El tope dinámico
--                     (año actual + 1) lo aplica guardarLibroAdministrativo.
--   autores.nombre    inicia con una letra y mide de 2 a 100 caracteres.
begin;

-- 1. Verificación previa: si algún dato existente incumple las reglas, la migración se
--    detiene con un mensaje legible y no cambia nada.
do $$
declare
  libros_incumplen integer;
  autores_incumplen integer;
  detalle_libros text;
  detalle_autores text;
begin
  select count(*), pg_catalog.string_agg(id::text, ', ') into libros_incumplen, detalle_libros
  from (select l.id from public.libros l
    where l.editorial is null or btrim(l.editorial) = ''
      or char_length(btrim(l.editorial)) > 100
      or l.editorial ~ '[[:cntrl:]]' or l.editorial ~ '[[:space:]]{2,}' or l.editorial !~ '[[:alnum:]]'
      or char_length(btrim(l.titulo)) > 200
      or l.titulo ~ '[[:cntrl:]]' or l.titulo ~ '[[:space:]]{2,}' or l.titulo !~ '[[:alnum:]]'
      or (l.anio is not null and l.anio not between 1450 and 2100)
    order by l.id limit 20) t;
  select count(*), pg_catalog.string_agg(id::text, ', ') into autores_incumplen, detalle_autores
  from (select a.id from public.autores a
    where btrim(a.nombre) !~ '^[[:alpha:]]' or char_length(btrim(a.nombre)) not between 2 and 100
    order by a.id limit 20) t;
  if libros_incumplen > 0 or autores_incumplen > 0 then
    raise exception 'La migración se detiene: % libro(s) y % autor(es) incumplen las reglas nuevas (se muestran hasta 20). Libros: [%]. Autores: [%]. No se cambió nada; corrígelos y vuelve a ejecutar.',
      libros_incumplen, autores_incumplen, coalesce(detalle_libros, ''), coalesce(detalle_autores, '');
  end if;
end $$;

-- 2. Restricciones de tabla (normales y validadas).
alter table public.libros drop constraint if exists libros_anio_check;
alter table public.libros add constraint libros_anio_check
  check (anio is null or anio between 1450 and 2100);

alter table public.libros drop constraint if exists ck_libro_titulo;
alter table public.libros add constraint ck_libro_titulo
  check (char_length(btrim(titulo)) <= 200 and titulo !~ '[[:cntrl:]]'
    and titulo !~ '[[:space:]]{2,}' and titulo ~ '[[:alnum:]]');

alter table public.libros drop constraint if exists ck_libro_editorial;
alter table public.libros add constraint ck_libro_editorial
  check (editorial is not null and btrim(editorial) <> '' and char_length(btrim(editorial)) <= 100
    and editorial !~ '[[:cntrl:]]' and editorial !~ '[[:space:]]{2,}' and editorial ~ '[[:alnum:]]');

alter table public.autores drop constraint if exists ck_autor_nombre;
alter table public.autores add constraint ck_autor_nombre
  check (btrim(nombre) ~ '^[[:alpha:]]' and char_length(btrim(nombre)) between 2 and 100);

-- 3. Función de guardado. Misma firma y permisos que en agregarGestionBibliografica.sql.
--    Cambios: valida y normaliza título, editorial y año; exige editorial al crear; valida
--    los nombres de autor; y el alta inserta título y editorial juntos (una fila sin
--    editorial violaría ck_libro_editorial).
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
  texto text;
  anio_maximo integer := extract(year from now())::integer + 1;
begin
  if p_datos is null or jsonb_typeof(p_datos) <> 'object' or p_datos = '{}'::jsonb
    or exists (select 1 from jsonb_object_keys(p_datos) k where k not in
      ('titulo', 'editorial', 'anio', 'url_ficha', 'activo', 'verificado', 'autores', 'cuerpos')) then
    raise exception using errcode = '22023', message = 'Campos inválidos';
  end if;

  -- Título: obligatorio al crear; si viene, una sola línea, sin espacios repetidos y con letra o dígito.
  if identificador is null or p_datos ? 'titulo' then
    texto := case when jsonb_typeof(p_datos->'titulo') = 'string' then p_datos->>'titulo' end;
    if texto is null or btrim(texto) = '' then
      raise exception using errcode = '23514', message = 'Escribe el título del libro.', detail = 'titulo';
    elsif texto ~ '[[:cntrl:]]' then
      raise exception using errcode = '23514', message = 'El título no admite saltos de línea ni caracteres de control.', detail = 'titulo';
    end if;
    texto := regexp_replace(btrim(texto), '[[:space:]]+', ' ', 'g');
    if char_length(texto) > 200 then
      raise exception using errcode = '23514', message = 'El título admite hasta 200 caracteres.', detail = 'titulo';
    elsif texto !~ '[[:alnum:]]' then
      raise exception using errcode = '23514', message = 'El título debe contener al menos una letra o un número.', detail = 'titulo';
    end if;
    p_datos := jsonb_set(p_datos, '{titulo}', to_jsonb(texto));
  end if;

  -- Editorial: obligatoria al crear; si viene en una edición, no puede quedar vacía.
  if identificador is null or p_datos ? 'editorial' then
    texto := case when jsonb_typeof(p_datos->'editorial') = 'string' then p_datos->>'editorial' end;
    if texto is null or btrim(texto) = '' then
      raise exception using errcode = '23514', message = 'Escribe la editorial del libro.', detail = 'editorial';
    elsif texto ~ '[[:cntrl:]]' then
      raise exception using errcode = '23514', message = 'La editorial no admite saltos de línea ni caracteres de control.', detail = 'editorial';
    end if;
    texto := regexp_replace(btrim(texto), '[[:space:]]+', ' ', 'g');
    if char_length(texto) > 100 then
      raise exception using errcode = '23514', message = 'La editorial admite hasta 100 caracteres.', detail = 'editorial';
    elsif texto !~ '[[:alnum:]]' then
      raise exception using errcode = '23514', message = 'La editorial debe contener al menos una letra o un número.', detail = 'editorial';
    end if;
    p_datos := jsonb_set(p_datos, '{editorial}', to_jsonb(texto));
  end if;

  -- Año: opcional; cuatro cifras entre 1450 y el año actual + 1.
  if p_datos ? 'anio' and jsonb_typeof(p_datos->'anio') <> 'null' then
    if jsonb_typeof(p_datos->'anio') <> 'number' or (p_datos->>'anio') !~ '^[0-9]{4}$' then
      raise exception using errcode = '23514', message = 'Escribe el año con cuatro cifras, por ejemplo 2020.', detail = 'anio';
    elsif (p_datos->>'anio')::integer not between 1450 and anio_maximo then
      raise exception using errcode = '23514', message = format('Escribe un año entre 1450 y %s.', anio_maximo), detail = 'anio';
    end if;
  end if;

  if identificador is null then
    if not (p_datos ? 'autores') then
      raise exception using errcode = '23514', message = 'Faltan autores';
    end if;
    -- El alta inserta título y editorial juntos para cumplir ck_libro_editorial.
    insert into public.libros(titulo, editorial) values (p_datos->>'titulo', p_datos->>'editorial')
      returning id into identificador;
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
      raise exception using errcode = '23514', message = 'Autoría inválida', detail = 'autores';
    end if;
    if jsonb_array_length(p_datos->'autores') not between 1 and 50
      or exists (select 1 from jsonb_array_elements(p_datos->'autores') a
        where jsonb_typeof(a) <> 'string' or char_length(btrim(a #>> '{}')) not between 2 and 100
          or btrim(a #>> '{}') !~ '^[[:alpha:]]') then
      raise exception using errcode = '23514', detail = 'autores',
        message = 'Escribe de 1 a 50 autores; cada nombre inicia con una letra y mide de 2 a 100 caracteres.';
    end if;
    if (select count(*) <> count(distinct lower(btrim(a))) from jsonb_array_elements_text(p_datos->'autores') a) then
      raise exception using errcode = '23514', message = 'Escribe cada nombre una sola vez.', detail = 'autores';
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

revoke all on function public."guardarLibroAdministrativo"(uuid, jsonb) from public, anon, authenticated;
grant execute on function public."guardarLibroAdministrativo"(uuid, jsonb) to service_role;

notify pgrst, 'reload schema';
commit;
