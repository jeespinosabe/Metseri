# Spec Delta

## ADDED Requirements

### Requirement: Acciones de ficha mediante mirada y toque

La ficha VR SHALL ofrecer controles explícitos para avanzar, retroceder cuando corresponda y cerrar. SHALL permitir apuntarlos con el eje común de mirada y activarlos con un único toque en cualquier zona de la superficie o con el clic táctil del visor. El control apuntado SHALL tener una señal visible coherente en ambos ojos. Mirarlo sin tocar SHALL NOT ejecutarlo ni iniciar temporizadores de permanencia. El objetivo de la acción SHALL resolverse en el instante de la activación y SHALL NOT depender de las coordenadas físicas del toque.

Un control de ficha apuntado SHALL tener prioridad sobre la deselección global, consumiendo esa activación una sola vez. Si no se apunta a un control accionable, el siguiente toque global SHALL conservar la regla existente de quitar la selección, incluso mirando al fondo, al texto de la ficha o a otro planeta. Los controles DOM explícitos de la interfaz SHALL seguir ejecutando únicamente su propia acción.

#### Scenario: Cambiar de página desde cualquier mitad
- **WHEN** se apunta a «Siguiente» de la ficha y se toca una zona alejada en cualquiera de las dos mitades
- **THEN** ambas vistas avanzan exactamente una página y no se deselecciona el planeta

#### Scenario: Mirar sin tocar
- **WHEN** la mirada permanece sobre «Siguiente», «Anterior» o «Cerrar» sin una activación
- **THEN** se señala el objetivo y no cambia la página, la selección ni el estado de la ficha

#### Scenario: Deselección global fuera de acciones
- **WHEN** hay selección, no se apunta a un control de ficha y se toca mirando al texto, al fondo o a otro planeta
- **THEN** se cierra la ficha y se quita la selección sin seleccionar otro cuerpo en ese mismo toque
- **AND** un toque posterior apuntando a otro planeta puede seleccionarlo y abrir su ficha

#### Scenario: Cierre explícito con el visor
- **WHEN** se apunta a «Cerrar» y se pulsa el botón táctil del visor
- **THEN** se cierra la ficha y se quita la selección una sola vez

#### Scenario: Lectura que ocluye un planeta
- **WHEN** la mirada incide en la superficie visible de la ficha y hay un planeta detrás
- **THEN** no se resalta ni se activa el planeta oculto a través de la ficha

#### Scenario: Arrastre o eventos derivados
- **WHEN** el usuario arrastra sobre la escena o el navegador entrega eventos derivados de un único toque
- **THEN** el arrastre no cambia la página ni la selección y un toque válido produce como máximo una acción

### Requirement: Lectura de ficha compatible con orientación y controles

Abrir una ficha, cambiar su página y cerrar o deseleccionar mediante toque SHALL conservar el seguimiento de orientación activo o pendiente, sin pasar al control manual. Los arrastres confirmados y las flechas SHALL mantener su comportamiento actual de navegación. La ficha SHALL ser alcanzable mediante sensor y alternativa manual y SHALL conservar los controles de salida de VR y recentrado utilizables. Recentrar SHALL reubicar la ficha respecto del nuevo frente sin cambiar el planeta ni la página.

#### Scenario: Sensor activo durante la lectura
- **WHEN** se abre una ficha o se cambia de página con el sensor activo y después se gira el dispositivo
- **THEN** ambas vistas continúan respondiendo a la orientación y conservan el mismo cuerpo y página

#### Scenario: Permiso o primera lectura pendientes
- **WHEN** se activa una acción de ficha con el sensor pendiente de permiso o de su primera lectura
- **THEN** continúa vigente el intento de seguimiento y la lectura válida posterior puede dirigir la vista

#### Scenario: Sensor denegado o ausente
- **WHEN** el sensor no se puede utilizar y se apunta a una acción mediante arrastre o flechas y luego se toca
- **THEN** se puede recorrer y cerrar la ficha con las mismas reglas de acción y selección

#### Scenario: Salida y retorno a vista única
- **WHEN** el usuario sale de VR con una ficha abierta, mediante el control, Escape o salida de pantalla completa
- **THEN** vuelve a la ficha del mismo cuerpo en vista única y el sensor deja de dirigir la mirada
- **AND** no se genera una selección, deselección ni activación de enlace accidental
