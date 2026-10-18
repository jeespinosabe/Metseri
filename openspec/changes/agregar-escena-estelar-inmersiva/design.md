# Design

## Context

Ver `proposal.md` para la motivación y las especificaciones de `immersive-starfield` y `mobile-vr-mode` para el contrato de comportamiento. Este diseño es necesario por la nueva dependencia gráfica, el tratamiento de orientación y el coste de renderizar dos vistas en móvil.

La inspección del repositorio muestra React con JavaScript y Vite, una interfaz de plantilla en `src/App.jsx`, estilos que limitan el ancho de `#root` y `StrictMode` en `src/main.jsx`. No hay motor 3D, controles de sensores, configuración PWA ni infraestructura de pruebas. Existen comandos de compilación y ESLint. La API Express solo expone un endpoint de estado y no interviene en esta experiencia.

El entorno dispone de Node.js 24.14.1. La comprobación inicial de `npm run lint`, sin modificar código, falla por `no-undef` en `server.js:3` debido a `process`. Ese fallo es previo al cambio y se registra como referencia, sin ampliar el alcance al servidor.

El usuario confirmó pantalla dividida para un visor móvil y aplazó la instalación y el uso sin conexión. La referencia es un fondo oscuro con puntos estelares discretos, sin una interfaz que compita con la escena.

## Goals / Non-Goals

**Goals:**

- Reutilizar una escena y una orientación de cámara para ambas presentaciones.
- Mantener el trabajo por fotograma dentro del motor gráfico y limitar React a la interfaz y las transiciones de estado.
- Aislar la conversión de orientación y la negociación de sensores para poder verificarlas sin hardware.
- Asegurar que solicitudes asíncronas, eventos y recursos gráficos se cancelen o liberen correctamente, también bajo `StrictMode`.

**Non-Goals:**

- Introducir un servidor de escenas, una biblioteca de componentes 3D para React o un sistema general de realidad extendida.
- Añadir calibración óptica por modelo de visor, perfiles de lentes, locomoción o controladores de VR.
- Crear manifest, service worker, caché sin conexión o flujo de instalación; quedan fuera de este cambio por decisión del usuario.

## Decisions

### 1. Three.js integrado de forma directa con React

Añadir `three` como dependencia y utilizar `WebGLRenderer`, una cámara de perspectiva y el complemento `StereoEffect` para las dos mitades. La [documentación oficial de StereoEffect](https://threejs.org/docs/pages/StereoEffect.html) define su uso con `WebGLRenderer`, su renderizado y su ajuste de tamaño. No se requiere abrir una sesión WebXR para la vista dividida seleccionada.

Distribución propuesta, sin convertirla en un framework interno:

| Archivo o área | Responsabilidad |
| --- | --- |
| `src/App.jsx` | Contenedor, estado de presentación, controles y mensajes. |
| `src/componentes/escenaEstelar.jsx` | Componente `EscenaEstelar`: canvas, enlace con React, foco y creación/liberación del motor. |
| `src/escena/campoEstelar.js` | Generación de estrellas, escena, cámara y renderizado normal/dividido. |
| `src/escena/orientacionDispositivo.js` | Conversión de lecturas y corrección de pantalla mediante cuaterniones. |
| `src/escena/controlesVista.js` | Arrastre, teclado, permisos, selección de entrada y recentrado. |

Alternativas: una imagen panorámica simplificaría el dibujo, pero necesitaría un recurso de alta resolución y duplicaría el tratamiento de las vistas; WebGL sin una biblioteca obligaría a desarrollar la cámara y el renderizado estéreo; un wrapper adicional para React aporta poca utilidad con una sola escena. Se elige Three.js directo por la escala actual.

### 2. Campo de estrellas procedural y estable

Generar una distribución esférica con semilla fija, centrada en el observador. Muestrear uniformemente la esfera para evitar acumulaciones accidentales en los polos. Empezar con aproximadamente 6 000 puntos, una mayoría tenue y una minoría más brillante, sobre un fondo cercano a `#080b12`. Ajustar densidad, brillo y tamaños durante la comprobación visual frente a la referencia.

Usar geometría de puntos agrupada, sin un objeto independiente por estrella. Un pequeño sprite radial generado localmente y unos pocos grupos de tamaño/brillo permiten puntos suaves sin descargar texturas. Generar los datos una vez y conservarlos al redimensionar o cambiar de modo. La cámara permanece en el centro; no hay traslación ni animación automática de las estrellas.

Alternativas: cargar un catálogo real introduce datos y decisiones astronómicas fuera del alcance; una textura externa compromete la autonomía de la escena; generar posiciones en cada fotograma produciría un cielo inestable y trabajo innecesario.

### 3. Separar el modo de presentación de la fuente de control

Mantener `modoPresentacion = normal | vr` y `fuenteControl = manual | solicitando | sensor`. La vista dividida debe poder utilizar cualquiera de las fuentes de control; la disponibilidad de un sensor no decide si existe VR.

```text
normal/manual -- entrar VR --> vr/solicitando
                                     |
                      +--------------+--------------+
                      |                             |
                 lectura valida              rechazo/ausencia
                      |                             |
                      v                             v
                  vr/sensor ----- arrastre ----> vr/manual
                      |                             |
                      +---------- salir VR ---------+
                                     |
                                     v
                               normal/manual
```

El arrastre usa Pointer Events y captura del puntero sobre el canvas. Actualiza yaw y pitch, limita el pitch cerca de los polos y libera el arrastre en `pointerup`, `pointercancel` o pérdida de captura. Solo el canvas evita los gestos de desplazamiento de la página. Las flechas funcionan cuando este tiene el foco, sin interceptar botones. La cámara manual parte siempre de la última orientación mostrada.

La primera lectura de sensor establece una alineación con la orientación visible, sin salto de cámara. Convertir `alpha`, `beta` y `gamma` a cuaterniones, corregir el marco de ejes del dispositivo y el ángulo de pantalla, y evitar integrar ángulos Euler de forma acumulativa. Valores iguales a cero son válidos; valores nulos o no finitos se descartan. El recentrado manual restaura la dirección inicial; con sensor modifica la referencia horizontal conservando el seguimiento y la inclinación.

Alternativa: permitir que arrastre y sensor escriban simultáneamente sobre la cámara causaría movimientos contradictorios. Iniciar una interacción manual cancela tanto el seguimiento activo como una activación pendiente; el usuario puede volver a intentar sensores saliendo y entrando de nuevo en VR.

### 4. Permisos y resultados tardíos sin bloquear la escena

Consultar capacidades en tiempo de ejecución. En el manejador de entrada a VR, invocar `DeviceOrientationEvent.requestPermission()` si existe, antes de cualquier operación que pueda consumir la activación del usuario y antes de esperar promesas. Si no existe esa operación pero sí la API de orientación, escuchar eventos y comprobar su utilidad. La [especificación de orientación del W3C](https://www.w3.org/TR/orientation-event/) fundamenta los marcos de coordenadas, el contexto seguro y la activación exigida para solicitar permiso.

Mientras se negocia el sensor, la escena ya está dividida y se puede salir. El plazo de dos segundos comienza cuando se puede empezar a recibir datos, después de resolver el permiso si lo hay, y solo acumula tiempo con la página visible. Tras ausencia o error se conserva el modo manual y aparece un aviso breve. No se repite el permiso ni se adopta una lectura tardía sin otra entrada explícita a VR.

Asociar cada intento a una generación cancelable: salir, arrastrar, desmontar o fallar el renderizado invalida las promesas y eventos pendientes. No depender de que la presencia de un constructor implique que existe un sensor físico. Tampoco se necesita geolocalización ni orientación al norte real para este cielo decorativo.

Alternativa: pedir permisos al cargar interrumpiría la exploración normal; basarse solo en detección de API dejaría sin control a equipos que exponen la interfaz pero no entregan datos.

### 5. Inmersión visual con capacidades opcionales de pantalla

Calcular el aspecto de cada ojo a partir de su propia mitad de pantalla; no duplicar una imagen ya renderizada con el aspecto de la ventana completa. Ambas vistas comparten el cielo y la orientación, y utilizan la proyección estéreo del complemento. Mantener un único renderizador al alternar modos y restaurar su tamaño y área de dibujo al volver a vista única.

Tras iniciar la solicitud de permiso desde el gesto, intentar pantalla completa si no estaba ya activa. Gestionar las promesas por separado: su rechazo no invalida el otro permiso ni la vista dividida. Si se obtiene pantalla completa, intentar bloqueo horizontal donde esté disponible. El [estándar de orientación de pantalla](https://w3c.github.io/screen-orientation/) contempla condiciones para permitir el bloqueo; por eso se trata como una mejora opcional. Si el teléfono sigue en vertical, mostrar una indicación para girarlo.

Registrar si la experiencia adquirió pantalla completa y bloqueo para liberar solo esos estados al salir. Si el usuario abandona desde el navegador la pantalla completa adquirida por la experiencia, volver a vista única. Los controles `Entrar VR`/`Salir de VR` y `Recentrar` permanecen discretos, con foco visible, zonas táctiles suficientes y respeto de `safe-area-inset-*`. En un visor sin botones se ajusta el frente antes de colocar el teléfono; esta versión no incorpora menús por mirada.

Alternativa: exigir pantalla completa o bloqueo de orientación excluiría navegadores en los que el renderizado dividido y el arrastre sí funcionan.

### 6. Coste gráfico, ciclo de vida y comprobación

Limitar inicialmente el pixel ratio a 1.5 y compartir geometría, materiales y texturas entre ambos ojos. Mantener un único ciclo de dibujo y pausarlo mientras la página esté oculta. React no recibe actualizaciones por cada fotograma ni cada lectura del sensor. Al desmontar o reintentar, retirar eventos, temporizadores y observadores, detener el bucle y liberar geometrías, materiales, sprite y renderizador.

Detectar fallos al crear el contexto y `webglcontextlost`; pasar a un estado de error accesible con reintento, cancelar sensores y salir de los estados de pantalla adquiridos por la experiencia. El reintento crea una instancia limpia del motor. No se modifica la API Express ni se aprovecha el cambio para limpiar archivos ajenos.

Verificar con pruebas pequeñas de `node:test` los cálculos de orientación y las transiciones asíncronas, inyectando eventos y reloj en el controlador cuando sea necesario. Se prefiere el ejecutor incorporado a añadir una infraestructura de pruebas amplia. Las verificaciones visuales y de hardware se documentan por separado: los eventos simulados no acreditan compatibilidad física con un visor.

### 7. Nombres propios en español

Los módulos nuevos usarán los nombres de la tabla anterior; sus funciones y métodos serán descriptivos y camelCase, por ejemplo `crearCampoEstelar`, `obtenerOrientacionDispositivo`, `entrarModoVr` y `recentrarVista`. Los archivos de pruebas conservarán esa base de nombre, con el sufijo convencional `.test.js`.

El archivo `escenaEstelar.jsx` exportará `EscenaEstelar` para respetar la capitalización de los componentes React. Las demás clases propias usarán nombres en español conforme a su convención. Se conservan `App`, `main`, los nombres fijos de los artefactos OpenSpec y los contratos externos como `StereoEffect`, `DeviceOrientationEvent.requestPermission`, `alpha`, `beta` y `gamma`.

Esta es una convención de implementación y no modifica el comportamiento descrito por las especificaciones. No requiere renombrar archivos existentes de plantilla ni archivos ajenos al cambio.

## Risks / Trade-offs

- Diferencias en permisos y entrega de orientación entre navegadores --> detectar capacidades, comprobar lecturas y conservar siempre el control manual; probar Chrome en Android y Safari en iPhone por HTTPS, además de escritorio.
- Distintas ópticas y tamaños de visor móvil --> el renderizado estéreo básico utiliza parámetros compartidos; comprobar legibilidad y alineación con un visor real y registrar los modelos probados, sin prometer calibración universal de lentes.
- Mayor coste de dos vistas en equipos modestos --> pocos grupos de puntos, pixel ratio acotado, pausa al ocultarse y revisión de fluidez en móvil; ajustar los valores visuales sin cambiar el contrato.
- Un sensor ausente o rechazado impide seguir la cabeza --> la alternativa manual mantiene navegable la vista dividida, pero no sustituye físicamente el seguimiento dentro de un visor sin entrada manual.
- Pruebas desde una IP local con HTTP pueden no acceder a sensores --> documentar una forma de servir la aplicación por HTTPS válido al móvil; la vista manual sigue utilizable.
- El mismo cielo puede confundirse con una representación astronómica precisa --> no incluir nombres, coordenadas, fecha u orientación geográfica que sugieran esa precisión en este cambio.

## Migration Plan

No hay datos que migrar. Durante la implementación se reemplaza la pantalla de plantilla, se incorpora la dependencia gráfica y se actualizan los metadatos básicos de `index.html` a la experiencia en español. No se genera configuración PWA ni se requiere desplegar o modificar la API.

Antes de publicar, compilar, comprobar los controles en el build de producción y ejecutar la matriz manual de escritorio y móvil. Si un dispositivo físico no está disponible, registrar la comprobación pendiente sin declararla aprobada. La publicación no forma parte de esta propuesta.

Una reversión consiste en retirar los cambios de interfaz y dependencia de este cambio mediante el flujo habitual del repositorio; no hay cachés persistentes o migraciones de servidor que deshacer.
