# escena-planetaria Specification

## Purpose

Permitir explorar los ocho planetas del sistema solar como cuerpos tridimensionales en el cielo 360 de Metseri y seleccionarlos mediante mouse, toque o mirada acompañada de un toque en un visor móvil.

## Requirements

### Requirement: Ocho planetas tridimensionales reconocibles

La escena SHALL incluir una representación 3D de Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno. Cada planeta SHALL mostrar volumen y rasgos visuales que permitan distinguirlo de los demás y del fondo estelar, incluyendo los continentes y océanos de la Tierra, las bandas de Júpiter y los anillos de Saturno. La iluminación de base SHALL permitir reconocerlos sin seleccionarlos.

#### Scenario: Primera apertura con planetas
- **WHEN** se carga la escena en un navegador compatible
- **THEN** los ocho planetas forman parte del mismo entorno 3D que las estrellas
- **AND** no es necesario entrar en VR ni conceder permiso de sensores para verlos

#### Scenario: Diferencias entre los cuerpos
- **WHEN** el usuario recorre la escena hasta observar cada planeta
- **THEN** distingue superficies y colores propios de cada uno, sin que todos parezcan esferas lisas idénticas
- **AND** Saturno presenta anillos integrados en su representación y la Tierra y Júpiter presentan sus rasgos indicados

### Requirement: Distribución planetaria en la vista 360

Los planetas SHALL distribuirse en distintas direcciones alrededor del observador, con variación horizontal y vertical y presencia delante, a los lados y detrás de la dirección inicial. Su disposición SHALL permitir encontrar y apuntar individualmente a los ocho al recorrer el cielo. Sus posiciones SHALL permanecer fijas; tamaños, distancias y ubicación SHALL ser una composición visual sin correspondencia astronómica real.

#### Scenario: Recorrido completo
- **WHEN** el usuario recorre la vista horizontalmente y hacia arriba y abajo
- **THEN** encuentra planetas en distintos sectores del entorno y puede apuntar individualmente a cada uno
- **AND** los planetas no se concentran todos en la vista inicial ni quedan permanentemente ocultos entre sí

#### Scenario: Estabilidad del entorno
- **WHEN** el usuario regresa a una dirección observada o redimensiona la ventana
- **THEN** los planetas conservan sus posiciones y apariencias sin regenerarse ni desplazarse automáticamente

### Requirement: Selección directa en vista única

En vista única, un clic primario o toque sobre un planeta SHALL seleccionarlo e iluminarlo de forma persistente. SHALL existir como máximo un planeta seleccionado. Pulsar el planeta seleccionado o el fondo SHALL quitar la selección; pulsar otro planeta SHALL trasladarla a ese cuerpo. El objetivo SHALL corresponder a la posición de la pulsación sobre el área visible de la escena, independientemente de dónde apunte la cruz central.

#### Scenario: Seleccionar fuera del centro
- **WHEN** el usuario hace clic o toca un planeta visible fuera de la cruz central y sin arrastrar
- **THEN** queda seleccionado e iluminado ese planeta
- **AND** no se selecciona un cuerpo distinto por estar bajo la cruz

#### Scenario: Cambiar el planeta seleccionado
- **WHEN** hay un planeta seleccionado y el usuario pulsa directamente otro en vista única
- **THEN** el segundo queda seleccionado y el primero pierde la iluminación de selección

#### Scenario: Quitar la selección
- **WHEN** el usuario vuelve a pulsar el planeta seleccionado o pulsa el fondo en vista única
- **THEN** deja de haber un planeta seleccionado

#### Scenario: Pulsar el fondo sin selección
- **WHEN** no hay selección y el usuario pulsa una zona sin planetas en vista única
- **THEN** no se selecciona ningún cuerpo ni se cambia la orientación

### Requirement: Separación entre navegación y activación

La escena SHALL distinguir el clic o toque del arrastre, tolerando pequeñas variaciones involuntarias del puntero. Un arrastre reconocido SHALL cambiar la mirada sin seleccionar ni deseleccionar, incluso si empieza o termina sobre un planeta. Los gestos cancelados, los botones secundarios y los punteros adicionales SHALL NOT activar selección. Una pulsación física SHALL producir como máximo una activación.

#### Scenario: Arrastrar sobre un planeta
- **WHEN** el usuario arrastra con mouse o dedo desde un planeta o termina el arrastre sobre uno
- **THEN** la mirada responde al arrastre
- **AND** al soltar no se selecciona ni deselecciona ningún planeta, tanto en vista única como en VR

#### Scenario: Pequeño movimiento durante un toque
- **WHEN** una pulsación presenta una pequeña variación involuntaria sin llegar a constituir un arrastre
- **THEN** se trata como un único clic o toque
- **AND** no se cambia la orientación manualmente

#### Scenario: Cancelación o pérdida de captura
- **WHEN** se cancela un gesto o se pierde su captura antes de completarlo
- **THEN** no se produce selección ni deselección y queda disponible el siguiente gesto

#### Scenario: Punteros y botones no admitidos
- **WHEN** se pulsa con un botón secundario o interviene un segundo dedo durante un gesto
- **THEN** no se produce una activación planetaria accidental

#### Scenario: Un toque con eventos derivados
- **WHEN** el navegador entrega varios eventos correspondientes a un mismo toque
- **THEN** el estado cambia una sola vez, sin seleccionar y deseleccionar inmediatamente el mismo planeta

### Requirement: Resaltado por mirada en VR

En VR, el planeta visible al que apunta el eje común de la mirada SHALL resaltarse mientras se le apunta. El resaltado SHALL actualizarse al cambiar la dirección, sin seleccionar por sí solo ni exigir permanencia durante un plazo. SHALL existir como máximo un planeta apuntado; el resaltado y la selección SHALL corresponder al mismo estado en ambos ojos. El fondo y las estrellas SHALL NOT convertirse en objetivos planetarios.

#### Scenario: Apuntar y dejar de apuntar
- **WHEN** la mirada entra en un planeta y después vuelve al fondo
- **THEN** el planeta recibe y pierde el resaltado de mirada respectivamente
- **AND** esa observación no crea una selección persistente

#### Scenario: Cambiar de objetivo con una selección previa
- **WHEN** un planeta permanece seleccionado y la mirada apunta a otro
- **THEN** el primero conserva la iluminación de selección y el segundo recibe el resaltado de mirada
- **AND** no se traslada la selección sin una nueva interacción

#### Scenario: Coherencia entre las vistas
- **WHEN** se apunta a un planeta con sensor o mediante la alternativa manual de VR
- **THEN** ambas mitades muestran el mismo cuerpo resaltado y el mismo estado de selección

### Requirement: Selección y deselección con toque global en VR

En VR, si no hay selección, un toque en cualquier zona de la escena SHALL seleccionar el planeta apuntado en ese instante. Si ya hay selección, el siguiente toque en cualquier zona SHALL quitarla, sin exigir apuntar al seleccionado y sin seleccionar otro en ese mismo toque. Las coordenadas del toque SHALL NOT determinar el objetivo. Los controles superpuestos SHALL ejecutar solo su propia acción.

#### Scenario: Seleccionar con un toque alejado del planeta
- **WHEN** no hay selección, se apunta a un planeta y se toca una zona alejada de su representación en cualquiera de las dos mitades
- **THEN** se selecciona el planeta apuntado, independientemente de las coordenadas del toque

#### Scenario: Tocar sin apuntar a un planeta
- **WHEN** no hay selección y se toca cualquier zona mientras la mirada apunta al fondo
- **THEN** no se selecciona ningún cuerpo, aunque el toque se produzca sobre la representación lateral de un planeta

#### Scenario: Deseleccionar mirando al fondo
- **WHEN** hay un planeta seleccionado, se mira al fondo y se toca cualquier zona de la escena
- **THEN** se quita la selección aunque el planeta seleccionado esté fuera de la vista

#### Scenario: Deseleccionar mirando otro planeta
- **WHEN** un planeta está seleccionado, la mirada apunta a otro y se toca cualquier zona
- **THEN** se quita la selección anterior y el otro planeta sigue únicamente resaltado por mirada
- **AND** un toque posterior mientras se le apunta lo selecciona

#### Scenario: Deseleccionar sin retirar la mirada
- **WHEN** se toca de nuevo mientras se sigue mirando al planeta seleccionado
- **THEN** se quita su selección y conserva únicamente el resaltado de mirada

#### Scenario: Pulsar controles de la interfaz
- **WHEN** se activa Recentrar o el control de entrada o salida de VR
- **THEN** se ejecuta esa acción sin seleccionar ni deseleccionar un planeta por propagación del toque

### Requirement: Iluminación que distingue mirada y selección

Un planeta seleccionado SHALL conservar una iluminación distinguible de su aspecto normal y del resaltado por mirada, incluso al apartar la vista. Al quitar la selección, SHALL recuperar su aspecto normal o el resaltado de mirada si sigue apuntado en VR. Estos estados SHALL mantener reconocibles la superficie y el volumen del cuerpo y SHALL NOT modificar la iluminación del resto del cielo.

#### Scenario: Selección persistente al explorar
- **WHEN** se selecciona un planeta y después se mira en otra dirección y se regresa
- **THEN** el planeta conserva su iluminación de selección sin exigir apuntarlo continuamente

#### Scenario: Diferenciar la deselección bajo la mirada
- **WHEN** se quita la selección de un planeta al que se sigue apuntando en VR
- **THEN** hay un cambio visual perceptible desde la iluminación de selección al resaltado de mirada
- **AND** el usuario puede distinguir que ya no está seleccionado

#### Scenario: Liberar y reintentar una escena
- **WHEN** la escena pierde el contexto gráfico y el usuario reintenta cargarla
- **THEN** se recupera una escena con los ocho planetas y sin una selección o un objetivo residual de la instancia anterior

### Requirement: Etiquetas con nombres de los planetas

Cada planeta visible SHALL mostrar su nombre en español junto al cuerpo. Las etiquetas SHALL acompañar su posición al girar y redimensionar, ocultarse cuando el cuerpo deje de estar visible y permitir que el arrastre y la selección sigan recibiendo los gestos. En VR SHALL existir una copia alineada por ojo, sin duplicar su lectura accesible.

#### Scenario: Identificar un planeta visible
- **WHEN** el usuario encuentra un planeta en la vista única
- **THEN** aparece su nombre junto al cuerpo y la etiqueta acompaña su posición al explorar

#### Scenario: Etiquetas en VR
- **WHEN** se observa un planeta en las dos vistas de VR
- **THEN** su nombre aparece junto al mismo cuerpo en cada ojo
- **AND** las etiquetas no bloquean los toques globales ni el arrastre

#### Scenario: Presentación según la referencia visual
- **WHEN** un planeta está visible
- **THEN** su etiqueta muestra el nombre y su clasificación sin cápsula ni recuadro «Haz clic para explorar»
- **AND** en vista única un punto y una guía discreta acompañan la etiqueta
- **AND** al apuntar o seleccionar el nombre cambia de color y el resaltado conserva el relieve del cuerpo

#### Scenario: Nombre de Saturno y espacio para los controles
- **WHEN** los anillos de Saturno están visibles cerca del borde inferior
- **THEN** su etiqueta se sitúa fuera del contorno de los anillos sin cubrir los controles de la escena

### Requirement: Vista única sin estiramiento periférico

En vista única, los planetas esféricos SHALL conservar contornos circulares al acercarse a los extremos de la pantalla, incluidas las ventanas anchas. El clic o toque SHALL seguir seleccionando el cuerpo situado bajo la posición visible y las etiquetas SHALL mantenerse alineadas con la imagen. La corrección SHALL conservar la navegación 360 y el comportamiento de selección al alternar con VR.

#### Scenario: Planetas en los extremos de escritorio
- **WHEN** el usuario observa planetas hacia los lados de una ventana de escritorio ancha
- **THEN** los cuerpos mantienen su contorno circular sin alargarse por el gran angular
- **AND** sus nombres permanecen junto a su representación

#### Scenario: Selección lateral después de corregir la proyección
- **WHEN** se pulsa un planeta alejado de la cruz central en vista única
- **THEN** se selecciona e ilumina el cuerpo pulsado, sin desplazamiento entre imagen y objetivo
