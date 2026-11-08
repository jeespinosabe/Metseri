# Spec Delta

## MODIFIED Requirements

### Requirement: Puntero común en las dos vistas

En VR el puntero blanco SHALL aparecer alineado con el eje común de mirada en cada ojo mediante la corrección óptica del visor y percibirse como una guía común, sin foco ni eventos propios. SHALL conservar una escala visual equivalente a la cruz actual. El eje común de mirada SHALL determinar el cuerpo, control o mitad de tarjeta apuntados con independencia del lugar del toque. Al redimensionar, rotar o ajustar la diagonal, cada puntero SHALL conservar su alineación óptica; al salir de VR SHALL aplicarse la visibilidad de la cruz según el tipo de entrada de la vista única.

El puntero SHALL mostrar una flecha izquierda si la acción disponible es retroceder y una flecha derecha si es avanzar a otra página. Si el tap va a cerrar la ficha, SHALL mostrar un símbolo de cierre distinguible de avanzar. Fuera de la tarjeta, sobre pestañas sin acción direccional, mientras se muestra la instrucción inicial o sobre la mitad izquierda de la primera página SHALL conservar la cruz neutra. Su figura SHALL corresponder siempre a la acción efectiva del objetivo actual y ser la misma en ambos ojos. Mirar SHALL actualizar la figura sin ejecutar la acción.

#### Scenario: Puntero en VR
- **WHEN** el usuario entra en VR
- **THEN** aparece una cruz blanca alineada con el eje común en cada ojo, respetando los centros ópticos y la corrección del visor
- **AND** el puntero no se muestra en el centro de la pantalla completa ni cruza la división entre las dos vistas

#### Scenario: Cambio de tamaño u orientación en VR
- **WHEN** cambia el tamaño o la orientación de la pantalla con VR activo, o se ajusta la diagonal
- **THEN** cada puntero permanece alineado con el eje común a través de la óptica de su ojo
- **AND** ambos muestran la misma figura correspondiente al objetivo vigente

#### Scenario: Salir de VR
- **WHEN** el usuario sale de VR
- **THEN** en escritorio no se muestra cruz central; en vista única táctil vuelve una sola cruz centrada
- **AND** no queda una flecha o un símbolo de cierre de la ficha VR

#### Scenario: El puntero no altera los controles de VR
- **WHEN** el usuario usa las vistas divididas con el sensor o con el control manual
- **THEN** el puntero no modifica la dirección de la mirada, el recentrado ni la entrada y salida de VR, y no recibe interacciones propias
- **AND** la escena puede resaltar y seleccionar el planeta apuntado conforme a los controles de la escena planetaria

#### Scenario: El toque no sustituye la mirada
- **WHEN** se mira un planeta o una mitad de tarjeta y se toca una zona distinta en cualquiera de las dos mitades de pantalla
- **THEN** el objetivo sigue correspondiendo a la dirección común de mirada, sin elegir cuerpos ni dirección de navegación a partir de las coordenadas del toque

#### Scenario: Dirección disponible sobre la tarjeta
- **WHEN** se apunta a una zona sin control explícito de la mitad derecha y quedan páginas, o a la mitad izquierda y existe una página anterior
- **THEN** el puntero muestra respectivamente una flecha derecha o izquierda en ambos ojos
- **AND** la página permanece igual hasta completar un tap simple

#### Scenario: Aviso de cierre al terminar
- **WHEN** se apunta a la mitad derecha de la última página, al control de avance final o al cierre ×
- **THEN** el puntero muestra un símbolo de cierre en ambos ojos
- **AND** no anuncia un avance a una página inexistente

#### Scenario: Primera página y regreso a la exploración
- **WHEN** se apunta a la mitad izquierda de la primera página, a una pestaña o fuera de la tarjeta
- **THEN** el puntero vuelve a la cruz neutra
- **AND** cerrar la ficha o descartar su objetivo retira cualquier figura direccional anterior

### Requirement: Acciones de ficha mediante mirada y toque

La ficha VR SHALL ofrecer pestañas de sección, controles de navegación y cierre ×. El eje común de mirada SHALL resolver primero cualquier control explícito apuntado; un tap simple en cualquier zona de la pantalla SHALL activar exclusivamente esa acción una sola vez, independientemente de las coordenadas del dedo. Cada control SHALL destacar al apuntarlo y la sección actual SHALL tener un estado visible en ambos ojos. Mirar sin tocar SHALL NOT activar acciones ni temporizadores de permanencia.

Si la mirada impacta la tarjeta sin apuntar a un control explícito, un tap simple SHALL ejecutar Anterior en su mitad izquierda o Siguiente en su mitad derecha. La línea central SHALL pertenecer a la mitad derecha. Anterior SHALL retroceder exactamente una página cuando exista; en la primera página SHALL consumir el tap sin cambiar lectura ni selección. Siguiente SHALL avanzar exactamente una página mientras queden páginas, incluidas las continuaciones de una misma sección. Desde la última página SHALL cerrar la ficha y quitar la selección, conservando VR y el seguimiento activo o pendiente. Ese tap SHALL NOT seleccionar otro cuerpo ni salir del modo VR.

Apuntar fuera de la tarjeta y tocar SHALL conservar la deselección global existente; ese toque no selecciona otro cuerpo. Los controles explícitos de interfaz SHALL ejecutar solo su acción y un arrastre SHALL NOT paginar ni seleccionar. El doble tap SHALL seguir recentrando sin paginar ni cerrar, incluso en la última página; el tap simple SHALL respetar la espera de 300 ms y la acción capturada al tocar. La instrucción inicial SHALL seguir consumiendo el primer tap sin accionar la ficha. Un tap pendiente SHALL NOT aplicarse sobre otra ficha o una lectura que haya cambiado antes de ejecutarlo.

#### Scenario: Activar desde una zona alejada
- **WHEN** se apunta a una pestaña o flecha y se toca lejos del objetivo en cualquiera de las mitades de pantalla
- **THEN** ambos ojos muestran la misma página y sección resultantes y el cuerpo sigue seleccionado mientras no sea la acción de cierre final
- **AND** solo se ejecuta el control explícito, sin añadir navegación por la mitad que ocupa

#### Scenario: Tocar la lectura
- **WHEN** se mira texto, imagen o espacio sin control explícito en la mitad derecha y se completa un tap simple antes de la última página
- **THEN** ambos ojos avanzan exactamente una página conservando cuerpo y selección

#### Scenario: Tocar la lectura izquierda
- **WHEN** se mira una zona sin control explícito de la mitad izquierda y se completa un tap simple después de la primera página
- **THEN** ambos ojos retroceden exactamente una página conservando cuerpo y selección

#### Scenario: Límite inicial
- **WHEN** se apunta a una zona sin control explícito de la mitad izquierda de la primera página y se completa un tap simple
- **THEN** se conserva la primera página y la ficha permanece abierta con el mismo cuerpo seleccionado
- **AND** no se activa ningún cuerpo situado detrás de la tarjeta

#### Scenario: Línea central de la tarjeta
- **WHEN** la mirada apunta exactamente a la línea central de la tarjeta sin coincidir con un control explícito y se completa un tap simple
- **THEN** se ejecuta Siguiente una sola vez conforme a la página vigente

#### Scenario: Salir al avanzar desde la última página
- **WHEN** se apunta a la mitad derecha de la última página y se completa un tap simple
- **THEN** se retiran la ficha y la selección una sola vez
- **AND** ambas vistas siguen en VR con la orientación y el seguimiento previos, sin seleccionar otro cuerpo en ese tap

#### Scenario: Cierre explícito
- **WHEN** se apunta a × y se toca
- **THEN** se cierra la ficha y se quita la selección una sola vez sin ejecutar Siguiente por estar a la derecha

#### Scenario: Deselección fuera de la ficha
- **WHEN** hay selección, se apunta fuera de la tarjeta y se toca mirando al fondo u otro planeta
- **THEN** se quita la selección sin seleccionar otro cuerpo en ese toque

#### Scenario: Mirar, arrastrar y eventos derivados
- **WHEN** se mira sin tocar, se arrastra o se reciben varios eventos del mismo toque
- **THEN** mirar no activa, arrastrar no pagina ni selecciona y un toque válido produce como máximo una acción

#### Scenario: Doble tap al final de la lectura
- **WHEN** se hacen dos taps válidos dentro de 300 ms apuntando a la mitad derecha o al control de avance de la última página
- **THEN** solo se recentra conservando el cuerpo, la página y la ficha abierta
- **AND** no se ejecuta el cierre pendiente y el sensor activo o pendiente continúa

#### Scenario: Mirada cambiante durante la espera
- **WHEN** se hace un tap simple apuntando a una mitad de tarjeta y el sensor mueve después la mirada durante los 300 ms
- **THEN** se ejecuta la acción de la mitad capturada al tocar, si la misma ficha y lectura siguen vigentes
- **AND** no se reemplaza por la acción del nuevo objetivo

#### Scenario: Lectura sustituida antes de ejecutar
- **WHEN** hay un tap pendiente y cambia el cuerpo, la página o la composición paginada antes de terminar la espera
- **THEN** se descarta la acción pendiente sin paginar ni cerrar la nueva lectura

#### Scenario: Oclusión del cielo
- **WHEN** hay un planeta o una etiqueta detrás de la tarjeta
- **THEN** no se apuntan cuerpos a través del panel ni se dibujan etiquetas sobre su lectura

