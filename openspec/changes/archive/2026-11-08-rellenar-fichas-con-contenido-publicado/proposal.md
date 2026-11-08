# Proposal

## Why

Metseri ya permite seleccionar los doce cuerpos y abrir sus fichas, pero sus espacios educativos siguen vacíos. El contenido del PDF del equipo ya está corregido en Supabase y disponible mediante la API existente; falta presentarlo dentro del diseño aprobado en el sprint anterior.

## What Changes

- Consultar `GET /api/cuerpos-celestes/:slug` al seleccionar un cuerpo en vista normal y VR, compartiendo una consulta por seleccion y conservando su identidad e imagen locales.
- Rellenar descripción, cuatro datos principales y dos curiosidades con la información publicada. Presentar las etiquetas, cifras, unidades y notas literales de `contenido_ficha.datos_principales`, sin volver a calcular el día solar o los años redondeados del PDF.
- Rellenar el espacio existente de «Descubrir libros» con `contenido_ficha.descubrir_libros`. No cargar títulos provisionales ni construir un catálogo; el documento solo contiene una invitación a la biblioteca.
- Mantener una sola ficha vinculada a la selección. Una respuesta tardía no puede sustituir el contenido del cuerpo actual ni reabrir una ficha cerrada.
- Conservar distribución, colores, tipografía, imágenes, cuadrícula, separadores, controles y desplazamiento. El usuario llega a libros y vuelve recorriendo el panel existente o las pestañas y flechas actuales del visor; el cierre devuelve la exploración. No se agregan botones, pantallas ni estilos.
- Mantener disponibles la escena, la selección y el cierre si falla la consulta. Mostrar el estado mediante texto breve en los espacios actuales, sin datos inventados ni controles nuevos.
- Obtener capturas y una demostración de selección, cambio de cuerpo, lectura, acceso a libros y regreso/cierre en navegador.

La aclaracion de la usuaria incorpora el relleno del Canvas VR con el mismo contenido publicado. Se conservan sus cuatro pestañas, flechas, cierre, apariencia y optica; si el texto no cabe, las flechas existentes recorren continuaciones sin recortarlo. Rediseñar la interfaz movil, cambiar sensores/optica y evaluar comodidad fisica siguen fuera del alcance. No se modifican la base de datos, los endpoints, la administración ni las políticas RLS en este cambio.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `fichas-cuerpos-celestes`: Pasar de reservas vacías a contenido publicado del PDF en vista normal y VR, manteniendo selección, diseño y navegación existentes; mostrar la invitación bibliográfica en su sección actual y controlar respuestas tardías o ausentes.
- `consulta-contenido-api`: Reconocer la propiedad editorial ya disponible en la ficha y permitir que la interfaz la consulte, conservando la independencia de la escena y los recursos locales cuando el backend no esté disponible.

## Impact

- Integración acotada en `src/componentes/escenaEstelar.jsx` y `src/componentes/fichaCuerpoCeleste.jsx`, con un módulo de consulta/adaptación en español dentro de `src/servicios/` y pruebas del contrato y la selección.
- Reutilizar React, `fetch`, la API Express y los recursos locales. No agregar dependencias ni editar `src/App.css`, `src/index.css`, geometría del cielo, sensores u optica del visor.
- Extender el puente de contenido de `campoEstelar.js` y el dibujo de `contenidoFicha.js`/`fichaCuerpoVr.js`; conservar estilos y controles.
- Ajustar el proxy de Vite para usar el puerto del backend configurado: actualmente apunta a 3000, mientras la configuración del servidor utiliza 3001. Mantener URL y clave de Supabase exclusivamente en el servidor.
- La corrección de contenido en `bd/` es un trabajo previo, independiente y ya ejecutado por la usuaria; no repetirla durante esta implementación. Se conservarán sus archivos locales y los cambios de los compañeros.
- Verificar la recuperación HTTP de las doce fichas y documentar las evidencias visuales y la demostración. No incluye auditoría integral del backend, verificación del catálogo bibliográfico, publicación, commit ni push.
