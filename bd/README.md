# Corrección de las fichas a partir del PDF

Fuente: **Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica**, documento del equipo fechado el 31 de octubre de 2026. Las fichas corresponden a las páginas 3–14.

El archivo `corregirContenidoDesdePdf.sql` reemplaza la carga anterior del sprint. **La usuaria ya ejecutó la corrección en Supabase y se comprobó la lectura de las doce fichas mediante la API.** No hay que ejecutar de nuevo el esquema original ni el antiguo `cargarContenidoSprint.sql`.

## Ejecutar en Supabase

1. Abrir el proyecto de Metseri → **SQL Editor → New query**, usando el rol `postgres`.
2. Copiar **todo** `corregirContenidoDesdePdf.sql` y pulsar **Run**. El editor puede señalar las instrucciones `DELETE`: están limitadas a los dos UUID bibliográficos indicados en el archivo, sus asociaciones y sus autores si quedan sin otros libros. No se elimina ningún cuerpo celeste ni se vacían tablas.
3. Revisar los resultados finales: 12 cuerpos publicados, páginas 3–14, descripciones de 38–43 palabras y 2 curiosidades por cuerpo. Con el estado observado antes de esta corrección habrá **0 libros públicos**, porque el PDF no proporciona títulos.
4. La consulta de pendientes debe devolver **0 filas** para esos doce cuerpos. La última consulta muestra los **48 datos literales** del PDF.

Si aparece un error, no ejecutar partes sueltas. Las instrucciones están en una transacción; ante un fallo ejecutar `ROLLBACK;` si el editor deja la transacción abierta y revisar el mensaje. Una identidad planetaria diferente, un libro provisional reutilizado o una definición de función/vista incompatible detienen la corrección. Si el editor no muestra todas las pestañas de resultados, se pueden ejecutar por separado las tres consultas que aparecen después de `COMMIT`.

## Qué se corrige

- Se sustituyen las descripciones y las dos curiosidades de cada cuerpo por la transcripción del PDF. Esto incluye el texto original de Europa Clipper.
- `clasificacion` contiene la etiqueta superior completa del documento. `subtitulo` queda nulo porque el PDF no define un subtítulo adicional. Se conservan UUID, nombres, slugs, tipos, planetas anfitriones, orden y metadatos de las imágenes existentes.
- Se reemplazan los valores de los ocho planetas y cuatro satélites por los del documento, con las conversiones de unidades explicadas abajo. No se añaden cuerpos nuevos.
- Se añade `cuerpos_celestes.contenido_ficha` para conservar la página de origen, el tipo editorial, las cuatro etiquetas y valores literales, la invitación a «Descubrir libros» y el respaldo científico. La función `ficha_cuerpo` devuelve esa propiedad adicional y conserva los campos anteriores. Las descripciones y curiosidades permanecen en sus tablas habituales.
- Se añade `datos_planeta.dia_solar_horas` para distinguir el día solar de la rotación. Se ajusta únicamente la condición correspondiente de la vista de pendientes. Se mantienen las políticas RLS y los permisos existentes de las tablas públicas.

## Día solar, rotación y años

El PDF especifica **día solar para los cuatro planetas rocosos**, y rotación aproximada para los gigantes. La carga previa usó períodos de rotación para los cuatro rocosos y otras cifras orbitales para los gigantes; eso no reproducía las fichas del documento.

| Cuerpo | Dato del PDF | Almacenamiento |
|---|---|---|
| Mercurio | 176 días terrestres (día solar) | `dia_solar_horas = 4224` |
| Venus | 116,8 días terrestres (día solar) | `dia_solar_horas = 2803.2` |
| Tierra | 24 horas (día solar) | `dia_solar_horas = 24` |
| Marte | 24,7 horas (día solar) | `dia_solar_horas = 24.7` |

En esos cuatro cuerpos `rotacion_horas` queda nulo: el PDF no proporciona esa magnitud. No debe mostrarse «Por definir» cuando sí existe `dia_solar_horas`. En gigantes y satélites se guardan las magnitudes positivas tal como aparecen en el PDF; no se añaden signos de dirección a sus períodos. El sentido retrógrado de Tritón figura en su etiqueta, descripción y curiosidades.

Para las órbitas expresadas en años se usa la conversión de almacenamiento **1 año = 365.25 días**. Por ejemplo, los 11,9 años aproximados de Júpiter se guardan como 4346.475 días; no se sustituyen por los 4331 días de otra tabla. Las rotaciones de los satélites en días se multiplican por 24 para almacenarlas en horas.

**La interfaz presenta `contenido_ficha.datos_principales`**, que conserva las unidades, los decimales y las notas del PDF sin reformatearlos. Los números normalizados permiten otras consultas, pero no sustituyen esa presentación editorial. La integración actual consulta la API y rellena las fichas existentes tanto en la vista normal como en VR.

## Libros que se retiran

Se consultaron los registros públicos reales antes de preparar el script:

| UUID | Título provisional |
|---|---|
| `940c5977-49c6-456e-9c0e-957218173207` | Un punto azul pálido |
| `b6e140d5-98e8-4fa9-a0d4-f43c4ace3b3b` | Astrofísica para gente con prisas |

Antes del borrado se comprueban título, editorial, año, URL, autoría y asociaciones. Si fueron verificados por una persona, convertidos en fuentes de una ficha o relacionados con otro cuerpo, se cancela toda la operación para revisarlos. Un autor compartido con otro libro se conserva. Ningún otro libro se elimina, aunque tenga un título parecido.

El documento solo aporta el texto «Conoce más sobre…» de cada cuerpo. Se almacena en `contenido_ficha.descubrir_libros`; **no se convierte en un libro ficticio ni se declara verificado un título ausente del catálogo de la biblioteca**. Las asociaciones de libros reales que pudieran existir se conservan.

## Respaldo y repetición

Antes de corregir se guarda la información anterior en `respaldo_pdf_20261102.contenido_anterior`, en un esquema privado, sin acceso para `anon` o `authenticated`. Incluye los doce cuerpos, sus datos y curiosidades, los dos libros retirados, sus asociaciones/autores y las definiciones anteriores de función/vista. No incluye claves ni contraseñas.

El archivo se puede repetir: no duplica cuerpos ni curiosidades, no recrea libros eliminados y conserva el **primer respaldo**. La corrección falla y se revierte completa si una comprobación final no coincide con la transcripción. El respaldo está en la misma base; no sustituye una copia externa ante la pérdida de todo el proyecto.

## Comprobaciones realizadas

- Cotejo automático del SQL contra el PDF original: 12 fichas, 48 datos, 24 curiosidades y 12 invitaciones a libros.
- Ejecución de la carga antigua y la corrección en PostgreSQL temporal mediante PGlite, sin escribir en Supabase.
- Conservación de identidades, relaciones, imágenes y UUID de curiosidades; repetición sin duplicados ni reemplazo del respaldo inicial.
- Lectura de las doce fichas y listas de libros mediante el servicio actual de la API con rol `anon`; registros privados y respaldo ocultos.
- Conservación de registros ajenos y de un autor compartido con otro libro.
- Cancelación íntegra si un libro fue reutilizado/verificado, si cambia un planeta anfitrión o si una modificación inesperada impide el resultado final.
- Tras la ejecución en Supabase, consulta HTTP de las doce fichas y comparación de sus descripciones, 48 datos, curiosidades e invitaciones con la transcripción del PDF. Los endpoints de libros devolvieron listas vacías.
- Prueba de integración contra Supabase y comprobación de las doce fichas renderizadas con los datos recibidos por la API.

Para repetir el cotejo del documento, con Python y `pypdf` disponibles:

```powershell
python bd/verificarContenidoPdf.py "C:/ruta/al/documento.pdf"
```

`verificarCorreccionPdf.mjs` recibe tres rutas: el esquema original compartido, la carga anterior y el módulo local de PGlite. Es una comprobación aislada; no carga `.env` ni conecta con Supabase. No se añadieron dependencias a la aplicación.

Para repetir la prueba de integración contra Supabase, con el archivo local `.env` configurado:

```powershell
npm run test:integracion
```

En Postman, `GET /api/cuerpos-celestes/mercurio` debe incluir `contenido_ficha` con «176 días terrestres (día solar)» y `datos_principales.dia_solar_horas = 4224`. `GET /api/cuerpos-celestes/mercurio/libros` debe devolver `[]` mientras no existan libros reales asociados. Estos resultados ya se comprobaron mediante la API conectada a Supabase; los comandos permiten repetir la comprobación.
