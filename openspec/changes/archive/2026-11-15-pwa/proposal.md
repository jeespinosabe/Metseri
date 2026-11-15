# PWA

## Why

Metseri depende de una conexión para abrirse y recuperar su contenido educativo. Queremos que el público pueda instalarla y preparar una descarga inicial para explorar el cielo, usar el visor móvil y consultar las fichas y recomendaciones en lugares sin internet.

## What Changes

- Permitir instalar Metseri con su nombre e icono desde los controles del navegador en plataformas compatibles y abrirla desde ese icono en una ventana de aplicación.
- Ofrecer la descarga inicial de la escena 360, el modo VR móvil, las imágenes locales, las fichas de los doce cuerpos celestes y sus recomendaciones públicas. Mostrar el progreso y confirmar cuando todo esté disponible sin conexión.
- Permitir volver a abrir Metseri y consultar el contenido descargado en pantalla y en VR, incluso si esos cuerpos nunca se habían seleccionado. Identificar cuándo se muestra la copia descargada y permitir renovarla con conexión.
- Usar el contenido público que devuelve la API cuando está disponible. La administración, la autenticación y los destinos externos requieren conexión.

## Capabilities

### New Capabilities

- `aplicacion-web-progresiva` — instalación, preparación y arranque sin conexión de la experiencia pública de Metseri.

### Modified Capabilities

- `fichas-cuerpos-celestes` — consultar la copia descargada de las fichas y recomendaciones con una indicación de su fecha en vista única y VR.
- `consulta-contenido-api` — permitir que la experiencia pública use respuestas previamente descargadas cuando falla el transporte, preservando los contratos HTTP y JSON de los endpoints.

## Impact

- Interfaz y compilación de Vite, manifest e iconos derivados del logo de Metseri, service worker y almacenamiento local del contenido público.
- Los servicios frontend de consulta compartirán las rutas públicas y la validación que ya usan para fichas y recomendaciones. La descarga utilizará los endpoints existentes de Express en el mismo origen.
- Las comprobaciones abarcan la compilación de producción, la instalación desde un origen seguro, la reapertura en modo avión y el comportamiento de las rutas de la API y administración con el service worker activo.
