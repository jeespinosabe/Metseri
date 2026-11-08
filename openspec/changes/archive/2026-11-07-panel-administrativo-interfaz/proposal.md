# Proposal

## Why

El acceso administrativo de Metseri ya autentica al administrador, pero su pantalla protegida solo muestra una bienvenida y no permite recorrer las funciones bibliográficas. Se necesita definir y construir la interfaz del panel para revisar libros, preparar sus formularios y organizar sus relaciones con los cuerpos celestes antes de incorporar una API administrativa.

## What Changes

- Sustituir la bienvenida del módulo protegido por un panel bibliográfico con navegación clara, listado de registros, búsqueda por título o autor y filtro por cuerpo celeste.
- Mostrar formularios de alta y edición con título, autoría, editorial, año y URL de la ficha bibliográfica, junto con validación visual de los campos.
- Incorporar un selector de cero o varios cuerpos celestes por libro, utilizando las identidades locales de los ocho planetas y cuatro satélites existentes.
- Ofrecer la acción de eliminar y su diálogo de confirmación, identificando el libro y sus asociaciones.
- Mantener disponibles los recorridos de apertura, edición de campos, selección de relaciones y cancelación. Por decisión del usuario, guardar, actualizar y confirmar la eliminación permanecerán deshabilitados con una explicación visible hasta disponer de una API futura; tampoco se simularán cambios en el listado.
- Utilizar registros sintéticos claramente identificados como ejemplos y exclusivos del panel para revisar los estados con contenido. Contemplar también un listado vacío y búsquedas sin resultados, sin presentar ejemplos como libros reales de la biblioteca.
- Integrar la nueva interfaz en `/admin` y `/admin/`, conservando el inicio, comprobación y cierre de sesión existentes. Adaptar listado, formularios y confirmación a escritorio y móvil, con acceso por teclado.

## Capabilities

### New Capabilities

- `panel-administrativo`: interfaz protegida para visualizar registros bibliográficos, preparar altas y ediciones, seleccionar relaciones con cuerpos celestes y revisar la confirmación de eliminación, con las operaciones de persistencia pendientes.

### Modified Capabilities

Ninguna. Los contratos de consulta pública, fichas astronómicas y VR mantienen su alcance.

## Impact

- Áreas previstas: `src/componentes/moduloAdministrativo.jsx`, componentes y estilos administrativos nuevos, datos exclusivos de vista previa y la integración de sesión en `src/App.jsx` únicamente donde resulte necesaria.
- Reutilización de React, CSS, las identidades de `src/datos/cuerposCelestes.js` y los endpoints existentes `/api/admin/sesion`. No se requieren nuevas dependencias.
- Comprobación de los recorridos visuales, filtros, validación, cancelación y ausencia de mutaciones, además de regresión del acceso autenticado, compilación y análisis estático.
- El alcance es exclusivamente de interfaz: se aplazan lectura del catálogo administrativo real, endpoints CRUD, persistencia incluso local, publicación o verificación de libros, migraciones y cambios en Supabase o RLS. Las peticiones de inicio y cierre de sesión siguen siendo reales.
- Los ejemplos administrativos no se incorporan a `LIBROS_POR_CUERPO`, a las fichas públicas ni a la API de consulta. Los cambios de contenido y VR actualmente sin archivar no requieren modificaciones ni sincronización para este trabajo.
