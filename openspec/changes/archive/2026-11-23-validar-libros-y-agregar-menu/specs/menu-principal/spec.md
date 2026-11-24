# Spec Delta

## Purpose

Reunir en un Menú del banner institucional las acciones generales de Metseri (instalar y descargar sin conexión, acceso a Administración e información «Acerca de»), de modo que el banner quede ordenado y quienes desarrollaron la aplicación estén identificados.

## ADDED Requirements

### Requirement: Menú en el banner
El banner institucional SHALL ofrecer un control «Menú» que despliegue, dentro de él, los botones «Instalar Metseri» y «Descargar para usar sin conexión» (o «Actualizar descarga»), el acceso a Administración y la opción Acerca de. El enlace de Administración y el botón de descarga sueltos SHALL dejar de mostrarse en el banner. El Menú SHALL poder usarse con ratón, toque y teclado, tener nombre accesible y cerrarse con Escape o al pulsar fuera.

#### Scenario: Abrir el Menú
- **WHEN** se despliega el banner y se activa «Menú»
- **THEN** se muestran los botones «Instalar Metseri» y «Descargar para usar sin conexión», Administración y Acerca de
- **AND** el control indica si está expandido para tecnologías de apoyo

#### Scenario: Banner sin accesos sueltos
- **WHEN** se despliega el banner con el Menú cerrado
- **THEN** no aparece ningún enlace «Administración» ni botón de descarga fuera del Menú
- **AND** el diálogo «Instalar o descargar» ya no se abre desde el banner

#### Scenario: Cerrar el Menú
- **WHEN** el Menú está abierto y se pulsa Escape o fuera de él
- **THEN** el Menú se cierra y el foco regresa a su control

### Requirement: Instalar y descargar sin cambios
Los botones «Instalar Metseri» y «Descargar para usar sin conexión» / «Actualizar descarga» SHALL conservar exactamente sus textos, avisos, estados y comportamiento actuales, ahora dentro del Menú. El estado de una descarga SHALL conservarse aunque el Menú se cierre y se vuelva a abrir. Una copia descargada antes de este cambio SHALL seguir disponible sin conexión.

#### Scenario: Instalar con aviso del navegador
- **WHEN** el navegador admite la instalación y se elige «Instalar Metseri»
- **THEN** se muestra el aviso de instalación del navegador
- **AND** si se acepta, el botón deja de mostrarse y el Menú se cierra

#### Scenario: Instalar sin aviso disponible
- **WHEN** no se puede solicitar la instalación y se elige «Instalar Metseri»
- **THEN** se muestra la guía de instalación correspondiente al navegador, con los mismos pasos de antes
- **AND** al cerrar el Menú, la guía se oculta

#### Scenario: Aplicación ya instalada
- **WHEN** Metseri se abre como aplicación instalada
- **THEN** «Instalar Metseri» no aparece, como antes

#### Scenario: Primera descarga
- **WHEN** no hay copia local y se elige «Descargar para usar sin conexión» con conexión a Internet
- **THEN** se muestra «Preparando N de 12 cuerpos…» durante el progreso
- **AND** al terminar se muestra «Disponible sin conexión.» con la fecha de descarga y el botón pasa a llamarse «Actualizar descarga»

#### Scenario: Descarga en curso con el Menú cerrado
- **WHEN** la descarga está en progreso, se cierra el Menú y se vuelve a abrir
- **THEN** el progreso o el resultado siguen visibles y el botón sigue deshabilitado mientras avanza

#### Scenario: Avisos de error y de falta de conexión
- **WHEN** no hay conexión ni copia, o la descarga falla
- **THEN** se muestra «Se necesita conexión para descargar las fichas.» o el mensaje del fallo seguido de «Vuelve a intentarlo con conexión.»

#### Scenario: Navegador sin soporte y entorno de desarrollo
- **WHEN** el navegador no admite la descarga sin conexión, o se usa la versión de desarrollo
- **THEN** se muestran «La descarga sin conexión no está disponible en este navegador.» o «La descarga está disponible en la versión de producción.», como antes

#### Scenario: Copia descargada antes del cambio
- **WHEN** existía una copia descargada antes de este cambio
- **THEN** sigue disponible sin conexión y se reconoce al abrir el Menú

### Requirement: Administración se accede desde el Menú
El acceso a Administración SHALL aparecer solo en el Menú y dirigir a `/admin` con el mismo comportamiento de navegación actual. El cambio SHALL NOT modificar la autenticación, las sesiones ni el control de acceso del módulo administrativo.

#### Scenario: Administración ya no está en el banner
- **WHEN** se revisa el banner desplegado, con el Menú cerrado
- **THEN** «Administración» no aparece en él
- **AND** sí aparece como opción dentro del Menú abierto

#### Scenario: Entrar sin sesión
- **WHEN** una persona sin sesión elige Administración
- **THEN** se abre la pantalla de acceso administrativo, como antes

#### Scenario: Entrar con sesión
- **WHEN** una persona con sesión vigente elige Administración
- **THEN** se abre el módulo administrativo, como antes

#### Scenario: Abrir en otra pestaña
- **WHEN** se abre Administración con clic central o Ctrl+clic
- **THEN** el navegador abre `/admin` en una pestaña nueva, como antes

### Requirement: Acerca de
La opción Acerca de SHALL abrir un diálogo que muestre los nombres de los desarrolladores tal como se indican: Espinosa Benítez Jesús, Garay Ocegueda Francisco Daniel, García Vázquez Edgar Daniel y Gonzalez Zapete Sophia; la carrera Ingeniería en Sistemas Computacionales; y el Instituto Tecnológico de Tepic. El diálogo SHALL poder cerrarse con un botón y con Escape.

#### Scenario: Mostrar los datos completos
- **WHEN** se elige Acerca de
- **THEN** el diálogo muestra los cuatro nombres exactos, la carrera y el Instituto Tecnológico de Tepic

#### Scenario: Cerrar Acerca de
- **WHEN** el diálogo está abierto y se activa Cerrar o se pulsa Escape
- **THEN** el diálogo se cierra y el foco regresa al Menú

#### Scenario: Contenido sin recorte en pantalla angosta
- **WHEN** se abre Acerca de en una pantalla de 320 px de ancho
- **THEN** los cuatro nombres, la carrera y la institución son legibles sin recorte horizontal y el diálogo se desplaza si no cabe en vertical

### Requirement: Menú en celular y en VR
En modo normal el Menú SHALL ser usable al tacto, con áreas táctiles de al menos 44 px, sin cubrir el control Entrar VR ni desbordar la pantalla. En modo VR el banner, y por tanto el Menú y sus diálogos, SHALL permanecer ocultos y cerrados, como hoy el banner.

#### Scenario: Menú en celular vertical
- **WHEN** se despliega el banner y se abre el Menú en un celular de 360 px de ancho
- **THEN** todas sus opciones son visibles y tocables, y el Menú no sobrepasa los bordes de la pantalla

#### Scenario: Menú en celular horizontal
- **WHEN** se abre el Menú en un celular de 360 px de alto en horizontal
- **THEN** todas sus opciones se pueden alcanzar, desplazando el Menú si hace falta

#### Scenario: Entrar a VR con el Menú o un diálogo abierto
- **WHEN** el Menú o Acerca de está abierto y se entra a VR
- **THEN** el Menú y los diálogos se cierran y no aparecen en VR
- **AND** una descarga en curso continúa

#### Scenario: Salir de VR
- **WHEN** se sale de VR
- **THEN** el banner vuelve a su estado cerrado y el Menú se puede abrir de nuevo
