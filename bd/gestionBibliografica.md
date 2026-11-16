# API de gestión bibliográfica

Implementación para el módulo 01 existente, con el login propio de Metseri. No requiere ejecutar el módulo 02 ni volver a cargar el esquema original.

## Preparación en Supabase y el servidor

1. Revisar y ejecutar completo `bd/agregarGestionBibliografica.sql` en el SQL Editor de Supabase con el rol postgres. Es transaccional y repetible; añade cuatro funciones administrativas, concede acceso a service_role y excluye su ejecución pública. No cambia las políticas de lectura ni las fichas astronómicas.
2. Ejecutar completo [`publicarLibrosActivos.sql`](publicarLibrosActivos.sql) en el SQL Editor. La migración actualiza la vista pública que usan las fichas y su listado de libros. Un libro activo asociado a un cuerpo publicado queda disponible en ambos recursos.
3. En el archivo local `.env`, conservar la URL y la clave pública existentes y completar `SUPABASE_SECRET_KEY` con una clave **Secret** del mismo proyecto (formato `sb_secret_…`). Se obtiene en Project Settings → API Keys. No usar la clave Publishable para escribir. La implementación usa la clave Secret en el encabezado apikey, según la documentación oficial de Supabase.
4. Completar `ADMIN_USUARIO` y `ADMIN_CONTRASENA` (mínimo 12 caracteres). No subir `.env` ni poner la clave secreta en el frontend, Postman o capturas. Reiniciar el servidor después de cambiar el entorno.
5. Iniciar `npm run dev` o `npm run start:api`. El puerto por defecto es 3000. Ajustar la variable urlBase de Postman al puerto efectivo.

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

En POST se requieren `titulo` y al menos un autor. `editorial` y `anio` pueden quedar en null. `activo` vale true por defecto. En PATCH se conservan los campos omitidos. `autores` reemplaza la autoría completa y conserva su orden. Cada autor puede aparecer una vez por libro y vincularse a varios libros. `cuerpos` reemplaza las relaciones. El valor `[]` las retira salvo referencias protegidas. Cada relación necesita un slug existente y un orden de 1 a 32767.

La respuesta incluye las columnas de libros y arreglos autores (id, nombre, orden) y cuerpos (id, slug, nombre, orden, es_fuente_de_ficha). No se admite escribir IDs internos, fechas de verificación, verificado_por o es_fuente_de_ficha desde este CRUD. No se eliminan autores automáticamente: pueden estar compartidos.

**Visibilidad.** Activa el libro y asócialo a un cuerpo publicado para incluirlo en su ficha. Desactivarlo lo retira de las consultas públicas. `url_ficha` y `verificado` siguen disponibles en la API por compatibilidad con clientes anteriores. El panel usa `activo` y las asociaciones.

Errores JSON: `{ "error": { "codigo": "...", "mensaje": "..." } }`. Se distinguen 400 (entrada inválida), 401 (sin sesión), 404 (inexistente), 409 (duplicidad/dependencia), 413 (JSON mayor de 64 KB), 405 (método no admitido) y 503 (configuración/proveedor). Los detalles internos y las claves no se devuelven.

### Recomendaciones en vista única y VR

Las recomendaciones se consultan por separado en `/api/cuerpos-celestes/:slug/libros`, para que su error no bloquee la información astronómica. Se descartan duplicados y se muestran como máximo tres títulos, en orden. Los estados de carga, error y cobertura parcial son distintos.

`src/datos/recomendacionesCuradas.json` contiene únicamente explicaciones temáticas públicas por UUID: `{ "uuid-del-libro": { "tierra": "Explicación revisada" } }`. Después de cada alta, usar los UUID devueltos por la API y las justificaciones revisadas para actualizar ese mapa; comprobarlos contra la consulta pública. Ya contiene los cuatro UUID cargados y nunca concede visibilidad a un libro: solo enriquece un UUID recibido de la API pública. No copiar el archivo de investigación completo al frontend.

La vista normal muestra la invitación y los datos bibliográficos. Si hay una explicación temática, la muestra debajo de los datos. En VR se muestran el título, el autor y los datos de edición disponibles, con número a la izquierda. Cada libro comienza una página y continúa si el texto no cabe. La lectura HTML accesible de VR refleja esos mismos campos.

### Revertir el acceso administrativo bibliográfico

Deshabilitar el montaje de las rutas bibliográficas y retirar SUPABASE_SECRET_KEY del servidor. Como postgres, revocar ejecución a service_role sobre las cuatro funciones añadidas y retirarlas solo después de comprobar sus dependencias (listar/guardar dependen de obtener). No usar DROP CASCADE, no retirar las funciones/vistas públicas y no borrar tablas o libros para revertir las rutas. Revisar individualmente cualquier libro creado durante las pruebas.

**Límite de despliegue:** el login existente conserva sesiones en memoria. Reiniciar el servidor o cambiar de instancia puede perderlas. Antes de habilitar administración en un despliegue con varias instancias debe abordarse esa persistencia; esta implementación no modifica el sistema de login.
