# Design

## Context

`index.html` ya define el nombre y el color de tema. La configuración de Vite 8 integra React y el proxy de `/api` a Express. La regla de Vercel reenvía `/api/:path*` a `/api`. La escena Three.js se genera en el cliente. Las doce imágenes WebP de `public/imagenes` ocupan unos 162 KiB en total y las fichas las usan tanto en pantalla como en VR.

El catálogo local `src/datos/cuerposCelestes.js` identifica los doce cuerpos. `consultaContenido.js` valida la identidad de la ficha y `consultaLibros.js` filtra las recomendaciones públicas. `escenaEstelar.jsx` comparte los resultados con las fichas de pantalla y VR. Esos puntos permiten incorporar la descarga con los mismos identificadores, validación y estados de selección.

## Goals / Non-Goals

- Versionar los archivos de arranque con la compilación y guardar la colección educativa completa como una unidad persistente.
- Reutilizar las consultas públicas y las representaciones de ficha. Las sesiones, operaciones administrativas y destinos externos pertenecen al flujo en línea. La entrega deja un build verificable con la configuración de alojamiento existente.

## Decisions

### Instalación y archivos locales

- Integrar `vite-plugin-pwa` con una versión que declare compatibilidad con Vite 8. Configurar el manifest con el nombre Metseri, `id`, `start_url` y `scope` en `/`, `display: standalone` y el color `#080b12`. Generar iconos PNG de 192 y 512 píxeles, una variante `maskable` con zona segura y un icono táctil a partir de `recursosGraficos/logo`. La instalación se realiza desde el navegador. Un botón de instalación propio dependería de APIs que varían por plataforma. [Soporte de Vite 8 en el plugin](https://github.com/vite-pwa/vite-plugin-pwa/releases/tag/v1.3.0) · [Guía de instalación de Safari en iPhone](https://support.apple.com/en-az/guide/iphone/iphea86e5236/26/ios/26)
- Generar el service worker con Workbox `generateSW`. Declarar el precaché versionado de `index.html`, los archivos compilados que carga la interfaz, el manifest, los iconos y las doce imágenes WebP. Limitar el respaldo de navegación a `/`, incluidas sus consultas. Las peticiones a `/api`, sus subrutas y `/admin` siguen hacia la red. Un service worker escrito a mano exigiría mantener el inventario de archivos y su invalidación. [Configuración de `generateSW`](https://developer.chrome.com/docs/workbox/modules/workbox-build) · [Recursos estáticos del plugin](https://vite-pwa-org.netlify.app/guide/static-assets)
- Registrar el worker en la compilación de producción y verificar la preparación de los recursos al tener el worker de la aplicación activo. Una nueva versión espera a que se cierren las páginas que usan la anterior. `skipWaiting` y la recarga automática quedan desactivados para que una actualización no interrumpa VR. La limpieza de caché se limita a los archivos precargados de versiones antiguas. [Ciclo de vida de Workbox](https://developer.chrome.com/docs/workbox/service-worker-lifecycle)

### Descarga de los doce cuerpos

- Mantener la acción de descarga y actualización como un control discreto y accesible en vista única, fuera del visor. Mostrar el progreso por pareja de respuestas guardables y la fecha de la última descarga completa. El primer uso parte de una acción explícita para que la persona elija cuándo consumir los datos. Si la plataforma no permite preparar archivos o persistir contenido, explicar el fallo y mantener la experiencia web en línea.
- Usar el catálogo local como conjunto esperado y consultar en lotes pequeños `GET /api/cuerpos-celestes/:slug` y `GET /api/cuerpos-celestes/:slug/libros`. Tomar cada pareja de respuestas HTTP exitosas y válidas tras aplicar las reglas existentes de correspondencia de ficha y selección bibliográfica. `[]` es un resultado válido para recomendaciones. Si falta una ficha publicada, asociar el error al cuerpo para que el reintento sea comprobable. La preparación solicita respuestas públicas frescas y prescinde de credenciales administrativas.
- Guardar en IndexedDB un registro con versión de formato, fecha de descarga y las doce parejas validadas, indexadas por slug dentro de la copia. Confirmar el reemplazo en una sola transacción. Mientras se descargan o validan respuestas, la copia existente sigue siendo legible. Ante descargas simultáneas, decidir el reemplazo dentro de la transacción y conservar la copia completa iniciada más recientemente. Una caché de respuestas HTTP por petición dejaría disponibilidad parcial si se interrumpe la descarga. La copia es persistente mientras el navegador conserva los datos de ese contexto.

### Lectura y conexión recuperada

- Al abrir una ficha, conservar la consulta pública en línea y el plazo actual. Un fallo de transporte antes de recibir respuesta permite leer la entrada del mismo slug de una copia compatible. Separar los fallos de transporte, los errores HTTP, la validación de la respuesta y la cancelación de la selección, de modo que una cancelación descarte el resultado y un 404, un 503 o un resultado incompatible conserve su estado de error. La consulta pública y la lectura local comparten el formato que consumen las fichas.
- Propagar la fecha y la procedencia solo para la parte que use la copia. Presentarlas dentro de los espacios existentes en pantalla y en la ficha VR, con una sola lectura accesible en VR. Las recomendaciones descargadas pasan por los mismos formatos de presentación. Al volver a seleccionar con conexión, los resultados válidos del servidor tienen prioridad y la copia se renueva cuando la persona elige actualizarla.

## Risks / Trade-offs

- **Almacenamiento separado o eliminado** → Validar la versión de formato y el conjunto de doce slugs antes de anunciar disponibilidad. En iPhone documentar que se debe abrir la app instalada con conexión y ejecutar la descarga allí. Si el sistema elimina los datos o la copia queda incompatible, permitir prepararla de nuevo. [Almacenamiento de las apps instaladas en WebKit](https://webkit.org/blog/14787/webkit-features-in-safari-17-2/)
- **Datos editoriales que cambian después de descargar** → Mostrar la fecha cuando se use la copia y mantener una acción de actualización. Una lista pública vacía y una consulta fallida conservan estados distintos. Para aceptar una descarga nueva, la API debe poder servir las doce fichas públicas.
- **Archivos omitidos o caché de desarrollo** → Revisar el inventario y los avisos de precaché del build. Comprobar con el build servido en `localhost` para escritorio o por HTTPS para dispositivos, con un origen limpio al repetir pruebas.

## Migration Plan

1. Construir y servir una versión de prueba en un origen seguro con acceso a la API bajo el mismo origen. Comprobar manifest, tipos de contenido, registro del worker y rutas de API y administración antes de distribuirla.
2. Tras la primera apertura, preparar los archivos de la aplicación y descargar el contenido desde el contexto donde se usará. El cambio requiere almacenamiento local del navegador y reutiliza las fichas ya publicadas en Supabase.
3. Si se revierte a una versión anterior que incluía PWA, publicar sus archivos y worker como una compilación coherente. Para volver a una versión previa a PWA, servir temporalmente en la misma URL un worker de retirada que quite sus cachés de archivos y su registro, conservando la copia educativa compatible para una reinstalación posterior.
