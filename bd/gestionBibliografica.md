# API de gestión bibliográfica

Implementación para el módulo 01 existente, con el login propio de Metseri. No requiere ejecutar el módulo 02 ni volver a cargar el esquema original.

## Preparación en Supabase y el servidor

1. Revisar y ejecutar completo `bd/agregarGestionBibliografica.sql` en el SQL Editor de Supabase con el rol postgres. Es transaccional y repetible; añade cuatro funciones administrativas, concede acceso a service_role y excluye su ejecución pública. No cambia las políticas de lectura ni las fichas astronómicas.
2. Ejecutar completo [`publicarLibrosActivos.sql`](publicarLibrosActivos.sql) en el SQL Editor. La migración actualiza la vista pública que usan las fichas y su listado de libros. Un libro activo asociado a un cuerpo publicado queda disponible en ambos recursos.
3. Ejecutar [`guardarPortadasLibros.sql`](guardarPortadasLibros.sql) en el SQL Editor antes de publicar la versión con portadas. La migración añade las imágenes y el encuadre sin modificar los registros que ya existen.
4. Ejecutar [`guardarSesionesAdministrativas.sql`](guardarSesionesAdministrativas.sql) antes de desplegar la API con sesiones compartidas. Si el catálogo y las portadas ya funcionan, aplicar solo esta nueva migración. Las sesiones anteriores requieren iniciar sesión de nuevo.
5. Ejecutar completo [`validarDatosLibros.sql`](validarDatosLibros.sql) en el SQL Editor, después de las migraciones anteriores y **antes de desplegar la API con las validaciones**. Es transaccional y repetible: primero comprueba que ningún libro ni autor existente incumple las reglas (si alguno las incumple se detiene con un mensaje que indica cuántos y sus `id`, sin cambiar nada; ejecuta `ROLLBACK;` si el editor deja la transacción abierta), después reemplaza `libros_anio_check` y agrega `ck_libro_titulo`, `ck_libro_editorial` y `ck_autor_nombre`, y reemplaza `guardarLibroAdministrativo` con la misma firma y permisos. Las reglas están en la sección «Reglas de validación».
6. En el archivo local `.env`, conservar la URL y la clave pública existentes y completar `SUPABASE_SECRET_KEY` con una clave **Secret** del mismo proyecto (formato `sb_secret_…`). Se obtiene en Project Settings → API Keys. No usar la clave Publishable para escribir. La implementación usa la clave Secret en el encabezado apikey, según la documentación oficial de Supabase.
7. Completar `ADMIN_USUARIO` y `ADMIN_CONTRASENA` (mínimo 12 caracteres). No subir `.env` ni poner la clave secreta en el frontend, Postman o capturas. Reiniciar el servidor después de cambiar el entorno.
8. Iniciar `npm run dev` o `npm run start:api`. El puerto por defecto es 3000. Ajustar la variable urlBase de Postman al puerto efectivo.

Documentación del proveedor: [API keys](https://supabase.com/docs/guides/getting-started/api-keys), [funciones y permisos](https://supabase.com/docs/guides/database/functions).

## Contrato para el panel administrativo

Todas las rutas `/api/admin/libros` requieren la cookie del login `POST /api/admin/sesion`. El navegador debe conservar la cookie; los formularios envían JSON. No necesita claves de Supabase.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | /api/admin/libros?limite=50&desplazamiento=0 | Arreglo con hasta 100 libros por página; incluye borradores e inactivos, ordenados por creación descendente e id |
| GET | /api/admin/libros/:id | Libro completo o 404 |
| POST | /api/admin/libros | Libro creado, 201 y encabezado Location |
| PATCH | /api/admin/libros/:id | Libro actualizado, 200 |
| DELETE | /api/admin/libros/:id | 204 sin cuerpo; 409 si respalda una ficha |

Ejemplo de alta:

```json
{
  "titulo": "Título del libro",
  "autores": ["Nombre del primer autor", "Nombre de la segunda autora"],
  "editorial": "Editorial",
  "anio": 2020,
  "activo": true,
  "cuerpos": [{ "slug": "tierra", "orden": 1 }]
}
```

En POST se requieren `titulo`, `editorial` y al menos un autor. `anio` es opcional y puede quedar en null. `activo` vale true por defecto. En PATCH, una `editorial` enviada no puede ser nula ni vacía. En PATCH se conservan los campos omitidos. `autores` reemplaza la autoría completa y conserva su orden. Cada autor puede aparecer una vez por libro y vincularse a varios libros. `cuerpos` reemplaza las relaciones. El valor `[]` las retira salvo referencias protegidas. Cada relación necesita un slug existente y un orden de 1 a 32767.

La respuesta incluye las columnas de libros y arreglos autores (id, nombre, orden) y cuerpos (id, slug, nombre, orden, es_fuente_de_ficha). No se admite escribir IDs internos, fechas de verificación, verificado_por o es_fuente_de_ficha desde este CRUD. No se eliminan autores automáticamente: pueden estar compartidos.

**Visibilidad.** Activa el libro y asócialo a un cuerpo publicado para incluirlo en su ficha. Desactivarlo lo retira de las consultas públicas. `url_ficha` y `verificado` siguen disponibles en la API por compatibilidad con clientes anteriores. El panel usa `activo` y las asociaciones.

Errores JSON: `{ "error": { "codigo": "...", "mensaje": "..." } }`. Cuando el rechazo se debe a campos inválidos (400 `LIBRO_INVALIDO`), se añade `campos` con el mensaje de cada uno, bajo las claves `titulo`, `autores`, `editorial` y `anio`; `mensaje` reúne esos mismos textos y los clientes que no lean `campos` no se ven afectados:

```json
{ "error": { "codigo": "LIBRO_INVALIDO",
  "mensaje": "El título admite hasta 200 caracteres. Escribe la editorial del libro.",
  "campos": { "titulo": "El título admite hasta 200 caracteres.", "editorial": "Escribe la editorial del libro." } } }
```

Los rechazos que no corresponden a un campo (campo desconocido, relaciones o portada inválidas) no incluyen `campos`. Se distinguen 400 (entrada inválida), 401 (sin sesión), 404 (inexistente), 409 (duplicidad/dependencia), 413 (JSON mayor de 64 KB), 405 (método no admitido) y 503 (configuración/proveedor). Los detalles internos y las claves no se devuelven.

### Reglas de validación

Las aplican, con los mismos criterios, el formulario, la API (`validarLibro`, con el módulo compartido `src/administracion/reglasLibro.js`) y la base de datos (`validarDatosLibros.sql`).

| Campo | Regla |
| --- | --- |
| `titulo` | Obligatorio; hasta 200 caracteres; una sola línea sin caracteres de control; espacios exteriores recortados y espacios repetidos reducidos a uno; al menos una letra o un dígito. |
| `autores` | De 1 a 50 nombres sin repetir (sin distinguir mayúsculas); cada nombre inicia con una letra (no con número, símbolo ni puntuación) y mide de 2 a 100 caracteres. |
| `editorial` | Obligatoria; hasta 100 caracteres; las mismas reglas de texto que el título. |
| `anio` | Opcional; entero de cuatro cifras entre 1450 y el año actual + 1 (el servidor decide el año). La tabla admite como máximo 2100. |

La normalización de espacios ocurre **antes** de guardar y de comparar con `uq_libro`, de modo que «Cosmos  infinito» y «Cosmos infinito» se consideran el mismo título (409 `LIBRO_DUPLICADO`). Limitación: `uq_libro (titulo, editorial, anio)` no detecta duplicados cuando `anio` es nulo, porque un `UNIQUE` normal no trata los `NULL` como iguales.

En la base, `libros_anio_check` (1450–2100), `ck_libro_titulo`, `ck_libro_editorial` y `ck_autor_nombre` son restricciones normales y validadas, y `guardarLibroAdministrativo` aplica el año máximo vigente. El alta inserta título y editorial juntos porque una fila sin editorial violaría `ck_libro_editorial`.

### Recomendaciones en vista única y VR

Las recomendaciones se consultan por separado en `/api/cuerpos-celestes/:slug/libros`, para que su error no bloquee la información astronómica. Se descartan duplicados y se muestran como máximo tres títulos, en orden. Los estados de carga, error y cobertura parcial son distintos.

`src/datos/recomendacionesCuradas.json` contiene únicamente explicaciones temáticas públicas por UUID: `{ "uuid-del-libro": { "tierra": "Explicación revisada" } }`. Después de cada alta, usar los UUID devueltos por la API y las justificaciones revisadas para actualizar ese mapa; comprobarlos contra la consulta pública. Ya contiene los cuatro UUID cargados y nunca concede visibilidad a un libro: solo enriquece un UUID recibido de la API pública. No copiar el archivo de investigación completo al frontend.

La vista normal muestra la invitación y los datos bibliográficos. Si hay una explicación temática, la muestra debajo de los datos. En VR se muestran el título, el autor y los datos de edición disponibles, con número a la izquierda. Cada libro comienza una página y continúa si el texto no cabe. La lectura HTML accesible de VR refleja esos mismos campos.

### Revertir las validaciones

Como postgres, en una transacción: `alter table public.libros drop constraint ck_libro_titulo, drop constraint ck_libro_editorial, drop constraint libros_anio_check;`, volver a agregar `libros_anio_check` con `check (anio between 1000 and 2100)`, `alter table public.autores drop constraint ck_autor_nombre;` y restaurar `guardarLibroAdministrativo` ejecutando de nuevo su definición de `agregarGestionBibliografica.sql`. Los datos no se modifican en ningún paso. Para comprobar las validaciones sin tocar Supabase: `node bd/verificarValidacionLibros.mjs ruta/al/modulo/pglite/dist/index.js` (PGlite no es dependencia de la aplicación).

### Revertir el acceso administrativo bibliográfico

Deshabilitar el montaje de las rutas bibliográficas y retirar SUPABASE_SECRET_KEY del servidor. Como postgres, revocar ejecución a service_role sobre las cuatro funciones añadidas y retirarlas solo después de comprobar sus dependencias (listar/guardar dependen de obtener). No usar DROP CASCADE, no retirar las funciones/vistas públicas y no borrar tablas o libros para revertir las rutas. Revisar individualmente cualquier libro creado durante las pruebas.

Las instancias de la API consultan las sesiones administrativas en Supabase. La tabla guarda una huella de cada sesión y su fecha de vencimiento. Al cerrar sesión, la API elimina esa huella para revocar el acceso en todas las instancias.
