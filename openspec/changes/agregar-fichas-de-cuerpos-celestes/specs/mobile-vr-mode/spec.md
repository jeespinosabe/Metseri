# Spec Delta

## ADDED Requirements

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

Abrir, cambiar sección y cerrar mediante toque SHALL conservar el seguimiento activo o pendiente. El sensor y la alternativa manual SHALL permitir apuntar los mismos controles. Los arrastres confirmados y las flechas de mirada SHALL mantener su comportamiento. Recentrar SHALL recuperar la tarjeta frente a la mirada conservando cuerpo y sección; salir de VR SHALL mantener el cuerpo en la ficha normal y detener el sensor.

#### Scenario: Sensor activo o pendiente
- **WHEN** se toca una acción de ficha con el seguimiento activo o esperando permiso o primera lectura
- **THEN** el intento sigue vigente y las lecturas válidas posteriores pueden dirigir ambas vistas

#### Scenario: Alternativa manual
- **WHEN** el sensor no se puede usar y se apunta mediante arrastre o teclado y luego se toca
- **THEN** funcionan las mismas pestañas, flechas y cierre sin selección accidental al arrastrar

#### Scenario: Recentrado y salida
- **WHEN** se recentra o se sale de VR con una ficha abierta
- **THEN** el recentrado conserva sección y coloca la tarjeta al frente; la salida conserva el cuerpo en vista única sin activar acciones adicionales
