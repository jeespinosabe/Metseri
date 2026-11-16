-- Ejecutar en el SQL Editor del proyecto Metseri con el rol postgres.
begin;

-- Las fichas y el listado público consultan esta vista. Su proyección y
-- permisos existentes se conservan. Las tablas base mantienen sus políticas.
create or replace view public.v_libros_por_cuerpo
with (security_invoker = false, security_barrier = true)
as
select cl.cuerpo_id, c.slug as cuerpo_slug, l.id as libro_id, l.titulo, l.url_ficha,
  (select pg_catalog.string_agg(a.nombre, ', ' order by la.orden)
   from public.libros_autores la
   join public.autores a on a.id = la.autor_id
   where la.libro_id = l.id) as autor,
  l.editorial, l.anio, cl.orden
from public.cuerpo_libro cl
join public.cuerpos_celestes c on c.id = cl.cuerpo_id
join public.libros l on l.id = cl.libro_id
where c.publicado and l.activo
order by cl.cuerpo_id, cl.orden;

-- Ajustar solo la frase original que describía el filtro anterior.
update public.cuerpos_celestes
set contenido_ficha = jsonb_set(contenido_ficha, '{descubrir_libros}', to_jsonb(replace(
  contenido_ficha->>'descubrir_libros',
  'los libros físicos verificados de la Biblioteca «Solón Argüello»',
  'los libros recomendados'
)), false)
where contenido_ficha->>'descubrir_libros' like '%los libros físicos verificados de la Biblioteca «Solón Argüello»%';

notify pgrst, 'reload schema';
commit;
