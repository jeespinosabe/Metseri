# Tasks

No iniciar `/opsx:apply` hasta que la usuaria revise esta versión. Los casos de prueba (VL-xx para validación, MN-xx para el Menú) están en [casosDePrueba.md](casosDePrueba.md).

## 1. Validación de datos del libro (puntos 1 a 5, incluidas G1, G2 y G3)

### 1.A Preparación

- [x] 1.1 Esquema real de `libros`, restricciones y conteos obtenidos por la usuaria (11 libros, 0 incumplen longitud, editorial ni año); verificar que quedan registrados en design.md («Datos reales de Supabase»).
- [x] 1.2 Comprobar `'^[[:alpha:]]'` con «Álvaro», «Ñandú» y «#x» en Supabase; verificar el resultado registrado en design.md.
- [x] 1.3 Tarea ejecutada por la usuaria en Supabase y registrada en [verificacion.md](verificacion.md): (a) prueba de clases POSIX: true, false, true, true, true; (b) libros con caracteres de control, espacios repetidos o sin letra/dígito: 0, 0, 0 (de 11); (c) autores con menos de 2 caracteres: 0; además, el único trigger de `public.libros` es `trg_libros_actualizado_en`. Verificado: los resultados están en verificacion.md y ningún dato existente incumple las reglas nuevas.

### 1.B Reglas compartidas

- [x] 1.4 Crear `src/administracion/reglasLibro.js` con `LIMITES_LIBRO`, `normalizarTextoLibro` (recorta y reduce `\p{Zs}+` a un espacio), las validaciones de título, autoría, editorial y año (año actual por parámetro), el orden de validación de design D1 y los mensajes de los specs; verificar con `src/administracion/reglasLibro.test.js` los casos VL-01 a VL-34 con `npm test`.
- [x] 1.5 Hacer que `validarCampoLibro` y `validarBorradorLibro` de `registrosBibliograficos.js` usen el módulo, conservando su firma, y que `convertirBorrador` envíe título y editorial normalizados y nunca `editorial: null`; actualizar `registrosBibliograficos.test.js` (editorial obligatoria, años 1000 y 2100 inválidos, autor con número o de un carácter, textos con espacios repetidos); verificar que `npm test` pasa.

### 1.C Formulario y servicio

- [x] 1.6 En `formularioLibro.jsx`, marcar la editorial como «Obligatorio», actualizar la ayuda del año al rango vigente y mostrar los mensajes nuevos; verificar con `panelAdministrativo.test.js` actualizado (etiquetas, alta vacía, edición) y revisión en el navegador de VL-19 a VL-21 y VL-27 a VL-30.
- [x] 1.7 Hacer que `solicitarLibros` de `src/servicios/gestionBibliografica.js` adjunte `campos` al error, y que `FormularioLibro` guarde `erroresServidor`, los muestre bajo cada campo (`autores` → `autoria`), enfoque el primero, los borre al editar el campo y deje el aviso general solo para errores sin `campos`; verificar con una prueba estática y una respuesta 400 simulada (VL-35 a VL-37).

### 1.D API

- [x] 1.8 Hacer que `validarLibro` use el módulo compartido, exija editorial en POST, rechace `null` o vacía en PATCH, normalice título y editorial antes de enviar a la base, recoja todos los errores de campo y lance `ErrorLibros` con `campos`; que el manejador de `libros.js` incluya `error.campos` solo cuando exista; verificar con el nuevo `servidor/pruebas/gestionLibros.test.js` los casos VL-38 a VL-48 (POST válido en 201, varios errores, rechazo sin `campos`, PATCH parciales, duplicado 409 tras normalizar).

### 1.E Base de datos

- [x] 1.9 Escribir `bd/validarDatosLibros.sql` según design D4: verificación previa en bloque `DO` (libros y autores), `libros_anio_check` 1450–2100, `ck_libro_titulo`, `ck_libro_editorial` y `ck_autor_nombre` como restricciones normales, y la función `guardarLibroAdministrativo` con normalización (G1), validaciones (G2 incluida) y alta reestructurada; verificar ejecutándolo dos veces en un PostgreSQL aislado (PGlite, como `bd/verificarCorreccionPdf.mjs`) sobre una copia del esquema real que incluya el trigger `trg_libros_actualizado_en`, sin errores ni duplicados (VL-63).
- [x] 1.10 Probar en el PostgreSQL aislado el alta, la edición, `uq_libro`, la autoría, las relaciones, un libro verificado, `guardarLibroConPortada`, que `trg_libros_actualizado_en` sigue actualizando `actualizado_en` y la verificación previa con un libro sin editorial; las fixtures de prueba deben incluir editorial (la de `verificarCorreccionPdf.mjs` línea 46 no la tiene); verificar VL-49 a VL-61, y que ningún rechazo deja un libro parcial.
- [x] 1.11 Documentar en `bd/gestionBibliografica.md` los límites, el rango, la normalización, `error.campos`, los pasos de ejecución y la reversión, y corregir la frase «editorial y año pueden quedar en null»; verificar que los pasos se pueden seguir tal como están escritos y que no contienen claves.
- [ ] 1.12 *(parcial: migración aplicada y verificada en Supabase; pruebas por HTTP VL-38, VL-39 y VL-49 no probadas)* La usuaria ejecuta la migración en Supabase (después de 1.3) y se comprueba por HTTP local VL-38, VL-39 y VL-49; verificar el resultado y registrarlo en `verificacion.md`, junto con VL-62 (los 11 libros siguen consultables y editables).

## 2. Menú y «Acerca de» (punto 6)

### 2.A Línea base antes de tocar nada

- [x] 2.1 Sobre la versión actual construida (`npm run build` y `npm run preview`): registrar en `verificacion.md` el comportamiento de «Instalar Metseri» y «Descargar para usar sin conexión» en los casos MN-07 a MN-15 (textos, estados y avisos exactos, con capturas en `evidencias/menuPrincipal/base/`), y escribir `src/componentes/dialogoAplicacionMetseri.test.js`, una prueba de caracterización que renderiza `DialogoAplicacionMetseri` con `renderToStaticMarkup` (abierto y cerrado) y compara su marcado con el guardado; verificar que la prueba pasa sobre el código actual y que cada caso MN tiene resultado y evidencia. MN-07 a MN-09 son los que ejercen el código que se moverá.

### 2.B Instalación movida y exportada

- [x] 2.2 En `dialogoAplicacionMetseri.jsx`, exportar `GuiaInstalacion` y **mover sin reescribir** el estado y la lógica de instalación y la sección «Instalar Metseri» a un componente exportado `InstalacionMetseri({ visible, alTerminar })` del mismo archivo; el diálogo lo renderiza con `visible={abierto}` y `alTerminar={alCerrar}`. Verificar que `dialogoAplicacionMetseri.test.js` (2.1) pasa **sin modificarse** y que `git diff --color-moved` muestra solo líneas movidas, los `export` y las dos propiedades; si hiciera falta cambiar lógica, detenerse y preguntar.

### 2.C Componentes del Menú

- [x] 2.3 Crear `src/componentes/dialogoAcercaDe.jsx` con los datos de `src/datos/acercaDe.js` (`DESARROLLADORES`, la carrera y el Instituto Tecnológico de Tepic; en archivo aparte porque la regla `react-refresh/only-export-components` no permite exportar constantes desde un archivo de componentes), reutilizando los estilos de `.aplicacion-metseri`; verificar con `src/componentes/menuPrincipal.test.js` que los cuatro nombres, la carrera y la institución aparecen exactos (MN-16, MN-17).
- [x] 2.4 Crear `src/componentes/menuPrincipal.jsx` (patrón disclosure con `aria-expanded`) con, en el panel siempre montado y oculto con `hidden`: `InstalacionMetseri`, `DescargaSinConexion` (sin tocar `descargaSinConexion.jsx`), el enlace Administración y el botón Acerca de; verificar con `menuPrincipal.test.js` la estructura estática (MN-01, MN-02) y por teclado (MN-18).

### 2.D Integración en el banner

- [x] 2.5 En `franjaInstitucional.jsx`, agregar el Menú, quitar el enlace suelto de Administración, el botón de descarga y el montaje de `DialogoAplicacionMetseri`, sustituir `dialogoAbierto` por el estado del Menú y de Acerca de, y extender las guardas de cierre (`!activa`, Escape, foco, ratón) a ambos; verificar que el banner con el Menú cerrado no contiene «Administración» ni botón de descarga (MN-03), que solo hay una instancia de `DescargaSinConexion` y que `npm run lint` y `npm test` pasan.
- [x] 2.6 Conservar el comportamiento de `abrirAdministracion` (clic normal navega a `/admin` sin recargar; clic central y Ctrl+clic abren pestaña) sin tocar `App.jsx`; verificar MN-04 a MN-06 en el navegador y que `servidor/pruebas/autenticacionAdmin.test.js` pasa sin modificaciones.
- [x] 2.7 Estilos del Menú en `franjaInstitucional.css` con alcance en el panel (no se toca el CSS del diálogo): fondo claro como el diálogo, párrafos y listas como en `.aplicacion-metseri`, objetivos de 44 px, panel dentro de la pantalla con desplazamiento, solo icono en `max-width: 900px`, `prefers-reduced-motion`; verificar con capturas a 320, 360 y 412 px de ancho y en horizontal de 360 px de alto (MN-19, MN-20).

### 2.E Verificación del punto 6

- [ ] 2.8 *(no probada: comparación MN-07 a MN-15 contra la línea base)* Repetir **desde el Menú** los casos MN-07 a MN-15 y compararlos con la línea base de 2.1; verificar que textos, estados y avisos son idénticos, con énfasis en MN-07 a MN-09 (antes y después), y guardar las capturas en `evidencias/menuPrincipal/`; incluir MN-24 (una copia descargada antes del cambio sigue disponible sin conexión) y MN-26 y MN-27.
- [x] 2.9 Comprobar que `git diff` sobre `descargaSinConexion.jsx` y los servicios de instalación y descarga está vacío, y sobre `dialogoAplicacionMetseri.jsx` solo muestra lo descrito en 2.2 (MN-25).
- [ ] 2.10 *(no probada: celular y VR, MN-19 a MN-22)* Comprobar VR: abrir el Menú y Acerca de, entrar a VR, y con una descarga en curso; verificar que se cierran, que la descarga continúa y que al salir de VR el Menú funciona (MN-21, MN-22); anotar cualquier conflicto.

## 3. Verificación integral

- [x] 3.1 Ejecutar `npm run lint`, `npm test` y `npm run build`; verificar que terminan sin errores.
- [ ] 3.2 *(abierta: quedan casos no probados; ver la matriz de verificacion.md, sección 7)* Recorrer la matriz completa de `casosDePrueba.md` en escritorio y celular y registrar resultado y evidencia de cada caso en `verificacion.md`.
- [x] 3.3 Confirmar que no cambiaron autenticación ni sesiones: `git diff` no debe tocar `servidor/servicios/autenticacionAdmin.js` ni `servidor/rutas/administracion.js`, y MN-23 (401 sin cookie) pasa.

## Workflow follow-up

- Archivar primero `implementar-api-bibliografica` (30/30) y después este cambio, cuando la revisión esté aprobada.
- Los commits, el push y el merge los realiza la usuaria.
