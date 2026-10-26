# Design

## Context

La motivación y el alcance se describen en `proposal.md`. Actualmente `api/index.js` exporta la aplicación Express con una ruta de estado y `server.js` la escucha en `PORT` o 3000. Vite ejecuta únicamente el frontend. No existe archivo `.env` ni cliente de Supabase en el repositorio, y no se ha comprobado el proyecto remoto.

El SQL entregado define ocho tablas con RLS, dos vistas públicas con `security_invoker` y `ficha_cuerpo(p_slug)`, función `stable security invoker` que devuelve una ficha JSON. Las políticas permiten cuerpos publicados y libros verificados y activos. La semilla crea ocho planetas y cuatro satélites sin publicar, con contenido editorial pendiente; no crea libros. El estado real puede haber cambiado desde la ejecución del SQL.

Las fichas del frontend siguen usando datos locales y no dependen de la API. Su identificador actual es un nombre como `tierra`; la base utiliza UUID en `id` y conserva ese nombre en `slug`. Esta diferencia debe quedar documentada para una integración futura.

El diseño se incluye por la integración con un servicio externo, el control de permisos y la necesidad de distinguir pruebas simuladas de evidencia real.

## Goals / Non-Goals

**Goals:**
- Implementar el contrato de `specs/consulta-contenido-api/spec.md` con consultas públicas de solo lectura y pruebas HTTP reproducibles.
- Conservar el punto de entrada y exportación actuales, limitar la configuración al backend y facilitar una comprobación real sin escrituras.

**Non-Goals:**
- Diseñar un ORM, repositorio genérico, sistema de autenticación o caché.
- Convertir el JSON al contrato React, sustituir los datos locales o representar los satélites en la escena.
- Corregir o volver a ejecutar el SQL proporcionado. Una diferencia remota se informará antes de proponer cambios fuera del alcance.

## Decisions

### 1. Reutilizar la Data API con fetch nativo

Añadir `api/consultaSupabase.js` para construir las URLs de los tres recursos permitidos y realizar consultas GET usando `fetch`, `URL` y `URLSearchParams` de Node. Se utilizará una señal de cancelación de cinco segundos y se validarán estado HTTP, JSON y forma básica de respuesta antes de devolver el contenido.

La [Data API de Supabase](https://supabase.com/docs/guides/api) admite vistas y funciones existentes y puede complementar un servidor propio. La llamada a `ficha_cuerpo` se hará mediante GET: PostgREST admite parámetros RPC en la consulta y ejecuta las peticiones GET en transacciones de solo lectura ([referencia RPC](https://docs.postgrest.org/en/v16/references/api/functions.html)).

Se descartan un cliente PostgreSQL directo y el SDK de Supabase para este alcance: las tres consultas no requieren sesiones, conexiones persistentes ni una dependencia nueva.

### 2. Mantener permisos públicos y configuración del servidor

Utilizar `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`, obtenidos del proyecto de la persona usuaria. Enviar la clave pública en `apikey`; no emplearla como JWT de usuario ni reenviar credenciales de las peticiones entrantes. No se admitirá una clave `sb_secret_` como sustituto. El acceso permanecerá en el rol público y dependerá de RLS, según la [documentación de claves](https://supabase.com/docs/guides/getting-started/api-keys).

La URL deberá ser HTTPS y no contener credenciales, consulta o fragmento. La configuración se comprobará al consultar contenido; un error permitirá seguir utilizando `/api/estado`. `.env.example` tendrá únicamente nombres y valores de muestra. `.env` ya está ignorado y no se usarán variables con prefijo `VITE_`.

Añadir `start:api` y `dev:api` en `package.json`, cargando `.env` mediante la opción nativa `--env-file-if-exists`; el segundo comando activará `--watch`. Documentar Node 22.12 o posterior compatible con la base de Vite. Se conserva `npm run dev` para el frontend.

### 3. Contratos pequeños sobre los recursos existentes

| Ruta de Metseri | Recurso de Supabase | Resultado |
| --- | --- | --- |
| `GET /api/cuerpos-celestes` | `v_cuerpos_exploracion`, selección explícita de las columnas del contrato, `order=orden.asc,slug.asc` | Arreglo de cuerpos visibles |
| `GET /api/cuerpos-celestes/:slug` | `rpc/ficha_cuerpo?p_slug=<slug>` | Objeto de ficha; `null` se convierte en 404 |
| `GET /api/cuerpos-celestes/:slug/libros` | Comprobar primero que la ficha sea visible; después consultar `v_libros_por_cuerpo` con filtro `cuerpo_slug=eq.<slug>` y `order=orden.asc,libro_id.asc` | Arreglo de campos bibliográficos del contrato |

El endpoint de libros emplea dos lecturas para distinguir un cuerpo público sin libros de uno no visible. Se acepta ese coste para evitar una función SQL adicional. Cada consulta tiene su propio plazo de cinco segundos. La verificación de existencia sigue las políticas vigentes; no constituye una instantánea compartida entre las dos lecturas.

Se conservan los nombres `snake_case` del contrato de base, UUID, rutas de imágenes y unidades base. Los nulos y arreglos vacíos se transmiten sin fabricar valores. Los créditos no están presentes en la función de ficha proporcionada; este cambio no modifica su SQL ni promete campos adicionales. El MVP contiene 12 cuerpos; una ampliación que supere los límites de filas de la Data API requerirá paginación explícita en otro cambio.

### 4. Integración acotada en Express

Conservar la exportación por defecto de `api/index.js` para `server.js`. Permitir construir la aplicación con el cliente de consulta inyectado para las pruebas, sin alterar el servidor de producción ni conectar las pruebas unitarias a Internet. El módulo de conexión también permitirá inyectar la función de transporte para probar solicitudes y errores.

Validar los slugs antes de acceder a Supabase. Las rutas fijas no aceptarán nombres arbitrarios de tabla, función o filtros remotos. Implementar 400, 404, 405 y 503 con el formato de error de la especificación; las respuestas no incluirán cuerpos de error remoto ni claves. El manejo de errores de las rutas nuevas no debe cambiar la respuesta de estado existente.

Se mantiene el origen local de backend en el puerto 3000. No se añade proxy de Vite ni CORS porque este cambio no conecta navegadores de otro origen al backend; los clientes HTTP y las pruebas pueden consultarlo directamente.

### 5. Verificación local y real separadas

Usar `node:test`, `assert`, servidores HTTP en puerto efímero y `fetch` nativo para probar rutas, permisos delegados, configuración, errores y método de transporte. `npm test` permanecerá independiente de credenciales y red externa. No se simulará que un transporte falso acredita la aplicación remota de RLS.

Añadir `api/comprobarSupabase.js` y el comando explícito `test:integracion`. Cargará la aplicación real con `.env`, la servirá temporalmente en localhost y consultará por HTTP listado, ficha y libros. Requerirá `CUERPO_PRUEBA_SLUG` y `CUERPO_PRUEBA_ID`, obtenidos por la persona usuaria de un registro publicado real. Deberá comparar ambos valores con listado y detalle y cerrar el servidor aun ante errores. Un listado vacío, variables ausentes o un registro inaccesible deben terminar con resultado no exitoso y causa legible, sin mostrar claves.

La comprobación no crea datos ni cambia publicación. Si existen libros públicos asociados, comprobará sus campos y correspondencia entre detalle y endpoint; si no existen, registrará esa rama como no verificada con datos reales y comprobará la respuesta vacía. La exclusión de cuerpos sin publicar y libros no verificados se contrastará con registros existentes si están disponibles y se identificará la evidencia que falte.

ESLint tendrá una configuración Node acotada a `server.js` y `api/**/*.js`, conservando las reglas de React para `src`. Esto corrige el error previo de `process` en el área que ahora se modifica.

## Risks / Trade-offs

- [La semilla no contiene cuerpos publicados] → La persona usuaria debe proporcionar un registro público existente para la prueba positiva; si no existe, la comprobación queda pendiente y no se publicará contenido automáticamente.
- [El SQL no coincide con el proyecto remoto o la Data API está deshabilitada] → Comprobar las tres consultas reales y registrar el recurso que falla; no ejecutar migraciones ni desactivar RLS.
- [Se configura una clave privilegiada] → Validar el tipo de clave admitido y documentar la obtención de la clave pública.
- [Un error remoto parece una lista vacía] → Devolver 503 y probar transporte, permisos, tiempo de espera y respuesta mal formada por separado del caso 200 con `[]`.
- [Se confunden UUID y slug, o se conectan antes de tiempo las fichas] → Mantener contratos separados y documentar la correspondencia sin editar `src/`.
- [Otro integrante modifica `main` durante el trabajo] → Revisar estado y diff antes de editar y al cerrar; preservar cambios ajenos y detener únicamente una edición que se solape hasta resolver su intención.
- [Las consultas a Supabase no acreditan por sí mismas todas las políticas] → Separar en el informe lo observado con datos remotos de lo cubierto mediante pruebas locales o lectura del SQL.

## Migration Plan

1. Implementar únicamente los archivos de backend, comandos, configuración Node y documentación descritos; conservar los cambios OpenSpec anteriores.
2. Configurar `.env` localmente con URL, clave pública y el UUID/slug de prueba; no versionar valores reales.
3. Ejecutar pruebas locales, lint, compilación y comprobación real. Registrar evidencia en `verificacion.md` del cambio y dejar sin marcar la tarea real si falta configuración o contenido público.
4. Revisar el diff en `main`. No hacer commit, push, despliegue ni archivar automáticamente.
5. Si es necesario revertir, retirar exclusivamente los cambios de este alcance mediante un diff revisado. No hay migraciones o escrituras remotas que deshacer.
