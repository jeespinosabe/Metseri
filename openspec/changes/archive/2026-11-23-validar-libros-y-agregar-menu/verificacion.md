# Verificación

Registro de comprobaciones del cambio `validar-libros-y-agregar-menu`. Sin credenciales ni datos privados.

## 1. Preparación (tareas 1.1 a 1.3)

Ejecutadas por la usuaria en Supabase (SQL Editor). Se registran los resultados que comunicó.

### 1.1 Esquema real y conteos

- `public.libros`: `id uuid`, `titulo text NOT NULL`, `editorial text NULL`, `anio smallint NULL`, `url_ficha text NULL`, `verificado bool NOT NULL`, `verificado_por uuid`, `verificado_en timestamptz`, `activo bool NOT NULL`, `creado_en`, `actualizado_en`.
- Restricciones: `ck_libro_verificado_completo`, `libros_anio_check` (1000–2100), `libros_titulo_check`, `libros_url_ficha_check`, `uq_libro UNIQUE (titulo, editorial, anio)`, `libros_pkey`.
- 11 libros; 0 sin editorial, 0 con título > 200, 0 con editorial > 100, 0 con año fuera de 1450 a año actual + 1.
- Autores inválidos (`___` y `$$%^&*()(*&^%$#@!@#$%^&*(`): no tenían libros (`libros_autores_autor_id_fkey` es `ON DELETE RESTRICT`); eliminados por la usuaria; consulta de verificación: 0.

### 1.2 Regla «iniciar con letra» en SQL

`'^[[:alpha:]]'` acepta «Álvaro» y «Ñandú» y rechaza «#x».

### 1.3 Clases POSIX, G1 y G2

**(a) Prueba de clases POSIX** (letra con eñe, solo símbolos, salto de línea, tabulador, espacios repetidos):

| Prueba | Esperado | Resultado |
| --- | --- | --- |
| `'Ñandú 2' ~ '[[:alnum:]]'` | true | true |
| `'!!!' ~ '[[:alnum:]]'` | false | false |
| `('a' \|\| chr(10)) ~ '[[:cntrl:]]'` | true | true |
| `('a' \|\| chr(9)) ~ '[[:cntrl:]]'` | true | true |
| `'a  b' ~ '[[:space:]]{2,}'` | true | true |

Las clases POSIX funcionan como se esperaba.

**(b) Libros con caracteres de control, espacios repetidos o sin letra/dígito** (sobre los 11 libros): 0, 0 y 0.

**(c) Autores con menos de 2 caracteres:** 0.

**Triggers en `public.libros`:** solo `trg_libros_actualizado_en`. Debe incluirse en la copia del esquema para las pruebas en PGlite (tareas 1.9 y 1.10).

**Conclusión:** ningún dato existente incumple las reglas nuevas; la verificación previa (`DO`) de `validarDatosLibros.sql` se conserva como red de seguridad.

## 2. Grupo 1: validación (tareas 1.4 a 1.11)

Aplicado sin commit ni push y sin ejecutar SQL contra Supabase.

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Sin errores ni advertencias |
| `npm test` (344 pruebas) | 344 superadas, 0 fallidas |
| `src/administracion/reglasLibro.test.js` (nuevo) | VL-01 a VL-34 y VL-22 a VL-26 cubiertos con el año fijado en 2026 |
| `servidor/pruebas/gestionLibros.test.js` (nuevo, 22 pruebas) | VL-38 a VL-48 por la función y por HTTP: 201 con `Location`, 400 con `campos`, rechazo sin `campos`, PATCH, 409 tras normalizar |
| `src/servicios/gestionBibliografica.test.js` (nuevo) y `registrosBibliograficos.test.js` | El error del servidor conserva `campos`; traducción `autores` → `autoria` (VL-35 a VL-37, sin interacción de pantalla) |
| `node bd/verificarValidacionLibros.mjs` (PGlite) | 24 comprobaciones superadas: VL-47 a VL-64 sobre `bd/validarDatosLibros.sql`, incluida la ejecución doble, la verificación previa con 5 tipos de dato inválido (sin cambios y con el `rollback` indicado), el alta sin libro parcial, `guardarLibroConPortada` y `trg_libros_actualizado_en` |

**Notas y desviaciones**

- PGlite no es dependencia del proyecto: se instaló fuera de él, en la carpeta temporal de la sesión, y el script recibe su ruta como argumento.
- El esquema de la fixture del script es una **reconstrucción** de lo informado de Supabase (columnas, restricciones y trigger). Aproxima, no sustituye, ejecutar la migración en Supabase (tarea 1.12).
- El script reproduce el comportamiento de `[[:alpha:]]` con «Álvaro», «Ñandú» y «Ünal» en PGlite, igual que lo observado en Supabase.
- `servidor/pruebas/portadasLibros.test.js` se ajustó: su alta de prueba no enviaba editorial y la regla nueva la rechaza (400).
- En una ejecución de `npm test` hecha mientras corrían otras pruebas, `proxyContenido.test.js` falló por un choque de directorios temporales de Vite (`ENOTEMPTY`); aislado y en la ejecución limpia pasa.
- **Pendiente (1.6 y 1.7):** la revisión manual del formulario en el navegador (mensajes bajo cada campo, foco, borrado del mensaje al editar). La interacción no tiene prueba automática porque el proyecto no incluye un entorno DOM.

## 3. Revisión de la usuaria tras el grupo 1

Informado por la usuaria; no lo ejecutó Claude.

- **Tareas 1.6 y 1.7 (formulario en el navegador):** probó el formulario y se comporta como esperaba: mensajes bajo cada campo, foco en el primero, borrado del mensaje al editar el campo y lo escrito se conserva.
- **Migración `bd/validarDatosLibros.sql`:** aplicada en Supabase y verificada (restricciones y función nueva).
- **Pruebas que habían fallado:** las repitió y dieron el resultado correcto.
- **Tarea 1.12:** queda abierta solo la parte de pruebas por HTTP (VL-38, VL-39 y VL-49).

## 4. Grupo 2: Menú y «Acerca de»

### 4.1 Línea base (tarea 2.1)

Hecha por la usuaria sobre la versión actual, antes de modificar nada. Capturas en `evidencias/menuPrincipal/base/` (sin cambiarles el nombre):

| Archivo | Qué muestra (revisado por Claude) |
| --- | --- |
| `Screenshot 2026-11-23 191248.png` | Banner desplegado con la marca, los tres logos, el botón «Administración» y el botón de descarga (icono) sueltos |
| `Screenshot 2026-11-23 191342.png` | Diálogo «Instalar o descargar» con el botón «Instalar Metseri» y el aviso «La descarga está disponible en la versión de producción.» |
| `Screenshot 2026-11-23 191415.png` | Mismo diálogo con «Instalar Metseri», «Prueba la versión de producción para instalar Metseri.» y «La descarga está disponible en la versión de producción.» (guía de instalación y aviso de desarrollo) |

Las capturas corresponden a la versión de desarrollo. Los casos que requieren la versión de producción (descarga real, instalación) los registra la usuaria con su propia verificación en el navegador.

### 4.2 Aplicación del grupo 2 (tareas 2.2 a 2.7 y 2.9)

Aplicado sin commit ni push, en la rama `main`. Las verificaciones en navegador (celular, VR, instalación y descarga reales: tareas 2.8 y 2.10) quedan a cargo de la usuaria.

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Sin errores ni advertencias |
| `npm test` | 358 pruebas, 358 superadas, 0 fallidas |
| `npm run build` | Termina sin errores (PWA generada) |
| `src/componentes/dialogoAplicacionMetseri.test.js` (nuevo, MN-26) | 3 pruebas: el marcado del diálogo es idéntico al capturado **antes** de mover el código. Pasó antes y después del cambio, sin modificarse |
| `src/componentes/menuPrincipal.test.js` (nuevo) | 11 pruebas: MN-01, MN-02, MN-03, MN-16, MN-17 y MN-27 en marcado estático |

**Movimiento en `dialogoAplicacionMetseri.jsx` (tarea 2.2):** comparación de líneas (sin sangría ni líneas vacías) entre `HEAD` y el archivo nuevo: se conservan 88 de las 91 líneas anteriores. Las únicas tres líneas anteriores que cambian son: `function GuiaInstalacion() {` → `export function GuiaInstalacion() {`; `if (!abierto && muestraGuia) …` → `if (!visible && muestraGuia) …`; y `alCerrar()` → `alTerminar()` dentro de `instalar`. Las demás diferencias son el esqueleto del componente nuevo (`export function InstalacionMetseri`, `return (`, `<>`, `</>`, `)`) y la llamada `<InstalacionMetseri visible={abierto} alTerminar={alCerrar} />`. No se cambió lógica.

**Archivos que no cambiaron (comprobado con `git status` y `git diff`):** `src/App.jsx`, `src/componentes/accesoAdministrativo.jsx`, `src/componentes/descargaSinConexion.jsx`, `src/componentes/escenaEstelar.jsx`, `src/servicios/instalacionMetseri.js`, `archivosSinConexion.js`, `descargaEducativa.js`, `servidor/servicios/autenticacionAdmin.js` y `servidor/rutas/administracion.js` (MN-25, parte automática).

**Notas y desviaciones**

- **La prueba de caracterización de 2.1 usa un recurso de prueba.** El diálogo y `DescargaSinConexion` usan `useSyncExternalStore` sin `getServerSnapshot`, y React no puede renderizarlos en servidor tal cual. Solo en las pruebas se agrega ese tercer argumento al código cargado mediante un complemento de Vite; los archivos del proyecto no se tocan. Se renderiza la versión de desarrollo, así que **no cubre los avisos de producción**: esos los cubren los casos manuales MN-07 a MN-14.
- **Datos de «Acerca de» en archivo aparte** (`src/datos/acercaDe.js`): la regla `react-refresh/only-export-components` no permite exportar constantes desde `dialogoAcercaDe.jsx`.
- **CSS del banner:** se retiraron dos reglas que quedaron sin uso (`.franja-institucional__descarga` y `.franja-institucional__etiqueta-administracion`). No se tocó el CSS del diálogo `.aplicacion-metseri`.
- **Foco y teclado:** al abrir el banner con teclado el foco va al botón «Menú» (antes iba al enlace de Administración). Con el Menú abierto, Escape cierra primero el Menú y conserva el banner; al cerrar «Acerca de» el foco regresa al botón «Menú».
- **Pendiente de la usuaria:** MN-04 a MN-15 y MN-18 a MN-22 en el navegador; y, por tanto, las casillas 2.8 y 2.10.

## 5. Estado real de las verificaciones manuales de la usuaria

Informado por la usuaria; no lo ejecutó Claude. **Este apartado corrige un registro anterior** que daba por satisfactorias las tareas 2.8, 2.10 y las pruebas HTTP de 1.12 a partir de un mensaje de la usuaria; ella aclaró después que **no las verificó**, y aquí se deja el estado real.

**Hechas por la usuaria**

- **Formulario de validación (tareas 1.6 y 1.7):** probado en el navegador; se comporta como esperaba (mensajes bajo cada campo, foco, borrado del mensaje al editar, lo escrito se conserva).
- **Migración `bd/validarDatosLibros.sql`:** aplicada en Supabase y verificada (restricciones y función nueva).
- **Sus pruebas de validación:** las repitió y dieron el resultado correcto.
- **Menú en `vite preview`:** revisó el Menú con «Instalar Metseri», «Descargar para usar sin conexión», Administración y Acerca de; sale como quería. Es una revisión general, sin comparación caso por caso contra la línea base.
- **Observación:** en `npm run dev` el botón «Descargar para usar sin conexión» no aparece y se ve el aviso «La descarga está disponible en la versión de producción.»; es lo previsto: `DescargaSinConexion`, que no se modificó, lo muestra cuando `import.meta.env.PROD` es falso (MN-15).

**No verificadas (siguen pendientes)**

| Tarea | Qué falta | Estado |
| --- | --- | --- |
| 2.8 | Comparar MN-07 a MN-15 desde el Menú contra la línea base de 2.1 | **No probada** |
| 2.10 | Celular y VR (MN-19 a MN-22) | **No probada** |
| 1.12 | Pruebas por HTTP VL-38, VL-39 y VL-49 | **No probadas** (la parte de la migración en Supabase sí está hecha) |

No hay capturas posteriores al cambio en `evidencias/menuPrincipal/` (solo `base/`).

**Trabajo posterior, fuera de este cambio y sin OpenSpec:** mostrar los límites de caracteres también en Editorial y Autoría del formulario, igual que en Título, y otras mejoras que la usuaria indicará.

## 6. Verificación integral hecha por Claude (tareas 3.1 y 3.3)

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Sin errores ni advertencias |
| `npm test` | 358 pruebas, 358 superadas, 0 fallidas |
| `npm run build` | Sin errores (PWA generada, 31 entradas) |
| `git status` / `git diff` de `servidor/servicios/autenticacionAdmin.js`, `servidor/rutas/administracion.js`, `src/App.jsx` y `src/componentes/accesoAdministrativo.jsx` | Sin cambios |
| MN-23 sobre una API real levantada en otro puerto con el `.env` (sin imprimir valores) | `GET /api/admin/libros` → 401 `SESION_REQUERIDA`; `POST /api/admin/libros` sin cookie → 401; `GET /api/admin/sesion` → 200 `{"autenticado":false}` |
| `servidor/pruebas/autenticacionAdmin.test.js` | Pasa sin modificaciones |

## 7. Matriz de casos (tarea 3.2): evidencia por caso

Leyenda: **A** = prueba automática (`npm test`); **P** = PGlite (`bd/verificarValidacionLibros.mjs`, 24 comprobaciones); **U** = verificación de la usuaria (sección 5); **C** = comprobación de Claude (sección 6); **NP** = no probado.

| Casos | Evidencia |
| --- | --- |
| VL-01 a VL-34 | A (`reglasLibro.test.js`, `registrosBibliograficos.test.js`, `panelAdministrativo.test.js`); además U: formulario probado en el navegador (1.6 y 1.7) |
| VL-35 a VL-37 (mensajes del servidor bajo el campo) | A (`registrosBibliograficos.test.js`, `gestionBibliografica.test.js`) y U (formulario en el navegador) |
| VL-38, VL-39 | A (`gestionLibros.test.js`, por HTTP con base simulada). **Por HTTP contra el entorno real: NP** |
| VL-40 a VL-48 | A (`gestionLibros.test.js`) |
| VL-49 | P. **Por HTTP: NP** |
| VL-50 a VL-61, VL-63, VL-64 | P |
| VL-62 | P; además U: migración aplicada en Supabase y verificada |
| MN-01, MN-02, MN-03 | A (`menuPrincipal.test.js`); U general: Menú revisado en `vite preview` |
| MN-16, MN-17 | A (`menuPrincipal.test.js`); U general (Acerca de en `vite preview`) |
| MN-23 | C |
| MN-25 | C (`git diff` y `git status`, sección 4.2) |
| MN-26, MN-27 | A (`dialogoAplicacionMetseri.test.js`, `menuPrincipal.test.js`) |
| MN-07 a MN-15 | **NP** como comparación contra la línea base (tarea 2.8); solo la revisión general en `vite preview` y MN-15 observado en desarrollo |
| MN-19 a MN-22 (celular y VR) | **NP** (tarea 2.10) |
| MN-04, MN-05, MN-06 (Administración) | **NP**; solo A indirecta: el banner conserva `href="/admin"` y el mismo `onClick` |
| MN-18 (teclado) | **NP** |
| MN-24 (copia descargada antes del cambio) | **NP** |

## 8. Pendiente

- **Tareas abiertas:** 1.12 (solo las pruebas HTTP), 2.8, 2.10 y 3.2.
- **Casos no probados:** los marcados NP en la sección 7.
- **Trabajo posterior sin OpenSpec:** límites visibles en Editorial y Autoría y otras mejoras (ver sección 5).
