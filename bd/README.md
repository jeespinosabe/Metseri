# Carga de contenido del sprint

`cargarContenidoSprint.sql` completa los doce cuerpos ya creados en Supabase y los publica para la API. Es una carga previa a la integración UX/UI de las fichas; no implementa todavía esa interfaz.

## Cómo ejecutarla

1. Abrir el proyecto de Metseri en Supabase y entrar a **SQL Editor → New query**.
2. Copiar **todo** `cargarContenidoSprint.sql` y ejecutarlo como `postgres`. No ejecutar otra vez el script original de creación de tablas.
3. Revisar las doce filas del resumen final: `publicado = true`, entre 30 y 50 palabras por descripción, dos curiosidades y dos libros por cuerpo en el estado compartido. Si ya había más libros, se conservan y el total puede ser mayor.
4. La última consulta de pendientes debe devolver cero filas para los doce slugs.
5. Iniciar la API con `npm run start:api`, ejecutar `npm run test:integracion` y comprobar en Postman el listado, una ficha y sus libros. Se esperan doce cuerpos públicos; Tierra conserva su UUID configurado en `.env`.

El archivo incluye `BEGIN`/`COMMIT` y comprobaciones antes de confirmar. Ante un error, no continuar pegando partes: ejecutar `ROLLBACK;` si el editor mantiene la transacción abierta, revisar el mensaje y volver a ejecutar el archivo completo una vez corregida la causa. Una relación planetaria distinta o un libro coincidente con otra configuración provoca una cancelación para evitar sobrescribirlo.

## Contenido incluido y conservación de datos

- Doce descripciones del PDF aportado, todas dentro de 30–50 palabras, más subtítulos y clasificación.
- Ocho registros de datos planetarios y cuatro de satélites, con cuatro magnitudes por cuerpo.
- Dos curiosidades por cuerpo y metadatos de las doce imágenes locales, incluidos los cuatro satélites.
- Dos libros, dos autores y 24 asociaciones, con enlaces editoriales utilizables.
- Publicación de los doce cuerpos al terminar sus datos, sin cambiar RLS, funciones, vistas, contraseñas o esquema permanente.

Los cuerpos se buscan por `slug`; no se insertan de nuevo ni se cambian sus UUID, nombre, tipo, orden o `planeta_id`. Los campos completos previos se conservan. Los valores numéricos solo se completan cuando son nulos; las curiosidades existentes conservan su posición y texto. Se reemplazan las descripciones ausentes o fuera del rango editorial, incluida la descripción corta de Tierra compartida por la usuaria. Volver a ejecutar no duplica cuerpos, autores, libros, curiosidades ni asociaciones.

«Campos llenos» se refiere a la información necesaria de las fichas. `planeta_id` debe seguir siendo nulo en los planetas; `verificado_por` queda nulo cuando no hay una persona verificadora real. No se inventan usuarios ni relaciones para rellenar columnas técnicas.

## Cifras y fuentes

Los textos y curiosidades proceden del documento del equipo **Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica**, páginas 3–14, fechado el 31 de octubre de 2026. La curiosidad de Europa Clipper se redacta como objetivo de la misión, evitando afirmar que ya haya demostrado vida.

Los datos planetarios se contrastaron con la [tabla métrica de NASA](https://nssdc.gsfc.nasa.gov/planetary/factsheet/). Se conserva su precisión publicada, con distancias en millones de km, rotación sideral en horas y órbitas en días. El signo negativo indica rotación retrógrada. La interfaz deberá rotular este campo como **Período de rotación**, según el diseño OpenSpec: el código previo «Un día dura» no distingue el día solar.

| Cuerpo | Rotación almacenada, horas | Órbita almacenada, días |
|---|---:|---:|
| Mercurio | 1407.6 | 88 |
| Venus | -5832.5 | 224.7 |
| Tierra | 23.9 | 365.2 |
| Marte | 24.6 | 687 |
| Júpiter | 9.9 | 4331 |
| Saturno | 10.7 | 10747 |
| Urano | -17.2 | 30589 |
| Neptuno | 16.1 | 59800 |

Por eso algunas cifras difieren del PDF: este utiliza día solar para los rocosos y años redondeados para los planetas exteriores. No se guardan los 176 días solares de Mercurio como si fueran rotación. Se trata de magnitudes o precisiones diferentes, no de una conversión directa entre ellas. La distinción se documenta también en las fichas de [Mercurio](https://science.nasa.gov/mercury/facts/) y [Venus](https://science.nasa.gov/venus/venus-facts/) de NASA.

Para los satélites se mantienen los redondeos educativos del PDF: Luna 27.3 días, Europa 3.55, Titán 15.95 y Tritón 5.88; se multiplican por 24 para almacenarlos en horas y se expresa el sentido retrógrado de Tritón con signo negativo. Sus diámetros se redondean a km. Referencias de contraste: [parámetros físicos de JPL](https://ssd.jpl.nasa.gov/sats/phys_par/), [elementos orbitales de JPL](https://ssd.jpl.nasa.gov/sats/elem/) y fichas de NASA para [Luna](https://science.nasa.gov/moon/facts/), [Europa](https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/), [Titán](https://science.nasa.gov/saturn/moons/titan/facts/) y [Tritón](https://science.nasa.gov/neptune/moons/triton/). Son valores aproximados de divulgación, no efemérides para cálculos de navegación.

Las rutas, alternativas, créditos y URLs de imagen se reutilizan de `src/datos/cuerposCelestes.js`; se comprobó que los doce archivos existen en `public/`.

## Libros provisionales

Por indicación de la usuaria, se usa el esquema actual, sin añadir campos o etiquetas de demostración. Los títulos y metadatos son reales; su presencia en el acervo de la Biblioteca «Solón Argüello» todavía no está confirmada. Las URLs son fichas del editor, no del catálogo de esa biblioteca.

| Título | Autor | Editorial | Año de la edición enlazada |
|---|---|---|---:|
| [Un punto azul pálido](https://www.planetadelibros.com/libro-un-punto-azul-palido/9700) | Carl Sagan | Editorial Planeta | 2006 |
| [Astrofísica para gente con prisas](https://www.planetadelibros.com/libro-astrofisica-para-gente-con-prisas/257363?soporte=450044) | Neil deGrasse Tyson | Ediciones Paidós | 2026 |

Se asocian como lecturas generales a los doce cuerpos con `es_fuente_de_ficha = false`: no se presentan como origen de las cifras. Se crean con `verificado = true`, `activo = true` y fecha para que sean visibles mediante las políticas actuales durante las pruebas del sprint. Esta habilitación provisional no acredita una verificación física en la biblioteca. Cuando llegue su catálogo se revisarán o retirarán estos registros y asociaciones; el script no elimina datos.

## Comprobación realizada antes de entregar

El 2 de noviembre de 2026 se ejecutó el esquema original compartido y esta carga en PostgreSQL temporal mediante PGlite, sin conectarse ni escribir en Supabase. Se verificaron:

- Doce cuerpos publicados, 24 curiosidades, dos libros y 24 asociaciones; cero pendientes astronómicos.
- Conservación de UUID y relaciones; repetición sin duplicados ni cambios de contenido.
- Conservación de descripciones, subtítulos, datos y curiosidades previos válidos, así como cuerpos y libros ajenos a la carga.
- Lectura como `anon` mediante las vistas y función existentes, con registros privados ocultos y las doce fichas compatibles con el servicio actual de la API.
- Reversión total si una luna tiene una relación diferente o un libro coincidente está previamente sin verificar.

## Verificación posterior en Supabase real

El 2 de noviembre de 2026 la usuaria ejecutó el archivo en el SQL Editor y compartió el resumen: doce cuerpos publicados, descripciones de 38–43 palabras, dos curiosidades y dos libros por cuerpo.

Después se inició una instancia temporal de la API local con la configuración de Supabase del proyecto y se realizaron únicamente consultas GET:

- Listado público: HTTP 200 con los doce slugs esperados.
- Ficha y libros de cada uno de los doce cuerpos: HTTP 200, cuatro datos principales completos, dos curiosidades y dos libros con título, autoría, editorial, año y URL.
- UUID comparados con los doce registros originales compartidos por la usuaria: sin cambios.
- Tipos, relaciones planetarias, descripciones, imágenes, cifras y curiosidades: coinciden con la carga; las asociaciones bibliográficas coinciden entre ficha completa y endpoint de libros.
- Colección Postman: seis peticiones y doce comprobaciones, sin fallos, incluidos los errores 400 y 404 esperados. Se ejecutó localmente sin publicar resultados en Postman Cloud.

La instancia temporal se cerró al terminar y no se modificó Supabase durante la comprobación. La vista privada de pendientes no se consultó con las credenciales públicas. Esta verificación acredita la carga y la recuperación por API; la integración visual de ese contenido con las fichas normales y VR sigue siendo el siguiente avance de OpenSpec. Los dos libros siguen siendo provisionales respecto al catálogo de la biblioteca.
