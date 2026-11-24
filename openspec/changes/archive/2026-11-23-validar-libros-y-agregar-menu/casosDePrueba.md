# Casos de prueba (QA)

Criterios de aceptación en [specs/](specs/). «Año máx.» es el año actual + 1 (en 2026 es 2027). Las columnas de resultado y evidencia se llenan durante la verificación. G1, G2 y G3 fueron aprobadas y sus casos forman parte de la matriz principal.

## Validación de datos (puntos 1 a 5)

| ID | Punto | Entrada | Resultado esperado |
| --- | --- | --- | --- |
| VL-01 | 1 título | 200 caracteres | Se acepta |
| VL-02 | 1 título | 201 caracteres | «El título admite hasta 200 caracteres.»; no guarda |
| VL-03 | 1 título | vacío o solo espacios | «Escribe el título del libro.» |
| VL-04 | 1 autor | nombre de 100 caracteres | Se acepta |
| VL-05 | 1 autor | nombre de 101 caracteres en la línea 2 | «El nombre de autor de la línea 2 admite hasta 100 caracteres.» |
| VL-06 | 1 autores | 50 nombres / 51 nombres | Se acepta / «Escribe hasta 50 autores.» |
| VL-07 | 1 editorial | 100 caracteres | Se acepta |
| VL-08 | 1 editorial | 101 caracteres | «La editorial admite hasta 100 caracteres.» |
| VL-09 | 2 autor | «Álvaro Mutis», «Ñandú Pérez», «Carl Sagan» | Se aceptan |
| VL-10 | 2 autor | «#Carl Sagan» en la línea 1 | «El nombre de autor de la línea 1 debe empezar con una letra, no con «#».» |
| VL-11 | 2 autor | «¿Quién», «(Anónimo)», «-Pérez», «_x», «"Pérez», «___» | Se rechazan con el mismo mensaje y su carácter |
| VL-12 | 2 autor | «3 Carl Sagan», «2001 Editores» | Se rechazan («no con «3»», «no con «2»») |
| VL-13 | 2 autor | «'t Hooft» | Se rechaza (sin excepción) |
| VL-14 | 2 autor | «  #Carl Sagan» (espacios antes) | Se rechaza (se evalúa tras quitar espacios) |
| VL-15 | 2 autor | línea 1 «Carl Sagan», línea 2 «@Ann Druyan» | Error solo en la línea 2 |
| VL-16 | G2 autor | «A» | «El nombre de autor de la línea 1 debe tener al menos 2 caracteres.» |
| VL-17 | G2 autor | «Li», «NASA» | Se aceptan |
| VL-18 | G2 autor | «#» (un carácter que no es letra) | Solo el mensaje de iniciar con letra; no se duplica el de longitud |
| VL-19 | 3 editorial | «Fondo de Cultura Económica» | Se guarda; la tarjeta la muestra |
| VL-20 | 3 editorial | vacío o solo espacios | «Escribe la editorial del libro.»; el foco va al campo; no guarda |
| VL-21 | 3 editorial | etiquetas del formulario | Editorial «Obligatorio»; año «Opcional» |
| VL-22 | 4 año | 1450 y año máx. | Se aceptan |
| VL-23 | 4 año | 1449, 1000, «0123» | «Escribe un año entre 1450 y 2027.» |
| VL-24 | 4 año | año máx. + 1, 2100, 9999 | Mismo mensaje |
| VL-25 | 4 año | «20», «999», «2020.5», «dos mil», «02020», «-2020», «1e3» | «Escribe el año con cuatro cifras, por ejemplo 2020.» |
| VL-26 | 4 año | vacío | Sin error; se guarda sin año |
| VL-27 | G1 título | «!!!» | «El título debe contener al menos una letra o un número.» |
| VL-28 | G1 editorial | «....» | «La editorial debe contener al menos una letra o un número.» |
| VL-29 | G1 título | texto pegado con salto de línea en medio | «El título no admite saltos de línea ni caracteres de control.» |
| VL-30 | G1 editorial | texto con tabulación | «La editorial no admite saltos de línea ni caracteres de control.» |
| VL-31 | G1 título | «  Cosmos    infinito  » | Se guarda «Cosmos infinito» (sin error) |
| VL-32 | G1 editorial | «Fondo   de  Cultura» | Se guarda «Fondo de Cultura» |
| VL-33 | G1 + 1 | título de 203 caracteres que mide 199 al colapsar espacios | Se acepta (el límite cuenta tras normalizar) |
| VL-34 | G1 título | salto de línea solo al final (pegado) | Se recorta sin error; no se rechaza |
| VL-35 | G3 formulario | la API responde 400 con `campos` para editorial y año | Cada mensaje bajo su campo, `aria-invalid`, foco en el primero y lo escrito se conserva |
| VL-36 | G3 formulario | editar el campo cuyo mensaje vino del servidor | Ese mensaje desaparece |
| VL-37 | G3 formulario | error del servidor sin `campos` (p. ej. 503) | Se muestra solo el aviso general |
| VL-38 | API | POST válido | 201 y `Location`, como antes |
| VL-39 | API | POST sin `editorial` | 400 `LIBRO_INVALIDO`; `mensaje` y `campos.editorial` = «Escribe la editorial del libro.» |
| VL-40 | API G3 | POST con título de 250, editorial vacía y año 1200 | 400; `campos` con `titulo`, `editorial` y `anio`; `mensaje` los reúne |
| VL-41 | API G3 | POST con autor «#Ana»; con autor «A» | 400 con `campos.autores` indicando la línea |
| VL-42 | API | PATCH `{ "editorial": null }` y `{ "editorial": "   " }` | 400 con `campos.editorial` |
| VL-43 | API | PATCH `{ "activo": false }` a un libro con editorial | 200 |
| VL-44 | API | PATCH `{ "anio": año máx. + 1 }` / `{ "anio": año máx. + 2 }` | 200 / 400 con `campos.anio` |
| VL-45 | API G3 | POST con un campo desconocido | 400 `LIBRO_INVALIDO` **sin** `campos` |
| VL-46 | API G3 | cliente que lee solo `codigo` y `mensaje` | Sigue funcionando (contrato aditivo) |
| VL-47 | API G1 | POST con «Cosmos    infinito» y mismos editorial y año de «Cosmos infinito» | 409 `LIBRO_DUPLICADO` (se normaliza antes de comparar) |
| VL-48 | API | POST con el mismo título, editorial y año exactos | 409 `LIBRO_DUPLICADO` |
| VL-49 | BD función | `guardarLibroAdministrativo` sin editorial | Error 23514; no queda ningún libro nuevo, ni solo con título |
| VL-50 | BD función | año 1449; año máx. + 2 | Error; sin cambios |
| VL-51 | BD función | título de 201; editorial de 101 | Error; sin cambios |
| VL-52 | BD función | autor «#x», «3x» o «A» | Error; sin cambios |
| VL-53 | BD función | título con salto de línea; editorial «....» | Error; sin cambios |
| VL-54 | BD función | título «Cosmos    infinito» | Guarda «Cosmos infinito» |
| VL-55 | BD función | datos válidos (alta y edición) y `guardarLibroConPortada` | Guardan como antes |
| VL-56 | BD tabla | `insert` directo en `libros` sin editorial | Viola `ck_libro_editorial` |
| VL-57 | BD tabla | `insert` en `libros` con título «a\nb» o con dos espacios seguidos | Viola `ck_libro_titulo` |
| VL-58 | BD tabla | `update libros set anio = 1200` y `= 2101` | Viola `libros_anio_check` (1450–2100) |
| VL-59 | BD tabla | `insert` en `autores` con «#x», «3x» o «A» | Viola `ck_autor_nombre` |
| VL-60 | BD tabla | libro verificado con editorial, año, URL y fecha | Sigue cumpliendo `ck_libro_verificado_completo` |
| VL-61 | BD migración | con un libro sin editorial en la copia de pruebas | El bloque `DO` aborta con un mensaje legible y no cambia nada |
| VL-62 | BD migración | tras migrar, listar y editar los 11 libros | Los 11 siguen consultables y editables |
| VL-63 | BD migración | ejecutar `validarDatosLibros.sql` dos veces | Sin errores ni duplicados |
| VL-64 | BD (limitación) | dos libros con el mismo título y editorial **sin año** | Ambos se aceptan: limitación documentada de `uq_libro` con `NULL`; no es un fallo |

## Menú y «Acerca de» (punto 6)

Los casos MN-07 a MN-15 se ejecutan **primero sobre la versión actual** (línea base, tarea 2.1, con los botones en el diálogo del banner) y después desde el Menú; los resultados deben ser idénticos. MN-07 a MN-09 son los críticos porque ejercen el código de instalación que se mueve dentro de `dialogoAplicacionMetseri.jsx`.

| ID | Criterio | Pasos | Resultado esperado |
| --- | --- | --- | --- |
| MN-01 | Menú existe | Desplegar el banner | Hay un control «Menú» |
| MN-02 | Opciones | Abrir el Menú | Aparecen directamente «Instalar Metseri», «Descargar para usar sin conexión», Administración y Acerca de |
| MN-03 | Banner sin accesos sueltos | Banner desplegado, Menú cerrado | No hay enlace «Administración» ni botón de descarga sueltos; el diálogo «Instalar o descargar» no se puede abrir desde el banner |
| MN-04 | Administración sin sesión | Menú → Administración | Pantalla de acceso, como antes |
| MN-05 | Administración con sesión | Menú → Administración | Módulo administrativo |
| MN-06 | Clic central / Ctrl+clic | Sobre Administración | `/admin` en pestaña nueva |
| MN-07 | Instalar con aviso | Navegador con instalación; elegir «Instalar Metseri» | Aviso del navegador; al aceptar, el botón desaparece y el Menú se cierra (antes se cerraba el diálogo) |
| MN-08 | Instalar sin aviso | Sin aviso disponible | La guía del navegador (iPhone, Mac, Android o genérica) con los textos actuales; al cerrar el Menú, la guía se oculta (antes, al cerrar el diálogo) |
| MN-09 | Ya instalada | Abrir Metseri como aplicación | «Instalar Metseri» no aparece |
| MN-10 | Primera descarga | Sin copia, con conexión | «Descargar para usar sin conexión»; «Preparando N de 12 cuerpos…»; «Disponible sin conexión. …»; la etiqueta pasa a «Actualizar descarga» |
| MN-11 | Copia existente | Recargar con copia | «Actualizar descarga» y la fecha, igual que en la línea base |
| MN-12 | Descarga en curso | Pulsar descargar, cerrar y reabrir el Menú | Botón deshabilitado mientras avanza; el progreso o el resultado se conservan |
| MN-13 | Sin conexión | Sin conexión y sin copia; y un fallo de descarga | «Se necesita conexión para descargar las fichas.»; «{mensaje} Vuelve a intentarlo con conexión.» |
| MN-14 | Navegador sin soporte | Sin Service Worker o IndexedDB | «La descarga sin conexión no está disponible en este navegador.»; sin botón |
| MN-15 | Desarrollo | `npm run dev` | «La descarga está disponible en la versión de producción.» y «Prueba la versión de producción para instalar Metseri.» |
| MN-16 | Acerca de: desarrolladores | Menú → Acerca de | Espinosa Benítez Jesús; Garay Ocegueda Francisco Daniel; García Vázquez Edgar Daniel; Gonzalez Zapete Sophia |
| MN-17 | Acerca de: carrera e institución | Mismo diálogo | Ingeniería en Sistemas Computacionales; Instituto Tecnológico de Tepic |
| MN-18 | Teclado | Tab hasta Menú, Enter, Tab entre opciones, Escape | Se opera por teclado; Escape cierra y devuelve el foco |
| MN-19 | Celular vertical | 320, 360 y 412 px de ancho | Opciones visibles y tocables (≥ 44 px), sin desbordar |
| MN-20 | Celular horizontal | 360 px de alto | Las opciones se alcanzan, con desplazamiento si hace falta |
| MN-21 | VR con Menú abierto y descarga en curso | Abrir Menú, iniciar descarga, Entrar VR | Menú cerrado y oculto en VR; la descarga continúa |
| MN-22 | VR con Acerca de | Abrir Acerca de, cerrar, Entrar VR, Salir de VR | El Menú se puede abrir de nuevo |
| MN-23 | Sin regresión de acceso | `GET /api/admin/libros` sin cookie | 401, como antes |
| MN-24 | Sin regresión de descarga | Copia descargada antes del cambio | Sigue disponible sin conexión y se reconoce |
| MN-25 | Código reutilizado sin reescribir | `git diff` sobre `descargaSinConexion.jsx`, los servicios de instalación/descarga y `dialogoAplicacionMetseri.jsx` | Los dos primeros, sin diferencias; el diálogo, solo líneas movidas, `export` de `GuiaInstalacion` e `InstalacionMetseri` y las propiedades `visible`/`alTerminar` |
| MN-26 | Marcado del diálogo sin cambios | Prueba de caracterización de `DialogoAplicacionMetseri` (abierto y cerrado), antes y después de mover el código | El marcado es idéntico y la prueba pasa sin modificarse |
| MN-27 | Una sola instancia de descarga | Revisar el banner montado | Solo el Menú monta `DescargaSinConexion`; el diálogo no se monta en el banner |
