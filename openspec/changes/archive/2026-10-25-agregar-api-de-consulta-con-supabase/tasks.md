# Tasks

## 1. Configuración y ejecución independiente del backend

- [x] 1.1 Añadir `start:api` y `dev:api` en `package.json` con carga nativa opcional de `.env`, conservando los comandos actuales; comprobar arranque en el puerto indicado y respuesta idéntica de `GET /api/estado` sin configurar Supabase.
- [x] 1.2 Declarar el entorno Node en `eslint.config.js` únicamente para `server.js` y `api/**/*.js`; comprobar con `npm run lint` que se corrige el error previo de `process` y se conservan las reglas del frontend.
- [x] 1.3 Añadir `.env.example` y documentar en `README.md` Node compatible, arranque y variables `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY`; verificar que el ejemplo no contiene valores reales, `.env` permanece ignorado y no se incorporan dependencias ni cambios de lockfile.

## 2. Consultas públicas a Supabase

- [x] 2.1 Crear `api/consultaSupabase.js` con configuración validada, clave pública en `apikey` y GET a las dos vistas y la función existentes; comprobar con transporte inyectado recursos permitidos, proyecciones, parámetros codificados, orden estable y ausencia de consultas de escritura o claves privilegiadas.
- [x] 2.2 Incorporar plazo de cinco segundos, validación básica del JSON y tratamiento controlado de configuración, respuestas no exitosas, red y cancelación; añadir pruebas sin red que diferencien 200 vacío, ficha `null` y fallo remoto, y que comprueben que no se expone la clave ni el error bruto.
- [x] 2.3 Documentar los recursos utilizados, permisos RLS, unidades y diferencia entre UUID y slug; verificar la correspondencia con el SQL entregado y explicar que la semilla sin publicar devuelve cero cuerpos públicos y que no debe volver a ejecutarse para probar la API.

## 3. Endpoints GET y contrato HTTP

- [x] 3.1 Ampliar `api/index.js`, preservando su exportación por defecto y permitiendo inyectar la consulta en pruebas; implementar listado y ficha por slug, y comprobar por HTTP el orden, los campos, planetas/satélites, nulos, respuesta vacía y 404 para un cuerpo no visible.
- [x] 3.2 Implementar el endpoint de libros con comprobación previa de visibilidad del cuerpo; probar por HTTP asociaciones ordenadas, campos bibliográficos, autores, cuerpo público sin libros y 404 sin cuerpo visible, sin inventar registros ni modificar las fichas locales.
- [x] 3.3 Validar slugs, rechazar métodos de escritura con 405 y `Allow: GET, HEAD`, y devolver el formato JSON de errores 400/404/503; probar que un slug inválido o una escritura no consulta Supabase, que los fallos no se convierten en `[]` y que `/api/estado` conserva su contrato sin conexión.
- [x] 3.4 Documentar las tres rutas en `README.md` con ejemplos HTTP reproducibles, formas de respuesta y errores; comprobar los ejemplos contra la aplicación local y distinguir expresamente una ficha por slug de una consulta por UUID.

## 4. Comprobación real de recuperación de contenido

- [x] 4.1 Crear `api/comprobarSupabase.js` y `test:integracion` para consultar la aplicación real en un puerto efímero usando `CUERPO_PRUEBA_SLUG` y `CUERPO_PRUEBA_ID`; comprobar que valida listado/ficha/libros, cierra el servidor y falla con causa legible ante configuración ausente, registro inaccesible o lista vacía, sin ejecutar escrituras.
- [x] 4.2 Ampliar `.env.example` y `README.md` con el procedimiento para obtener URL, clave pública y UUID/slug de un cuerpo ya publicado, ejecutar la comprobación y diagnosticar RLS; verificar que no se solicitan claves privilegiadas ni se instruye a deshabilitar políticas o publicar contenido automáticamente.
- [x] 4.3 Ejecutar `npm run test:integracion` contra el proyecto Supabase de la persona usuaria y acreditar al menos un registro publicado por UUID y slug; registrar en `verificacion.md` los resultados reales de las tres rutas, libros existentes o su ausencia y las comprobaciones de exclusión que puedan realizarse. Mantener esta tarea pendiente si faltan configuración o contenido público, sin sustituirla por pruebas simuladas.

## 5. Verificación integrada y revisión del alcance

- [x] 5.1 Ejecutar `npm test`, `npm run lint` y `npm run build` sobre el resultado final; registrar la conservación de las 125 pruebas previas, las nuevas comprobaciones HTTP y cualquier aviso de compilación, diferenciando estas evidencias de la prueba remota.
- [x] 5.2 Comprobar la interfaz con el backend detenido: escena, selección, ficha y cambio a VR conservan su funcionamiento local; registrar el resultado y verificar que no se añadieron solicitudes a la API o Supabase ni se modificaron `src/` o los recursos gráficos.
- [x] 5.3 Ejecutar `openspec validate agregar-api-de-consulta-con-supabase --strict` y `git diff --check`, y revisar estado/diff completo en `main`; comprobar que los cambios corresponden al alcance, preservan los cambios anteriores y no incluyen datos de conexión reales, commit, push, despliegue ni archivo automático.

## Workflow follow-up

- Después de verificar y revisar el cambio, sincronizar su capacidad y archivarlo cuando la persona usuaria lo solicite; conservar separados los cambios OpenSpec anteriores.
- Realizar commit, push o integración con el equipo únicamente cuando exista autorización expresa.
