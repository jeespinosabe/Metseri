# mobile-vr-mode Specification

## Purpose

Ofrecer una vista dividida para usar el teléfono en un visor móvil, con orientación mediante sensores cuando sea posible y una alternativa manual para mantener utilizable la experiencia.

## Requirements

### Requirement: Entrada y salida explícitas de VR

La aplicación SHALL permitir entrar en VR mediante una acción del usuario y salir mediante un control visible o la tecla Escape. En VR SHALL presentar dos vistas contiguas de la misma escena, una por ojo, con perspectivas proporcionadas y una dirección común. La vista única SHALL ser el modo inicial. Cambiar de modo SHALL conservar la distribución de estrellas y planetas, la dirección observada y el planeta seleccionado, sin ejecutar una selección o deselección adicional.

#### Scenario: Entrar en VR
- **WHEN** el usuario activa el control de entrada a VR
- **THEN** la escena pasa de una vista única a dos vistas contiguas y sincronizadas
- **AND** puede volver a la vista única incluso si el dispositivo no dispone de sensores

#### Scenario: Salir de VR
- **WHEN** el usuario activa la salida o pulsa Escape en VR
- **THEN** vuelve a una sola vista orientada hacia la última dirección observada
- **AND** los movimientos posteriores del dispositivo no modifican la mirada hasta una nueva activación del control por sensores

#### Scenario: Conservar una selección al alternar modos
- **WHEN** hay un planeta seleccionado y el usuario entra o sale de VR
- **THEN** el mismo planeta conserva la selección y su iluminación en la presentación de destino
- **AND** el resaltado de mirada se recalcula al entrar en VR y se retira al salir sin quitar la selección

### Requirement: Puntero común en las dos vistas

En VR la cruz blanca SHALL aparecer alineada con el eje común de mirada en cada ojo mediante la corrección óptica del visor y percibirse como una guía común. SHALL conservar su tamaño y carácter visual, sin foco ni eventos propios. El eje común de mirada SHALL determinar el cuerpo o control apuntado con independencia del lugar del toque. Al redimensionar, rotar o ajustar la diagonal, cada cruz SHALL conservar su alineación óptica; al salir de VR SHALL aplicarse la visibilidad de la cruz según el tipo de entrada de la vista única.

#### Scenario: Puntero en VR
- **WHEN** el usuario entra en VR
- **THEN** aparece una cruz blanca alineada con el eje común en cada ojo, respetando los centros ópticos y la corrección del visor
- **AND** el puntero no se muestra en el centro de la pantalla completa ni cruza la división entre las dos vistas

#### Scenario: Cambio de tamaño u orientación en VR
- **WHEN** cambia el tamaño o la orientación de la pantalla con VR activo
- **THEN** cada cruz permanece alineada con el eje común a través de la óptica de su ojo

#### Scenario: Salir de VR
- **WHEN** el usuario sale de VR
- **THEN** en escritorio no se muestra cruz central; en vista única táctil vuelve una sola cruz centrada

#### Scenario: El puntero no altera los controles de VR
- **WHEN** el usuario usa las vistas divididas con el sensor o con el control manual
- **THEN** la cruz no modifica la dirección de la mirada, el recentrado ni la entrada y salida de VR, y no recibe interacciones propias
- **AND** la escena puede resaltar y seleccionar el planeta apuntado conforme a los controles de la escena planetaria

#### Scenario: El toque no sustituye la mirada
- **WHEN** se mira un planeta y se toca una zona distinta en cualquiera de las dos mitades
- **THEN** el objetivo sigue correspondiendo a la dirección común de mirada, sin elegir cuerpos a partir de las coordenadas del toque

### Requirement: Activación de sensores con permiso

La aplicación SHALL intentar habilitar la orientación del dispositivo al entrar en VR a partir de esa acción del usuario. SHALL solicitar permiso únicamente cuando el navegador lo requiera y proporcione una forma de solicitarlo, sin pedirlo al abrir la aplicación. La falta de soporte o de un contexto seguro SHALL conducir al control manual sin impedir la entrada en la vista dividida.

#### Scenario: Navegador que solicita permiso
- **WHEN** el usuario entra en VR y el navegador requiere permiso de orientación
- **THEN** la solicitud se inicia desde esa acción explícita
- **AND** el control por sensores solo se activa tras concederse el permiso y recibirse lecturas válidas

#### Scenario: Navegador sin solicitud explícita de permiso
- **WHEN** el usuario entra en VR, existe soporte de orientación y no hay una operación de solicitud de permiso disponible
- **THEN** la aplicación comprueba si recibe datos válidos antes de activar el seguimiento
- **AND** la ausencia de esa operación no provoca por sí sola un fallo de la experiencia

#### Scenario: Salir mientras se espera el permiso
- **WHEN** el usuario sale de VR antes de que se resuelva una solicitud de permiso o llegue la primera lectura
- **THEN** la aplicación permanece en vista única y control manual aunque el permiso se conceda o lleguen datos después

### Requirement: Seguimiento y recentrado de la mirada

Con sensores activos, ambas vistas SHALL seguir de forma coherente la orientación del dispositivo, incluyendo su inclinación, y compensar la orientación de la pantalla. La primera lectura válida SHALL establecer una referencia que conserve la dirección previa al activar el seguimiento. El arrastre táctil o con mouse y las flechas de navegación SHALL ajustar la orientación sin cancelar el seguimiento; las lecturas posteriores SHALL seguir respondiendo al movimiento físico y conservar el ajuste manual. La continuidad SHALL mantenerse también mientras se arrastra. El doble tap de recentrado en VR SHALL permitir usar la orientación horizontal actual como frente, retirar los ajustes manuales acumulados y conservar la inclinación natural, sin regenerar el cielo ni cancelar el seguimiento.

#### Scenario: Girar el dispositivo
- **WHEN** el sensor está activo y el usuario gira o inclina el teléfono
- **THEN** ambas vistas cambian de orientación conjuntamente y muestran la dirección correspondiente al movimiento

#### Scenario: Rotar la pantalla
- **WHEN** la pantalla cambia entre orientación vertical y horizontal durante el seguimiento
- **THEN** la escena compensa ese cambio sin intercambiar los ejes de movimiento ni introducir un giro artificial de 90 grados

#### Scenario: Recentrar con sensor activo
- **WHEN** el usuario hace doble tap en VR con seguimiento activo
- **THEN** la dirección horizontal en la que apunta el dispositivo se convierte en el frente de referencia
- **AND** el seguimiento continúa conservando la inclinación natural del dispositivo

#### Scenario: Arrastrar con seguimiento activo
- **WHEN** el usuario arrastra con dedo o mouse en VR con sensor activo y después gira el dispositivo
- **THEN** el arrastre cambia la mirada y las lecturas posteriores continúan cambiándola desde la orientación ajustada
- **AND** no se requiere salir de VR, repetir permisos ni reactivar el sensor

#### Scenario: Lecturas intercaladas con un arrastre
- **WHEN** llegan lecturas mientras el usuario mantiene un arrastre y se alternan movimientos del dedo y del teléfono
- **THEN** ambas entradas se reflejan en una dirección común sin congelar el sensor ni revertir los ajustes con cada lectura
- **AND** soltar el gesto no produce un salto ni una acción de selección

#### Scenario: Flechas con seguimiento activo
- **WHEN** el área de la escena tiene el foco y se usan las flechas en VR con sensor activo
- **THEN** la mirada incorpora esos cambios y continúa respondiendo al sensor
- **AND** las flechas de controles o formularios con foco no giran la escena

#### Scenario: Recentrar después de una intervención manual
- **WHEN** se recentra tras combinar sensor, arrastre y flechas
- **THEN** el rumbo actual del dispositivo pasa a ser el frente sin conservar los ajustes manuales anteriores
- **AND** el seguimiento continúa con la inclinación natural y ambas vistas sincronizadas

### Requirement: Alternativa manual ante sensores no utilizables

La aplicación SHALL mantener operativos mouse, arrastre táctil y teclado en VR si faltan sensores utilizables, se rechaza el permiso, ocurre un error o no llegan lecturas completas y numéricas durante dos segundos de página visible tras habilitarlos. La espera de permiso SHALL quedar fuera de ese plazo y los ceros SHALL ser válidos. El paso a manual SHALL conservar la orientación visible y mostrar un aviso breve y no bloqueante. Usar arrastre, flechas de navegación o controles de interfaz SHALL conservar el seguimiento activo o pendiente mientras el sensor sea utilizable. La intervención manual SHALL NOT provocar por sí misma el aviso de sensor no disponible. Si la primera lectura llega después de una intervención manual durante la espera, SHALL alinearse con la orientación visible más reciente, sin un salto.

#### Scenario: Permiso rechazado o API ausente
- **WHEN** el usuario rechaza el permiso o el dispositivo no expone orientación utilizable
- **THEN** la vista dividida permanece disponible con controles manuales
- **AND** se informa brevemente de que puede arrastrar para mirar, sin repetir automáticamente la solicitud de permiso

#### Scenario: No llegan datos válidos
- **WHEN** transcurren dos segundos desde la habilitación con la página visible y solo se reciben valores nulos, incompletos o no numéricos, o no se reciben eventos
- **THEN** la experiencia continúa en control manual sin quedar esperando indefinidamente
- **AND** lecturas que lleguen después no sustituyen automáticamente al control manual

#### Scenario: Lectura con ángulos en cero
- **WHEN** se recibe una lectura completa cuyos ángulos incluyen valores iguales a cero
- **THEN** la lectura se acepta como válida y no se confunde con ausencia de datos

#### Scenario: Control manual durante el seguimiento
- **WHEN** se reconoce un arrastre real o el usuario usa las flechas sobre la escena mientras el sensor está activo o pendiente de activación
- **THEN** la mirada responde a esa interacción sin cancelar el seguimiento activo ni el intento pendiente
- **AND** las lecturas válidas posteriores continúan modificando la mirada y conservan los cambios manuales

#### Scenario: Tocar para seleccionar con seguimiento activo
- **WHEN** el usuario toca para seleccionar o deseleccionar un planeta sin iniciar un arrastre
- **THEN** el sensor continúa dirigiendo la mirada y no se necesita salir y volver a entrar en VR
- **AND** la pulsación no cambia la orientación manualmente

#### Scenario: Tocar mientras se espera el sensor
- **WHEN** el sensor está pendiente de permiso o de la primera lectura y se completa un toque sin arrastre
- **THEN** el intento de activación permanece vigente y una lectura válida posterior puede activar el seguimiento

#### Scenario: Seleccionar sin sensor
- **WHEN** VR está en control manual y el usuario apunta mediante arrastre o flechas y después toca
- **THEN** siguen disponibles el resaltado por mirada y las reglas de selección y deselección mediante toque global

#### Scenario: Arrastrar o usar flechas mientras se espera el sensor
- **WHEN** se arrastra o se usan flechas durante la espera del permiso o de la primera lectura y luego llega una lectura válida dentro del intento vigente
- **THEN** el sensor se activa sin descartar la orientación manual alcanzada y sin un salto
- **AND** no se cancela la solicitud ni se muestra un aviso por haber usado otro control

#### Scenario: Fallo después de navegar durante la espera
- **WHEN** se navega manualmente mientras se espera y después se deniega el permiso o vence el plazo de lecturas válidas
- **THEN** se conserva la última orientación y aparece el aviso breve existente
- **AND** el control manual sigue disponible y una lectura tardía no reactiva ese intento

### Requirement: Vista dividida utilizable con distintas capacidades de pantalla

La aplicación SHALL adaptar cada vista al tamaño de su mitad de pantalla. SHALL intentar utilizar pantalla completa y orientación horizontal cuando esas capacidades estén disponibles, sin convertirlas en requisito para VR. En orientación vertical SHALL mantener la posibilidad de salir y mostrar una indicación discreta para girar el dispositivo. Al salir SHALL liberar únicamente la pantalla completa o el bloqueo de orientación que haya adquirido la propia experiencia.

#### Scenario: Pantalla completa o bloqueo no disponibles
- **WHEN** el navegador no permite pantalla completa o bloqueo de orientación, o rechaza la solicitud
- **THEN** la vista dividida sigue funcionando dentro del área disponible sin errores bloqueantes

#### Scenario: Dispositivo en vertical
- **WHEN** el usuario entra en VR con la pantalla vertical y no se obtiene orientación horizontal
- **THEN** se muestran las dos vistas y una indicación para girar el teléfono
- **AND** el control de salida sigue accesible

#### Scenario: Salir de pantalla completa desde el navegador
- **WHEN** el usuario abandona mediante el navegador una pantalla completa que la experiencia adquirió al entrar en VR
- **THEN** la aplicación vuelve a la vista única y deja sus controles en un estado coherente

### Requirement: Acciones de ficha mediante mirada y toque

La ficha VR SHALL ofrecer pestañas de sección, flechas de navegación y cierre ×. El eje común de mirada SHALL resolver el control apuntado y un toque en cualquier zona SHALL activarlo una sola vez, independientemente de las coordenadas del dedo. Cada control SHALL destacar al apuntarlo y la sección actual SHALL tener un estado visible en ambos ojos. Mirar sin tocar SHALL NOT activar acciones ni temporizadores de permanencia.

Un impacto en la tarjeta sin control accionable SHALL consumir el toque manteniendo ficha, sección y selección. Apuntar fuera de la tarjeta y tocar SHALL conservar la deselección global existente; ese toque no selecciona otro cuerpo. Los controles explícitos de interfaz SHALL ejecutar solo su acción y un arrastre SHALL NOT paginar ni seleccionar.

#### Scenario: Activar desde una zona alejada
- **WHEN** se apunta a una pestaña o flecha y se toca lejos del objetivo en cualquiera de las mitades
- **THEN** ambos ojos muestran la misma sección y el cuerpo sigue seleccionado

#### Scenario: Tocar la lectura
- **WHEN** se mira el texto o un espacio reservado y se toca sin apuntar a un control
- **THEN** la ficha permanece en la misma sección y no se quita la selección

#### Scenario: Cierre explícito
- **WHEN** se apunta a × y se toca
- **THEN** se cierra la ficha y se quita la selección una sola vez

#### Scenario: Deselección fuera de la ficha
- **WHEN** hay selección, se apunta fuera de la tarjeta y se toca mirando al fondo u otro planeta
- **THEN** se quita la selección sin seleccionar otro cuerpo en ese toque

#### Scenario: Mirar, arrastrar y eventos derivados
- **WHEN** se mira sin tocar, se arrastra o se reciben varios eventos del mismo toque
- **THEN** mirar no activa, arrastrar no pagina ni selecciona y un toque válido produce como máximo una acción

#### Scenario: Oclusión del cielo
- **WHEN** hay un planeta o una etiqueta detrás de la tarjeta
- **THEN** no se apuntan cuerpos a través del panel ni se dibujan etiquetas sobre su lectura

### Requirement: Lectura de ficha compatible con orientación y controles

Abrir, cambiar sección y cerrar mediante toque SHALL conservar el seguimiento activo o pendiente. El sensor y la alternativa manual SHALL permitir apuntar los mismos controles. Los arrastres confirmados y las flechas de mirada SHALL ajustar la orientación conservando el seguimiento activo o pendiente, conforme a las reglas de navegación combinada. Recentrar SHALL recuperar la tarjeta frente a la mirada conservando cuerpo y sección; salir de VR SHALL mantener el cuerpo en la ficha normal y detener el sensor.

#### Scenario: Sensor activo o pendiente
- **WHEN** se toca una acción de ficha con el seguimiento activo o esperando permiso o primera lectura
- **THEN** el intento sigue vigente y las lecturas válidas posteriores pueden dirigir ambas vistas

#### Scenario: Alternativa manual
- **WHEN** el sensor no se puede usar y se apunta mediante arrastre o teclado y luego se toca
- **THEN** funcionan las mismas pestañas, flechas y cierre sin selección accidental al arrastrar

#### Scenario: Recentrado y salida
- **WHEN** se recentra o se sale de VR con una ficha abierta
- **THEN** el recentrado conserva sección y coloca la tarjeta al frente; la salida conserva el cuerpo en vista única sin activar acciones adicionales

#### Scenario: Navegar con una ficha y sensor activo
- **WHEN** hay una ficha abierta, se arrastra o se usan las flechas sobre la escena y después se mueve el dispositivo
- **THEN** la cámara responde a ambas entradas, conserva cuerpo y sección y no pagina ni cierra por el arrastre

### Requirement: Controles generales según modo

La vista normal SHALL ofrecer Recentrar y Entrar VR y SHALL NOT mostrar Ajustar visor. En VR SHALL conservarse abajo Ajustar visor y Salir de VR y SHALL NOT mostrarse un botón Recentrar ni controles generales dentro de la escena. Ajustar visor SHALL abrir el formulario HTML anterior con entrada decimal, Guardar, Cancelar, validación y persistencia existentes. Los botones HTML SHALL conservar su acceso por teclado.

#### Scenario: Alternar modos
- **WHEN** se entra y se sale de VR
- **THEN** la barra inferior cambia entre Recentrar y Entrar VR en vista normal y Ajustar visor y Salir de VR en VR
- **AND** la selección se conserva y el sensor se detiene al salir

#### Scenario: Ajustar visor
- **WHEN** se pulsa Ajustar visor abajo en VR
- **THEN** se abre el formulario anterior sin ajuste mediante mirada y se cancela cualquier tap pendiente

### Requirement: Doble tap para recentrar en VR

Dos taps válidos sobre el cielo dentro de 300 ms SHALL recentrar una sola vez, conservando cuerpo y sección y sin seleccionar, deseleccionar ni activar acciones de ficha. SHALL funcionar en cualquier punto de ambas mitades y mediante clicks del visor, con sensor activo, pendiente o no disponible. La orientación SHALL seguir las reglas existentes de recentrado. El tap simple SHALL ejecutar la acción capturada al tocar solo al descartar el segundo tap. La vista normal SHALL mantener selección inmediata y recentrado mediante botón.

Arrastre confirmado, múltiples punteros, cancelación del gesto, flechas, pérdida de foco, cambio de modo y destrucción SHALL cancelar el tap pendiente. Las lecturas del sensor SHALL NOT cancelar el gesto ni sustituir el objetivo capturado.

#### Scenario: Doble tap con ficha abierta
- **WHEN** se pulsa dos veces rápidamente con una ficha abierta y apuntando a una acción de ficha o al cielo
- **THEN** solo se recentra y se recupera la misma ficha y sección frente a la mirada
- **AND** el sensor activo o pendiente continúa

#### Scenario: Tap simple y mirada cambiante
- **WHEN** se hace un tap simple y el sensor cambia la mirada durante la espera
- **THEN** se activa el objetivo capturado al tocar y no el que haya quedado apuntado después

#### Scenario: Tap seguido de gesto invalidado
- **WHEN** hay un tap pendiente y se arrastra, se cancela el gesto, se pierde el foco, se cambia de modo o se destruye la experiencia
- **THEN** no se ejecuta la selección o acción de ficha pendiente

### Requirement: Instrucción inicial de controles VR

Cada entrada a VR SHALL mostrar en ambos ojos «Pulsa tap para seleccionar. Pulsa dos tap para recentrar.», legible mediante la óptica existente y con texto accesible. El primer tap en cualquier punto del cielo SHALL ocultarla sin seleccionar ni accionar fichas. El segundo tap rápido SHALL poder completar el doble tap de recentrado. Salir, abrir Ajustar visor, perder contexto o destruir SHALL retirar la instrucción; volver a entrar SHALL mostrarla de nuevo.

#### Scenario: Primer tap
- **WHEN** se entra en VR y se toca en cualquier punto de una de las mitades
- **THEN** desaparece la instrucción en ambos ojos sin seleccionar el cuerpo apuntado

#### Scenario: Nueva entrada
- **WHEN** se sale de VR después de cerrar la instrucción y se vuelve a entrar
- **THEN** aparece de nuevo el mismo texto

#### Scenario: Limpieza
- **WHEN** se pierde WebGL o se destruye la escena
- **THEN** la instrucción deja de verse y se liberan sus recursos al destruir sin acciones tardías
