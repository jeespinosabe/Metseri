# Spec Delta

## MODIFIED Requirements

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
