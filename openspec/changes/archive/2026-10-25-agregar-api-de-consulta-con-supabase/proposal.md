# Proposal

## Why

La API Express de Metseri únicamente informa su estado y todavía no permite consultar el contenido almacenado en Supabase. Se necesita una API GET que recupere cuerpos celestes, fichas y libros públicos desde la base existente y permita comprobar la integración de extremo a extremo.

## What Changes

- Incorporar `GET /api/cuerpos-celestes`, `GET /api/cuerpos-celestes/:slug` y `GET /api/cuerpos-celestes/:slug/libros` para consultar el listado, la ficha completa y sus asociaciones bibliográficas.
- Consultar la Data API de Supabase reutilizando `v_cuerpos_exploracion`, `ficha_cuerpo(p_slug)` y `v_libros_por_cuerpo` del SQL proporcionado por la persona usuaria, que declara ya ejecutado.
- Aplicar la decisión confirmada de lectura pública: solo cuerpos publicados y libros verificados y activos, mediante los permisos y políticas RLS actuales.
- Configurar la conexión por variables de entorno del servidor, con validación de configuración, plazo de consulta y errores JSON controlados.
- Conservar el contrato de `GET /api/estado` y permitir ejecutar el backend de forma independiente de Vite.
- Añadir pruebas HTTP locales y una comprobación explícita contra Supabase que acredite la recuperación de al menos un registro publicado existente, además de documentar las peticiones y sus resultados.

Quedan fuera la conexión del frontend a estos endpoints, administración, autenticación, escrituras, ejecución de SQL, publicación de registros, cambios en políticas o esquema, despliegue, PWA y modificaciones de los cambios OpenSpec anteriores. Se trabajará en `main` por instrucción expresa, sin commit ni push.

## Capabilities

### New Capabilities

- `consulta-contenido-api`: Consulta HTTP de cuerpos celestes y contenido bibliográfico público mediante Express y Supabase, con contratos JSON, control de errores y evidencia de lectura real.

### Modified Capabilities

Ninguna. La escena, sus datos locales y las fichas actuales mantienen su funcionamiento independiente de la API.

## Impact

- Backend: ampliar `api/index.js`, añadir módulos y pruebas acotadas dentro de `api/` y mantener `server.js` como punto de arranque.
- Herramientas: añadir comandos de servidor y de comprobación real en `package.json`, declarar el entorno Node en ESLint para los archivos de backend y documentar variables en `.env.example` y `README.md`.
- Dependencias: reutilizar Express y las APIs nativas de Node; no se prevén nuevos paquetes ni cambios en `package-lock.json`.
- Supabase: únicamente consultas a los recursos existentes. La URL y la clave pública no se han configurado en este repositorio. El script inicial inserta 12 cuerpos sin publicar y ningún libro; una respuesta vacía acredita acceso, pero no la recuperación de un registro exigida para cerrar el cambio.
- Compatibilidad: las 125 pruebas actuales y la compilación constituyen la referencia inicial; el error conocido de ESLint por `process` se resolverá mediante el ajuste del entorno Node dentro del alcance del backend.
