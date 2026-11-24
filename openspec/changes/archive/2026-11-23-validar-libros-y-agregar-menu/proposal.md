# Proposal

## Why

Las pruebas funcionales (QA) del módulo administrativo mostraron que acepta datos incongruentes con un libro real: nombres de autor que empiezan con símbolos, libros sin editorial, años extremos y textos de longitud arbitraria. Además, el banner institucional mezcla accesos de propósitos distintos (Administración, instalación y descarga) y no existe un lugar donde presentar quién desarrolló Metseri. Conviene corregirlo ahora, antes de cargar el catálogo real de la biblioteca, porque cada dato inválido guardado después exige limpieza manual en Supabase.

## What Changes

**A. Validación de datos del libro (puntos 1 a 5)**

Campos del formulario, confirmados en [formularioLibro.jsx](../../../src/componentes/formularioLibro.jsx): `titulo`, `autoria` (un nombre por línea), `editorial` y `anio`. «Descripción» fue solo un ejemplo del pedido: ese campo no existe y **no se agrega** (P2).

Reglas actuales (verificadas en el repo y en Supabase): título ≤ 500, nombre de autor ≤ 200, hasta 50 autores, editorial opcional ≤ 500, año 1000–2100 en el formulario ([registrosBibliograficos.js](../../../src/administracion/registrosBibliograficos.js)), la API (`validarLibro` en [gestionLibros.js](../../../servidor/servicios/gestionLibros.js)) y la restricción `libros_anio_check`. La base no limita la longitud de título ni editorial, ni valida nombres de autor.

1. **Límites de caracteres (aprobados):** título **200**, nombre de autor **100**, editorial **100**, autores por libro **50** (sin cambio). Justificación: un título con subtítulo rara vez pasa de 150 caracteres; un nombre completo cabe en menos de 80; las editoriales reales miden 10–60; no hay evidencia para endurecer los 50 autores. Los límites se cuentan después de quitar y colapsar espacios.
2. **El nombre de cada autor inicia con una letra** (P1): se rechazan números, símbolos y puntuación al inicio, sin excepción para «'t Hooft». Se acepta «Á», «ñ», «ü», etc.
3. **Editorial obligatoria** en formulario, API y base de datos; se retira «Opcional» de su etiqueta.
4. **Año acotado (aprobado):** entero de cuatro cifras entre **1450** y **el año actual + 1**, con la fecha del servidor. El rango estático 1450–2100 reemplaza en la base a `libros_anio_check` (1000–2100). El año sigue siendo opcional.
5. **Congruencia general (aprobada en P15, G1–G3):**
   - **G1.** Título y editorial: sin saltos de línea ni caracteres de control; los espacios internos repetidos se colapsan a uno; deben contener al menos una letra o dígito.
   - **G2.** Nombre de autor: al menos 2 caracteres. La exigencia de «al menos una letra» no se duplica: ya la cubre la regla 2.
   - **G3.** La API devuelve `error.campos` con el mensaje de cada campo inválido, de forma aditiva (`codigo` y `mensaje` no cambian), y el formulario muestra cada mensaje bajo su campo.

**Mensajes.** En español, con el tono imperativo actual del formulario («Escribe…»). El texto exacto está en los specs. `error.mensaje` contiene los mensajes concretos (hoy es un texto genérico).

**Capas.** Se valida en tres: formulario (mensajes inmediatos), API (Postman u otros clientes evitan el formulario) y base de datos (la función de guardado puede llamarse por SQL). Con los datos reales (0 libros incumplen las reglas de 1–4), las restricciones son **normales y validadas**, no `NOT VALID`. Frontend y API comparten **un solo módulo de reglas**. Dónde se normaliza el texto y cómo afecta a `uq_libro`: [design.md](design.md), D4.

**Libros duplicados.** No se agrega detección: **ya existe** `uq_libro UNIQUE (titulo, editorial, anio)`, que la API traduce a `LIBRO_DUPLICADO` (409). **Limitación conocida:** un `UNIQUE` normal no considera iguales los `NULL`, así que dos libros con el mismo título y editorial y **sin año** no chocan; tampoco distingue mayúsculas. Con la editorial obligatoria desaparece el caso de editorial `NULL`; el del año sigue. Con G1, dos títulos que solo difieran en espacios repetidos pasan a ser el mismo texto guardado y sí chocan.

**Autores inválidos existentes (resuelto, P14).** Los 2 registros que incumplían la regla 2 (`___` y `$$%^&*()(*&^%$#@!@#$%^&*(`) no tenían libros asociados (`libros_autores_autor_id_fkey` es `ON DELETE RESTRICT`); la usuaria los eliminó en Supabase y la consulta de verificación dio 0. La restricción sobre `autores` ya no está bloqueada.

**Revisión de escritores de `libros`.** Búsqueda en `bd/`, `servidor/`, `src/`, `postman/` y la raíz de cualquier script que inserte o actualice `libros` sin editorial, que `ck_libro_editorial` rechazaría:

| Archivo | Operación sobre `libros` | ¿Sin editorial? | Acción |
| --- | --- | --- | --- |
| [bd/agregarGestionBibliografica.sql](../../../bd/agregarGestionBibliografica.sql) línea 57 | `insert into public.libros(titulo) values (…)` al crear | **Sí: lo rechazaría** | Se reestructura en la nueva función (design D4): el `insert` incluye `titulo` y `editorial` |
| mismo archivo, línea 125 | `update … editorial = datos->>'editorial'` | Solo si se envía `null` explícito | Cubierto: la función y la restricción lo rechazan |
| mismo archivo, línea 143 | `delete from public.libros` | — | Sin impacto |
| [bd/guardarPortadasLibros.sql](../../../bd/guardarPortadasLibros.sql) (`guardarLibroConPortada`) | Llama a `guardarLibroAdministrativo`; no escribe en `libros` | No directamente | Sin cambios; se prueba en la tarea 1.10 |
| [bd/corregirContenidoDesdePdf.sql](../../../bd/corregirContenidoDesdePdf.sql) línea 703 | Solo `delete from public.libros` (ya ejecutado); su tabla temporal `librosRetirar` incluye editorial | — | Sin impacto |
| [bd/verificarCorreccionPdf.mjs](../../../bd/verificarCorreccionPdf.mjs) línea 21 y 147 | `insert` con editorial; `update … verificado_por` | No | Sin impacto |
| mismo archivo, línea 46 | `insert into public.libros (id, titulo) values (…)` (libro «de un compañero», fixture de prueba) | **Sí** | Corre en una base PGlite con el esquema original, sin la migración, así que no se rompe. Si se reutiliza para probar `validarDatosLibros.sql`, esa fixture debe incluir editorial (tarea 1.10) |
| [bd/publicarLibrosActivos.sql](../../../bd/publicarLibrosActivos.sql), [bd/guardarSesionesAdministrativas.sql](../../../bd/guardarSesionesAdministrativas.sql) | Solo vista y tabla de sesiones | — | Sin impacto |
| [servidor/herramientas/comprobarSupabase.js](../../../servidor/herramientas/comprobarSupabase.js), [postman/consultasMetseri.postman_collection.json](../../../postman/consultasMetseri.postman_collection.json) | Solo lecturas (`GET`) | — | Sin impacto |
| [bd/gestionBibliografica.md](../../../bd/gestionBibliografica.md) | Documenta «editorial y año pueden quedar en null» | — (documentación) | Se actualiza (tarea 1.11) |

No hay seeds ni migraciones de carga de libros en el repositorio; `cargarLibrosInvestigados.js`, mencionado en tareas anteriores, no existe en él.

**B. Menú y «Acerca de» (punto 6)**

El banner es `FranjaInstitucional` ([franjaInstitucional.jsx](../../../src/componentes/franjaInstitucional.jsx)). Hoy contiene el enlace **Administración** (`/admin`) y un botón de descarga que abre [dialogoAplicacionMetseri.jsx](../../../src/componentes/dialogoAplicacionMetseri.jsx); ese diálogo contiene el botón **Instalar Metseri** y monta [descargaSinConexion.jsx](../../../src/componentes/descargaSinConexion.jsx) (**Descargar para usar sin conexión / Actualizar descarga**).

6a. **Instalar y descargar se muestran directamente en el Menú, sin modificarse (P12, P13, P16 = O3).** Los botones «Instalar Metseri» y «Descargar para usar sin conexión» / «Actualizar descarga» conservan su código, textos, avisos y comportamiento, y viven solo en el Menú; se quita el botón de descarga suelto del banner. `descargaSinConexion.jsx` no se toca y se monta en el Menú. «Instalar Metseri» no existía como componente (era una sección interna de `DialogoAplicacionMetseri`), así que **en `dialogoAplicacionMetseri.jsx` solo se mueve esa sección a un componente exportado y se exporta `GuiaInstalacion`, sin reescribirlas**. Detalle, archivos y verificación en [design.md](design.md), D6.
6b. **Administración** pasa al Menú y se retira del banner. Solo cambia dónde está el enlace; no se tocan sesión, `/api/admin/*` ni control de acceso.
6c. **Acerca de** abre un diálogo con: Espinosa Benítez Jesús, Garay Ocegueda Francisco Daniel, García Vázquez Edgar Daniel, Gonzalez Zapete Sophia; Ingeniería en Sistemas Computacionales; Instituto Tecnológico de Tepic. Solo texto (P11).

Celular y VR (P6): el banner solo está activo en modo normal (`activa={modo === 'normal'}`), así que el Menú tampoco aparece en VR, igual que hoy. En celular el Menú es una lista desplegable bajo el banner.

## Capabilities

### New Capabilities

- `validacion-datos-bibliograficos`: reglas de longitud, texto limpio, autoría, editorial obligatoria y año del libro, con sus mensajes, en formulario, API (incluido `error.campos`) y base de datos.
- `menu-principal`: Menú del banner con acceso a instalar y descargar sin conexión (sin cambios), Administración y Acerca de, y su comportamiento en celular y VR.

### Modified Capabilities

- `panel-administrativo`: «Formularios para preparar altas y ediciones» (editorial obligatoria) y «Validación visual de los campos» (límites, texto limpio, autoría, editorial, rango del año y mensajes del servidor bajo cada campo).

## Impact

- **Frontend:** [registrosBibliograficos.js](../../../src/administracion/registrosBibliograficos.js) (reglas extraídas a un módulo compartido), [formularioLibro.jsx](../../../src/componentes/formularioLibro.jsx), [gestionBibliografica.js](../../../src/servicios/gestionBibliografica.js) (lleva `campos` del error), [franjaInstitucional.jsx](../../../src/componentes/franjaInstitucional.jsx) y su CSS; nuevos `menuPrincipal.jsx` y `dialogoAcercaDe.jsx`. `dialogoAplicacionMetseri.jsx` (solo mover y exportar la instalación; D6). El diálogo deja de montarse en el banner y el archivo queda sin uso, sin eliminarse.
- **API:** `validarLibro`, `ErrorLibros` ([gestionLibros.js](../../../servidor/servicios/gestionLibros.js)) y el manejador de errores de [libros.js](../../../servidor/rutas/libros.js). No existe hoy `servidor/pruebas/gestionLibros.test.js`.
- **Base de datos:** nuevo `bd/validarDatosLibros.sql` (verificación previa, restricciones de `libros` y `autores`, función `guardarLibroAdministrativo` reestructurada con normalización). La usuaria lo ejecuta en el SQL Editor.
- **Pruebas existentes a ajustar:** [registrosBibliograficos.test.js](../../../src/administracion/registrosBibliograficos.test.js) y [panelAdministrativo.test.js](../../../src/componentes/panelAdministrativo.test.js) asumen editorial opcional y año 1000–2100.
- **Sin cambios:** autenticación y sesiones, rutas protegidas, escena 360/VR, `descargaSinConexion.jsx` (se monta en el Menú tal cual) y los servicios de instalación y descarga.
- **Dependencias nuevas:** ninguna.
- **Documentación en conflicto:** el cambio en curso `implementar-api-bibliografica` (30/30 tareas, sin archivar) especifica editorial opcional y año 1000–2100; este cambio las reemplaza. Archivarlo antes de aplicar este.

## Decisiones confirmadas

| # | Decisión |
| --- | --- |
| P1 | El autor inicia con una letra; sin excepción «'t Hooft». |
| P2 | No existe campo «descripción» y no se agrega. |
| P3 | Límites 200 / 100 / 100 / 50. |
| P4 | Año de 1450 a año actual + 1. |
| P5/P12 | Instalar y descargar quedan exactamente como hoy; el Menú agrega Administración y Acerca de y los reutiliza sin modificarlos. |
| P6 | Provisional: Menú oculto en VR; lista desplegable en celular. |
| P7 | Esquema real de Supabase recibido (design, «Datos reales»). |
| P8 | `uq_libro` ya existe; se retira la detección de duplicados y se documenta su limitación con `NULL`. |
| P9 | Restricciones normales y validadas; `libros_anio_check` pasa a 1450–2100. |
| P10 | Provisional: no se corrigen las frases desactualizadas de `panel-administrativo`. |
| P11 | Provisional: «Acerca de» solo con texto. |
| P13 | Se conservan literalmente los textos actuales. |
| P14 | Resuelta: los 2 autores inválidos se eliminaron (0 en la verificación); `ck_autor_nombre` ya es aplicable. |
| P15 | G1, G2 y G3 aprobadas y convertidas en requisitos. |
| P16 | **O3**: se mueve y exporta la instalación dentro de `dialogoAplicacionMetseri.jsx`; el Menú muestra «Instalar Metseri» y «Descargar para usar sin conexión» directamente; se quita el botón de descarga suelto del banner; `DescargaSinConexion` no se toca y permanece montado. |

## Preguntas abiertas

Ninguna pendiente. Los valores provisionales P6, P10 y P11 se mantienen por indicación de la usuaria.

## Supuestos

- **S1.** «Banner» significa `FranjaInstitucional`.
- **S2.** El año sigue siendo opcional; solo se acota cuando se escribe.
- **S3.** Las reglas se evalúan sobre el texto normalizado (recortado y con espacios colapsados) y aplican a altas y ediciones.
- **S4.** Mensajes en español con el tono imperativo del formulario actual.
- **S5.** La migración SQL se entrega como archivo en `bd/` y la usuaria la ejecuta en Supabase; Claude no escribe en Supabase.
- **S6.** El Menú vive en el banner y solo existe en la escena pública; la pantalla `/admin` no cambia.
- **S7.** El año máximo usa la fecha del servidor; la del navegador solo adelanta el mensaje en el formulario.
- **S8.** Los 11 libros existentes deben seguir guardables sin cambios. Comprobado en Supabase (tarea 1.3, [verificacion.md](verificacion.md)): cumplen las reglas 1–4 y G1 (0 con caracteres de control, espacios repetidos o sin letra/dígito) y 0 autores tienen menos de 2 caracteres.
- **S9.** G1 se aplica a título y editorial; los nombres de autor no se normalizan más allá de recortar espacios.
- **S10.** Como el diálogo «Instalar o descargar» deja de montarse en el banner (montarlo duplicaría `DescargaSinConexion`), `dialogoAplicacionMetseri.jsx` permanece en el repositorio sin uso desde el banner, porque no se retiran componentes; limpiarlo sería otro cambio.
- **S11.** `trg_libros_actualizado_en` es el único trigger de `libros`; no interfiere con las restricciones y se incluye en la copia del esquema para las pruebas en PGlite.
