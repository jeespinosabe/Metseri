# Tasks

## 1. Configuración y comprobación local

- [x] 1.1 Crear `vercel.json` en la raíz con la reescritura de `/api/:path*` a `/api` descrita en el diseño; verificar que es JSON válido, que utiliza la entrada existente y que la regla no captura la raíz, los archivos compilados ni las imágenes.
- [x] 1.2 Añadir a `README.md` las instrucciones de Vercel: compilación `npm run build`, salida `dist`, función de API, variables `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` en el entorno correspondiente y despliegue posterior; incluir consultas de estado, ficha y libros y cómo distinguir 404 de plataforma de errores JSON. Cotejar nombres y ejemplos con la configuración y las rutas reales, sin incluir credenciales ni presentar `npm run dev` como comando de producción.
- [x] 1.3 Ejecutar `npm run build`, `npm test` y `git diff --check`; comprobar que terminan correctamente y que el diff de implementación se limita a `vercel.json` y la documentación prevista, sin mover archivos ni cambiar los módulos de la aplicación.
- [x] 1.4 Crear `verificacion.md` dentro del cambio y registrar los resultados locales y el diagnóstico HTTP previo como evidencia anterior a la corrección; comprobar que las pruebas locales no se describen como validación del enrutamiento de producción y que las comprobaciones públicas aún no realizadas quedan pendientes.

## 2. Integración en el despliegue actualizado

Estas tareas dependen de que la persona responsable haya publicado la versión corregida. La aplicación local del cambio no incluye commit, push, redeploy ni modificaciones en la cuenta de Vercel. Mantener pendientes las tareas que todavía no puedan comprobarse.

- [x] 2.1 Una vez disponible el despliegue corregido, comprobar por HTTP que `/api/estado` devuelve 200 con el JSON esperado y que la raíz, un archivo JS compilado y una imagen local siguen disponibles; registrar URL, fecha y resultados en `verificacion.md`, confirmando que se evalúa la versión que contiene la nueva regla.
- [x] 2.2 Consultar el listado, la ficha y la ruta anidada de libros de Tierra y Luna, o de un planeta y un satélite ya publicados; verificar estados 200, tipos JSON, coincidencia de UUID y slug entre listado y ficha y el contrato de libros, que admite `[]`. Registrar cualquier 503 de configuración o consulta sin marcarlo como recuperación exitosa, y sin modificar Supabase ni las variables de producción.
- [x] 2.3 Comprobar que un slug inválido devuelve 400 con `SLUG_INVALIDO` y, con la conexión operativa, uno válido inexistente devuelve 404 JSON con `CUERPO_NO_ENCONTRADO`; registrar códigos y tipos de contenido para distinguirlos del `NOT_FOUND` de Vercel y cotejar con las pruebas locales existentes la cobertura de errores 503.
- [x] 2.4 Abrir el despliegue actualizado en el navegador y seleccionar un planeta y un satélite; verificar que sus fichas reciben el contenido desde `/api` del mismo dominio y que la escena y sus recursos siguen disponibles. Completar `verificacion.md` con la evidencia observada y dejar explícita cualquier comprobación pública pendiente.
