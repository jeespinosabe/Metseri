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

Los ocho planetas y los cuatro satélites SHALL distribuirse en distintas direcciones alrededor del observador, con variación horizontal y vertical y presencia delante, a los lados y detrás de la dirección inicial. Su disposición SHALL permitir encontrar y apuntar individualmente a los doce al recorrer el cielo. Cada satélite SHALL estar próximo a su planeta en la composición y tener menor tamaño aparente, con separación visible suficiente para seleccionarlo de forma independiente. Titán SHALL quedar fuera del contorno visible de los anillos de Saturno. Las posiciones de los ocho planetas existentes SHALL conservarse y las de los doce cuerpos SHALL permanecer fijas; tamaños, distancias y ubicación SHALL ser una composición visual sin correspondencia astronómica real ni movimiento orbital o rotación automática.

#### Scenario: Recorrido completo
- **WHEN** el usuario recorre la vista horizontalmente y hacia arriba y abajo
- **THEN** encuentra cuerpos en distintos sectores del entorno y puede apuntar individualmente a los doce
- **AND** los cuerpos no se concentran todos en la vista inicial ni quedan permanentemente ocultos entre sí

#### Scenario: Estabilidad del entorno
- **WHEN** el usuario regresa a una dirección observada, redimensiona, recentra o alterna entre vista única y VR
- **THEN** los doce cuerpos conservan sus posiciones y apariencias sin regenerarse ni desplazarse automáticamente
- **AND** la Tierra conserva su ubicación en la dirección inicial y los ocho planetas su distribución previa

#### Scenario: Separación de las parejas
- **WHEN** se apunta sucesivamente al centro visible de cada satélite y de su planeta en vista única y VR
- **THEN** los dos se pueden detectar por separado sin que el planeta o los anillos impidan seleccionar la luna

### Requirement: Selección directa en vista única

En vista única, un clic primario o toque sobre un planeta SHALL seleccionarlo e iluminarlo de forma persistente. SHALL existir como máximo un planeta seleccionado. Pulsar el planeta seleccionado o el fondo SHALL quitar la selección; pulsar otro planeta SHALL trasladarla a ese cuerpo. El objetivo SHALL corresponder a la posición de la pulsación sobre el área visible de la escena, independientemente del eje central de mirada y de la presencia o ausencia de una cruz visual.

#### Scenario: Seleccionar fuera del centro
- **WHEN** el usuario hace clic o toca un planeta visible fuera del centro de la escena y sin arrastrar
- **THEN** queda seleccionado e iluminado ese planeta
- **AND** no se selecciona un cuerpo distinto por estar en el eje central de mirada

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

Un cuerpo seleccionado, planeta o satélite, SHALL conservar una iluminación distinguible de su aspecto normal y del resaltado transitorio por mouse en vista única o por mirada en VR, incluso al apartar el puntero o la vista. La selección SHALL prevalecer cuando un cuerpo también esté apuntado. Al quitarla, SHALL recuperar el aspecto normal si no está apuntado o el resaltado transitorio correspondiente si sigue bajo el mouse o la mirada. Estos estados SHALL mantener reconocibles la superficie y el volumen del cuerpo y SHALL NOT modificar la iluminación del resto del cielo. Un cuerpo seleccionado y otro apuntado SHALL poder coexistir; solo el seleccionado SHALL determinar la ficha abierta.

#### Scenario: Selección persistente al explorar
- **WHEN** se selecciona un planeta o satélite y después se mira en otra dirección y se regresa
- **THEN** el cuerpo conserva su iluminación de selección y su ficha sin exigir apuntarlo continuamente

#### Scenario: Diferenciar la deselección bajo la mirada
- **WHEN** se quita la selección de un cuerpo al que se sigue apuntando en VR
- **THEN** hay un cambio visual perceptible desde la iluminación de selección al resaltado de mirada
- **AND** el usuario puede distinguir que ya no está seleccionado y su ficha se cierra

#### Scenario: Diferenciar la deselección bajo el mouse
- **WHEN** se pulsa otra vez el cuerpo seleccionado sin retirar el mouse en vista única
- **THEN** su ficha se cierra y el aspecto cambia a resaltado transitorio
- **AND** al retirar el mouse vuelve a su aspecto normal

#### Scenario: Apuntar a otro cuerpo mientras hay ficha
- **WHEN** un cuerpo está seleccionado y el mouse o la mirada pasan sobre otro
- **THEN** el primero mantiene la iluminación persistente y su ficha y el segundo recibe solo iluminación transitoria

#### Scenario: Liberar y reintentar una escena
- **WHEN** la escena pierde el contexto gráfico y el usuario reintenta cargarla
- **THEN** se recupera una escena con los doce cuerpos y sin una selección, ficha u objetivo residual de la instancia anterior

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
- **WHEN** se pulsa un planeta alejado del centro de la escena en vista única
- **THEN** se selecciona e ilumina el cuerpo pulsado, sin desplazamiento entre imagen y objetivo

### Requirement: Resaltado transitorio por mouse en vista única

En vista única, el planeta situado bajo el mouse SHALL iluminarse sin requerir clic y SHALL perder esa iluminación transitoria cuando el mouse salga de su representación. El objetivo SHALL coincidir con la imagen visible, también fuera del centro y sobre los anillos de Saturno. SHALL existir como máximo un cuerpo apuntado transitoriamente por mouse. En escritorio SHALL omitirse la cruz central; el cursor del mouse SHALL ser la referencia de apuntado. La ausencia de cruz SHALL NOT modificar las coordenadas usadas para apuntar o seleccionar en este modo.

La detección SHALL actualizarse al mover el mouse, cambiar la orientación o redimensionar aunque el mouse permanezca quieto. Salir de la superficie, entrar en un panel o control superpuesto, ocultar la página o perder el foco de la ventana SHALL retirar el resaltado transitorio. Los toques táctiles SHALL NOT dejar un apuntado persistente simulado.

#### Scenario: Pasar sobre un planeta y salir
- **WHEN** el mouse entra en un planeta no seleccionado y después pasa al fondo
- **THEN** el planeta se ilumina durante el apuntado y recupera su aspecto normal al dejar de estar bajo el mouse
- **AND** no se abre su ficha ni se crea una selección

#### Scenario: Dos objetivos diferentes en la pantalla
- **WHEN** el eje central de mirada apunta a un planeta y el mouse está sobre otro en vista única
- **THEN** solo el situado bajo el mouse recibe el resaltado transitorio
- **AND** pulsarlo selecciona ese mismo planeta

#### Scenario: Objetivo lateral o anillos
- **WHEN** el mouse pasa sobre un cuerpo lateral o sobre los anillos de Saturno
- **THEN** se resalta el planeta que corresponde a esa posición visible sin desplazamiento entre imagen y objetivo

#### Scenario: Mouse quieto y cámara o tamaño cambiantes
- **WHEN** se gira la vista con teclado o se redimensiona y cambia el cuerpo situado bajo un mouse inmóvil
- **THEN** se recalcula el apuntado y desaparece cualquier resaltado anterior que ya no corresponda

#### Scenario: Superficie abandonada o tapada por la interfaz
- **WHEN** el mouse sale del cielo, entra en la ficha o en sus controles, la página se oculta o la ventana pierde el foco
- **THEN** se limpia solo el apuntado transitorio y se conserva cualquier selección y ficha activas

#### Scenario: Finalizar un toque táctil
- **WHEN** el visitante selecciona o deselecciona mediante toque y retira el dedo
- **THEN** no queda iluminación transitoria por una posición táctil antigua

### Requirement: Cuatro satélites naturales tridimensionales

La escena SHALL incorporar Luna, Europa, Titán y Tritón como satélites naturales de Tierra, Júpiter, Saturno y Neptuno respectivamente, conservando los ocho planetas existentes para completar exactamente doce cuerpos celestes explorables. Cada satélite SHALL tener volumen, iluminación de base y una apariencia distinguible: Luna gris con regiones oscuras y cráteres, Europa clara con trazos entrecruzados, Titán ocre con aspecto de bruma y Tritón pálido con regiones de distinto tono. Estas representaciones SHALL mantener el carácter ilustrativo del entorno.

#### Scenario: Apertura con doce cuerpos
- **WHEN** se carga la escena en un navegador compatible y se recorre el cielo
- **THEN** se encuentran los ocho planetas y las cuatro lunas indicadas, sin duplicados ni cuerpos adicionales
- **AND** las lunas no requieren entrar en VR, permisos de sensores ni consultar el servidor API para aparecer

#### Scenario: Distinguir las cuatro lunas
- **WHEN** se observa cada satélite sin seleccionarlo
- **THEN** se distinguen sus rasgos y su volumen sobre el fondo estelar
- **AND** las cuatro lunas no se presentan como copias de una esfera lisa con el mismo color

### Requirement: Interacción compartida entre planetas y satélites

Los satélites SHALL participar en las mismas reglas de apuntado, selección, ficha y separación de gestos que los planetas. SHALL existir como máximo un cuerpo seleccionado y un cuerpo apuntado en toda la escena, compartidos entre planetas, satélites y ambos ojos. En vista única, el mouse SHALL resaltar transitoriamente el cuerpo visible bajo sus coordenadas, y un clic primario o toque directo SHALL seleccionarlo; pulsar el seleccionado o el fondo SHALL deseleccionar y pulsar otro cuerpo SHALL trasladar la selección. La detección SHALL coincidir con la representación visible, también en los extremos de una ventana ancha.

En VR, mirar SHALL resaltar sin seleccionar ni activar por permanencia. Sin selección previa, un toque global SHALL seleccionar el cuerpo apuntado independientemente de las coordenadas del dedo; con selección previa, un toque mirando fuera de la ficha SHALL deseleccionar sin seleccionar otro en esa misma activación. La instrucción inicial SHALL consumir el primer tap sin seleccionar. Un doble tap SHALL recentrar sin seleccionar, deseleccionar ni accionar la ficha. El tap simple SHALL confirmar el objetivo capturado al tocar tras descartar un segundo tap; los controles y la superficie de lectura de la ficha SHALL conservar su prioridad sobre el cielo. Arrastrar, cancelar un gesto o activar controles superpuestos SHALL NOT seleccionar accidentalmente. Los toques de selección, ficha y controles generales SHALL conservar el seguimiento de orientación activo o pendiente, salvo la salida explícita de VR.

#### Scenario: Elegir una luna fuera de la cruz
- **WHEN** el mouse pasa sobre una luna lateral y se hace clic o se la toca directamente en vista única
- **THEN** el apuntado y la selección corresponden a esa luna y se abre su ficha
- **AND** no se selecciona su planeta ni el cuerpo situado en el eje central de mirada

#### Scenario: Una selección entre los doce cuerpos
- **WHEN** está seleccionado un planeta y se pulsa una luna en vista única, o está seleccionada una luna y se pulsa otro cuerpo
- **THEN** la selección y la única ficha pasan al cuerpo pulsado y el anterior pierde su estado persistente

#### Scenario: Selección por mirada con toque global
- **WHEN** no hay selección, se apunta a un satélite en VR y se toca lejos de su imagen en cualquiera de las mitades
- **THEN** se selecciona ese satélite y ambos ojos muestran la misma ficha y el mismo resaltado
- **AND** la orientación por sensores continúa si estaba activa o pendiente

#### Scenario: Cambiar de una luna a otro cuerpo en VR
- **WHEN** hay una luna seleccionada y se toca mirando a otro cuerpo fuera de la tarjeta
- **THEN** se cierra la ficha y se deselecciona la luna sin seleccionar otro cuerpo en ese toque
- **AND** un toque posterior mientras se sigue apuntando al nuevo cuerpo lo selecciona

#### Scenario: Lectura y gestos protegidos
- **WHEN** se toca el área de lectura de una ficha de satélite, se activa una pestaña, se arrastra desde una luna o se cancela el gesto
- **THEN** la lectura consume el toque sin cerrar, la pestaña ejecuta solo su acción y el arrastre o la cancelación no activan selección
- **AND** no se apunta ni selecciona un cuerpo a través de la tarjeta

#### Scenario: Controles generales sobre una luna
- **WHEN** está seleccionada una luna y se recentra con doble tap o se pulsa Salir de VR abajo
- **THEN** su selección y su ficha se conservan sin seleccionar su planeta principal ni otro cuerpo; Recentrar conserva la sección y Salir de VR aplica el reinicio habitual de sección del cambio de modo
- **AND** el tap simple mantiene la navegación de ficha y la deselección global tras cerrar la instrucción

### Requirement: Etiquetas e identidad de los satélites

Cada satélite visible SHALL mostrar su nombre en español y la relación «Satélite de la Tierra», «Satélite de Júpiter», «Satélite de Saturno» o «Satélite de Neptuno» según corresponda. Las etiquetas SHALL seguir la posición visible, ocultarse al dejar de ser visibles y mantener el estilo de nombre sin cápsula, cambio de color por apuntado o selección y guía discreta en vista única. SHALL ser legibles y permitir distinguir el satélite de su planeta, sin superponerse entre sí cuando la pareja está completamente visible. En VR SHALL aparecer alineadas en ambos ojos con una sola lectura accesible. SHALL NOT interceptar selección, arrastre ni controles de ficha.

#### Scenario: Identificar la pareja
- **WHEN** una luna y su planeta están completamente visibles en vista única
- **THEN** se leen los dos nombres por separado y la etiqueta de la luna identifica su planeta principal
- **AND** Titán y su etiqueta quedan diferenciados del contorno de los anillos de Saturno

#### Scenario: Etiquetas durante la exploración y en VR
- **WHEN** se gira la vista, se redimensiona o se entra en VR con un satélite visible
- **THEN** su nombre acompaña la imagen y aparece junto al mismo cuerpo en ambos ojos del visor
- **AND** las etiquetas permiten interactuar con el cielo y respetan la oclusión de la ficha
