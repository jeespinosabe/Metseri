# Spec Delta

Este delta amplía `openspec/specs/escena-planetaria/spec.md` y conserva el resaltado y las fichas definidos en `openspec/changes/agregar-fichas-de-cuerpos-celestes/specs/escena-planetaria/spec.md`. Antes de sincronizarlo se debe incorporar esa base completada, de modo que este cambio no sustituya sus mejoras por una versión anterior.

## ADDED Requirements

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

En VR, mirar SHALL resaltar sin seleccionar ni activar por permanencia. Sin selección previa, un toque global SHALL seleccionar el cuerpo apuntado independientemente de las coordenadas del dedo; con selección previa, un toque mirando fuera de la ficha SHALL deseleccionar sin seleccionar otro en esa misma activación. Los controles y la superficie de lectura de la ficha SHALL conservar su prioridad sobre el cielo. Arrastrar, cancelar un gesto o activar controles superpuestos SHALL NOT seleccionar accidentalmente. Los toques de selección y de ficha SHALL conservar el seguimiento de orientación activo o pendiente.

#### Scenario: Elegir una luna fuera de la cruz
- **WHEN** el mouse pasa sobre una luna lateral y se hace clic o se la toca directamente en vista única
- **THEN** el apuntado y la selección corresponden a esa luna y se abre su ficha
- **AND** no se selecciona su planeta ni el cuerpo situado bajo la cruz central

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

## MODIFIED Requirements

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
