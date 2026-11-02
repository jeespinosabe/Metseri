# Spec Delta

## MODIFIED Requirements

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

