# Verificación de corregir-rutas-api-en-vercel

Fecha de comprobación local: 2026-11-04, 19:57, zona America/Mazatlan.

## Estado

El cambio tiene sus 8 tareas completadas. La implementación local, el estado y los recursos del despliegue, la recuperación real de contenido, los errores HTTP y las fichas de Tierra y Luna en el navegador están verificados. El usuario publicó la versión y corrigió las variables de conexión; el agente no realizó esos cambios en la cuenta de Vercel.

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

## Comprobaciones del despliegue actualizado

El usuario confirmó la publicación. La verificación se realiza contra [el dominio de prueba](https://metseri-prueba.vercel.app/). El agente no hizo commit, push ni despliegue, ni consultó o modificó las variables de la cuenta de Vercel.

| Tarea | Resultado actual en la versión publicada |
| --- | --- |
| 2.1 | Completada. `/api/estado` devuelve 200 y el JSON esperado; raíz, JavaScript compilado e imagen local devuelven 200. Comprobado el 2026-11-04 a las 20:05, America/Mazatlan (2026-11-05 03:05 UTC). |
| 2.2 | Completada tras corregir la configuración: listado con 12 cuerpos, fichas y libros de Tierra y Luna con 200 JSON, UUID y slug coincidentes entre listado y ficha. Ambas rutas de libros devuelven `[]`, permitido por el contrato. |
| 2.3 | Completada: `TIERRA` devuelve 400 JSON con `SLUG_INVALIDO`; el slug válido inexistente devuelve 404 JSON con `CUERPO_NO_ENCONTRADO`. Se cotejó la cobertura local existente de errores 503. |
| 2.4 | Completada: selección real de Tierra y Luna en el navegador, descripciones y datos cargados, imágenes locales disponibles y regreso a la escena al cerrar Tierra. Evidencia visual guardada en los artefactos del chat. |

### Comprobación inicial del despliegue, 20:05 a 20:08

El usuario informó que ya desplegó la versión. La disponibilidad de las rutas internas que antes producían `NOT_FOUND` confirma funcionalmente que el dominio ya dirige las peticiones hacia Express. No se inspeccionó un identificador de despliegue de la cuenta de Vercel.

| Ruta | Estado | Tipo y resultado |
| --- | --- | --- |
| `/` | 200 | `text/html`, documento de Metseri. |
| `/api/estado` | 200 | `application/json`, `{ "proyecto": "Metseri", "mensaje": "API de Metseri funcionando correctamente", "estado": "activo" }`. |
| `/assets/index-DUr-W2mm.js` | 200 | `application/javascript`, 829232 bytes. |
| `/imagenes/planetas/tierra.webp` | 200 | `image/webp`, 34764 bytes. |
| `/api/cuerpos-celestes` | 503 | `application/json`, `CONFIGURACION_NO_DISPONIBLE`. |
| `/api/cuerpos-celestes/tierra` | 503 | `application/json`, `CONFIGURACION_NO_DISPONIBLE`. |
| `/api/cuerpos-celestes/tierra/libros` | 503 | `application/json`, `CONFIGURACION_NO_DISPONIBLE`. |
| `/api/cuerpos-celestes/luna` | 503 | `application/json`, `CONFIGURACION_NO_DISPONIBLE`. |
| `/api/cuerpos-celestes/luna/libros` | 503 | `application/json`, `CONFIGURACION_NO_DISPONIBLE`. |
| `/api/cuerpos-celestes/TIERRA` | 400 | `application/json`, `SLUG_INVALIDO`. |
| `/api/cuerpos-celestes/cuerpo-inexistente-verificacion` | 503 | `application/json`, `CONFIGURACION_NO_DISPONIBLE`; falta comprobar el 404 cuando la conexión esté configurada. |

Seguimiento registrado el 2026-11-04 a las 20:08, America/Mazatlan (2026-11-05 03:08 UTC). La comprobación de contenido terminó con código 1 al recibir 503 donde se esperaba 200; no se presenta como integración exitosa. El error controlado recibido fue:

```json
{
  "error": {
    "codigo": "CONFIGURACION_NO_DISPONIBLE",
    "mensaje": "La conexión de contenido no está configurada correctamente."
  }
}
```

### Configuración pendiente en la comprobación inicial

El código de `api/servicios/consultaSupabase.js` valida `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` antes de hacer una consulta externa. La URL debe usar HTTPS y apuntar a la raíz del proyecto, sin una ruta como `/rest/v1`; la clave debe cumplir el prefijo y formato `sb_publishable_…`. El 503 observado en la comprobación inicial indicaba que la configuración faltaba o era inválida para ese contrato. No acreditaba un fallo de red o de permisos de Supabase: la consulta se rechazaba antes de iniciarse.

No se inspeccionaron los valores de la cuenta, así que no se puede distinguir desde esta respuesta pública entre variables ausentes y valores con formato incorrecto. No se cambió la validación del servicio para ocultar el problema ni se modificó la cuenta de Vercel.

La cobertura local existente de configuración ausente o inválida y fallos de consulta está incluida entre las 199 pruebas correctas. No se provocaron fallos modificando variables de producción ni datos de Supabase.

### Recuperación real después de corregir las variables

El usuario informó que completó la configuración. Se repitieron las consultas contra el mismo dominio el 2026-11-04 a las 20:15, America/Mazatlan (2026-11-05T03:15:11.684Z). La comprobación terminó con código de salida 0.

| Ruta | Estado | Resultado |
| --- | --- | --- |
| `/api/cuerpos-celestes` | 200 | Arreglo JSON con 12 registros y los campos públicos esperados. |
| `/api/cuerpos-celestes/tierra` | 200 | Ficha JSON de tipo `planeta`, con descripción y contenido editorial. |
| `/api/cuerpos-celestes/tierra/libros` | 200 | Arreglo JSON vacío `[]`. |
| `/api/cuerpos-celestes/luna` | 200 | Ficha JSON de tipo `satelite`, con descripción y contenido editorial. |
| `/api/cuerpos-celestes/luna/libros` | 200 | Arreglo JSON vacío `[]`. |
| `/api/cuerpos-celestes/TIERRA` | 400 | JSON con `SLUG_INVALIDO`. |
| `/api/cuerpos-celestes/cuerpo-inexistente-verificacion` | 404 | JSON con `CUERPO_NO_ENCONTRADO`. |

Las fichas conservan los campos requeridos, los arreglos de curiosidades y libros y la imagen con `path` y `alt`. El contrato de ambas rutas anidadas de libros se validó sin exigir títulos donde no existen asociaciones públicas. Se cotejaron estos identificadores entre el listado y la ficha correspondiente:

| Slug | UUID coincidente | Tipo |
| --- | --- | --- |
| `tierra` | `e8e30d37-49aa-4f4b-84cc-0af40ee7105e` | `planeta` |
| `luna` | `f8ef5b21-9629-4a99-b260-8b1c6a8e9904` | `satelite` |

Estas respuestas acreditan recuperación de contenido real, además del acceso al servidor. No se consultaron valores de variables ni se hicieron escrituras en Supabase.

### Verificación en el navegador

El 2026-11-04 a las 20:20, America/Mazatlan (2026-11-05 03:20 UTC), se abrió `https://metseri-prueba.vercel.app/` en el navegador integrado y se seleccionaron directamente los cuerpos en la escena. Se observó la transición de «Cargando información...» al contenido publicado de cada ficha.

| Comprobación | Resultado observado |
| --- | --- |
| Tierra | Descripción «La Tierra es el tercer planeta desde el Sol y nuestro hogar…», diámetro 12 756 km, distancia media al Sol 149,6 millones de km, día solar de 24 horas y año de 365,2 días terrestres. |
| Cierre de Tierra | El botón de cierre devolvió la escena con «Sin ficha abierta» y permitió seleccionar Luna. |
| Luna | Descripción «La Luna es el único satélite natural permanente de la Tierra…», diámetro medio 3 475 km, distancia orbital media de 384 400 km desde la Tierra y períodos de rotación y órbita de 27,3 días terrestres. |
| Imágenes | Ambas imágenes terminaron de cargar con dimensiones naturales válidas: `/imagenes/planetas/tierra.webp` y `/imagenes/satelites/luna.webp`, bajo el dominio del despliegue. |
| Escena y controles | El cielo, los cuerpos y los controles de Recentrar y Entrar VR siguieron disponibles. |
| Origen del contenido | El navegador permaneció en el dominio de Metseri y el contenido coincide con las fichas JSON comprobadas. Se cotejó en `src/servicios/consultaContenido.js:45` que el cliente utiliza la ruta relativa `/api/cuerpos-celestes/...`, atendida por ese mismo dominio. No se instrumentó la red del navegador ni se consultó el estado interno de React. |

El árbol de accesibilidad de ambas fichas incorporó además sus curiosidades y la invitación bibliográfica publicada. Los arreglos de libros vacíos no impidieron presentar esa invitación.

Se guardaron las capturas `tierraVercel.jpg` y `lunaVercel.jpg` como artefactos locales del chat y se incluyen en la respuesta de verificación. Esta comprobación valida la carga de contenido en vista normal; no añade una evaluación física del visor ni modifica escena, sensores u óptica.

## Continuación

Las tareas 2.2 a 2.4 están completadas después de corregir la configuración de conexión. No quedan comprobaciones de este cambio pendientes. Los pasos y las consultas de diagnóstico siguen documentados en la sección Despliegue en Vercel de `README.md`.

El estado del servidor, las fichas públicas y su presentación en el navegador tienen evidencia positiva diferenciada. El cambio queda listo para su revisión y posterior archivo mediante el flujo de OpenSpec correspondiente; no se ha archivado automáticamente ni se ha hecho commit o push.
