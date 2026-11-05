# Verificación de corregir-rutas-api-en-vercel

Fecha de comprobación local: 2026-11-04, 19:57, zona America/Mazatlan.

## Estado

La implementación local está lista. Las tareas 1.1 a 1.4 quedan completadas; las tareas 2.1 a 2.4 siguen pendientes de disponer de un despliegue que incluya esta versión.

Se añadió `vercel.json` con la reescritura de `/api/:path*` a `/api`, utilizando la aplicación ya exportada por `api/index.js`. Se documentaron la compilación, las variables de Vercel y el diagnóstico de las respuestas en `README.md`. No se movieron archivos ni se cambiaron módulos de la interfaz, de Express o de Supabase. No se instalaron dependencias.

## Comprobaciones locales realizadas

| Comprobación | Resultado | Alcance |
| --- | --- | --- |
| Lectura de `vercel.json` con `JSON.parse` y revisión de la entrada y del prefijo de la regla | Correcta | JSON válido, `api/index.js` existente y regla limitada a `/api/...`; no captura `/`, `/assets/...` ni `/imagenes/...`. No ejecuta el enrutador de Vercel. |
| Cotejo de `README.md` con `package.json`, `.env.example`, las rutas y el servicio de consulta | Correcto | Compilación, nombres de variables, endpoints y códigos de error corresponden al proyecto. No se incluyeron valores de credenciales. |
| `npm run build` | Código de salida 0 | Vite 8.3.4 compiló 44 módulos y generó `dist/`. |
| `npm test` | Código de salida 0 | 199 pruebas correctas en 18 suites, sin fallos, cancelaciones ni pruebas omitidas. |
| `git diff --check` | Código de salida 0 | Sin errores de espacios en el diff de archivos versionados. |
| `openspec validate corregir-rutas-api-en-vercel --strict` | Código de salida 0 | Cambio válido según OpenSpec. |

La compilación mantuvo el aviso sobre un archivo JavaScript de más de 500 kB: el paquete generado mide 829.23 kB antes de gzip. El aviso no impidió compilar y no se modificó el código de la escena para optimizarlo dentro de este cambio de enrutamiento.

La revisión del estado de Git limitó la implementación a `vercel.json`, la sección nueva de `README.md` y los archivos de este cambio OpenSpec. La validación del JSON confirma su formato y alcance; la compilación y las pruebas existentes cubren la aplicación local, pero no demuestran que Vercel ya atienda las rutas nuevas.

## Diagnóstico HTTP anterior a la corrección

Estas respuestas proceden del diagnóstico previo realizado en esta conversación sobre [el despliegue de prueba](https://metseri-prueba.vercel.app/), antes de crear el archivo de configuración. No son una comprobación de la versión corregida ni se presentan como resultados posteriores a su publicación.

| Ruta | Estado HTTP observado | Tipo y contenido relevante |
| --- | --- | --- |
| `/` | 200 | `text/html`, interfaz compilada de Metseri. |
| `/api` | 404 | `text/html`, respuesta de Express `Cannot GET /api`. |
| `/api/estado` | 404 | `text/plain`, respuesta de Vercel `NOT_FOUND`. |
| `/api/cuerpos-celestes/tierra` | 404 | `text/plain`, respuesta de Vercel `NOT_FOUND`. |

La diferencia entre la respuesta de Express en `/api` y los errores de plataforma en sus rutas internas fundamenta la corrección de enrutamiento. Ese diagnóstico no verifica la configuración o la conectividad de Supabase en Vercel.

## Comprobaciones públicas pendientes

No se hizo commit, push ni despliegue, y no se consultaron ni modificaron las variables de la cuenta de Vercel. Por tanto, todavía no se ha verificado un despliegue que incluya esta corrección.

| Tarea | Pendiente de verificar en la versión publicada |
| --- | --- |
| 2.1 | `/api/estado` con 200 y el JSON esperado; raíz, JavaScript compilado e imagen local disponibles. Registrar URL, fecha y versión probada. |
| 2.2 | Listado, fichas y libros de un planeta y un satélite publicados; estados 200, contratos y coincidencia de UUID y slug. Un arreglo de libros vacío es válido. |
| 2.3 | Slug inválido con 400 y `SLUG_INVALIDO`; slug válido inexistente con 404 y `CUERPO_NO_ENCONTRADO`, con la conexión operativa. Distinguir esos errores JSON del `NOT_FOUND` de Vercel. |
| 2.4 | Selección de planeta y satélite en el navegador, contenido recibido desde `/api` del mismo dominio y escena e imágenes disponibles. |

La cobertura local existente de configuración ausente o inválida y fallos de consulta está incluida entre las 199 pruebas correctas. No se provocaron fallos modificando variables de producción ni datos de Supabase.

## Continuación

La persona responsable debe publicar la versión que incluye `vercel.json` mediante su flujo habitual, con compilación `npm run build` y salida `dist`. En Vercel deben estar configuradas `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` para el entorno utilizado; los cambios de variables requieren un nuevo despliegue. Los pasos y las consultas están en la sección Despliegue en Vercel de `README.md`.

Cuando esté disponible esa versión, continuar las tareas 2.1 a 2.4 y sustituir sus estados pendientes por resultados observados. Un 200 en `/api/estado` acreditará el acceso a Express; para acreditar la recuperación de datos se necesita además el resultado positivo de las fichas publicadas. Hasta entonces el cambio no está verificado en producción ni listo para archivarse como completado.
