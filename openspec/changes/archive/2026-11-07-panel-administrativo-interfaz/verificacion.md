# Verificación del panel administrativo

Fecha: 2026-11-07.

## Implementación

- `ModuloAdministrativo` sustituye la bienvenida por el panel. Incluye cabecera con marca, **Volver a la exploración** y **Cerrar sesión**, navegación **Registros bibliográficos** / **Agregar libro** y el aviso permanente «Vista previa · Datos de ejemplo». Pantalla, registro activo, búsqueda y filtro viven en estado React del contenedor, sin rutas internas ni almacenamiento.
- `src/datos/registrosBibliograficosEjemplo.js` contiene seis registros sintéticos congelados con el modelo `{ id, titulo, autoria, editorial, anio, urlFicha, cuerposIds }`. El contenedor recibe `registros` y usa los ejemplos por defecto; una colección vacía explícita sigue vacía.
- `src/administracion/registrosBibliograficos.js` concentra búsqueda, filtro, textos de ausencia, cantidad de resultados, creación de borradores, alternancia de cuerpos y validación. Ninguna función modifica la colección recibida.
- Componentes nuevos: `ListadoBibliografico`, `FormularioLibro`, `SelectorCuerposCelestes` y `ConfirmacionEliminarLibro`, con estilos exclusivos en `panelAdministrativo.css`. De `App.css` solo se retiraron las reglas de la bienvenida eliminada (`.admin-modulo__contenido` y `.admin-modulo__estado`). Los estilos del acceso no cambian.
- Guardar libro, Guardar cambios y la confirmación Eliminar libro usan `disabled` nativo y una explicación visible asociada con `aria-describedby`. El formulario usa `noValidate` y previene el envío.
- `README.md` documenta el acceso al panel, los campos, el alcance temporal de borradores y relaciones, y que la eliminación real queda pendiente.

### Corrección durante la verificación

En desarrollo, `StrictMode` monta dos veces los efectos. El `close()` de la limpieza del primer montaje encolaba un evento `close` que llegaba cuando el diálogo ya se había reabierto y lo cerraba. Ahora `onClose` solo cierra la confirmación si el diálogo está realmente cerrado. Se volvió a comprobar en navegador tras la corrección.

## Comprobaciones automáticas

| Comprobación | Resultado |
| --- | --- |
| `node --test api/pruebas/autenticacionAdmin.test.js` | 3 pruebas aprobadas, 0 fallos. |
| `npm test` | 252 pruebas aprobadas, 0 fallos, 0 omitidas. |
| `npm run lint` | Aprobado. |
| `npm run build` | Aprobado. Vite mantiene la advertencia previa por un chunk JavaScript de más de 500 kB. |
| `openspec validate panel-administrativo-interfaz --strict` | Aprobado. |
| `git diff --check` | Aprobado. |

Pruebas nuevas:

- `src/administracion/registrosBibliograficos.test.js` (15): mayúsculas, tildes, espacios exteriores, búsqueda por título o autoría, relaciones múltiples, combinación de criterios, ausencia de coincidencias, conservación de la colección, textos de ausencia, borradores sin referencias compartidas, selección y retirada de cuerpos sin duplicados, y validación de título, autoría, URL y año.
- `src/datos/registrosBibliograficosEjemplo.test.js` (4): modelo, condición sintética, inmutabilidad, cobertura de casos y existencia de los cuerpos en el catálogo local. También comprueba que solo `moduloAdministrativo.jsx` importa los ejemplos y que no figuran en `LIBROS_POR_CUERPO`.
- `src/componentes/panelAdministrativo.test.js` (12): representación con Vite y `react-dom/server` del contenedor, el listado, la colección vacía y la búsqueda sin coincidencias. Cubre además el alta y la edición, el selector, la confirmación con y sin relaciones, y los controles de persistencia deshabilitados con su explicación. Una comprobación estática confirma que los componentes bibliográficos no usan `fetch`, `XMLHttpRequest`, `sendBeacon`, almacenamiento web ni cookies.

Las pruebas de representación son estáticas: no ejecutan efectos, eventos, foco ni el diálogo modal. Esas conductas se comprobaron en navegador.

## Recorridos en navegador

Se usó el navegador integrado de Claude Desktop, basado en Chromium, en Windows. La API se inició en `3101` con credenciales de prueba generadas para esa sesión, pasadas solo al proceso y eliminadas al terminar; `.env` no se modificó. Vite se sirvió en `127.0.0.1:5174` con caché propia y dirigía `/api` a ese puerto. El servidor Vite que ya ocupaba `5173` no se tocó. La API leyó el contenido público de Supabase con la configuración existente, sin escrituras ni SQL. Los anchos se emularon con el visor del navegador. La interacción se realizó con Tab, Shift+Tab, Enter, Espacio y Escape. JavaScript se usó solo para leer el estado y, en algunos pasos, para colocar el foco de partida.

| Recorrido | Resultado |
| --- | --- |
| `/admin` sin sesión | Comprobación de acceso y formulario existente, sin panel. |
| Credenciales incorrectas | `POST /api/admin/sesion` → 401 y mensaje de error. |
| Acceso autorizado | `POST` → 200 y el listado como pantalla inicial: 6 registros de ejemplo y aviso de vista previa. |
| Recarga en `/admin/` con sesión | Listado inicial con búsqueda y filtro vacíos. El borrador anterior no se conserva. `localStorage` y `sessionStorage` vacíos. |
| Búsqueda «  TIERRA » | 1 de 6. «Átlas» con tilde y espacios más el filtro Luna también da 1 de 6. «planetas» con Luna da 0 de 6 y el mensaje de ausencia de resultados, distinto del catálogo vacío. |
| Limpiar filtros, desde el estado sin resultados | Recupera los 6 registros y lleva el foco a la búsqueda. |
| Editar con «ejemplo» y Tierra | Foco en «Editar libro», valores originales, Tierra y Luna marcadas, y Guardar cambios deshabilitado con su explicación. |
| Validación | Título con solo espacios, año `2020.5` y URL `example.org/ficha` muestran «Error: …», `aria-invalid` y un mensaje en `aria-describedby` al abandonar el campo. Los errores desaparecen al corregir. En el alta, recorrer campos sin editarlos no produce errores, y Editorial y Año vacíos no generan errores. |
| Selector de cuerpos | Espacio marca y desmarca Mercurio sin duplicados. Desmarcar Tierra y Luna muestra «Sin asociar» y el formulario sigue disponible. |
| Enter con campos válidos | Sin evento `submit`, sin peticiones nuevas, sin almacenamiento y sin mensaje de guardado. |
| Cancelar y Volver al listado | Conservan «ejemplo» y Tierra (2 de 6) y devuelven el foco a «Editar …». Al reabrir reaparecen los valores originales y las relaciones Tierra y Luna. |
| Agregar libro | Campos vacíos, «Sin asociar», foco en el encabezado y Guardar libro deshabilitado. |
| Confirmación de eliminación | Muestra título y relaciones (Tierra, Luna) y pone el foco en Cancelar. Tab y Shift+Tab alternan solo entre Cerrar y Cancelar. El clic sobre Eliminar libro, deshabilitado, no cambia nada. |
| Cierres de la confirmación | Escape, Cerrar y Cancelar (con Espacio) cierran el diálogo, devuelven el foco al botón Eliminar de origen y conservan filtros y registros. |
| Registro sin asociaciones | El diálogo indica «Sin asociar». |
| 360 × 740 y 360 × 420 | Dentro del panel, `scrollWidth` es igual a `clientWidth` (360), sin elementos fuera del ancho. Listado en tarjetas con etiquetas, formularios en una columna y acciones alcanzables. El diálogo ocupa de 16 a 404 px en altura y se desplaza internamente (468 de contenido frente a 386 visibles). |
| 1440 × 900 | Sin desbordamiento horizontal (1425 = 1425). Tabla con las acciones en una fila y formulario en dos columnas. |
| Cerrar sesión | `DELETE /api/admin/sesion` → 200, retirada del panel y nuevo formulario de acceso. Tras recargar sin sesión se muestra el acceso. |
| Red | Solo hubo `GET`, `POST` y `DELETE /api/admin/sesion`. Las operaciones bibliográficas no generaron peticiones. |

Capturas en `evidencias/panelAdministrativo/`: `listadoEscritorio`, `busquedaSinCoincidencias`, `edicionEscritorio`, `validacionErrores`, `altaEscritorio`, `selectorCuerposEscritorio`, `confirmacionEliminarEscritorio`, `listadoMovil`, `registrosMovil`, `edicionMovil`, `selectorCuerposMovil`, `altaMovil`, `accionesFormularioMovil`, `confirmacionSinAsociarMovil`, `regresionFichaTierra` y `regresionVr`. Las capturas de escritorio se reducen a 800 px de ancho al guardarlas. `edicionEscritorio` y `altaEscritorio` son anteriores a ajustar el contorno de foco del encabezado a su texto; el resto de capturas corresponde al estilo final.

## Regresión

- **Volver a la exploración** abre `/` con la escena y sin elementos del panel. La ficha de Tierra se abrió con su contenido publicado. Entrar y salir de VR conservó la ficha y los controles. En ningún momento aparecieron títulos «Ejemplo ·» ni URL `example.org/fichas` en el DOM.
- El único error de consola fue el 401 provocado con la contraseña incorrecta.
- El diff modifica `src/componentes/moduloAdministrativo.jsx`, `src/App.css` (solo reglas de la bienvenida retirada) y `README.md`, y añade componentes, datos, lógica, estilos y pruebas del panel. No se modificaron la API, `src/App.jsx`, la base de datos, los contratos públicos, `.env`, las credenciales ni el código de la escena. Se retiraron la configuración temporal `.claude/launch.json` y la caché de Vite usada para la verificación.

## Limitaciones

- No se usó un lector de pantalla. La lectura de errores y explicaciones se comprobó en el árbol accesible y en los atributos (`aria-describedby`, `aria-invalid` y regiones `aria-live`).
- Solo se probó el motor Chromium del navegador integrado, con anchos emulados. No se probaron Firefox, Safari ni teléfonos físicos. La contención del foco del diálogo depende de `showModal()` nativo.
- VR se comprobó en escritorio sin permiso de orientación, por lo que solo cubre la entrada, la salida y la ausencia de ejemplos, no los sensores.
- La sesión sigue en memoria del proceso de la API, como antes; este cambio no altera esa limitación.
