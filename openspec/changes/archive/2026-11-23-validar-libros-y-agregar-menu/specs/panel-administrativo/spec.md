# Spec Delta

## MODIFIED Requirements

### Requirement: Formularios para preparar altas y ediciones

Los formularios SHALL ofrecer título, autoría, editorial, año y URL de la ficha bibliográfica, una fotografía opcional del libro y la selección de cuerpos celestes. Título, autoría, editorial y URL SHALL identificarse como obligatorios; año y fotografía SHALL ser opcionales. El alta SHALL comenzar vacía y sin fotografía. La edición SHALL presentar los valores originales del libro seleccionado, incluidos su fotografía y su encuadre. Los campos SHALL poder modificarse como borrador temporal, sin alterar el registro mostrado en el listado.

#### Scenario: Preparar un alta
- **WHEN** se abre Agregar libro
- **THEN** se muestran campos vacíos, indicación de obligatoriedad, el campo de fotografía sin imagen y selección inicial sin cuerpos asociados
- **AND** Guardar libro permanece deshabilitado sin texto explicativo

#### Scenario: Preparar una edición
- **WHEN** se abre Editar para un registro
- **THEN** se muestran sus datos, su fotografía si la tiene y sus asociaciones actuales
- **AND** modificar un campo, la fotografía o su encuadre solo cambia el borrador visible

#### Scenario: Cancelar una edición
- **WHEN** se modifican datos o la fotografía, se cancela y se vuelve a editar el mismo registro
- **THEN** reaparecen sus valores originales, sin conservar el borrador cancelado

#### Scenario: Identificar la editorial como obligatoria
- **WHEN** se abre Agregar libro o Editar
- **THEN** la etiqueta de la editorial indica «Obligatorio», igual que título y autoría, y la del año indica «Opcional»

### Requirement: Validación visual de los campos

La interfaz SHALL señalar errores al abandonar un campo que se haya editado y actualizar el mensaje al corregirlo. Título y autoría SHALL rechazar contenido compuesto únicamente por espacios; la editorial SHALL rechazarlo y SHALL ser obligatoria. Los textos SHALL respetar las reglas de `validacion-datos-bibliograficos` (longitud, una línea sin caracteres de control, al menos una letra o dígito, nombres de autor que inician con letra y tienen al menos 2 caracteres, y rango del año). La URL SHALL requerir un destino absoluto con protocolo HTTP o HTTPS. Cuando el servidor rechace un campo, su mensaje SHALL mostrarse bajo ese campo. Cada error SHALL estar asociado al campo y expresarse en texto; su corrección SHALL NOT habilitar el guardado en esta etapa.

#### Scenario: Mostrar y corregir errores
- **WHEN** se introduce un título vacío, una URL no válida o un año decimal y se abandona el campo correspondiente
- **THEN** se identifica el campo con un mensaje que explica cómo corregirlo
- **AND** al introducir un valor válido desaparece su error sin enviar información

#### Scenario: Conservar campos opcionales vacíos
- **WHEN** se deja vacío el año
- **THEN** ese campo no genera errores ni se sustituye por información inventada

#### Scenario: Señalar la editorial vacía
- **WHEN** se abandona la editorial sin escribir nada
- **THEN** aparece «Escribe la editorial del libro.» asociado al campo y el campo queda marcado como inválido para tecnologías de apoyo

#### Scenario: Señalar un valor fuera de regla
- **WHEN** se escribe un título de más de 200 caracteres, un año fuera de rango, un título «!!!» o un nombre de autor que inicia con símbolo y se abandona el campo
- **THEN** aparece el mensaje de `validacion-datos-bibliograficos` asociado a ese campo, y desaparece al corregirlo

#### Scenario: Mensaje del servidor bajo el campo
- **WHEN** la API responde 400 con `error.campos` para la editorial y el año
- **THEN** cada mensaje aparece bajo su campo, el campo queda marcado como inválido y el foco pasa al primero
- **AND** lo escrito se conserva

#### Scenario: Corregir un campo rechazado por el servidor
- **WHEN** se modifica un campo cuyo mensaje vino del servidor
- **THEN** ese mensaje desaparece mientras se valida de nuevo localmente
