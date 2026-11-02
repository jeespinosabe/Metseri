-- Metseri: correccion de las doce fichas con el PDF del equipo (31/10/2026).
-- Ejecutar COMPLETO como postgres en Supabase > SQL Editor.
-- No ejecutar el script antiguo cargarContenidoSprint.sql.
-- Conserva cuerpos, UUID, relaciones, imagenes y registros ajenos a la carga.
-- Crea un respaldo privado ANTES de reemplazar contenido o retirar libros.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

create temporary table fichasPdf on commit drop as
select * from jsonb_to_recordset($fichasPdf$
[
  {
    "slug": "mercurio",
    "nombre": "Mercurio",
    "tipo": "planeta",
    "planeta_slug": null,
    "clasificacion": "EL MÁS CERCANO AL SOL · PLANETA ROCOSO",
    "descripcion_breve": "Mercurio es el planeta más cercano al Sol y el más pequeño del sistema solar. Tiene una superficie rocosa llena de cráteres, casi no posee atmósfera y experimenta cambios extremos de temperatura entre el día y la noche.",
    "contenido_ficha": {
      "documento": "Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica",
      "pagina_pdf": 3,
      "tipo": "Planeta rocoso",
      "datos_principales": [
        {
          "etiqueta": "Diámetro",
          "valor": "4 879 km"
        },
        {
          "etiqueta": "Distancia media al Sol",
          "valor": "57,9 millones de km"
        },
        {
          "etiqueta": "Duración del día",
          "valor": "176 días terrestres (día solar)"
        },
        {
          "etiqueta": "Duración del año",
          "valor": "88 días terrestres"
        }
      ],
      "descubrir_libros": "Conoce más sobre Mercurio mediante los libros físicos verificados de la Biblioteca «Solón Argüello» que se relacionen con este tema. Explóralos desde Metseri.",
      "respaldo_cientifico": "(NASA)."
    },
    "diametro_km": 4879,
    "distancia_sol_millones_km": 57.9,
    "distancia_planeta_km": null,
    "rotacion_horas": null,
    "dia_solar_horas": 4224,
    "orbita_dias": 88,
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
    "clasificacion": "EL MÁS CALIENTE · PLANETA ROCOSO",
    "descripcion_breve": "Venus es un planeta rocoso envuelto por nubes muy densas. Su atmósfera, rica en dióxido de carbono, atrapa gran cantidad de calor y lo convierte en el planeta más caliente del sistema solar, a pesar de no ser el más cercano al Sol.",
    "contenido_ficha": {
      "documento": "Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica",
      "pagina_pdf": 4,
      "tipo": "Planeta rocoso",
      "datos_principales": [
        {
          "etiqueta": "Diámetro",
          "valor": "12 104 km"
        },
        {
          "etiqueta": "Distancia media al Sol",
          "valor": "108,2 millones de km"
        },
        {
          "etiqueta": "Duración del día",
          "valor": "116,8 días terrestres (día solar)"
        },
        {
          "etiqueta": "Duración del año",
          "valor": "224,7 días terrestres"
        }
      ],
      "descubrir_libros": "Conoce más sobre Venus mediante los libros físicos verificados de la Biblioteca «Solón Argüello» que se relacionen con este tema. Explóralos desde Metseri.",
      "respaldo_cientifico": "(NASA)."
    },
    "diametro_km": 12104,
    "distancia_sol_millones_km": 108.2,
    "distancia_planeta_km": null,
    "rotacion_horas": null,
    "dia_solar_horas": 2803.2,
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
    "clasificacion": "NUESTRO HOGAR · PLANETA ROCOSO",
    "descripcion_breve": "La Tierra es el tercer planeta desde el Sol y nuestro hogar. Posee océanos de agua líquida, una atmósfera que ayuda a regular la temperatura y un campo magnético que nos protege de muchas partículas solares. Es el único mundo con vida confirmada.",
    "contenido_ficha": {
      "documento": "Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica",
      "pagina_pdf": 5,
      "tipo": "Planeta rocoso",
      "datos_principales": [
        {
          "etiqueta": "Diámetro",
          "valor": "12 756 km"
        },
        {
          "etiqueta": "Distancia media al Sol",
          "valor": "149,6 millones de km"
        },
        {
          "etiqueta": "Duración del día",
          "valor": "24 horas (día solar)"
        },
        {
          "etiqueta": "Duración del año",
          "valor": "365,2 días terrestres"
        }
      ],
      "descubrir_libros": "Conoce más sobre Tierra mediante los libros físicos verificados de la Biblioteca «Solón Argüello» que se relacionen con este tema. Explóralos desde Metseri.",
      "respaldo_cientifico": "(NASA)."
    },
    "diametro_km": 12756,
    "distancia_sol_millones_km": 149.6,
    "distancia_planeta_km": null,
    "rotacion_horas": null,
    "dia_solar_horas": 24,
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
    "clasificacion": "EL PLANETA ROJO · PLANETA ROCOSO",
    "descripcion_breve": "Marte es un planeta frío y desértico, conocido por su color rojizo debido a los minerales de hierro oxidados presentes en el suelo. Conserva huellas de antiguos ríos y lagos, por lo que es un lugar importante para investigar el pasado del agua.",
    "contenido_ficha": {
      "documento": "Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica",
      "pagina_pdf": 6,
      "tipo": "Planeta rocoso",
      "datos_principales": [
        {
          "etiqueta": "Diámetro",
          "valor": "6 792 km"
        },
        {
          "etiqueta": "Distancia media al Sol",
          "valor": "228,0 millones de km"
        },
        {
          "etiqueta": "Duración del día",
          "valor": "24,7 horas (día solar)"
        },
        {
          "etiqueta": "Duración del año",
          "valor": "687 días terrestres"
        }
      ],
      "descubrir_libros": "Conoce más sobre Marte mediante los libros físicos verificados de la Biblioteca «Solón Argüello» que se relacionen con este tema. Explóralos desde Metseri.",
      "respaldo_cientifico": "(NASA)."
    },
    "diametro_km": 6792,
    "distancia_sol_millones_km": 228,
    "distancia_planeta_km": null,
    "rotacion_horas": null,
    "dia_solar_horas": 24.7,
    "orbita_dias": 687,
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
    "clasificacion": "EL MÁS GRANDE · GIGANTE GASEOSO",
    "descripcion_breve": "Júpiter es el planeta más grande del sistema solar. Está compuesto principalmente de hidrógeno y helio, y muestra bandas de nubes en constante movimiento. Su atmósfera alberga enormes tormentas, entre ellas la Gran Mancha Roja, observada desde hace siglos.",
    "contenido_ficha": {
      "documento": "Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica",
      "pagina_pdf": 7,
      "tipo": "Gigante gaseoso",
      "datos_principales": [
        {
          "etiqueta": "Diámetro",
          "valor": "142 984 km"
        },
        {
          "etiqueta": "Distancia media al Sol",
          "valor": "778,5 millones de km"
        },
        {
          "etiqueta": "Duración del día",
          "valor": "9,9 horas (aprox.)"
        },
        {
          "etiqueta": "Duración del año",
          "valor": "11,9 años terrestres (aprox.)"
        }
      ],
      "descubrir_libros": "Conoce más sobre Júpiter mediante los libros físicos verificados de la Biblioteca «Solón Argüello» que se relacionen con este tema. Explóralos desde Metseri.",
      "respaldo_cientifico": "(NASA)."
    },
    "diametro_km": 142984,
    "distancia_sol_millones_km": 778.5,
    "distancia_planeta_km": null,
    "rotacion_horas": 9.9,
    "dia_solar_horas": null,
    "orbita_dias": 4346.475,
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
    "clasificacion": "MUNDO DE ANILLOS · GIGANTE GASEOSO",
    "descripcion_breve": "Saturno es un gigante gaseoso famoso por su extenso sistema de anillos, formados principalmente por fragmentos de hielo y pequeñas cantidades de roca y polvo. Es el segundo planeta más grande del sistema solar y posee numerosos satélites naturales.",
    "contenido_ficha": {
      "documento": "Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica",
      "pagina_pdf": 8,
      "tipo": "Gigante gaseoso",
      "datos_principales": [
        {
          "etiqueta": "Diámetro",
          "valor": "120 536 km"
        },
        {
          "etiqueta": "Distancia media al Sol",
          "valor": "1 432,0 millones de km"
        },
        {
          "etiqueta": "Duración del día",
          "valor": "10,7 horas (aprox.)"
        },
        {
          "etiqueta": "Duración del año",
          "valor": "29,4 años terrestres (aprox.)"
        }
      ],
      "descubrir_libros": "Conoce más sobre Saturno mediante los libros físicos verificados de la Biblioteca «Solón Argüello» que se relacionen con este tema. Explóralos desde Metseri.",
      "respaldo_cientifico": "(NASA)."
    },
    "diametro_km": 120536,
    "distancia_sol_millones_km": 1432,
    "distancia_planeta_km": null,
    "rotacion_horas": 10.7,
    "dia_solar_horas": null,
    "orbita_dias": 10738.35,
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
    "clasificacion": "GIRA CASI DE LADO · GIGANTE HELADO",
    "descripcion_breve": "Urano es un gigante helado de color azul verdoso, provocado en parte por el metano de su atmósfera. Su eje de rotación está inclinado casi de lado, una característica que produce estaciones muy extremas durante su larga vuelta alrededor del Sol.",
    "contenido_ficha": {
      "documento": "Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica",
      "pagina_pdf": 9,
      "tipo": "Gigante helado",
      "datos_principales": [
        {
          "etiqueta": "Diámetro",
          "valor": "51 118 km"
        },
        {
          "etiqueta": "Distancia media al Sol",
          "valor": "2 867,0 millones de km"
        },
        {
          "etiqueta": "Duración del día",
          "valor": "17,2 horas (aprox.)"
        },
        {
          "etiqueta": "Duración del año",
          "valor": "84 años terrestres (aprox.)"
        }
      ],
      "descubrir_libros": "Conoce más sobre Urano mediante los libros físicos verificados de la Biblioteca «Solón Argüello» que se relacionen con este tema. Explóralos desde Metseri.",
      "respaldo_cientifico": "(NASA)."
    },
    "diametro_km": 51118,
    "distancia_sol_millones_km": 2867,
    "distancia_planeta_km": null,
    "rotacion_horas": 17.2,
    "dia_solar_horas": null,
    "orbita_dias": 30681,
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
    "clasificacion": "EL MÁS LEJANO · GIGANTE HELADO",
    "descripcion_breve": "Neptuno es el planeta más lejano del Sol y un gigante helado de tonos azules. Su atmósfera es muy activa, con nubes y vientos extraordinariamente intensos. Se encuentra tan lejos que la luz solar tarda varias horas en llegar hasta él.",
    "contenido_ficha": {
      "documento": "Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica",
      "pagina_pdf": 10,
      "tipo": "Gigante helado",
      "datos_principales": [
        {
          "etiqueta": "Diámetro",
          "valor": "49 528 km"
        },
        {
          "etiqueta": "Distancia media al Sol",
          "valor": "4 515,0 millones de km"
        },
        {
          "etiqueta": "Duración del día",
          "valor": "16,1 horas (aprox.)"
        },
        {
          "etiqueta": "Duración del año",
          "valor": "165 años terrestres (aprox.)"
        }
      ],
      "descubrir_libros": "Conoce más sobre Neptuno mediante los libros físicos verificados de la Biblioteca «Solón Argüello» que se relacionen con este tema. Explóralos desde Metseri.",
      "respaldo_cientifico": "(NASA)."
    },
    "diametro_km": 49528,
    "distancia_sol_millones_km": 4515,
    "distancia_planeta_km": null,
    "rotacion_horas": 16.1,
    "dia_solar_horas": null,
    "orbita_dias": 60266.25,
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
    "clasificacion": "SATÉLITE DE LA TIERRA · LUNA NATURAL",
    "descripcion_breve": "La Luna es el único satélite natural permanente de la Tierra. Su superficie rocosa conserva numerosos cráteres de impacto y antiguas llanuras de lava. Su gravedad influye en las mareas y su movimiento alrededor de nuestro planeta produce las fases lunares.",
    "contenido_ficha": {
      "documento": "Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica",
      "pagina_pdf": 11,
      "tipo": "Satélite natural",
      "datos_principales": [
        {
          "etiqueta": "Diámetro medio",
          "valor": "3 475 km"
        },
        {
          "etiqueta": "Distancia orbital media",
          "valor": "384 400 km desde la Tierra"
        },
        {
          "etiqueta": "Período de rotación",
          "valor": "27,3 días terrestres (rotación)"
        },
        {
          "etiqueta": "Período orbital",
          "valor": "27,3 días terrestres (órbita)"
        }
      ],
      "descubrir_libros": "Conoce más sobre Luna mediante los libros físicos verificados de la Biblioteca «Solón Argüello» que se relacionen con este tema. Explóralos desde Metseri.",
      "respaldo_cientifico": "(NASA, Jet Propulsion Laboratory)."
    },
    "diametro_km": 3475,
    "distancia_sol_millones_km": null,
    "distancia_planeta_km": 384400,
    "rotacion_horas": 655.2,
    "dia_solar_horas": null,
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
    "clasificacion": "SATÉLITE DE JÚPITER · LUNA HELADA",
    "descripcion_breve": "Europa es una luna de Júpiter cuya superficie está cubierta por una corteza de hielo atravesada por grietas. Existen pruebas sólidas de un océano de agua salada bajo esa capa, lo que la convierte en un objetivo importante para estudiar la habitabilidad.",
    "contenido_ficha": {
      "documento": "Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica",
      "pagina_pdf": 12,
      "tipo": "Satélite natural",
      "datos_principales": [
        {
          "etiqueta": "Diámetro medio",
          "valor": "3 122 km"
        },
        {
          "etiqueta": "Distancia orbital media",
          "valor": "671 100 km desde Júpiter"
        },
        {
          "etiqueta": "Período de rotación",
          "valor": "3,55 días terrestres (rotación)"
        },
        {
          "etiqueta": "Período orbital",
          "valor": "3,55 días terrestres (órbita)"
        }
      ],
      "descubrir_libros": "Conoce más sobre Europa mediante los libros físicos verificados de la Biblioteca «Solón Argüello» que se relacionen con este tema. Explóralos desde Metseri.",
      "respaldo_cientifico": "(NASA, Jet Propulsion Laboratory)."
    },
    "diametro_km": 3122,
    "distancia_sol_millones_km": null,
    "distancia_planeta_km": 671100,
    "rotacion_horas": 85.2,
    "dia_solar_horas": null,
    "orbita_dias": 3.55,
    "curiosidades": [
      "Los científicos consideran que su océano podría contener más agua que todos los océanos de la Tierra juntos.",
      "La misión Europa Clipper estudia si existen ambientes adecuados para la vida; no se ha demostrado que haya vida allí."
    ]
  },
  {
    "slug": "titan",
    "nombre": "Titán",
    "tipo": "satelite",
    "planeta_slug": "saturno",
    "clasificacion": "SATÉLITE DE SATURNO · ATMÓSFERA DENSA",
    "descripcion_breve": "Titán es la luna más grande de Saturno y posee una atmósfera densa, poco común entre los satélites naturales. En su superficie existen ríos, lagos y mares de metano y etano líquidos. También se investiga la posibilidad de un océano subterráneo.",
    "contenido_ficha": {
      "documento": "Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica",
      "pagina_pdf": 13,
      "tipo": "Satélite natural",
      "datos_principales": [
        {
          "etiqueta": "Diámetro medio",
          "valor": "5 150 km"
        },
        {
          "etiqueta": "Distancia orbital media",
          "valor": "1 221 900 km desde Saturno"
        },
        {
          "etiqueta": "Período de rotación",
          "valor": "15,95 días terrestres (rotación)"
        },
        {
          "etiqueta": "Período orbital",
          "valor": "15,95 días terrestres (órbita)"
        }
      ],
      "descubrir_libros": "Conoce más sobre Titán mediante los libros físicos verificados de la Biblioteca «Solón Argüello» que se relacionen con este tema. Explóralos desde Metseri.",
      "respaldo_cientifico": "(NASA; Jet Propulsion Laboratory)."
    },
    "diametro_km": 5150,
    "distancia_sol_millones_km": null,
    "distancia_planeta_km": 1221900,
    "rotacion_horas": 382.8,
    "dia_solar_horas": null,
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
    "clasificacion": "SATÉLITE DE NEPTUNO · ÓRBITA RETRÓGRADA",
    "descripcion_breve": "Tritón es la luna más grande de Neptuno y destaca por recorrer una órbita retrógrada, opuesta al sentido de rotación de su planeta. Su superficie es muy fría y contiene hielos de nitrógeno. La sonda Voyager 2 observó actividad de géiseres.",
    "contenido_ficha": {
      "documento": "Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica",
      "pagina_pdf": 14,
      "tipo": "Satélite natural",
      "datos_principales": [
        {
          "etiqueta": "Diámetro medio",
          "valor": "2 705 km"
        },
        {
          "etiqueta": "Distancia orbital media",
          "valor": "354 800 km desde Neptuno"
        },
        {
          "etiqueta": "Período de rotación",
          "valor": "5,88 días terrestres (rotación)"
        },
        {
          "etiqueta": "Período orbital",
          "valor": "5,88 días terrestres (órbita)"
        }
      ],
      "descubrir_libros": "Conoce más sobre Tritón mediante los libros físicos verificados de la Biblioteca «Solón Argüello» que se relacionen con este tema. Explóralos desde Metseri.",
      "respaldo_cientifico": "(NASA; Jet Propulsion Laboratory)."
    },
    "diametro_km": 2705,
    "distancia_sol_millones_km": null,
    "distancia_planeta_km": 354800,
    "rotacion_horas": 141.12,
    "dia_solar_horas": null,
    "orbita_dias": 5.88,
    "curiosidades": [
      "Su movimiento retrógrado sugiere que pudo haber sido capturado por la gravedad de Neptuno.",
      "Voyager 2 detectó chorros de material que salían de su superficie helada."
    ]
  }
]
$fichasPdf$::jsonb) as ficha(
  slug text, nombre text, tipo public.tipo_cuerpo, planeta_slug text,
  clasificacion text, descripcion_breve text, contenido_ficha jsonb,
  diametro_km numeric, distancia_sol_millones_km numeric,
  distancia_planeta_km numeric, rotacion_horas numeric,
  dia_solar_horas numeric, orbita_dias numeric, curiosidades jsonb
);

-- UUID observados mediante GET antes de preparar esta correccion.
create temporary table librosRetirar (
  id uuid primary key, titulo text, editorial text, anio smallint,
  url_ficha text, autor text
) on commit drop;
insert into librosRetirar values
  ('940c5977-49c6-456e-9c0e-957218173207', 'Un punto azul pálido',
   'Editorial Planeta', 2006,
   'https://www.planetadelibros.com/libro-un-punto-azul-palido/9700', 'Carl Sagan'),
  ('b6e140d5-98e8-4fa9-a0d4-f43c4ace3b3b', 'Astrofísica para gente con prisas',
   'Ediciones Paidós', 2026,
   'https://www.planetadelibros.com/libro-astrofisica-para-gente-con-prisas/257363?soporte=450044',
   'Neil deGrasse Tyson');

-- Bloquea escrituras concurrentes durante el respaldo y la correccion.
lock table public.cuerpos_celestes, public.datos_planeta, public.datos_satelite,
  public.curiosidades, public.libros, public.autores,
  public.cuerpo_libro, public.libros_autores in share row exclusive mode;

do $comprobar$
begin
  if (select count(*) from fichasPdf) <> 12
     or (select count(distinct slug) from fichasPdf) <> 12 then
    raise exception 'La fuente debe contener los doce cuerpos del PDF';
  end if;
  if exists (
    select 1 from fichasPdf f
    left join public.cuerpos_celestes c on c.slug = f.slug
    left join public.cuerpos_celestes p on p.id = c.planeta_id
    where c.id is null or c.nombre <> f.nombre or c.tipo <> f.tipo
       or p.slug is distinct from f.planeta_slug
       or nullif(btrim(c.imagen_path), '') is null
  ) then
    raise exception 'Falta un cuerpo, su imagen o difiere su identidad/planeta; revisar sin recrear cuerpos';
  end if;
  if exists (
    select 1 from fichasPdf
    where jsonb_array_length(curiosidades) <> 2
       or jsonb_array_length(contenido_ficha->'datos_principales') <> 4
       or cardinality(regexp_split_to_array(btrim(descripcion_breve), '\s+')) not between 30 and 50
  ) then
    raise exception 'Una ficha no cumple la estructura editorial del PDF';
  end if;
  if exists (
    select 1 from librosRetirar r join public.libros l on l.id = r.id
    where l.titulo is distinct from r.titulo
       or l.editorial is distinct from r.editorial or l.anio is distinct from r.anio
       or l.url_ficha is distinct from r.url_ficha or l.verificado_por is not null
       or (select count(*) from public.libros_autores la where la.libro_id = l.id) <> 1
       or not exists (
         select 1 from public.libros_autores la
         join public.autores a on a.id = la.autor_id
         where la.libro_id = l.id and a.nombre = r.autor
       )
       or exists (
         select 1 from public.cuerpo_libro cl
         join public.cuerpos_celestes c on c.id = cl.cuerpo_id
         where cl.libro_id = l.id
           and (cl.es_fuente_de_ficha or c.slug not in (select slug from fichasPdf))
       )
  ) then
    raise exception 'Un libro provisional fue modificado o reutilizado: se cancela TODO para revisarlo';
  end if;
end;
$comprobar$;

-- Respaldo fuera del esquema public: no queda expuesto por la API de contenido.
-- La primera copia se conserva al repetir el archivo.
create schema if not exists respaldo_pdf_20261102;
revoke all on schema respaldo_pdf_20261102 from public, anon, authenticated;
create table if not exists respaldo_pdf_20261102.contenido_anterior (
  id smallint primary key check (id = 1),
  guardado_en timestamptz not null default now(),
  contenido jsonb not null
);
revoke all on respaldo_pdf_20261102.contenido_anterior from public, anon, authenticated;

insert into respaldo_pdf_20261102.contenido_anterior (id, contenido)
select 1, jsonb_build_object(
  'cuerpos_celestes', (select coalesce(jsonb_agg(to_jsonb(c)), '[]')
    from public.cuerpos_celestes c where c.slug in (select slug from fichasPdf)),
  'datos_planeta', (select coalesce(jsonb_agg(to_jsonb(d)), '[]')
    from public.datos_planeta d join public.cuerpos_celestes c on c.id = d.cuerpo_id
    where c.slug in (select slug from fichasPdf)),
  'datos_satelite', (select coalesce(jsonb_agg(to_jsonb(d)), '[]')
    from public.datos_satelite d join public.cuerpos_celestes c on c.id = d.cuerpo_id
    where c.slug in (select slug from fichasPdf)),
  'curiosidades', (select coalesce(jsonb_agg(to_jsonb(q)), '[]')
    from public.curiosidades q join public.cuerpos_celestes c on c.id = q.cuerpo_id
    where c.slug in (select slug from fichasPdf)),
  'libros', (select coalesce(jsonb_agg(to_jsonb(l)), '[]')
    from public.libros l where l.id in (select id from librosRetirar)),
  'cuerpo_libro', (select coalesce(jsonb_agg(to_jsonb(cl)), '[]')
    from public.cuerpo_libro cl where cl.libro_id in (select id from librosRetirar)),
  'libros_autores', (select coalesce(jsonb_agg(to_jsonb(la)), '[]')
    from public.libros_autores la where la.libro_id in (select id from librosRetirar)),
  'autores', (select coalesce(jsonb_agg(to_jsonb(a)), '[]')
    from public.autores a where a.id in (
      select autor_id from public.libros_autores where libro_id in (select id from librosRetirar))),
  'funcion_ficha', pg_get_functiondef('public.ficha_cuerpo(text)'::regprocedure),
  'vista_pendientes', pg_get_viewdef('public.v_pendientes_astronomicos'::regclass, true)
)
on conflict (id) do nothing;

-- El modelo anterior no distingue el dia solar de la rotacion.
-- El contenido editorial conserva las etiquetas, unidades y redondeos del PDF.
alter table public.cuerpos_celestes add column if not exists contenido_ficha jsonb;
alter table public.datos_planeta add column if not exists dia_solar_horas numeric(14,3)
  check (dia_solar_horas > 0);
comment on column public.cuerpos_celestes.contenido_ficha is
  'Transcripcion editorial del PDF del sprint: pagina, tipo, cuatro datos con sus unidades, invitacion a libros y respaldo cientifico.';
comment on column public.datos_planeta.dia_solar_horas is
  'Duracion del dia solar en horas terrestres; diferente del periodo de rotacion.';

update public.cuerpos_celestes c
set clasificacion = f.clasificacion,
    subtitulo = null, -- El PDF no define otro subtitulo ademas de su etiqueta superior.
    descripcion_breve = f.descripcion_breve,
    contenido_ficha = f.contenido_ficha,
    publicado = true
from fichasPdf f where c.slug = f.slug;

-- Reemplaza los valores de la carga anterior por los del PDF.
-- Rocosos: rotacion_horas queda NULL, ya que el documento solo aporta dia solar.
-- Orbitas expresadas en anos: conversion de almacenamiento 1 ano = 365.25 dias.
-- Para mostrar la ficha se utiliza contenido_ficha, que conserva la cifra literal.
insert into public.datos_planeta
  (cuerpo_id, diametro_km, distancia_sol_millones_km, rotacion_horas, dia_solar_horas, orbita_dias)
select c.id, f.diametro_km, f.distancia_sol_millones_km,
       f.rotacion_horas, f.dia_solar_horas, f.orbita_dias
from fichasPdf f join public.cuerpos_celestes c on c.slug = f.slug
where f.tipo = 'planeta'
on conflict (cuerpo_id) do update
set diametro_km = excluded.diametro_km,
    distancia_sol_millones_km = excluded.distancia_sol_millones_km,
    rotacion_horas = excluded.rotacion_horas,
    dia_solar_horas = excluded.dia_solar_horas,
    orbita_dias = excluded.orbita_dias;

insert into public.datos_satelite
  (cuerpo_id, diametro_km, distancia_planeta_km, rotacion_horas, orbita_dias)
select c.id, f.diametro_km, f.distancia_planeta_km, f.rotacion_horas, f.orbita_dias
from fichasPdf f join public.cuerpos_celestes c on c.slug = f.slug
where f.tipo = 'satelite'
on conflict (cuerpo_id) do update
set diametro_km = excluded.diametro_km,
    distancia_planeta_km = excluded.distancia_planeta_km,
    rotacion_horas = excluded.rotacion_horas,
    orbita_dias = excluded.orbita_dias;

-- Actualiza las dos posiciones existentes, conservando sus UUID.
insert into public.curiosidades (cuerpo_id, texto, orden)
select c.id, q.texto, q.orden::smallint
from fichasPdf f join public.cuerpos_celestes c on c.slug = f.slug
cross join lateral jsonb_array_elements_text(f.curiosidades) with ordinality as q(texto, orden)
on conflict (cuerpo_id, orden) do update set texto = excluded.texto;

create temporary table autoresRetirar on commit drop as
select distinct a.id from public.autores a
join public.libros_autores la on la.autor_id = a.id
join librosRetirar r on r.id = la.libro_id and r.autor = a.nombre;

delete from public.cuerpo_libro where libro_id in (select id from librosRetirar);
delete from public.libros_autores where libro_id in (select id from librosRetirar);
delete from public.libros where id in (select id from librosRetirar);
delete from public.autores a where a.id in (select id from autoresRetirar)
  and not exists (select 1 from public.libros_autores la where la.autor_id = a.id);

-- La vista debe aceptar dia solar O rotacion segun el tipo de ficha del PDF.
-- Modifica solo esa condicion de la definicion actual y conserva las demas.
do $actualizarPendientes$
declare
  definicion text;
  inicioPlanetas integer;
  inicioRotacion integer;
  opciones text;
begin
  select pg_get_viewdef('public.v_pendientes_astronomicos'::regclass, true),
         array_to_string(reloptions, ', ')
    into definicion, opciones
  from pg_class where oid = 'public.v_pendientes_astronomicos'::regclass;
  if position('d.dia_solar_horas' in definicion) = 0 then
    inicioPlanetas := position('FROM datos_planeta d' in definicion);
    if inicioPlanetas = 0 then
      inicioPlanetas := position('FROM public.datos_planeta d' in definicion);
    end if;
    inicioRotacion := position('d.rotacion_horas IS NOT NULL' in substring(definicion from inicioPlanetas));
    if inicioPlanetas = 0 or inicioRotacion = 0
       or coalesce(position('security_invoker=true' in opciones), 0) = 0 then
      raise exception 'La vista de pendientes tiene otra estructura; revisar sin sobrescribirla';
    end if;
    definicion := overlay(definicion placing
      '(d.rotacion_horas IS NOT NULL OR d.dia_solar_horas IS NOT NULL)'
      from inicioPlanetas + inicioRotacion - 1 for length('d.rotacion_horas IS NOT NULL'));
    execute 'create or replace view public.v_pendientes_astronomicos with (' || opciones || ') as ' || definicion;
  end if;
end;
$actualizarPendientes$;

-- Agrega solo una propiedad a la funcion existente; conserva el resto de su
-- definicion y permisos. Si su estructura cambio, cancela para revisarla.
do $actualizarFuncion$
declare
  definicion text;
  actualizada text;
begin
  select pg_get_functiondef('public.ficha_cuerpo(text)'::regprocedure) into definicion;
  if position('''contenido_ficha''' in definicion) = 0 then
    actualizada := regexp_replace(definicion,
      '(''descripcion_breve''\s*,\s*c\.descripcion_breve\s*,)',
      E'\\1\n    ''contenido_ficha'', c.contenido_ficha,');
    if actualizada = definicion then
      raise exception 'La funcion ficha_cuerpo tiene otra estructura; revisar sin sobrescribirla';
    end if;
    execute actualizada;
  elsif position('c.contenido_ficha' in definicion) = 0 then
    raise exception 'La funcion ya define contenido_ficha de otra manera; revisar';
  end if;
end;
$actualizarFuncion$;

do $verificar$
begin
  if exists (
    select 1 from public.v_pendientes_astronomicos p
    join fichasPdf f on f.slug = p.slug
  ) then
    raise exception 'Persisten pendientes: se revierte la correccion completa';
  end if;
  if exists (
    select 1 from fichasPdf f join public.cuerpos_celestes c on c.slug = f.slug
    where c.descripcion_breve is distinct from f.descripcion_breve
       or c.clasificacion is distinct from f.clasificacion
       or c.contenido_ficha is distinct from f.contenido_ficha
       or c.subtitulo is not null or not c.publicado
       or (select jsonb_agg(q.texto order by q.orden)
           from public.curiosidades q where q.cuerpo_id = c.id) is distinct from f.curiosidades
       or public.ficha_cuerpo(f.slug)->'contenido_ficha' is distinct from f.contenido_ficha
  ) then
    raise exception 'Una ficha difiere de la transcripcion del PDF';
  end if;
  if exists (select 1 from public.libros where id in (select id from librosRetirar)) then
    raise exception 'No se retiraron los libros provisionales';
  end if;
  if exists (
    select 1 from fichasPdf f
    join public.cuerpos_celestes c on c.slug = f.slug
    join public.datos_planeta d on d.cuerpo_id = c.id
    where f.tipo = 'planeta' and
      row(d.diametro_km, d.distancia_sol_millones_km, d.rotacion_horas, d.dia_solar_horas, d.orbita_dias)
      is distinct from
      row(f.diametro_km, f.distancia_sol_millones_km, f.rotacion_horas, f.dia_solar_horas, f.orbita_dias)
  ) or exists (
    select 1 from fichasPdf f
    join public.cuerpos_celestes c on c.slug = f.slug
    join public.datos_satelite d on d.cuerpo_id = c.id
    where f.tipo = 'satelite' and
      row(d.diametro_km, d.distancia_planeta_km, d.rotacion_horas, d.orbita_dias)
      is distinct from row(f.diametro_km, f.distancia_planeta_km, f.rotacion_horas, f.orbita_dias)
  ) then
    raise exception 'Los valores numericos no coinciden con la carga del PDF';
  end if;
end;
$verificar$;

notify pgrst, 'reload schema';
commit;

-- Esperado: doce filas, 38-43 palabras, dos curiosidades por cuerpo.
-- Con la carga anterior sin otros libros: libros_publicos = 0.
select c.slug, c.publicado,
  c.contenido_ficha->>'pagina_pdf' as pagina_pdf,
  cardinality(regexp_split_to_array(btrim(c.descripcion_breve), '\s+')) as palabras_descripcion,
  (select count(*) from public.curiosidades q where q.cuerpo_id = c.id) as curiosidades,
  (select count(*) from public.v_libros_por_cuerpo v where v.cuerpo_id = c.id
     and exists (select 1 from public.libros l where l.id = v.libro_id and l.activo and l.verificado)) as libros_publicos
from public.cuerpos_celestes c
where c.slug in ('mercurio', 'venus', 'tierra', 'marte', 'jupiter', 'saturno',
                'urano', 'neptuno', 'luna', 'europa', 'titan', 'triton')
order by c.orden;

-- Esperado: cero filas para los doce cuerpos.
select * from public.v_pendientes_astronomicos
where slug in ('mercurio', 'venus', 'tierra', 'marte', 'jupiter', 'saturno',
               'urano', 'neptuno', 'luna', 'europa', 'titan', 'triton');

-- Ver las cifras literales del PDF, sin convertirlas para presentacion.
select c.slug, d.dato->>'etiqueta' as etiqueta, d.dato->>'valor' as valor
from public.cuerpos_celestes c
cross join lateral jsonb_array_elements(c.contenido_ficha->'datos_principales')
  with ordinality as d(dato, posicion)
where c.slug in ('mercurio', 'venus', 'tierra', 'marte', 'jupiter', 'saturno',
                'urano', 'neptuno', 'luna', 'europa', 'titan', 'triton')
order by c.orden, d.posicion;
