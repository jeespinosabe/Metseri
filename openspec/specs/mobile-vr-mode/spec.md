# mobile-vr-mode Specification

## Purpose

Ofrecer una vista dividida para usar el teléfono en un visor móvil, con orientación mediante sensores cuando sea posible y una alternativa manual para mantener utilizable la experiencia.

## Requirements

### Requirement: Entrada y salida explícitas de VR

La aplicación SHALL permitir entrar en VR mediante una acción del usuario y salir mediante un control visible o la tecla Escape. En VR SHALL presentar dos vistas contiguas de la misma escena, una por ojo, con perspectivas proporcionadas y una dirección de observación común. La vista única SHALL ser el modo inicial. Cambiar de modo SHALL conservar la distribución de estrellas y la dirección observada.

#### Scenario: Entrar en VR
- **WHEN** el usuario activa el control de entrada a VR
- **THEN** la escena pasa de una vista única a dos vistas contiguas y sincronizadas
- **AND** puede volver a la vista única incluso si el dispositivo no dispone de sensores

#### Scenario: Salir de VR
- **WHEN** el usuario activa la salida o pulsa Escape en VR
- **THEN** vuelve a una sola vista orientada hacia la última dirección observada
- **AND** los movimientos posteriores del dispositivo no modifican la mirada hasta una nueva activación del control por sensores

### Requirement: Puntero común en las dos vistas

En VR el puntero de cruz SHALL mostrarse centrado en cada una de las dos vistas, en la misma posición relativa dentro de su mitad de pantalla, de modo que ambas copias coincidan y se perciban como un solo puntero al usar el visor. El puntero SHALL conservar las mismas características de la vista única (blanco, tamaño y carácter de mera guía visual), seguir centrado al redimensionar o rotar la pantalla, y desaparecer al volver a la vista única, donde SHALL mostrarse un único puntero en el centro.

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
- **THEN** el puntero no modifica la dirección de la mirada, el recentrado ni la entrada y salida de VR, y no responde a ninguna interacción

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

La aplicación SHALL mantener operativos el mouse, el arrastre táctil y el teclado en VR cuando no exista soporte, se rechace el permiso, ocurra un error o no lleguen lecturas completas y numéricas en los dos segundos posteriores a la habilitación del sensor con la página visible. El tiempo empleado por el usuario en resolver el permiso SHALL quedar fuera de ese plazo. Los ángulos con valor cero SHALL considerarse válidos. Un cambio a control manual SHALL conservar la última orientación visible y mostrar un aviso breve y no bloqueante.

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
- **WHEN** el usuario comienza un arrastre o usa las flechas sobre la escena mientras el sensor está activo o pendiente de activación
- **THEN** el control pasa a manual conservando la orientación actual y responde a esa interacción
- **AND** los eventos del sensor dejan de modificar la mirada hasta que el usuario salga y vuelva a entrar en VR

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
