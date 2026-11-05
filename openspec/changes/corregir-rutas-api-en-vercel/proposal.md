# Proposal

## Why

En el diagnóstico de `https://metseri-prueba.vercel.app/`, la interfaz respondió 200, pero `/api/estado` y `/api/cuerpos-celestes/tierra` devolvieron `404 NOT_FOUND` de Vercel. `/api` respondió `Cannot GET /api` desde Express: la función está disponible, pero sus rutas internas no reciben las peticiones que necesitan las fichas.

## What Changes

- Añadir una regla de enrutamiento en `vercel.json` para que las peticiones `/api/...` lleguen a la aplicación exportada por `api/index.js`, conservando su ruta y parámetros.
- Mantener las URL actuales del navegador y los contratos HTTP de estado, listado, ficha y libros. Servir la interfaz y sus recursos compilados como hasta ahora.
- Documentar el despliegue con la compilación de Vite, las variables de Supabase del entorno de Vercel y la comprobación de las rutas después de desplegar. El arranque local con `npm run dev` continúa siendo independiente de esa configuración.
- Distinguir los errores de enrutamiento de Vercel de los errores JSON de configuración o consulta de Supabase, y registrar por separado las comprobaciones locales y las del despliegue actualizado.

No se moverán archivos, cambiarán endpoints, instalarán dependencias ni modificarán fichas, escena, VR, autenticación, datos o políticas de Supabase. Este cambio no autoriza commit, push, publicación ni modificaciones en la cuenta de Vercel.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `consulta-contenido-api`: Exigir que el despliegue de Vercel atienda las rutas públicas existentes bajo el mismo dominio de la interfaz, con los mismos contratos y errores de Express.

## Impact

- Archivo nuevo de herramienta: `vercel.json`, en la raíz junto a `package.json`.
- Documentación: sección de despliegue y diagnóstico en `README.md`; evidencias en `verificacion.md` de este cambio durante su aplicación.
- Reutilizar `api/index.js`, las rutas y servicios de `api/`, el consumo relativo de `/api` en `src/servicios/consultaContenido.js` y las pruebas existentes. No se prevén cambios en esos módulos.
- El funcionamiento del contenido en producción requiere `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` en el entorno de Vercel correspondiente. Su existencia no se ha verificado; el archivo `.env` local está excluido de Git.
- La comprobación pública final dependerá de que la versión corregida esté desplegada. Los resultados previos o locales no acreditan que Vercel ya esté corregido.
