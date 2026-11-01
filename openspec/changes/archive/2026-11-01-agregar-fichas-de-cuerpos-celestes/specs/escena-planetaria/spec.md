# Spec Delta

Este delta depende de la capacidad definida en `openspec/changes/escena-planetaria/specs/escena-planetaria/spec.md` dentro del repositorio. El cambio base está completado, pero todavía no sincronizado con las especificaciones principales. Se debe establecer esa base antes de sincronizar este delta; no se introduce otra capacidad planetaria paralela.

## ADDED Requirements

### Requirement: Resaltado transitorio por mouse en vista única

En vista única, el planeta situado bajo el mouse SHALL iluminarse sin requerir clic y SHALL perder esa iluminación transitoria cuando el mouse salga de su representación. El objetivo SHALL coincidir con la imagen visible, también fuera del centro y sobre los anillos de Saturno. SHALL existir como máximo un cuerpo apuntado transitoriamente por mouse. La cruz central SHALL continuar siendo una guía visual y SHALL NOT sustituir las coordenadas del mouse al apuntar o seleccionar en este modo.

La detección SHALL actualizarse al mover el mouse, cambiar la orientación o redimensionar aunque el mouse permanezca quieto. Salir de la superficie, entrar en un panel o control superpuesto, ocultar la página o perder el foco de la ventana SHALL retirar el resaltado transitorio. Los toques táctiles SHALL NOT dejar un apuntado persistente simulado.

#### Scenario: Pasar sobre un planeta y salir
- **WHEN** el mouse entra en un planeta no seleccionado y después pasa al fondo
- **THEN** el planeta se ilumina durante el apuntado y recupera su aspecto normal al dejar de estar bajo el mouse
- **AND** no se abre su ficha ni se crea una selección

#### Scenario: Dos objetivos diferentes en la pantalla
- **WHEN** la cruz central apunta a un planeta y el mouse está sobre otro en vista única
- **THEN** solo el situado bajo el mouse recibe el resaltado transitorio
- **AND** pulsarlo selecciona ese mismo planeta

#### Scenario: Objetivo lateral o anillos
- **WHEN** el mouse pasa sobre un cuerpo lateral o sobre los anillos de Saturno
- **THEN** se resalta el planeta que corresponde a esa posición visible sin desplazamiento entre imagen y objetivo

#### Scenario: Mouse quieto y cámara o tamaño cambiantes
- **WHEN** se gira la vista con teclado o se redimensiona y cambia el cuerpo situado bajo un mouse inmóvil
- **THEN** se recalcula el apuntado y desaparece cualquier resaltado anterior que ya no corresponda

#### Scenario: Superficie abandonada o tapada por la interfaz
- **WHEN** el mouse sale del cielo, entra en la ficha o en sus controles, la página se oculta o la ventana pierde el foco
- **THEN** se limpia solo el apuntado transitorio y se conserva cualquier selección y ficha activas

#### Scenario: Finalizar un toque táctil
- **WHEN** el visitante selecciona o deselecciona mediante toque y retira el dedo
- **THEN** no queda iluminación transitoria por una posición táctil antigua

## MODIFIED Requirements

### Requirement: Iluminación que distingue mirada y selección

Un planeta seleccionado SHALL conservar una iluminación distinguible de su aspecto normal y del resaltado transitorio por mouse en vista única o por mirada en VR, incluso al apartar el puntero o la vista. La selección SHALL prevalecer cuando un cuerpo también esté apuntado. Al quitarla, SHALL recuperar el aspecto normal si no está apuntado o el resaltado transitorio correspondiente si sigue bajo el mouse o la mirada. Estos estados SHALL mantener reconocibles la superficie y el volumen del cuerpo y SHALL NOT modificar la iluminación del resto del cielo. Un cuerpo seleccionado y otro apuntado SHALL poder coexistir; solo el seleccionado SHALL determinar la ficha abierta.

#### Scenario: Selección persistente al explorar
- **WHEN** se selecciona un planeta y después se mira en otra dirección y se regresa
- **THEN** el planeta conserva su iluminación de selección y su ficha sin exigir apuntarlo continuamente

#### Scenario: Diferenciar la deselección bajo la mirada
- **WHEN** se quita la selección de un planeta al que se sigue apuntando en VR
- **THEN** hay un cambio visual perceptible desde la iluminación de selección al resaltado de mirada
- **AND** el usuario puede distinguir que ya no está seleccionado y su ficha se cierra

#### Scenario: Diferenciar la deselección bajo el mouse
- **WHEN** se pulsa otra vez el planeta seleccionado sin retirar el mouse en vista única
- **THEN** su ficha se cierra y el aspecto cambia a resaltado transitorio
- **AND** al retirar el mouse vuelve a su aspecto normal

#### Scenario: Apuntar a otro cuerpo mientras hay ficha
- **WHEN** un planeta está seleccionado y el mouse o la mirada pasan sobre otro
- **THEN** el primero mantiene la iluminación persistente y su ficha y el segundo recibe solo iluminación transitoria

#### Scenario: Liberar y reintentar una escena
- **WHEN** la escena pierde el contexto gráfico y el usuario reintenta cargarla
- **THEN** se recupera una escena con los ocho planetas y sin una selección, ficha u objetivo residual de la instancia anterior
