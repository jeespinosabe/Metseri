# Proposal

## Why

Metseri todavía muestra la plantilla inicial de React y Vite. Este primer cambio debe establecer la experiencia central del proyecto de astronomía: contemplar un cielo de estrellas y mirar alrededor tanto en una pantalla convencional como con un visor móvil.

## What Changes

- Sustituir la pantalla de bienvenida por una escena de estrellas que ocupe toda el área disponible, con fondo casi negro, puntos de brillo y tamaño variados y una apariencia similar a la imagen de referencia del usuario.
- Permitir explorar el entorno en 360 grados mediante arrastre con mouse o pantalla táctil, manteniendo al observador en una posición fija y sin movimiento automático.
- Ofrecer una opción explícita para entrar y salir de VR con pantalla dividida en dos vistas sincronizadas para un visor móvil tipo Cardboard.
- Utilizar la orientación del dispositivo en VR cuando esté disponible y autorizada; conservar el control por mouse o arrastre táctil cuando falte el sensor, no entregue datos válidos o se rechace el permiso.
- Mantener controles discretos para cambiar de modo y recentrar la mirada, con adaptación al tamaño y la orientación de la pantalla y mensajes breves ante limitaciones del dispositivo.
- Mostrar un puntero de cruz blanco, fijo en el centro de la vista, que indique hacia dónde apunta la mirada. En VR aparece centrado en cada una de las dos vistas, en la misma posición relativa, de modo que con el visor se perciba como un solo puntero. Es únicamente una guía visual: no selecciona, no activa acciones ni responde a la interacción.
- Limitar este cambio a la experiencia visual y sus controles. La instalación como PWA y el funcionamiento sin conexión quedan expresamente para otro cambio, según la decisión del usuario.

Las estrellas serán una representación visual generada, sin correspondencia con posiciones astronómicas reales. No se incluyen planetas, constelaciones, etiquetas, información educativa, audio, desplazamiento por el espacio ni soporte para visores autónomos mediante WebXR en este primer alcance. Tampoco se incluye selección de objetos ni acciones disparadas por el puntero (por ejemplo, por mirada o por toque); esa interacción se plantea para sprints posteriores.

## Capabilities

### New Capabilities

- `immersive-starfield`: Escena envolvente de estrellas, navegación manual en 360 grados, puntero de cruz central como guía visual, presentación adaptable y manejo de fallos del renderizado.
- `mobile-vr-mode`: Entrada y salida de la vista dividida para visor móvil, puntero común alineado en ambas vistas, orientación mediante sensores con permisos, recentrado y alternativa manual.

### Modified Capabilities

Ninguna. El proyecto no tiene especificaciones registradas actualmente.

## Impact

- Se reemplazarán la interfaz de `src/App.jsx` y los estilos de plantilla de `src/App.css` y `src/index.css`; se incorporarán módulos acotados para la escena y sus controles dentro de `src/`, entre ellos un componente `PunteroCruz` superpuesto a la escena, sin dependencias nuevas.
- Los archivos, funciones y métodos propios de este cambio tendrán nombres descriptivos en español y camelCase. Las clases y los componentes propios también se nombrarán en español respetando su convención, sin traducir nombres de plantilla, herramientas o APIs externas.
- Se propone añadir `three` como dependencia de ejecución y actualizar el manifiesto de dependencias y su archivo de bloqueo durante la implementación. React y Vite seguirán siendo la base existente.
- Se actualizarán únicamente los metadatos básicos necesarios de `index.html` y se documentarán en `README.md` los controles y la forma de comprobar sensores desde un móvil mediante HTTPS.
- El renderizado y los sensores funcionarán en el cliente, sin depender de la API Express ni de servicios, catálogos o recursos visuales remotos.
- Se incorporarán comprobaciones centradas en orientación, cambios de modo y degradación a control manual, además de la verificación visual en escritorio y móvil. Los archivos de aplicación no se modifican durante esta propuesta.
