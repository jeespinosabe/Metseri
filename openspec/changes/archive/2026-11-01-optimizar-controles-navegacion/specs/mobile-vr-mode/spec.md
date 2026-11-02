# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
