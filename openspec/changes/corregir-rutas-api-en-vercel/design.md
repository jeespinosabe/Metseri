# Design

## Context

Ver la motivación y los resultados HTTP del diagnóstico en `proposal.md`, sección Why. El repositorio no tiene `vercel.json`. `api/index.js` exporta la aplicación Express que registra `/api/estado`, `/api/cuerpos-celestes` y sus rutas anidadas; `server.js` inicia esa misma aplicación para uso local.

El cliente consulta URL relativas de `/api`. `vite.config.js` las reenvía al backend local mediante `server.proxy`, una opción exclusiva del servidor de desarrollo. `npm run build` produce la interfaz en `dist/` y no convierte ese proxy en una regla de producción.

Las pruebas existentes en `api/pruebas/consultaContenido.test.js`, `inicioServidor.test.js` y `proxyContenido.test.js` comprueban contratos de Express, arranque y proxy local. No comprueban el enrutamiento de un despliegue de Vercel. El cambio completado `rellenar-fichas-con-contenido-publicado` tiene deltas aún sin sincronizar; este cambio añade un requisito de despliegue sin reemplazar sus requisitos editoriales o de integración del cliente.

## Goals / Non-Goals

**Goals:**

- Usar la función Express ya reconocida por Vercel y mantener el mismo origen para interfaz y contenido.
- Aislar la corrección en la configuración de rutas de producción y documentar cómo comprobar su efecto real.
- Permitir distinguir una ruta no publicada de una API accesible con conexión a Supabase pendiente.

**Non-Goals:**

- Convertir Express en un servidor persistente de producción o ejecutar `npm run dev` en Vercel.
- Cambiar la organización de `api/`, el arranque local, los contratos, los consumidores de contenido o las sesiones administrativas.
- Incorporar una regla general para todas las páginas de la interfaz, modificar dominios o aprovisionar otra plataforma.

## Decisions

### 1. Reescritura limitada a las rutas de la API

Crear `vercel.json` junto a `package.json` con esta regla:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api"
    }
  ]
}
```

El destino corresponde a la función que Vercel ya ejecuta mediante `api/index.js`. La URL pública conserva `/api/estado` o `/api/cuerpos-celestes/:slug`; Express debe recibir esa ruta completa y sus parámetros de consulta. Se verificará también la ruta anidada de libros. La regla no debe capturar `/`, `/assets/...` ni las imágenes locales.

Alternativas consideradas: una nueva entrada de captura dentro de `api/` duplicaría el punto de entrada; una regla general hacia `index.html` podría entregar HTML a las consultas de contenido; publicar Express en otro servicio añadiría configuración de origen y alojamiento que el diagnóstico no requiere.

### 2. Mantener separados el desarrollo local y la configuración de producción

Conservar los scripts actuales y el proxy de Vite. La documentación indicará compilación `npm run build` y salida `dist` para la interfaz Vite, más la función de API del mismo proyecto. No se cambiará el comando de compilación a `npm run dev`: este último mantiene procesos de desarrollo abiertos y no representa la configuración de rutas del despliegue.

La alternativa de modificar los scripts locales no atiende los 404 observados en Vercel.

### 3. Configuración de Supabase en el entorno de Vercel

Documentar `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` en Settings > Environment Variables, aplicadas a Production o al entorno de la URL que se esté probando. Los nombres y valores deben satisfacer el contrato actual del servicio; no llevan prefijo `VITE_`. `.env` sigue siendo local e ignorado por Git. El puerto local `PORT` no es la dirección del backend de producción.

No se consultarán ni cambiarán variables de la cuenta durante la implementación local. Su configuración y el despliegue corresponden a la persona responsable, o a una acción posterior autorizada. No se propondrá consultar Supabase desde React como alternativa: el cliente ya usa la API del mismo origen y la configuración pertenece al servidor.

### 4. Evidencia local y pública diferenciada

Durante la aplicación, ejecutar la compilación y las pruebas existentes y comprobar el formato y alcance de `vercel.json`. No agregar pruebas que únicamente reproduzcan el contenido literal del archivo.

Registrar en `verificacion.md` los comandos, resultados, URL y fecha de las comprobaciones, sin valores de credenciales. Las comprobaciones públicas solo acreditan la corrección después de desplegar esta versión. El orden es:

1. `/api/estado`: 200 y JSON con el estado esperado, independiente de Supabase.
2. Listado, ficha de Tierra o de otro cuerpo ya publicado y sus libros: 200 y contratos existentes; cotejar UUID y slug entre listado y ficha. Consultar también Luna u otro satélite publicado.
3. Slug inválido: 400 con `SLUG_INVALIDO`. Slug válido inexistente: 404 JSON con `CUERPO_NO_ENCONTRADO` si la conexión está operativa. Un 503 JSON se registra según su código, sin confundirlo con el 404 de la plataforma.
4. Raíz, archivo JS compilado e imagen local: respuestas correctas; abrir una ficha en el navegador y comprobar que llega su contenido mediante `/api`.

No se eliminarán variables de producción ni se alterará Supabase para provocar errores. Los escenarios de configuración ausente y fallos de proveedor se cubren con las pruebas existentes y el diagnóstico de respuestas reales. No se presentará el estado 200 de `/api/estado` como prueba de recuperación de contenido.

## Risks / Trade-offs

- [Variables de producción sin verificar] → Documentar la configuración requerida y distinguir 503 JSON de un fallo de enrutamiento; mantener pendiente la recuperación real hasta observar contenido publicado.
- [Las pruebas locales no ejecutan el enrutador de Vercel] → Mantener una tarea específica de comprobación pública tras el despliegue, incluyendo ruta anidada de libros y respuestas de error.
- [Un despliegue anterior puede seguir atendiendo el dominio] → Registrar la URL y la fecha de verificación y confirmar que la versión publicada contiene la nueva regla antes de evaluar su resultado.
- [La regla debe conservar la ruta que interpreta Express] → Validar estado, listado, slug y libros en la plataforma; no aceptar como éxito únicamente que responda `/api`.

## Migration Plan

1. Aplicar únicamente `vercel.json`, la documentación necesaria en `README.md` y el registro de verificación del cambio. Ejecutar las comprobaciones locales.
2. La persona responsable revisa la configuración Vite y las variables del entorno en Vercel y publica la versión corregida mediante su flujo habitual. No se hará commit, push, redeploy ni cambios de cuenta con la autorización de planificación o implementación local.
3. Una vez disponible esa versión, ejecutar las comprobaciones públicas y del navegador. Si falta el despliegue o las variables, registrar la causa y dejar pendientes esas tareas; no marcar completo el cambio solo por pasar las pruebas locales.
4. Para revertir, restaurar la configuración previa y publicar esa revisión mediante un flujo autorizado. No hay migración de base de datos ni de recursos.

## Referencias

- [Opciones del servidor y proxy de Vite](https://vite.dev/config/server-options.html#server-proxy).
- [Reescrituras en Vercel](https://vercel.com/docs/routing/rewrites).
- [Express en Vercel](https://vercel.com/docs/frameworks/backend/express).
- [Variables de entorno y despliegues nuevos](https://vercel.com/docs/environment-variables/managing-environment-variables).
