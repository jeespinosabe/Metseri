# Spec Delta

## Purpose

Permitir instalar Metseri y preparar en el dispositivo la experiencia pública, incluidas las doce fichas y sus recomendaciones, para explorarla después sin conexión.

## ADDED Requirements

### Requirement: Instalación de Metseri

Metseri SHALL ofrecer su nombre, icono y punto de inicio público a los navegadores compatibles con la instalación desde un origen seguro. La aplicación instalada SHALL abrir la escena en una ventana propia. La experiencia en una pestaña SHALL funcionar también en navegadores donde la instalación no esté disponible.

#### Scenario: Instalar y abrir desde el icono
- **WHEN** la persona instala Metseri mediante los controles del navegador compatible y abre su icono
- **THEN** se abre la escena 360 en vista única bajo el nombre y el icono de Metseri en modo de aplicación

#### Scenario: Explorar desde el navegador
- **WHEN** la persona abre Metseri sin instalarla o utiliza un navegador sin opción de instalar
- **THEN** puede seguir usando en línea la exploración y sus controles habituales

### Requirement: Preparación completa para uso sin conexión

En la vista única, Metseri SHALL ofrecer una acción para descargar o actualizar la copia sin conexión y comunicar progreso, éxito y fallo en español. La preparación SHALL guardar los recursos de arranque y de la escena, las imágenes locales y, para cada uno de los ocho planetas y cuatro satélites, su ficha publicada y sus recomendaciones públicas devueltas por la API. Una respuesta válida sin recomendaciones cuenta como completa para ese cuerpo. La disponibilidad SHALL confirmarse solo cuando los recursos locales estén listos y las doce parejas de respuestas válidas se hayan guardado de forma persistente en el contexto que ejecuta Metseri. Una actualización fallida SHALL conservar la última descarga completa legible.

#### Scenario: Completar la descarga sin visitar las fichas
- **WHEN** se ejecuta la acción de descarga con acceso a la API pública y los doce cuerpos responden correctamente
- **THEN** Metseri muestra el progreso y confirma que se puede usar sin conexión, incluida la fecha de la copia educativa
- **AND** quedan guardadas las recomendaciones de todos los cuerpos, aunque alguno haya devuelto una lista vacía

#### Scenario: Recuperarse de un fallo de descarga
- **WHEN** una respuesta falta, no es válida o falla el almacenamiento antes de guardar toda la copia
- **THEN** Metseri informa que la descarga quedó incompleta y permite reintentar con conexión
- **AND** una descarga válida anterior sigue disponible con su fecha original, si existía

### Requirement: Reapertura sin conexión de la experiencia pública

En un dispositivo compatible con la escena y con los archivos locales preparados, Metseri SHALL volver a abrir en la raíz sin conexión aunque la sesión anterior se haya cerrado. SHALL permitir explorar los doce cuerpos en 360, usar el visor dividido y abrir las fichas con sus imágenes locales. Cuando se conserva la descarga completa, SHALL ofrecer el contenido educativo conforme a `fichas-cuerpos-celestes`.

#### Scenario: Arrancar en modo avión después de preparar la descarga
- **WHEN** se cierra Metseri tras la confirmación y se vuelve a abrir desde el icono o la raíz del navegador que guardó la copia, con el dispositivo en modo avión
- **THEN** inicia la escena con sus controles locales y permite seleccionar planetas y satélites cuyas fichas nunca se habían abierto
- **AND** el visor móvil puede entrar y salir del modo dividido y conserva la alternativa manual si no puede usar orientación

#### Scenario: Explorar con los archivos locales y sin una copia educativa disponible
- **WHEN** el navegador conserva los archivos de la escena, pero falta una descarga educativa completa y legible
- **THEN** la escena y la estructura local de las fichas siguen disponibles y Metseri indica que se requiere conexión para descargar el contenido

### Requirement: Límites de la descarga y actualización de la aplicación

La descarga SHALL contener únicamente los recursos locales de la aplicación y las fichas y recomendaciones públicas. Las rutas y respuestas administrativas, autenticación, escrituras y recursos de otros sitios deberán seguir su flujo de red habitual y quedan fuera de la copia. La actualización de los archivos de aplicación SHALL activarse sin recargar una exploración o una sesión VR en curso. Una copia educativa compatible SHALL seguir disponible al actualizar esos archivos.

#### Scenario: Consultar rutas de red mientras la aplicación está instalada
- **WHEN** se consulta una ruta de la API o se intenta acceder a administración con el service worker activo
- **THEN** la petición mantiene su destino y su respuesta de red, incluidos los errores HTTP de la API, y el navegador señala el fallo de red cuando el servidor es inaccesible
- **AND** la descarga pública no proporciona una sesión ni permite operaciones administrativas desconectadas

#### Scenario: Reabrir después de una actualización
- **WHEN** hay una nueva versión de la aplicación mientras se usa la escena o VR
- **THEN** la experiencia activa no se recarga de forma automática
- **AND** una vez cerradas las sesiones que mantienen la versión anterior, la siguiente apertura usa la versión nueva con su conjunto coherente de archivos y conserva la copia educativa si es compatible
