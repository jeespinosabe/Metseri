# Spec Delta

## MODIFIED Requirements

### Requirement: Presentación adaptable y controles discretos

La escena SHALL adaptarse al área visible al redimensionar la ventana o rotar el dispositivo, sin deformaciones ni barras de desplazamiento. La interfaz SHALL mantener disponibles controles discretos y accesibles para entrar en VR, ajustar el visor y recentrar la mirada. En vista única SHALL ofrecer Recentrar y Entrar VR y SHALL NOT mostrar Ajustar visor. Dentro de VR SHALL mostrar Ajustar visor y Salir de VR abajo y SHALL NOT mostrar un botón Recentrar. El doble tap en VR SHALL recentrar. Ajustar visor SHALL conservar su formulario HTML anterior. Los controles y mensajes SHALL presentarse en español, respetar las zonas seguras de la pantalla y poder utilizarse mediante teclado.

#### Scenario: Cambio de tamaño u orientación
- **WHEN** cambia el tamaño del área visible o la orientación de la pantalla
- **THEN** el cielo sigue cubriendo el área disponible con una perspectiva proporcionada
- **AND** la dirección observada y los controles permanecen disponibles

#### Scenario: Recentrado manual
- **WHEN** el usuario activa el control para recentrar en vista única
- **THEN** la mirada vuelve a la dirección inicial sin regenerar las estrellas

#### Scenario: Controles con el visor puesto
- **WHEN** el usuario está dentro de VR
- **THEN** puede recentrar con doble tap en cualquier punto del cielo sin activar selección ni acciones de ficha
- **AND** Ajustar visor y Salir de VR permanecen abajo; en vista normal se conservan Recentrar y Entrar VR

### Requirement: Puntero de cruz como guía visual

La vista única de escritorio SHALL omitir la cruz central y conservar el cursor del mouse como referencia de apuntado. A estos efectos, escritorio corresponde a una entrada principal precisa con capacidad de hover, independientemente del ancho de la ventana. La vista única táctil SHALL conservar su cruz blanca central. Cuando se muestre, la cruz SHALL permanecer como guía superpuesta distinguible de las estrellas, sin cubrir una parte significativa del cielo, sin foco ni eventos propios e ignorada por la tecnología de asistencia. La selección directa SHALL usar la posición del mouse o del toque, exista o no una cruz visible. VR SHALL conservar su guía común conforme a las reglas del modo VR.

#### Scenario: Escritorio sin cruz
- **WHEN** se abre la escena en vista única con entrada principal precisa y hover
- **THEN** no aparece una cruz central y se conserva el cursor del mouse
- **AND** el apuntado, clic, arrastre y teclado mantienen sus funciones

#### Scenario: Puntero en la vista única
- **WHEN** la escena funciona en vista única con entrada principal táctil sin hover
- **THEN** se ve una cruz blanca en el centro exacto del área de la escena
- **AND** al girar la mirada la cruz permanece en el centro mientras las estrellas se desplazan

#### Scenario: Cambio de tamaño u orientación
- **WHEN** cambia el tamaño de la ventana o la orientación del dispositivo sin cambiar el tipo de entrada
- **THEN** en escritorio la cruz sigue ausente y en vista táctil permanece centrada
- **AND** una ventana estrecha de escritorio no se clasifica como táctil por su tamaño

#### Scenario: El puntero no interfiere con la interacción
- **WHEN** el usuario presiona, toca o arrastra sobre una cruz visible, o utiliza el teclado
- **THEN** la escena recibe los gestos y aplica sus controles de navegación o selección según corresponda
- **AND** la cruz no recibe el foco, no cambia de aspecto ni ejecuta manejadores propios

#### Scenario: Escena en estado de error
- **WHEN** la escena no puede mostrarse y aparece el mensaje de error
- **THEN** no se presenta el puntero

