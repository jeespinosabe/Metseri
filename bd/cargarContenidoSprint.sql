-- Metseri: contenido del sprint para los doce cuerpos ya existentes.
-- Ejecutar COMPLETO en Supabase > SQL Editor, como postgres.
-- No ejecutar de nuevo el script de creacion del modelo.
-- Conserva UUID, relaciones, contenido ya completo y registros ajenos.
-- Completa ausencias, corrige descripciones fuera de 30-50 palabras y publica.
-- Libros provisionales: fichas editoriales reales, no catalogo confirmado
-- de la biblioteca. verificado/activo se habilitan para las pruebas del sprint.
-- No cambia esquema, funciones, politicas RLS ni credenciales.
-- Fuentes y diferencias respecto al PDF: bd/README.md.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

create temporary table contenidoSprint on commit drop as
select * from jsonb_to_recordset($fichas$
[
  {
    "slug": "mercurio",
    "nombre": "Mercurio",
    "tipo": "planeta",
    "planeta_slug": null,
    "clasificacion": "Planeta rocoso",
    "subtitulo": "El más cercano al Sol",
    "descripcion_breve": "Mercurio es el planeta más cercano al Sol y el más pequeño del sistema solar. Tiene una superficie rocosa llena de cráteres, casi no posee atmósfera y experimenta cambios extremos de temperatura entre el día y la noche.",
    "imagen_path": "/imagenes/planetas/mercurio.webp",
    "imagen_alt": "Imagen de Mercurio",
    "imagen_credito": "NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington",
    "imagen_origen_url": "https://science.nasa.gov/wp-content/uploads/2023/05/mercury-from-messenger-pia15160-1920x640-1.jpg",
    "diametro_km": 4879,
    "distancia_sol_millones_km": 57.9,
    "distancia_planeta_km": null,
    "rotacion_horas": 1407.6,
    "orbita_dias": 88.0,
    "curiosidades": [
      "Aunque es el planeta más próximo al Sol, Venus alcanza temperaturas superficiales más altas.",
      "En algunos cráteres cercanos a sus polos se ha detectado hielo de agua, protegido de la luz solar directa."
    ]
  },
  {
    "slug": "venus",
    "nombre": "Venus",
    "tipo": "planeta",
    "planeta_slug": null,
    "clasificacion": "Planeta rocoso",
    "subtitulo": "El más caliente",
    "descripcion_breve": "Venus es un planeta rocoso envuelto por nubes muy densas. Su atmósfera, rica en dióxido de carbono, atrapa gran cantidad de calor y lo convierte en el planeta más caliente del sistema solar, a pesar de no ser el más cercano al Sol.",
    "imagen_path": "/imagenes/planetas/venus.webp",
    "imagen_alt": "Imagen de Venus",
    "imagen_credito": "NASA/JPL-Caltech",
    "imagen_origen_url": "https://science.nasa.gov/wp-content/uploads/2024/03/venus-mariner-10-pia23791-fig2-16x9-1.jpg",
    "diametro_km": 12104,
    "distancia_sol_millones_km": 108.2,
    "distancia_planeta_km": null,
    "rotacion_horas": -5832.5,
    "orbita_dias": 224.7,
    "curiosidades": [
      "En Venus, el Sol parece salir por el oeste porque gira en sentido contrario al de la mayoría de los planetas.",
      "Su presión atmosférica en la superficie es unas 90 veces mayor que la terrestre."
    ]
  },
  {
    "slug": "tierra",
    "nombre": "Tierra",
    "tipo": "planeta",
    "planeta_slug": null,
    "clasificacion": "Nuestro hogar · Planeta rocoso",
    "subtitulo": "Nuestro hogar",
    "descripcion_breve": "La Tierra es el tercer planeta desde el Sol y nuestro hogar. Posee océanos de agua líquida, una atmósfera que ayuda a regular la temperatura y un campo magnético que nos protege de muchas partículas solares. Es el único mundo con vida confirmada.",
    "imagen_path": "/imagenes/planetas/tierra.webp",
    "imagen_alt": "Imagen de Tierra",
    "imagen_credito": "NASA",
    "imagen_origen_url": "https://science.nasa.gov/wp-content/uploads/2023/05/earth-1-jpg.webp",
    "diametro_km": 12756,
    "distancia_sol_millones_km": 149.6,
    "distancia_planeta_km": null,
    "rotacion_horas": 23.9,
    "orbita_dias": 365.2,
    "curiosidades": [
      "Cerca del 70 % de su superficie está cubierta por agua.",
      "Su inclinación axial, de aproximadamente 23,4 grados, contribuye a las estaciones del año."
    ]
  },
  {
    "slug": "marte",
    "nombre": "Marte",
    "tipo": "planeta",
    "planeta_slug": null,
    "clasificacion": "Planeta rocoso",
    "subtitulo": "El planeta rojo",
    "descripcion_breve": "Marte es un planeta frío y desértico, conocido por su color rojizo debido a los minerales de hierro oxidados presentes en el suelo. Conserva huellas de antiguos ríos y lagos, por lo que es un lugar importante para investigar el pasado del agua.",
    "imagen_path": "/imagenes/planetas/marte.webp",
    "imagen_alt": "Imagen de Marte",
    "imagen_credito": "NASA/JPL-Caltech",
    "imagen_origen_url": "https://science.nasa.gov/wp-content/uploads/2016/05/1-mars-nasa-gov-jpg.webp",
    "diametro_km": 6792,
    "distancia_sol_millones_km": 228.0,
    "distancia_planeta_km": null,
    "rotacion_horas": 24.6,
    "orbita_dias": 687.0,
    "curiosidades": [
      "El monte Olimpo es uno de los volcanes más grandes conocidos del sistema solar.",
      "Sus dos lunas, Fobos y Deimos, son pequeñas y de forma irregular."
    ]
  },
  {
    "slug": "jupiter",
    "nombre": "Júpiter",
    "tipo": "planeta",
    "planeta_slug": null,
    "clasificacion": "Gigante gaseoso",
    "subtitulo": "El más grande",
    "descripcion_breve": "Júpiter es el planeta más grande del sistema solar. Está compuesto principalmente de hidrógeno y helio, y muestra bandas de nubes en constante movimiento. Su atmósfera alberga enormes tormentas, entre ellas la Gran Mancha Roja, observada desde hace siglos.",
    "imagen_path": "/imagenes/planetas/jupiter.webp",
    "imagen_alt": "Imagen de Júpiter",
    "imagen_credito": "Kevin M. Gill (CC BY), a partir de NASA/JPL-Caltech/SwRI/MSSS",
    "imagen_origen_url": "https://science.nasa.gov/wp-content/uploads/2024/03/jupiter-marble-pia22946-16x9-1.jpg",
    "diametro_km": 142984,
    "distancia_sol_millones_km": 778.5,
    "distancia_planeta_km": null,
    "rotacion_horas": 9.9,
    "orbita_dias": 4331,
    "curiosidades": [
      "Tiene el día más corto de todos los planetas: gira en unas diez horas.",
      "Su Gran Mancha Roja es una tormenta gigantesca que ha cambiado de tamaño con el tiempo."
    ]
  },
  {
    "slug": "saturno",
    "nombre": "Saturno",
    "tipo": "planeta",
    "planeta_slug": null,
    "clasificacion": "Gigante gaseoso",
    "subtitulo": "Un mundo de anillos",
    "descripcion_breve": "Saturno es un gigante gaseoso famoso por su extenso sistema de anillos, formados principalmente por fragmentos de hielo y pequeñas cantidades de roca y polvo. Es el segundo planeta más grande del sistema solar y posee numerosos satélites naturales.",
    "imagen_path": "/imagenes/planetas/saturno.webp",
    "imagen_alt": "Imagen de Saturno",
    "imagen_credito": "NASA/JPL-Caltech/Space Science Institute",
    "imagen_origen_url": "https://science.nasa.gov/wp-content/uploads/2024/03/saturn-farewell-pia21345.jpg",
    "diametro_km": 120536,
    "distancia_sol_millones_km": 1432.0,
    "distancia_planeta_km": null,
    "rotacion_horas": 10.7,
    "orbita_dias": 10747,
    "curiosidades": [
      "Sus anillos son enormes en extensión, pero comparativamente muy delgados.",
      "Su densidad media es menor que la del agua, aunque eso no significa que pudiera flotar en un océano real."
    ]
  },
  {
    "slug": "urano",
    "nombre": "Urano",
    "tipo": "planeta",
    "planeta_slug": null,
    "clasificacion": "Gigante helado",
    "subtitulo": "Gira casi de lado",
    "descripcion_breve": "Urano es un gigante helado de color azul verdoso, provocado en parte por el metano de su atmósfera. Su eje de rotación está inclinado casi de lado, una característica que produce estaciones muy extremas durante su larga vuelta alrededor del Sol.",
    "imagen_path": "/imagenes/planetas/urano.webp",
    "imagen_alt": "Imagen de Urano",
    "imagen_credito": "NASA/JPL-Caltech",
    "imagen_origen_url": "https://science.nasa.gov/wp-content/uploads/2016/05/uranus-jpg.webp",
    "diametro_km": 51118,
    "distancia_sol_millones_km": 2867.0,
    "distancia_planeta_km": null,
    "rotacion_horas": -17.2,
    "orbita_dias": 30589,
    "curiosidades": [
      "Su eje está inclinado cerca de 98°, por lo que parece girar acostado.",
      "Tiene anillos oscuros que resultan difíciles de observar desde la Tierra."
    ]
  },
  {
    "slug": "neptuno",
    "nombre": "Neptuno",
    "tipo": "planeta",
    "planeta_slug": null,
    "clasificacion": "Gigante helado",
    "subtitulo": "El planeta más lejano",
    "descripcion_breve": "Neptuno es el planeta más lejano del Sol y un gigante helado de tonos azules. Su atmósfera es muy activa, con nubes y vientos extraordinariamente intensos. Se encuentra tan lejos que la luz solar tarda varias horas en llegar hasta él.",
    "imagen_path": "/imagenes/planetas/neptuno.webp",
    "imagen_alt": "Imagen de Neptuno",
    "imagen_credito": "NASA/JPL-Caltech",
    "imagen_origen_url": "https://science.nasa.gov/wp-content/uploads/2024/03/pia01492-neptune-full-disk-16x9-1.jpg",
    "diametro_km": 49528,
    "distancia_sol_millones_km": 4515.0,
    "distancia_planeta_km": null,
    "rotacion_horas": 16.1,
    "orbita_dias": 59800,
    "curiosidades": [
      "Allí se han registrado algunos de los vientos más rápidos del sistema solar.",
      "Fue descubierto en 1846 a partir de cálculos matemáticos y observaciones telescópicas."
    ]
  },
  {
    "slug": "luna",
    "nombre": "Luna",
    "tipo": "satelite",
    "planeta_slug": "tierra",
    "clasificacion": "Satélite natural de la Tierra",
    "subtitulo": "La compañera natural de la Tierra",
    "descripcion_breve": "La Luna es el único satélite natural permanente de la Tierra. Su superficie rocosa conserva numerosos cráteres de impacto y antiguas llanuras de lava. Su gravedad influye en las mareas y su movimiento alrededor de nuestro planeta produce las fases lunares.",
    "imagen_path": "/imagenes/satelites/luna.webp",
    "imagen_alt": "La Luna llena fotografiada desde la Estación Espacial Internacional",
    "imagen_credito": "NASA",
    "imagen_origen_url": "https://www.nasa.gov/wp-content/uploads/2023/03/iss068e039237.jpg",
    "diametro_km": 3475,
    "distancia_sol_millones_km": null,
    "distancia_planeta_km": 384400,
    "rotacion_horas": 655.2,
    "orbita_dias": 27.3,
    "curiosidades": [
      "Su rotación está sincronizada con su órbita y por eso vemos casi siempre la misma cara.",
      "Las misiones Apolo trajeron muestras de roca lunar para su estudio científico."
    ]
  },
  {
    "slug": "europa",
    "nombre": "Europa",
    "tipo": "satelite",
    "planeta_slug": "jupiter",
    "clasificacion": "Satélite natural de Júpiter",
    "subtitulo": "Un océano bajo el hielo",
    "descripcion_breve": "Europa es una luna de Júpiter cuya superficie está cubierta por una corteza de hielo atravesada por grietas. Existen pruebas sólidas de un océano de agua salada bajo esa capa, lo que la convierte en un objetivo importante para estudiar la habitabilidad.",
    "imagen_path": "/imagenes/satelites/europa.webp",
    "imagen_alt": "Europa con su superficie clara cruzada por líneas rojizas, vista por Galileo",
    "imagen_credito": "NASA/JPL-Caltech/SETI Institute",
    "imagen_origen_url": "https://science.nasa.gov/wp-content/uploads/2024/07/pia19048-europa-stunning-surface.jpg",
    "diametro_km": 3122,
    "distancia_sol_millones_km": null,
    "distancia_planeta_km": 671100,
    "rotacion_horas": 85.2,
    "orbita_dias": 3.55,
    "curiosidades": [
      "Los científicos consideran que su océano podría contener más agua que todos los océanos de la Tierra juntos.",
      "La misión Europa Clipper fue diseñada para estudiar si Europa reúne condiciones adecuadas para la vida; no se ha demostrado que haya vida allí."
    ]
  },
  {
    "slug": "titan",
    "nombre": "Titán",
    "tipo": "satelite",
    "planeta_slug": "saturno",
    "clasificacion": "Satélite natural de Saturno",
    "subtitulo": "Una luna con atmósfera densa",
    "descripcion_breve": "Titán es la luna más grande de Saturno y posee una atmósfera densa, poco común entre los satélites naturales. En su superficie existen ríos, lagos y mares de metano y etano líquidos. También se investiga la posibilidad de un océano subterráneo.",
    "imagen_path": "/imagenes/satelites/titan.webp",
    "imagen_alt": "Titán cubierto de bruma amarillenta, fotografiado por Cassini",
    "imagen_credito": "NASA/JPL/Space Science Institute",
    "imagen_origen_url": "https://science.nasa.gov/wp-content/uploads/2023/06/pia11548-titan-16x9-1.jpg",
    "diametro_km": 5150,
    "distancia_sol_millones_km": null,
    "distancia_planeta_km": 1221900,
    "rotacion_horas": 382.8,
    "orbita_dias": 15.95,
    "curiosidades": [
      "Es la única luna conocida con líquidos estables en su superficie.",
      "Su atmósfera espesa impide observar directamente la superficie con cámaras de luz visible desde el espacio."
    ]
  },
  {
    "slug": "triton",
    "nombre": "Tritón",
    "tipo": "satelite",
    "planeta_slug": "neptuno",
    "clasificacion": "Satélite natural de Neptuno",
    "subtitulo": "Una órbita en sentido contrario",
    "descripcion_breve": "Tritón es la luna más grande de Neptuno y destaca por recorrer una órbita retrógrada, opuesta al sentido de rotación de su planeta. Su superficie es muy fría y contiene hielos de nitrógeno. La sonda Voyager 2 observó actividad de géiseres.",
    "imagen_path": "/imagenes/satelites/triton.webp",
    "imagen_alt": "Mosaico de la superficie de Tritón obtenido por Voyager 2",
    "imagen_credito": "NASA/JPL/USGS",
    "imagen_origen_url": "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/07/PIA00317_modest.jpg?w=654&h=509&fit=clip",
    "diametro_km": 2705,
    "distancia_sol_millones_km": null,
    "distancia_planeta_km": 354800,
    "rotacion_horas": -141.12,
    "orbita_dias": 5.88,
    "curiosidades": [
      "Su movimiento retrógrado sugiere que pudo haber sido capturado por la gravedad de Neptuno.",
      "Voyager 2 detectó chorros de material que salían de su superficie helada."
    ]
  }
]
$fichas$::jsonb) as contenido(
  slug text, nombre text, tipo public.tipo_cuerpo, planeta_slug text,
  clasificacion text, subtitulo text, descripcion_breve text,
  imagen_path text, imagen_alt text, imagen_credito text, imagen_origen_url text,
  diametro_km numeric, distancia_sol_millones_km numeric,
  distancia_planeta_km numeric, rotacion_horas numeric, orbita_dias numeric,
  curiosidades jsonb
);

-- Detenerse si falta un cuerpo o si sus relaciones no son las esperadas.
-- No se recrean cuerpos ni se reasignan sus identificadores.
do $comprobar$
begin
  if (select count(*) from contenidoSprint) <> 12
     or (select count(distinct slug) from contenidoSprint) <> 12 then
    raise exception 'La carga debe contener exactamente los doce slugs del sprint';
  end if;
  if exists (
    select 1 from contenidoSprint s
    left join public.cuerpos_celestes c on c.slug = s.slug
    left join public.cuerpos_celestes p on p.id = c.planeta_id
    where c.id is null or c.tipo <> s.tipo
       or p.slug is distinct from s.planeta_slug
  ) then
    raise exception 'Falta un cuerpo o su tipo/planeta difiere. Revisar antes de cargar; no se modificaron relaciones';
  end if;
  if exists (
    select 1 from contenidoSprint
    where cardinality(regexp_split_to_array(btrim(descripcion_breve), '\s+')) not between 30 and 50
       or jsonb_array_length(curiosidades) <> 2
  ) then
    raise exception 'La fuente debe incluir descripciones de 30-50 palabras y dos curiosidades por cuerpo';
  end if;
end;
$comprobar$;

update public.cuerpos_celestes c
set clasificacion = coalesce(nullif(btrim(c.clasificacion), ''), s.clasificacion),
    subtitulo = coalesce(nullif(btrim(c.subtitulo), ''), s.subtitulo),
    descripcion_breve = case
      when c.descripcion_breve is null
        or cardinality(regexp_split_to_array(btrim(c.descripcion_breve), '\s+')) not between 30 and 50
      then s.descripcion_breve else c.descripcion_breve end,
    imagen_path = coalesce(nullif(btrim(c.imagen_path), ''), s.imagen_path),
    imagen_alt = coalesce(nullif(btrim(c.imagen_alt), ''), s.imagen_alt),
    imagen_credito = coalesce(nullif(btrim(c.imagen_credito), ''), s.imagen_credito),
    imagen_origen_url = coalesce(nullif(btrim(c.imagen_origen_url), ''), s.imagen_origen_url)
from contenidoSprint s
where c.slug = s.slug;

-- rotacion_horas es rotacion sideral, NO dia solar. Signo negativo: retrograda.
-- Los periodos de los satelites se redondean como en el PDF (dias x 24 = horas).
insert into public.datos_planeta as destino
  (cuerpo_id, diametro_km, distancia_sol_millones_km, rotacion_horas, orbita_dias)
select c.id, s.diametro_km, s.distancia_sol_millones_km, s.rotacion_horas, s.orbita_dias
from contenidoSprint s join public.cuerpos_celestes c on c.slug = s.slug
where s.tipo = 'planeta'
on conflict (cuerpo_id) do update
set diametro_km = coalesce(destino.diametro_km, excluded.diametro_km),
    distancia_sol_millones_km = coalesce(destino.distancia_sol_millones_km, excluded.distancia_sol_millones_km),
    rotacion_horas = coalesce(destino.rotacion_horas, excluded.rotacion_horas),
    orbita_dias = coalesce(destino.orbita_dias, excluded.orbita_dias);

insert into public.datos_satelite as destino
  (cuerpo_id, diametro_km, distancia_planeta_km, rotacion_horas, orbita_dias)
select c.id, s.diametro_km, s.distancia_planeta_km, s.rotacion_horas, s.orbita_dias
from contenidoSprint s join public.cuerpos_celestes c on c.slug = s.slug
where s.tipo = 'satelite'
on conflict (cuerpo_id) do update
set diametro_km = coalesce(destino.diametro_km, excluded.diametro_km),
    distancia_planeta_km = coalesce(destino.distancia_planeta_km, excluded.distancia_planeta_km),
    rotacion_horas = coalesce(destino.rotacion_horas, excluded.rotacion_horas),
    orbita_dias = coalesce(destino.orbita_dias, excluded.orbita_dias);

insert into public.curiosidades (cuerpo_id, texto, orden)
select c.id, curiosidad.texto, curiosidad.orden::smallint
from contenidoSprint s join public.cuerpos_celestes c on c.slug = s.slug
cross join lateral jsonb_array_elements_text(s.curiosidades) with ordinality as curiosidad(texto, orden)
on conflict (cuerpo_id, orden) do nothing;

create temporary table librosSprint (
  titulo text, autor text, editorial text, anio smallint, url_ficha text, orden smallint
) on commit drop;

insert into librosSprint values
  ('Un punto azul pálido', 'Carl Sagan', 'Editorial Planeta', 2006,
   'https://www.planetadelibros.com/libro-un-punto-azul-palido/9700', 1),
  ('Astrofísica para gente con prisas', 'Neil deGrasse Tyson', 'Ediciones Paidós', 2026,
   'https://www.planetadelibros.com/libro-astrofisica-para-gente-con-prisas/257363?soporte=450044', 2);

insert into public.autores (nombre)
select distinct autor from librosSprint
on conflict do nothing;

-- No sobrescribir libros que ya tenga cargados la biblioteca o un companero.
insert into public.libros
  (titulo, editorial, anio, url_ficha, verificado, verificado_en, activo)
select titulo, editorial, anio, url_ficha, true, current_timestamp, true
from librosSprint
on conflict (titulo, editorial, anio) do nothing;

insert into public.libros_autores (libro_id, autor_id, orden)
select l.id, a.id, 1
from librosSprint s
join public.libros l on l.titulo = s.titulo and l.editorial = s.editorial and l.anio = s.anio
join public.autores a on lower(btrim(a.nombre)) = lower(btrim(s.autor))
on conflict (libro_id, autor_id) do nothing;

-- Dos lecturas generales por cuerpo; no se declaran fuentes de sus cifras.
insert into public.cuerpo_libro (cuerpo_id, libro_id, orden, es_fuente_de_ficha)
select c.id, l.id, s.orden, false
from contenidoSprint contenido
join public.cuerpos_celestes c on c.slug = contenido.slug
cross join librosSprint s
join public.libros l on l.titulo = s.titulo and l.editorial = s.editorial and l.anio = s.anio
on conflict (cuerpo_id, libro_id) do nothing;

-- Publicar solo los doce cuerpos de esta carga, al terminar sus datos.
update public.cuerpos_celestes c
set publicado = true
from contenidoSprint s
where c.slug = s.slug and not c.publicado;

-- Comprobaciones dentro de la misma transaccion: un fallo revierte toda la carga.
do $verificar$
begin
  if exists (
    select 1 from public.v_pendientes_astronomicos p
    join contenidoSprint s on s.slug = p.slug
  ) then
    raise exception 'Persisten pendientes astronomicos en los doce cuerpos; se cancela la carga';
  end if;
  if exists (
    select 1 from public.cuerpos_celestes c join contenidoSprint s on s.slug = c.slug
    where not c.publicado
       or nullif(btrim(c.clasificacion), '') is null
       or nullif(btrim(c.subtitulo), '') is null
       or nullif(btrim(c.imagen_path), '') is null
       or nullif(btrim(c.imagen_alt), '') is null
       or nullif(btrim(c.imagen_credito), '') is null
       or nullif(btrim(c.imagen_origen_url), '') is null
       or (select count(*) from public.curiosidades q where q.cuerpo_id = c.id) <> 2
  ) then
    raise exception 'Faltan campos editoriales, imagenes o dos curiosidades por cuerpo';
  end if;
  if (select count(*) from librosSprint s
      join public.libros l on l.titulo = s.titulo and l.editorial = s.editorial and l.anio = s.anio
      where l.verificado and l.activo and l.verificado_en is not null
        and l.url_ficha = s.url_ficha) <> 2 then
    raise exception 'Un libro ya existente tiene otra configuracion; revisar sin sobrescribirlo';
  end if;
  if exists (
    select 1 from contenidoSprint s
    where (select count(*) from public.v_libros_por_cuerpo v
           join librosSprint l on l.titulo = v.titulo and l.editorial = v.editorial and l.anio = v.anio
           where v.cuerpo_slug = s.slug and nullif(btrim(v.autor), '') is not null) <> 2
       or public.ficha_cuerpo(s.slug)->>'slug' is distinct from s.slug
  ) then
    raise exception 'No se recuperan la ficha y sus dos libros por los recursos actuales de la API';
  end if;
end;
$verificar$;

commit;

-- Resultado esperado en el estado compartido: doce filas, 30-50 palabras,
-- dos curiosidades y dos libros por cuerpo. Otros libros previos se conservan.
select c.slug, c.publicado,
       cardinality(regexp_split_to_array(btrim(c.descripcion_breve), '\s+')) as palabras_descripcion,
       (select count(*) from public.curiosidades q where q.cuerpo_id = c.id) as curiosidades,
       (select count(*) from public.v_libros_por_cuerpo v where v.cuerpo_id = c.id) as libros
from public.cuerpos_celestes c
where c.slug in ('mercurio', 'venus', 'tierra', 'marte', 'jupiter', 'saturno',
                 'urano', 'neptuno', 'luna', 'europa', 'titan', 'triton')
order by c.orden;

-- Debe devolver cero filas para estos doce cuerpos.
select * from public.v_pendientes_astronomicos
where slug in ('mercurio', 'venus', 'tierra', 'marte', 'jupiter', 'saturno',
               'urano', 'neptuno', 'luna', 'europa', 'titan', 'triton');
