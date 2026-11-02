# Proposal

## Why

Metseri ya permite seleccionar ocho planetas y cuatro satélites, pero sus fichas normales y VR conservan espacios editoriales vacíos y «Descubrir libros» todavía no ofrece contenido útil. El siguiente avance conectará esa experiencia con las fichas públicas de la API existente, manteniendo la correspondencia con el cuerpo seleccionado y una navegación continua.

## What Changes

- Consultar `GET /api/cuerpos-celestes/:slug` al seleccionar un cuerpo y compartir su contenido publicado entre la ficha HTML y la ficha VR. Reutilizar los libros incluidos en esa respuesta, sin una segunda consulta bibliográfica.
- Vincular el identificador local de la escena con el `slug` remoto; conservar por separado el UUID de Supabase, las imágenes locales y sus créditos.
- Sustituir las reservas editoriales por descripción, datos y curiosidades publicados. Distinguir carga, datos ausentes, ficha no disponible y error recuperable; impedir que respuestas tardías mezclen cuerpos o reabran fichas cerradas.
- Incorporar «Descubrir libros» como sección de cada ficha, con acceso directo, metadatos disponibles, enlaces bibliográficos reales y un estado vacío explícito cuando no existan asociaciones verificadas.
- Conservar selección, orientación, controles y regreso a la escena; hacer legible el contenido real en escritorio, móvil y ambas vistas de VR, incluyendo la paginación del texto que exceda el área disponible.
- Actualizar expresamente las especificaciones que exigían contenido vacío y ausencia de solicitudes del frontend. La escena seguirá operativa sin backend, mientras el contenido editorial mostrará su estado de indisponibilidad.
- Usar el PDF «Sprint 3.3 Elaboración de las 12 fichas astronómicas con información científica» como referencia editorial, sin convertirlo en una copia local de respaldo ni modificar automáticamente la base de datos.

## Capabilities

### New Capabilities

Ninguna. La consulta pública y las fichas ya tienen capacidades propias; este avance las integra sin crear un catálogo general de libros.

### Modified Capabilities

- `fichas-cuerpos-celestes`: contenido público por selección, estados de consulta, unidades fieles al contrato, lectura completa normal/VR y navegación a libros relacionados.
- `consulta-contenido-api`: ajustar la compatibilidad del frontend para permitir consultar contenido publicado, conservando escena, selección, imágenes y VR independientes de la disponibilidad del servidor. Se mantienen las rutas, respuestas y políticas públicas existentes.

## Impact

- Interfaz: `src/componentes/escenaEstelar.jsx`, `fichaCuerpoCeleste.jsx`, `src/escena/contenidoFicha.js`, `fichaCuerpoVr.js`, `campoEstelar.js`, datos/formateadores relacionados y estilos de ficha en `src/App.css`.
- Incorporar un servicio pequeño de consulta/adaptación en `src/servicios/consultaContenido.js`; reutilizar React, Three.js, `fetch` y las pruebas con Node existentes, sin nuevas dependencias de ejecución.
- Ajustar la configuración de desarrollo para que el proxy `/api` alcance el puerto real del servidor. Hoy Vite fija `3000` y la configuración local de la API usa `3001`; las credenciales siguen siendo exclusivas del servidor.
- Pruebas: correspondencia de los doce slugs, solicitudes fuera de orden, errores, estados vacíos, navegación y contenido VR sin recortes; regresión de la API pública y el acceso administrativo.
- Estado inicial al planificar el 2 de noviembre de 2026: solo `tierra` era pública e incompleta. Antes de implementar la interfaz, la usuaria ejecutó la carga previa de `bd/cargarContenidoSprint.sql`; las doce fichas y sus dos libros provisionales ya se recuperan por la API. La evidencia y sus límites están en `verificacion.md`; la integración de interfaz no realiza escrituras o publicaciones automáticas.
- Fuera de alcance: autenticación o administración nuevas, cambios en RLS/esquema, reescritura de commits, cambios geométricos/de sensores, catálogo bibliográfico global, préstamos, búsquedas externas, PWA y funcionamiento sin conexión del contenido remoto.
