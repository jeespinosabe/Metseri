# Design

## Context

Ver `proposal.md` para la motivación y `specs/` para el contrato de comportamiento, incluida la aclaración del usuario: en VR, cualquier toque posterior a una selección la quita aunque la mirada ya no apunte al seleccionado.

El proyecto ya utiliza React, Vite, Three.js directo y pruebas con `node:test`. `src/componentes/escenaEstelar.jsx` enlaza el renderizador, los controles de mirada, el sensor y las capacidades opcionales de pantalla. `src/escena/campoEstelar.js` crea la escena, una cámara fija en el origen y tres grupos de estrellas a radio 100; emplea `StereoEffect`, limita el pixel ratio a 1.5 y dibuja bajo demanda. El cambio de modo reutiliza la escena. `PunteroCruz` es un SVG superpuesto sin eventos, centrado una vez en vista única y por mitad en VR.

No existen planetas, luces para mallas ni detección de intersecciones. `controlesVista.js` llama a `pasarAManual()` en `pointerdown`, por lo que actualmente un toque simple cancela el sensor antes de poder seleccionarse algo. La prueba de arrastre con sensor en `controlesVistaSensor.test.js` exige esa cancelación temprana y deberá actualizarse para exigirla al reconocer un arrastre. La especificación principal también restringe expresamente el cielo a estrellas y el puntero a una guía sin selección; los deltas aclaran la ampliación sin poner manejadores en el SVG.

## Goals / Non-Goals

**Goals:**

- Reutilizar una escena, un conjunto de planetas y un estado de selección para ambos modos y ambos ojos.
- Separar la fabricación de los cuerpos, la resolución del objetivo y la clasificación del gesto, con pruebas sin necesidad de iniciar WebGL.
- Mantener la orientación por sensores durante los toques y conservar la última orientación al transferir el control a un arrastre.
- Conservar el dibujo bajo demanda y un ciclo de vida seguro bajo `StrictMode`, pérdida de contexto y reintentos.

**Non-Goals:**

- Añadir un motor físico, catálogo astronómico, biblioteca React para 3D, infraestructura general de eventos o dependencias nuevas.
- Renombrar componentes o módulos existentes para reflejar el nuevo contenido, ni reorganizar la aplicación completa.
- Añadir posprocesado de brillo, calibración óptica por visor o una nueva modalidad de navegación.

## Decisions

### 1. Cuerpos procedurales en la escena existente

Añadir `src/escena/planetas.js` con definiciones estables de los ocho cuerpos, un grupo por planeta y una fábrica `crearPlanetas`. Usar esferas con geometría compartida cuando sea posible y materiales por cuerpo, texturas locales generadas con Canvas 2D y un anillo para Saturno. Las texturas representarán rasgos reconocibles: superficie gris accidentada de Mercurio, tonos nubosos de Venus, océanos y continentes de la Tierra, Marte rojizo, bandas de Júpiter y Saturno, Urano cian y Neptuno azul profundo. Son ilustraciones procedurales, no mapas científicos.

La iluminación base combina una contribución ambiental tenue y una luz direccional que acompaña la orientación de la vista para mantener legible el relieve de cada cuerpo. No hay malla de Sol. Las estrellas conservan sus materiales actuales. Las esferas comparten una geometría de 48 por 32 segmentos y sus texturas locales son de 1024 por 512 píxeles. Saturno utiliza una textura radial de 1024 por 1024 píxeles para bandas y separación de anillos. No se generan texturas por fotograma.

Distribuir los centros con posiciones explícitas alrededor de una envolvente de radio aproximado 60, dentro del campo de estrellas, con sectores horizontales separados y elevaciones variadas. Al menos un planeta será visible al inicio; los demás se encontrarán recorriendo el entorno, incluidos los sectores posteriores. Ajustar radios aparentes para que los ocho sean apuntables y no se oculten permanentemente entre sí. Mantener posiciones y orientaciones fijas.

Alternativas: modelos o mapas remotos añadirían descarga, licencias y fallos de red; esferas de un solo color no bastan para la apariencia reconocible; una simulación a escala real impediría ver y apuntar cómodamente a todos desde una posición fija.

### 2. Objetivo y selección como estados independientes

Añadir `src/escena/seleccionPlanetas.js` para la detección y el estado, con identificadores estables en español, por ejemplo `tierra` y `jupiter`. Mantener `planetaApuntado` y `planetaSeleccionado`, ambos identificador o `null`. El primero solo se utiliza en VR y se recalcula al cambiar la orientación; el segundo se conserva hasta una acción explícita y no depende de la visibilidad del cuerpo.

| Modo y estado previo | Activación válida | Resultado |
| --- | --- | --- |
| Normal, sin selección | Pulsar un planeta | Seleccionar ese planeta. |
| Normal, con selección | Pulsar el seleccionado o el fondo | Quitar la selección. |
| Normal, con selección | Pulsar otro planeta | Trasladar la selección al pulsado. |
| VR, sin selección | Toque en cualquier punto con planeta apuntado | Seleccionar el apuntado. |
| VR, sin selección | Toque en cualquier punto mirando al fondo | Conservar `null`. |
| VR, con selección | Toque en cualquier punto, con cualquier objetivo o sin él | Quitar la selección y terminar esa activación. |

La última fila tiene prioridad: mirar otro planeta y tocar primero deselecciona; solo un toque posterior lo selecciona. Entrar, salir o recentrar no activa esta tabla. Al salir de VR se limpia únicamente el objetivo por mirada; al reintentar se crea una instancia sin selección anterior.

Alternativas: usar un único estado de «activo» confundiría mirar con seleccionar; trasladar la selección automáticamente al objetivo del siguiente toque en VR contradice la deselección global solicitada.

### 3. Una detección para pantalla y otra para mirada

Usar `Raycaster` solo sobre las mallas seleccionables de los planetas, resolviendo el impacto más cercano a su identificador. Los anillos de Saturno pertenecerán al mismo objetivo que su esfera; estrellas, luces y efectos de resaltado no participarán. Mantener actualizadas las matrices de cámara y objetos antes de consultar intersecciones, también si todavía no se ha dibujado el último cambio.

En vista única, convertir `clientX/clientY` a coordenadas normalizadas usando el rectángulo del lienzo, no el tamaño global de la ventana ni el pixel ratio. Resolver el planeta situado bajo el clic o toque, sin usar la cruz como selector.

En VR, lanzar un único rayo desde la cámara central en su dirección de mirada. Resolverlo al cambiar la orientación, entrar en VR y justo antes de procesar una activación para evitar un objetivo atrasado. Ignorar las coordenadas del toque al decidir la selección VR. El resultado central se comparte entre los dos ojos.

Conservar las dos cruces superpuestas sin eventos. `StereoEffect` utiliza cámaras por ojo y el código actual fija `camara.focus = 100` para las estrellas; ajustar el enfoque a la envolvente de los planetas para aproximar su convergencia a la guía central y comprobar la coincidencia percibida con el visor. No utilizar dos rayos independientes que puedan seleccionar cuerpos diferentes. Esta aproximación conserva las limitaciones ópticas ya documentadas del renderizado estéreo básico.

Alternativas: rayos desde las coordenadas del toque en VR exigirían acertar físicamente al cuerpo; dos estados por ojo producirían resultados contradictorios; colocar planetas como elementos HTML perdería volumen e integración con la profundidad de la escena.

### 4. Clasificar el gesto antes de cancelar el sensor

Extender `crearControlesVista` con una notificación `alActivar` y separar pulsación pendiente de arrastre confirmado. `pointerdown` registrará puntero, origen y captura, sin cancelar el sensor ni cambiar la orientación. Un umbral inicial de 6 píxeles CSS desde el origen distinguirá el arrastre de la oscilación involuntaria; será una constante verificable, independiente de la resolución física.

Solo al superar el umbral se llamará a `pasarAManual()`, partiendo de la orientación más reciente del sensor y aplicando el desplazamiento acumulado. Una vez reconocido, el gesto seguirá siendo arrastre aunque vuelva al punto inicial. Las flechas conservarán su transición actual a manual. Un toque mantendrá tanto un sensor activo como un intento pendiente.

Emitir una única activación por gesto completado sin arrastre. Elegir una sola ruta de activación y suprimir eventos derivados duplicados; no combinar sin control `pointerup`, `touchend` y `click`. Admitir también el `click` simple que pueda emitir el botón del visor sin una secuencia de puntero observable, y probar que no duplica una activación ya procesada. Al cancelar, perder captura o recibir un segundo dedo se invalidará la activación del gesto; liberar una captura tras terminar normalmente no debe cancelar retroactivamente una activación válida.

Escuchar sobre la superficie de la escena y mantener los botones fuera de esa ruta. Los avisos y cruces con `pointer-events: none` dejarán pasar el toque. «Cualquier parte» abarca las dos mitades completas de la superficie; los controles explícitos ejecutan únicamente su acción.

Alternativas: cancelar al presionar conserva el defecto actual; basarse solo en la distancia final convertiría un arrastre de ida y vuelta en selección; activar simultáneamente con eventos de toque y de clic puede deshacer la selección inmediatamente.

### 5. Iluminación local con tres aspectos distinguibles

Cada planeta tendrá aspecto normal, apuntado y seleccionado. Aplicar una emisión tenue al apuntado y una emisión más intensa con un halo local al seleccionado, conservando los detalles de la superficie. El seleccionado prevalece cuando también está apuntado; al deseleccionarlo mirando todavía hacia él debe quedar un cambio visible al aspecto apuntado. Un planeta seleccionado y otro apuntado podrán coexistir.

Usar materiales y un halo sencillo generado localmente, sin añadir luces por selección ni posprocesado global. El halo no será seleccionable ni deberá tapar objetivos. Actualizar solo los materiales de los cuerpos cuyo estado cambie y solicitar un dibujo. No animar pulsaciones ni introducir rotación automática.

Alternativas: modificar luces globales alteraría otros cuerpos; un brillo idéntico para mirada y selección impediría reconocer una deselección; el bloom de pantalla completa aumenta el coste de las dos vistas y exige una cadena gráfica adicional.

### 6. Integración, recursos y verificación

`campoEstelar.js` será dueño de las instancias planetarias y de selección y expondrá la activación necesaria al componente. `EscenaEstelar` enlazará `alActivar` sin enviar a React actualizaciones por cada lectura de orientación. Mantener los módulos actuales de sensor y pantalla completa, cambiándolos solo si aparece una necesidad directamente ligada a estos gestos. Actualizar la descripción accesible de la superficie y las instrucciones de `README.md` para que ya no afirmen que no hay selección.

Los cambios de orientación, objetivo, selección, modo y tamaño marcarán `necesitaDibujo`. Sin cambios, no habrá nuevos renders efectivos ni consultas de intersección continuas. Mantener la pausa en segundo plano. Destruir mallas, geometrías compartidas, materiales, texturas y halo una sola vez; retirar eventos y referencias, y evitar activaciones tardías al desmontar o perder contexto. No cambiar la distribución actual de estrellas al añadir los planetas.

Probar con `node:test` la tabla de estados, las intersecciones con cámara/mallas sin WebGL y los gestos con el elemento y sensor simulados existentes. Actualizar la expectativa antigua de cancelación en `pointerdown` sin perder las comprobaciones de orientación conservada y rechazo de lecturas tardías después del arrastre. La apariencia, el resaltado en dos ojos y el botón de visor requieren comprobación visual y física adicional.

Alternativas: reconstruir la escena al cambiar una selección desperdicia recursos y pierde estabilidad; un bucle continuo no es necesario para cuerpos estáticos; una infraestructura nueva de pruebas no aporta utilidad para los casos que ya admite el ejecutor actual.

### 7. Etiquetas y contornos sin estiramiento en vista única

Usar `src/escena/proyeccionVista.js` para una proyección estereográfica aplicada a los vértices en la vista única. La perspectiva rectilínea anterior estiraba las siluetas al acercarse a los bordes del gran angular; la proyección esférica conserva los contornos circulares. Acotar la cobertura diagonal a 130 grados y ampliar la cámara de recorte para no descartar cuerpos visibles en las esquinas. No se añade otra pasada de renderizado. Las estrellas mantienen puntos circulares y los halos se centran y escalan según la misma dirección.

El detector utiliza la transformación inversa de pantalla a dirección, de modo que el clic sigue coincidiendo con la superficie mostrada fuera del centro. En VR se desactiva la transformación de vértices y se conserva la perspectiva estéreo existente.

`planetas.js` proporciona nombres en español y anclajes; `src/escena/etiquetasPlanetas.js` proyecta esos anclajes a etiquetas HTML sin eventos ni foco propios. Se actualizan junto con cada dibujo necesario y se retiran al destruir la escena. En VR se proyectan por separado con las mismas matrices y separación de ojos que la vista estéreo, y la segunda copia se oculta a la tecnología de asistencia. Los cuerpos fuera de vista no dejan etiquetas visibles.

Las comprobaciones cubren contornos circulares a distintas relaciones de aspecto, inversión de coordenadas, selección lateral y etiquetas en ambos ojos. La revisión visual de escritorio se realiza también a 1440 × 900.

### 8. Acabado de las referencias sin recuadro de exploración

Aumentar los radios aparentes conservando los centros y la distribución 360. Las bandas gaseosas presentan detalle fino y bordes ondulados; los anillos de Saturno se inclinan respecto del observador y muestran una separación transparente entre bandas. Su emisión de base mantiene legibles las bandas finas.

Una capa esférica compartida con transparencia de Fresnel aporta atmósfera tenue a la Tierra y un resplandor de contorno al apuntar o seleccionar. La emisión superficial de selección es moderada para conservar las sombras. Los materiales de proyección encadenan los ajustes de compilación existentes para mantener simultáneamente Fresnel y la corrección esférica de escritorio.

Las etiquetas HTML usan punto, guía, nombre y clasificación, sin fondo, borde de cápsula ni recuadro de invitación a explorar. El estado activo cambia su color. Para Saturno, las etiquetas consideran muestras del contorno real de los anillos; reservan una franja para los controles y pasan arriba si no caben debajo. En VR se centran por ojo y omiten las guías laterales.

## Risks / Trade-offs

- La apariencia procedural puede resultar demasiado esquemática → revisar los ocho cuerpos en capturas, especialmente continentes, bandas y anillos, y ajustar las texturas sin añadir servicios externos.
- Un umbral táctil demasiado pequeño puede convertir toques en arrastres → partir de 6 píxeles CSS, probar pequeñas oscilaciones y recorridos de ida y vuelta y ajustar con hardware conservando la distinción contractual.
- El botón de algunos visores entrega secuencias distintas → cubrir toque, clic derivado y clic aislado con pruebas; verificar el botón real y registrar el dispositivo utilizado.
- Profundidad planetaria y cruces sin disparidad pueden diferir con las lentes → colocar centros en una envolvente común, ajustar convergencia y revisar ambos ojos; no prometer calibración universal.
- Más geometría y texturas aumentan el coste móvil → compartir recursos, limitar segmentos y texturas, conservar pixel ratio y dibujo bajo demanda, y revisar fluidez y ciclos de entrada/salida.

## Migration Plan

No hay datos persistidos, cambios de API ni migraciones de servidor. Implementar primero cuerpos y detección, después gestos y enlace de modos, y validar el conjunto antes de publicar por el procedimiento que se acuerde para otro alcance. Si se necesita revertir, retirar la integración y los módulos de este cambio para recuperar la escena estelar; no borrar ni regenerar recursos ajenos. No realizar commit, push ni publicación sin autorización del usuario.
