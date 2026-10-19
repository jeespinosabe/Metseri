# Spec Delta

## Purpose

Permitir que el usuario contemple un entorno de estrellas envolvente y explore su alrededor desde una posición fija, en escritorio y en dispositivos móviles.

## ADDED Requirements

### Requirement: Escena inicial de estrellas

La aplicación SHALL abrir en una vista única que ocupe toda el área disponible y muestre estrellas sobre un fondo casi negro. Las estrellas SHALL rodear al observador en todas las direcciones y presentar variación discreta de tamaño y brillo, tomando la imagen aportada por el usuario como referencia visual. La escena SHALL permanecer estática mientras el usuario no cambie la dirección de observación.

#### Scenario: Primera apertura
- **WHEN** el usuario abre la aplicación en un navegador con renderizado compatible
- **THEN** se muestra directamente el cielo de estrellas en vista única, sin la interfaz de bienvenida de la plantilla
- **AND** el usuario no necesita activar VR ni conceder permisos para ver y explorar la escena

#### Scenario: Mirar en cualquier dirección
- **WHEN** el usuario gira la mirada horizontalmente o hacia arriba y abajo
- **THEN** continúa viendo el campo de estrellas, sin bordes de una imagen plana ni una dirección vacía por falta de cobertura

### Requirement: Exploración manual en 360 grados

La aplicación SHALL permitir cambiar la dirección de la mirada mediante arrastre con mouse en escritorio y arrastre táctil en móvil. SHALL permitir girar horizontalmente una vuelta completa y mirar hacia los polos verticales sin voltear involuntariamente el horizonte. La posición del observador SHALL permanecer fija. Los controles por teclado SHALL permitir una alternativa al arrastre cuando el área de la escena tenga el foco.

#### Scenario: Arrastre con mouse
- **WHEN** el usuario presiona y arrastra sobre la escena con el mouse
- **THEN** cambia la dirección de observación siguiendo el arrastre y permanece en esa dirección al soltarlo
- **AND** no se desplaza la posición del observador ni se necesita bloqueo del puntero

#### Scenario: Arrastre táctil
- **WHEN** el usuario arrastra un dedo sobre la escena
- **THEN** cambia la dirección de observación sin desplazar o seleccionar la página
- **AND** los botones superpuestos responden a los toques sin iniciar un arrastre de la escena

#### Scenario: Navegación con teclado
- **WHEN** el área de la escena tiene el foco y el usuario utiliza las flechas de dirección
- **THEN** la mirada gira en la dirección correspondiente sin desplazar la página
- **AND** esas teclas no interceptan la interacción con un botón que tenga el foco

### Requirement: Presentación adaptable y controles discretos

La escena SHALL adaptarse al área visible al redimensionar la ventana o rotar el dispositivo, sin deformaciones ni barras de desplazamiento. La interfaz SHALL mantener disponibles controles discretos y accesibles para entrar en VR y recentrar la mirada. Los controles y mensajes SHALL presentarse en español, respetar las zonas seguras de la pantalla y poder utilizarse mediante teclado.

#### Scenario: Cambio de tamaño u orientación
- **WHEN** cambia el tamaño del área visible o la orientación de la pantalla
- **THEN** el cielo sigue cubriendo el área disponible con una perspectiva proporcionada
- **AND** la dirección observada y los controles permanecen disponibles

#### Scenario: Recentrado manual
- **WHEN** el usuario activa el control para recentrar en vista única
- **THEN** la mirada vuelve a la dirección inicial sin regenerar las estrellas

### Requirement: Puntero de cruz como guía visual

La vista única SHALL mostrar un puntero de cruz blanco fijo en el centro del área de la escena que indique hacia dónde apunta la mirada, con un tamaño suficiente para distinguirse claramente de las estrellas sin cubrir una parte significativa de la escena. El puntero SHALL ser únicamente una guía visual: no SHALL seleccionar objetos, activar acciones, recibir el foco ni responder a punteros o al teclado, y SHALL ser ignorado por la tecnología de asistencia.

#### Scenario: Puntero en la vista única
- **WHEN** la escena está en funcionamiento en vista única
- **THEN** se ve una cruz blanca en el centro exacto del área de la escena, claramente distinguible de las estrellas
- **AND** al girar la mirada la cruz permanece en el centro mientras las estrellas se desplazan

#### Scenario: Cambio de tamaño u orientación
- **WHEN** cambia el tamaño de la ventana o la orientación del dispositivo
- **THEN** la cruz permanece en el centro del área de la escena

#### Scenario: El puntero no interfiere con la interacción
- **WHEN** el usuario presiona, toca o arrastra sobre el puntero, o utiliza el teclado
- **THEN** el arrastre, las flechas y los controles se comportan exactamente igual que sin puntero
- **AND** el puntero no recibe el foco, no cambia de aspecto ni dispara ninguna acción

#### Scenario: Escena en estado de error
- **WHEN** la escena no puede mostrarse y aparece el mensaje de error
- **THEN** no se presenta el puntero

### Requirement: Representación visual autónoma

La experiencia SHALL generar su campo visual sin depender de una API, catálogo astronómico, geolocalización o descarga externa de imágenes. SHALL conservar la misma distribución de estrellas al cambiar la dirección, redimensionar la vista o alternar entre vista única y VR. La escena SHALL limitarse a estrellas; no se requiere correspondencia con el cielo real. El puntero de cruz y los controles son elementos de interfaz superpuestos y no forman parte de la escena.

#### Scenario: Uso sin la API del proyecto
- **WHEN** la aplicación está cargada y la API Express no está disponible
- **THEN** el cielo y sus controles continúan funcionando sin solicitudes a esa API

#### Scenario: Conservación del campo visual
- **WHEN** el usuario cambia de modo o vuelve a una dirección ya observada durante la misma sesión
- **THEN** reconoce la misma distribución de estrellas en esa dirección

### Requirement: Fallos comprensibles del renderizado

La aplicación SHALL mostrar un mensaje comprensible cuando no pueda iniciar el renderizado o pierda su contexto gráfico, en vez de dejar únicamente una pantalla negra. SHALL ofrecer una acción explícita para reintentar y evitar presentar controles de navegación activos sobre una escena inoperante.

#### Scenario: Renderizado no disponible
- **WHEN** el navegador no puede crear el contexto gráfico necesario para mostrar la escena
- **THEN** aparece un mensaje en español que explica la limitación y ofrece reintentar
- **AND** no se presenta como cargada una escena vacía

#### Scenario: Pérdida del contexto durante la sesión
- **WHEN** se pierde el contexto gráfico de una escena que estaba funcionando
- **THEN** se detiene la interacción con esa escena y se muestra el estado de error con la opción de reintento
