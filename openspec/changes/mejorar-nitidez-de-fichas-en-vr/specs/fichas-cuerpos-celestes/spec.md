# Spec Delta

## MODIFIED Requirements

### Requirement: Conservación del diseño del sprint anterior

La vista única SHALL conservar distribución, colores, tipografía, imágenes, cuadrícula, separadores, controles y desplazamiento, sin pantallas ni rutas nuevas. En VR SHALL conservar identidad, paleta, imágenes y controles, permitiendo adaptar automáticamente escala, tamaño de letra y continuaciones según diagonal y área útil para alcanzar legibilidad. La ficha VR SHALL conservar el encabezado sin franja de subtítulo.

#### Scenario: Comparar antes y después en navegador
- **WHEN** se compara la ficha normal previa y posterior al cambio con el mismo tamaño de ventana
- **THEN** se conservan presentación, contenido, controles y desplazamiento
- **AND** la adaptación automática de lectura afecta exclusivamente a VR

#### Scenario: Conservar la experiencia del visor
- **WHEN** se entra y sale del modo VR con una selección
- **THEN** permanecen el cuerpo y las reglas anteriores de navegación y reinicio de lectura
- **AND** el contenido aparece en el panel y en ambos ojos sin cambiar colores, imágenes, controles ni parámetros del perfil óptico
- **AND** la adaptación de tamaños y continuaciones no vuelve a mostrar la franja del subtítulo

## ADDED Requirements

### Requirement: Legibilidad automática tras la proyección

En la matriz horizontal de aceptación, la ficha VR SHALL alcanzar automáticamente un em proyectado mínimo de 15.5 px CSS para párrafos y 13.5 para etiquetas y unidades cuando la entrada principal es táctil. Con otras entradas SHALL alcanzar 16 y 14 px CSS, respectivamente. Estos mínimos aplican en la zona de lectura, con la ficha y los controles visibles. El ajuste SHALL responder a diagonal y área útil sin exigir elecciones manuales de tamaño o calidad. El criterio SHALL medirse después de la transformación óptica.

#### Scenario: Matriz horizontal
- **WHEN** se recorren los doce cuerpos con viewports 844 × 390, 1045 × 552 y 1381 × 645, diagonales 6.9, 7 y 8 y DPR 1, 2 y 3, con screen igual al viewport
- **THEN** se verifican los mínimos en ambos ojos con la ficha centrada frente a la mirada
- **AND** aumentar pulgadas no obliga a aceptar letras por debajo de esos mínimos para conservar una sola página

#### Scenario: Salida vertical
- **WHEN** se usa VR en vertical fuera de la matriz de lectura horizontal
- **THEN** se mantiene la indicación de giro y una salida operativa sin recortar controles para forzar los mínimos horizontales

### Requirement: Resolución independiente de la composición

Cambiar únicamente el detalle de rasterización SHALL conservar texto, tamaño visible, páginas y zonas accionables de una composición lógica. Ambos ojos y la lectura accesible SHALL compartir la información. Las acciones de mirada y toque SHALL coincidir con los controles mostrados sin multiplicarse por el factor de resolución.

#### Scenario: Aumentar resolución
- **WHEN** el ajuste automático cambia la rasterización sin cambiar la composición lógica
- **THEN** permanecen cuerpo, sección, página, texto y tamaño proyectado
- **AND** cada toque activa exactamente la acción correspondiente

#### Scenario: Cambios repetidos
- **WHEN** se cambia diagonal, tamaño u orientación repetidamente
- **THEN** no quedan tarjetas anteriores superpuestas dentro de un ojo
- **AND** los recursos sustituidos se liberan y los vigentes se reutilizan cuando es posible

### Requirement: Contenido íntegro al adaptar la lectura

Cuando la información no quepa con la letra legible calculada, VR SHALL crear continuaciones sin recortar o sustituir contenido. SHALL conservar etiquetas, cifras, unidades, notas, curiosidades y recomendaciones publicadas. Datos SHALL mantener dos columnas y filas completas entre continuaciones; la adaptación SHALL conservar cuerpo, sección y una continuación válida.

#### Scenario: Datos largos
- **WHEN** los cuatro datos no caben con sus etiquetas y unidades en una página
- **THEN** se distribuyen por filas completas en continuaciones de Datos
- **AND** cada cifra mantiene etiqueta y unidad en su bloque sin invadir controles

#### Scenario: Libros y descripción extensos
- **WHEN** se recorre una descripción o recomendaciones con textos largos
- **THEN** se alcanza todo el contenido mediante las pestañas y flechas existentes
- **AND** el ajuste no inventa enlaces ni elimina texto para hacerlo caber

### Requirement: Evidencia equivalente de lectura

La aceptación de la ficha SHALL comparar texto, cifras y unidades en la misma pose, diagonal y escala de captura, en reposo y movimiento. El texto SHALL conservar definición sin parpadeo que dificulte leer. Las capturas aportadas SHALL identificarse como antes; los resultados emulados y físicos SHALL distinguirse.

#### Scenario: Antes y después
- **WHEN** se compara una ficha con la evidencia inicial
- **THEN** se documentan las condiciones de reproducción y las diferencias observadas sin favorecer una versión mediante reescalado
- **AND** un aumento de resolución de los planetas por sí solo no acredita mejora de lectura de la ficha

#### Scenario: Comprobación física
- **WHEN** se repiten las pruebas en los teléfonos disponibles
- **THEN** se registra si Sophia puede leer cifras, unidades y texto con la presentación automática
- **AND** cualquier dificultad residual mantiene abierta la aceptación correspondiente
