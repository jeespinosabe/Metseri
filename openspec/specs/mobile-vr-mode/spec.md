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

En VR la cruz blanca SHALL aparecer centrada en cada mitad, a la misma altura y posición relativa, y percibirse como una guía común de mirada. SHALL conservar su tamaño y carácter visual, sin foco ni eventos propios. El eje común de mirada SHALL determinar el objetivo planetario con independencia del lugar del toque. Al redimensionar o rotar, cada cruz SHALL seguir centrada; al salir de VR SHALL volver una sola cruz central.

#### Scenario: Puntero en VR
- **WHEN** el usuario entra en VR
- **THEN** aparece una cruz blanca en el centro de la vista izquierda y otra en el centro de la vista derecha, a la misma altura y en la misma posición relativa dentro de su mitad
- **AND** el puntero no se muestra en el centro de la pantalla completa ni cruza la división entre las dos vistas

#### Scenario: Cambio de tamaño u orientación en VR
- **WHEN** cambia el tamaño o la orientación de la pantalla con VR activo
- **THEN** cada cruz permanece centrada en su mitad de pantalla

#### Scenario: Salir de VR
- **WHEN** el usuario sale de VR
- **THEN** vuelve a mostrarse una sola cruz, centrada en el área completa de la escena

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

Con sensores activos, ambas vistas SHALL seguir de forma coherente la orientación del dispositivo, incluyendo su inclinación, y compensar la orientación de la pantalla. La primera lectura válida SHALL establecer una referencia que conserve la dirección previa al activar el seguimiento. El control de recentrado SHALL permitir usar la orientación horizontal actual como frente sin regenerar el cielo ni cancelar el seguimiento.

#### Scenario: Girar el dispositivo
- **WHEN** el sensor está activo y el usuario gira o inclina el teléfono
- **THEN** ambas vistas cambian de orientación conjuntamente y muestran la dirección correspondiente al movimiento

#### Scenario: Rotar la pantalla
- **WHEN** la pantalla cambia entre orientación vertical y horizontal durante el seguimiento
- **THEN** la escena compensa ese cambio sin intercambiar los ejes de movimiento ni introducir un giro artificial de 90 grados

#### Scenario: Recentrar con sensor activo
- **WHEN** el usuario activa el recentrado en VR con seguimiento activo
- **THEN** la dirección horizontal en la que apunta el dispositivo se convierte en el frente de referencia
- **AND** el seguimiento continúa conservando la inclinación natural del dispositivo

### Requirement: Alternativa manual ante sensores no utilizables

La aplicación SHALL mantener operativos mouse, arrastre táctil y teclado en VR si faltan sensores utilizables, se rechaza el permiso, ocurre un error o no llegan lecturas completas y numéricas durante dos segundos de página visible tras habilitarlos. La espera de permiso SHALL quedar fuera de ese plazo y los ceros SHALL ser válidos. El paso a manual SHALL conservar la orientación visible y mostrar un aviso breve y no bloqueante. Un toque sin arrastre SHALL conservar el seguimiento activo o pendiente.

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
- **THEN** el control pasa a manual conservando la orientación actual y responde a esa interacción
- **AND** los eventos del sensor dejan de modificar la mirada hasta que el usuario salga y vuelva a entrar en VR

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
