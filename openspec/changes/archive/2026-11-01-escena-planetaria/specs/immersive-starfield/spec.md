# Spec Delta

## MODIFIED Requirements

### Requirement: Escena inicial de estrellas

La aplicación SHALL abrir en una vista única que ocupe toda el área disponible y muestre estrellas sobre un fondo casi negro junto con los planetas de la escena planetaria. Las estrellas SHALL rodear al observador en todas las direcciones y presentar variación discreta de tamaño y brillo, tomando la imagen aportada por el usuario como referencia visual. La distribución de los cuerpos SHALL permanecer fija; su iluminación SHALL poder cambiar por mirada o selección según el modo.

#### Scenario: Primera apertura
- **WHEN** el usuario abre la aplicación en un navegador con renderizado compatible
- **THEN** se muestra directamente el cielo de estrellas con planetas en vista única, sin la interfaz de bienvenida de la plantilla
- **AND** el usuario no necesita activar VR ni conceder permisos para ver y explorar la escena

#### Scenario: Mirar en cualquier dirección
- **WHEN** el usuario gira la mirada horizontalmente o hacia arriba y abajo
- **THEN** continúa viendo el campo de estrellas, sin bordes de una imagen plana ni una dirección vacía por falta de cobertura

#### Scenario: Iluminación sin movimiento automático
- **WHEN** el usuario selecciona un planeta o cambia el objetivo de mirada en VR
- **THEN** se actualiza la iluminación correspondiente sin desplazar los cuerpos ni animar automáticamente el cielo

### Requirement: Puntero de cruz como guía visual

La vista única SHALL mostrar una cruz blanca fija en el centro de la escena, distinguible de las estrellas y sin cubrir una parte significativa del cielo. La cruz SHALL permanecer como guía superpuesta sin foco ni eventos propios e ignorada por la tecnología de asistencia. La escena SHALL gestionar la selección directa en vista única y la referencia de mirada en VR sin exigir pulsar la cruz ni impedir el paso de los gestos a la escena.

#### Scenario: Puntero en la vista única
- **WHEN** la escena está en funcionamiento en vista única
- **THEN** se ve una cruz blanca en el centro exacto del área de la escena, claramente distinguible de las estrellas
- **AND** al girar la mirada la cruz permanece en el centro mientras las estrellas se desplazan

#### Scenario: Cambio de tamaño u orientación
- **WHEN** cambia el tamaño de la ventana o la orientación del dispositivo
- **THEN** la cruz permanece en el centro del área de la escena

#### Scenario: El puntero no interfiere con la interacción
- **WHEN** el usuario presiona, toca o arrastra sobre el puntero, o utiliza el teclado
- **THEN** la escena recibe los gestos y aplica sus controles de navegación o selección según corresponda
- **AND** la cruz no recibe el foco, no cambia de aspecto ni ejecuta manejadores propios

#### Scenario: Escena en estado de error
- **WHEN** la escena no puede mostrarse y aparece el mensaje de error
- **THEN** no se presenta el puntero

### Requirement: Representación visual autónoma

La experiencia SHALL generar estrellas y planetas sin depender de una API, catálogo astronómico, geolocalización o descarga externa de imágenes. SHALL conservar su distribución al cambiar la dirección, redimensionar la vista o alternar entre vista única y VR. No se requiere correspondencia con posiciones, distancias o escalas del cielo real. El puntero de cruz y los controles SHALL seguir siendo elementos de interfaz superpuestos y no cuerpos de la escena.

#### Scenario: Uso sin la API del proyecto
- **WHEN** la aplicación está cargada y la API Express no está disponible
- **THEN** el cielo, sus planetas y sus controles continúan funcionando sin solicitudes a esa API

#### Scenario: Conservación del campo visual
- **WHEN** el usuario cambia de modo o vuelve a una dirección ya observada durante la misma sesión
- **THEN** reconoce la misma distribución de estrellas y planetas en esa dirección

#### Scenario: Apariencia planetaria local
- **WHEN** se crean los cuerpos de la escena
- **THEN** sus superficies y rasgos reconocibles no requieren descargar modelos ni imágenes de un servicio externo
