# Design

## Context

Motivación y decisiones: ver [proposal.md](proposal.md). Estado actual verificado.

**Datos reales de Supabase (ejecutados por la usuaria):**

- `public.libros`: `id uuid`, `titulo text NOT NULL`, `editorial text NULL`, `anio smallint NULL`, `url_ficha text NULL`, `verificado bool NOT NULL`, `verificado_por uuid`, `verificado_en timestamptz`, `activo bool NOT NULL`, `creado_en`, `actualizado_en`. No hay columna de autoría: los autores están en `autores` y `libros_autores`.
- Restricciones: `ck_libro_verificado_completo` (si `verificado`: editorial, anio, url_ficha y verificado_en no nulos), `libros_anio_check` (1000–2100), `libros_titulo_check` (`btrim(titulo)` no vacío), `libros_url_ficha_check`, `uq_libro UNIQUE (titulo, editorial, anio)`, `libros_pkey`.
- Hay 11 libros; ninguno incumple las reglas de longitud, editorial y año, ni G1: **0** con caracteres de control, **0** con espacios repetidos y **0** sin letra o dígito (tarea 1.3).
- Los 2 autores que incumplían «iniciar con letra» (`___` y `$$%^&*()(*&^%$#@!@#$%^&*(`) **ya se eliminaron**: no tenían libros (`libros_autores_autor_id_fkey` es `ON DELETE RESTRICT`) y la verificación dio 0. Autores con menos de 2 caracteres (G2): **0**.
- Las clases POSIX de PostgreSQL funcionan en Supabase como se esperaba: `'^[[:alpha:]]'` acepta «Álvaro» y «Ñandú» y rechaza «#x»; y `[[:alnum:]]` (letra con eñe → true; solo símbolos → false), `[[:cntrl:]]` (salto de línea y tabulador → true) y `[[:space:]]{2,}` (espacios repetidos → true).
- Triggers en `public.libros`: solo `trg_libros_actualizado_en`. No interfiere con las restricciones (solo fija `actualizado_en`), pero debe incluirse en la copia del esquema para las pruebas en PGlite (tareas 1.9 y 1.10).

**Código:**

- **Formulario** ([formularioLibro.jsx](../../../src/componentes/formularioLibro.jsx)): `CAMPOS_FORMULARIO` define `titulo`, `autoria`, `editorial` (`obligatorio: false`) y `anio` (ayuda «Año entre 1000 y 2100.»); valida con `validarBorradorLibro` y tiene un aviso general `errorGuardado` (`setErrorGuardado(error.message)`) para errores del servidor.
- **Servicio del formulario** ([gestionBibliografica.js](../../../src/servicios/gestionBibliografica.js)): `solicitarLibros` lanza `new Error(contenido?.error?.mensaje …)`, es decir, descarta el resto del cuerpo del error.
- **Reglas del frontend** ([registrosBibliograficos.js](../../../src/administracion/registrosBibliograficos.js)): `validarCampoLibro` con 500/200/50/500 y 1000–2100; `convertirBorrador` hace `trim()` y envía `editorial: null` cuando está vacía; `prepararDatosLibro` envía solo los campos cambiados (`PATCH` parcial).
- **API** ([gestionLibros.js](../../../servidor/servicios/gestionLibros.js)): `validarLibro(datos, parcial)` es una copia independiente de las reglas; todo fallo lanza `invalido()` con el mismo mensaje genérico `LIBRO_INVALIDO`. [libros.js](../../../servidor/rutas/libros.js) serializa `{ error: { codigo, mensaje } }`. Los errores de la base se traducen por `code` (23505 → `LIBRO_DUPLICADO`; 23514/22023 → `LIBRO_INVALIDO`).
- **Base de datos:** `guardarLibroAdministrativo` está definida solo en [agregarGestionBibliografica.sql](../../../bd/agregarGestionBibliografica.sql); [guardarPortadasLibros.sql](../../../bd/guardarPortadasLibros.sql) (`guardarLibroConPortada`) la **llama**, sin redefinirla. Al crear hace `insert into libros(titulo) values (btrim(…))` y después un `update` con el resto. No valida longitudes, texto ni año.
- **Banner:** `FranjaInstitucional` con `.franja-institucional__acciones`: enlace Administración (`onClick={alAbrirAdministracion}`) y botón de descarga que abre `DialogoAplicacionMetseri`. Se oculta con `hidden={!activa}` (`activa = modo === 'normal'`); cierra por ratón, foco o Escape según `apertura`, con la guarda `dialogoAbierto` y las líneas `if (!activa && …) set…(false)`.
- **Diálogo actual** ([dialogoAplicacionMetseri.jsx](../../../src/componentes/dialogoAplicacionMetseri.jsx), 102 líneas): `GuiaInstalacion` (función local, líneas 5–45), el estado `instalando`/`muestraGuia`/`instalada`, la función `instalar` y el botón «Instalar Metseri» (líneas 84–96, dentro de la sección `aplicacion-metseri__instalacion`), y el montaje de `<DescargaSinConexion />`. Siempre está montado, aunque cerrado.
- **`DescargaSinConexion`** ([descargaSinConexion.jsx](../../../src/componentes/descargaSinConexion.jsx), 74 líneas): exportado, **sin props**, con todo su estado y sus avisos internos. Se puede montar en cualquier lugar tal cual.
- **Pruebas:** `node --test`; los componentes se prueban con `renderToStaticMarkup` y Vite en modo SSR ([panelAdministrativo.test.js](../../../src/componentes/panelAdministrativo.test.js)). No existe prueba de `validarLibro`, de la franja ni del diálogo de descargas.

## Goals / Non-Goals

**Goals:**
- Una única fuente de verdad de las reglas del libro, consumida por el formulario y la API y respaldada por la base.
- Menú accesible en el banner con Administración, Acerca de y los botones «Instalar Metseri» y «Descargar para usar sin conexión» directamente dentro, sin alterar su funcionamiento.

**Non-Goals:**
- No se cambia autenticación, sesiones ni rutas protegidas.
- No se agregan campos al libro (no hay «descripción»).
- No se cierra el hueco de duplicados con año `NULL` (limitación documentada).
- No se corrigen las frases desactualizadas de `panel-administrativo` (P10).
- No se toca `descargaSinConexion.jsx` ni los servicios de instalación y descarga. En `dialogoAplicacionMetseri.jsx` solo se mueve y exporta código (D6); no se reescribe.
- No se elimina `dialogoAplicacionMetseri.jsx`: queda en el repositorio, sin uso desde el banner.

## Decisions

### D1. Módulo de reglas compartido (`src/administracion/reglasLibro.js`)
Archivo JavaScript puro, sin React, Vite ni navegador. Exporta `LIMITES_LIBRO`, `normalizarTextoLibro` y las validaciones de título, autoría, editorial y año (`validarAnioLibro(valor, anioActual)`). Lo importan `registrosBibliograficos.js` (conserva la firma de `validarCampoLibro`/`validarBorradorLibro` para no romper sus pruebas) y `gestionLibros.js`.

- *Por qué:* hoy la regla vive dos veces; con dos copias QA volvería a ver discrepancias.
- *Alternativas:* duplicar (se desincroniza); validar solo en la API (pierde la validación al abandonar el campo y exige red).
- *Riesgo menor:* `servidor/` importa desde `src/`; es seguro mientras el módulo no importe nada.

**Orden de validación por campo** (devuelve el primer error): vacío → caracteres de control → longitud máxima → «al menos una letra o dígito». Para cada nombre de autor: longitud máxima → inicia con letra → longitud mínima de 2. Así «#» solo muestra el mensaje de la letra y no se duplica.

### D2. Año máximo dinámico
`anioActual` entra como parámetro: la API usa el del servidor; el formulario, el del navegador solo para adelantar el mensaje; la función SQL, `extract(year from now())`. Máximo = `anioActual + 1`. Un `CHECK` no puede usar `now()` de forma segura, así que la restricción estática es 1450–2100 y el tope dinámico vive en la función.

### D3. Regla «iniciar con letra» y longitud mínima del autor
- JS: `/^\p{L}/u` sobre el nombre recortado; el mensaje cita el primer carácter. Longitud mínima: `[...nombre].length >= 2`.
- SQL: `btrim(nombre) ~ '^[[:alpha:]]' and char_length(btrim(nombre)) between 2 and 100`, en la función y en `ck_autor_nombre`.

### D4. Base de datos: restricciones normales, normalización y alta reestructurada

Archivo `bd/validarDatosLibros.sql`, transaccional y repetible. Esquema propuesto (no es código aplicado):

1. **Verificación previa** (bloque `DO`, se conserva): cuenta los libros que incumplen las restricciones nuevas (editorial vacía o nula, título > 200 o con control/espacios consecutivos/sin letra o dígito, editorial > 100 con las mismas condiciones, año fuera de 1450–2100) y los autores que incumplen (`^[[:alpha:]]`, 2–100 caracteres). Si hay alguno, lanza una excepción legible con las cantidades y los `id`, y no cambia nada.
2. `libros`:
   - `libros_anio_check`: `drop constraint` y `add constraint … check (anio is null or anio between 1450 and 2100)` (mismo nombre).
   - `ck_libro_titulo`: `char_length(btrim(titulo)) <= 200 and titulo !~ '[[:cntrl:]]' and titulo !~ '[[:space:]]{2,}' and titulo ~ '[[:alnum:]]'`. Se conserva `libros_titulo_check`.
   - `ck_libro_editorial`: `editorial is not null and btrim(editorial) <> '' and char_length(btrim(editorial)) <= 100 and editorial !~ '[[:cntrl:]]' and editorial !~ '[[:space:]]{2,}' and editorial ~ '[[:alnum:]]'`.
   - Se conservan `ck_libro_verificado_completo`, `libros_url_ficha_check` y `uq_libro`.
3. `autores`: `ck_autor_nombre` con la regla de D3. **Ya no está bloqueada**: los 2 autores inválidos se eliminaron.
4. `create or replace function public."guardarLibroAdministrativo"` conservando firma, `security invoker`, `search_path` y permisos, con:
   - **Normalización de G1 en la función:** tras comprobar que no hay caracteres de control, `titulo`/`editorial` pasan por `regexp_replace(btrim(x), '[[:space:]]+', ' ', 'g')` antes de validar longitudes, antes de insertar y antes de comparar con `uq_libro`.
   - Validaciones: título presente, ≤ 200 y con letra o dígito; editorial presente (obligatoria al crear; si viene en una edición, no vacía), ≤ 100 y con letra o dígito; año entre 1450 y `extract(year from now()) + 1`; cada autor con `^[[:alpha:]]` y entre 2 y 100 caracteres. Errores `23514` con mensaje en español.
   - **Alta reestructurada:** hoy hace `insert into libros(titulo)` y luego `update`. Con `ck_libro_editorial` esa primera inserción fallaría. El `insert` pasa a incluir `titulo` y `editorial` normalizados; `anio` sigue entrando por el `update`, donde `uq_libro` se evalúa y conserva su error `23505`.
   - `guardarLibroConPortada` no se modifica (solo llama a esta función).
5. `notify pgrst, 'reload schema'`.

**G1 — dónde se normaliza y efecto en `uq_libro`:**

| Capa | Qué hace |
| --- | --- |
| Formulario | Al enviar (`convertirBorrador`) manda título y editorial normalizados: recortados y con `\p{Zs}+` reducido a un espacio. No reescribe el campo mientras se teclea. Rechaza `[\p{Cc}\p{Zl}\p{Zp}]` (saltos de línea, tabulaciones y otros controles). |
| API (`validarLibro`) | **Primera barrera y lugar principal de la normalización**: recorta, rechaza controles, colapsa espacios y valida sobre el texto normalizado antes de llamar a la base. |
| Función SQL | Repite la normalización y el rechazo (respaldo para llamadas directas por SQL). Puede diferir en espacios Unicode raros (por ejemplo, U+00A0), que la API ya habrá convertido. |
| Restricciones | Rechazan cualquier escritura directa que deje controles, espacios consecutivos o texto sin letra/dígito. |

*Efecto en `uq_libro`:* `uq_libro` compara el texto **guardado**. Como la normalización ocurre **antes** del `insert`/`update` y de la comparación, «Cosmos  infinito» y «Cosmos infinito» pasan a ser el mismo valor y **sí chocan** (409 `LIBRO_DUPLICADO`): mejora la detección. No cambia la sensibilidad a mayúsculas ni a tildes, ni la limitación con `anio NULL`. Un libro existente con espacios repetidos no chocaría con uno nuevo normalizado, pero esos casos los detecta la verificación previa (1) y deben corregirse antes. Los nombres de autor solo se recortan (su unicidad usa `lower(btrim(nombre))`).

- *Por qué restricciones y función:* la restricción cubre `INSERT/UPDATE` directos; la función da el mensaje claro, la normalización y el tope dinámico.
- *Alternativas:* `ALTER COLUMN editorial SET NOT NULL` (no cubre cadena vacía, longitud ni G1); `NOT VALID` (innecesario con datos limpios).
- *Interacción con `ck_libro_verificado_completo`:* compatible; un libro verificado ya exigía editorial.
- *Reversión:* reponer `libros_anio_check` 1000–2100, `drop constraint` de `ck_libro_titulo`, `ck_libro_editorial` y `ck_autor_nombre`, y restaurar la función desde `agregarGestionBibliografica.sql`. No se modifican datos.

**G3 y la base de datos:** G3 **no exige cambio en la base**: `error.campos` lo arma la API con el mismo módulo de reglas antes de llamar a la función. Los rechazos de la base (solo por llamadas directas o carreras) conservan su mapeo por código.

### D5. API y formulario: `error.campos` (G3)

`validarLibro` recoge **todos** los errores de campo (no se detiene en el primero) y lanza `ErrorLibros(400, 'LIBRO_INVALIDO', mensajeUnido, campos)`.

- `ErrorLibros` gana un cuarto parámetro opcional `campos`; el manejador de [libros.js](../../../servidor/rutas/libros.js) añade `campos` al cuerpo **solo si no está vacío**: `{ "error": { "codigo": "LIBRO_INVALIDO", "mensaje": "El título admite hasta 200 caracteres. Escribe la editorial del libro.", "campos": { "titulo": "…", "editorial": "…" } } }`.
- Claves: `titulo`, `autores`, `editorial`, `anio` (el nombre de la API). El formulario traduce `autores` → `autoria`.
- Los rechazos sin campo (campo desconocido, JSON inválido, relaciones o portada inválidas) no incluyen `campos`.
- **Formulario:** `solicitarLibros` ([gestionBibliografica.js](../../../src/servicios/gestionBibliografica.js)) adjunta `campos` al `Error` que lanza. `FormularioLibro` guarda `erroresServidor` en su estado, los muestra bajo cada campo (con `aria-invalid` y `aria-describedby`), enfoca el primero, y borra el mensaje de un campo cuando se edita. El aviso general `errorGuardado` solo se muestra cuando el error no trae `campos`.

### D6. Menú con los botones de instalar y descargar (opción O3, elegida en P16)

**Restricción de la usuaria:** el código, los textos, los avisos y el comportamiento de «Instalar Metseri» y «Descargar para usar sin conexión» no cambian; los botones viven solo en el Menú y se quita el botón de descarga suelto del banner. `descargaSinConexion.jsx` no se toca y permanece montado.

**Hallazgo que motiva la opción:** `DescargaSinConexion` es autónomo y sin props, así que se monta en el Menú tal cual. «Instalar Metseri» no existe como componente: es una sección interna de `DialogoAplicacionMetseri`. La opción elegida es **mover esa sección dentro del mismo archivo a un componente exportado**, sin reescribirla.

**Cambios en `src/componentes/dialogoAplicacionMetseri.jsx` (el único archivo existente que se toca de los dos reutilizados):**

| Qué | Cómo |
| --- | --- |
| `GuiaInstalacion` (líneas 5–45) | Solo se agrega `export`. El cuerpo no cambia. |
| Estado y lógica de instalación: `instalando`, `muestraGuia`, `instalada` (`useSyncExternalStore`), la función `instalar` y el reinicio `if (!abierto && muestraGuia) setMuestraGuia(false)` | **Se mueven sin cambios** a un componente nuevo del mismo archivo, `InstalacionMetseri({ visible, alTerminar })`, exportado. `visible` sustituye a `abierto` en el reinicio de la guía; `alTerminar` sustituye a `alCerrar` tras una instalación aceptada. |
| Sección «Instalar Metseri» (líneas 84–96: el botón con su icono, `aria-disabled`, y el `aria-live` con la guía) | **Se mueve sin cambios** al `return` de `InstalacionMetseri`, con el mismo marcado y las mismas clases. |
| `DialogoAplicacionMetseri` | Renderiza `<InstalacionMetseri visible={abierto} alTerminar={alCerrar} />` donde estaba la sección, de modo que su marcado resultante es idéntico. Conserva el efecto de `showModal`/`close` y el montaje de `<DescargaSinConexion />`. |

Se estima que se mueven unas 60 líneas y se agregan dos `export` y dos propiedades. Un `git diff --color-moved` debe mostrar solo líneas movidas, los `export` y esas dos propiedades. **Si al implementarlo resultara necesario modificar la lógica (no solo moverla), se detiene y se pregunta antes de continuar.**

**Cómo queda el Menú:**
- `MenuPrincipal` (`menuPrincipal.jsx`) usa el patrón **disclosure** (un botón con `aria-expanded` que muestra un panel), no `role="menu"`, porque los botones reutilizados no son `menuitem`.
- El panel contiene, en este orden: `<InstalacionMetseri visible={menuAbierto} alTerminar={cerrarMenu} />`, `<section className="aplicacion-metseri__sin-conexion"><DescargaSinConexion /></section>`, el enlace **Administración** y el botón **Acerca de**.
- **El panel permanece montado** y se oculta con `hidden` (no se desmonta) cuando el Menú está cerrado. Así `DescargaSinConexion` conserva su estado (progreso, error, fecha) y la lectura de la copia guardada al cargar la franja, igual que hoy en el diálogo, siempre montado. `InstalacionMetseri` también permanece montada y su guía se reinicia cuando `visible` pasa a `false`.
- Tras una instalación aceptada, `alTerminar` cierra el Menú, como antes se cerraba el diálogo.
- **El diálogo «Instalar o descargar» deja de montarse en el banner**: si siguiera montado, duplicaría `DescargaSinConexion` (dos estados y dos lecturas de la copia). `dialogoAplicacionMetseri.jsx` queda en el repositorio, sin uso desde el banner, porque no se retiran componentes; limpiarlo sería otro cambio.
- **CSS** (nuevo, con alcance en el panel del Menú; no se toca el CSS del diálogo): los botones ya tienen estilo propio por las clases `.aplicacion-metseri__opcion` y `.descarga-sin-conexion__boton`, que están en `franjaInstitucional.css` como selectores sueltos; los estilos de párrafos, listas y foco que hoy cuelgan de `.aplicacion-metseri` se replican para el panel (fondo claro `--icono-franja`, texto `--fondo-franja`), de modo que se vea como el diálogo. No se reutiliza la clase `.aplicacion-metseri` en el panel porque trae ancho, borde y sombra del diálogo.

**Línea base y comprobación de que nada cambió:**
1. *Antes* de tocar nada: registrar manualmente en la versión actual los casos MN-07 a MN-15 (los tres primeros, MN-07 a MN-09, son los del código movido) y una **prueba de caracterización** que renderiza `DialogoAplicacionMetseri` con `renderToStaticMarkup` y guarda su marcado.
2. *Después*: la prueba de caracterización debe seguir pasando **sin cambios** (el diálogo produce el mismo marcado); y los casos MN-07 a MN-15 desde el Menú deben dar los mismos textos, estados y avisos.
3. `git diff` sobre `descargaSinConexion.jsx` debe estar vacío; sobre `dialogoAplicacionMetseri.jsx`, solo movimientos y los `export`/propiedades descritos.

*Alternativas descartadas:* O1 (entrada que abre el diálogo: los botones no quedan directamente en el Menú) y O2 (copiar la instalación a un archivo nuevo: código duplicado).

### D7. Resto del Menú

- `MenuPrincipal` va en `.franja-institucional__acciones`, en el lugar del enlace y del botón actuales. El estado `menuAbierto` y `acercaAbierto` vive en `FranjaInstitucional` en lugar de `dialogoAbierto` (que desaparece junto con el montaje del diálogo), para que `cerrarAlSalir`, `cerrarAlPerderFoco` y Escape no cierren el banner con el Menú o «Acerca de» abiertos, y para que las líneas `if (!activa && …) set…(false)` los cierren al entrar a VR. Con el Menú abierto, Escape cierra primero el Menú y devuelve el foco a su botón.
- «Administración» sigue siendo `<a href="/admin">` con el `onClick={alAbrirAdministracion}` actual, para conservar clic central y Ctrl+clic.
- `DialogoAcercaDe` (`dialogoAcercaDe.jsx`) es un `<dialog>` modal que reutiliza los estilos `.aplicacion-metseri`; sus datos están en un arreglo exportado `DESARROLLADORES` para probar los nombres exactos.
- **Móvil:** trigger de 44×44 px, solo icono con `aria-label="Menú"` en `max-width: 900px`; panel anclado al borde derecho con `max-width: calc(100vw - 16px)` y desplazamiento vertical (`max-height` con `overflow: auto`), porque con los dos botones, sus avisos y la guía de instalación abierta el panel puede superar los 360 px de alto en horizontal. **VR:** sin cambios (`hidden`).
- *Alternativas:* menú fijo fuera del banner (no cumple «quitar del banner» limpiamente); `<select>` (mala experiencia táctil).

## Risks / Trade-offs

- [El alta reestructurada de la función puede cambiar un comportamiento no previsto] → Pruebas en PostgreSQL aislado (PGlite) del alta, la edición, `uq_libro` (`23505`), la autoría, las relaciones, un libro verificado, `guardarLibroConPortada` y el trigger `trg_libros_actualizado_en`; misma firma y permisos.
- [Las clases POSIX o los datos existentes podrían incumplir G1/G2] → Ya comprobado: las clases funcionan y hay 0 libros y 0 autores que incumplan; la verificación previa del `DO` se conserva como red de seguridad.
- [La normalización de espacios Unicode difiere entre JS y SQL] → La API normaliza primero; la función SQL es respaldo.
- [`error.campos` es un contrato nuevo] → Aditivo: `codigo` y `mensaje` no cambian; se prueba con un cliente que lo ignora.
- [Mover código dentro de `dialogoAplicacionMetseri.jsx` puede romper el reinicio de la guía o el cierre tras instalar] → Se mueve, no se reescribe; prueba de caracterización del marcado antes y después, casos MN-07 a MN-09 antes y después, y revisión de `git diff --color-moved`.
- [`DescargaSinConexion` y `InstalacionMetseri` pierden estado si el panel se desmonta] → Panel siempre montado y oculto con `hidden`.
- [Un segundo montaje de `DescargaSinConexion` duplicaría su estado] → El diálogo deja de montarse en el banner; solo el Menú monta el componente.
- [Los estilos de los botones fuera del diálogo se ven distinto] → CSS nuevo con alcance en el panel; verificación visual a 320, 360 y 412 px.
- [`dialogoAplicacionMetseri.jsx` queda sin uso desde el banner] → Aceptado; limpiarlo sería otro cambio.
- [El año máximo cambia cada enero] → Es lo buscado; las pruebas fijan el año.
- [Duplicados con año NULL siguen permitidos] → Limitación documentada.
- [`servidor/` importa desde `src/`] → El módulo no tiene imports.

## Migration Plan

1. Ya se comprobaron en Supabase las clases POSIX y que los 11 libros y los autores cumplen las reglas (tarea 1.3, [verificacion.md](verificacion.md)).
2. Ejecutar `bd/validarDatosLibros.sql` en el SQL Editor **antes** de desplegar la API nueva; con la API anterior, solo los rechazos nuevos de la base devolverían el mensaje genérico, sin corromper datos.
3. Desplegar API, formulario y Menú (el Menú es independiente de los pasos de base de datos).
4. Reversión: ver D4. El Menú se revierte restaurando `franjaInstitucional.jsx` y `dialogoAplicacionMetseri.jsx` desde git.
5. Documentar en `bd/gestionBibliografica.md` los límites, el rango, `campos` y los pasos.

## Open Questions

- Aspecto exacto del botón del Menú en escritorio («Menú» con icono o solo icono): decisión visual al aplicar; no cambia los requisitos.
