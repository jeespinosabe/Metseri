# Spec Delta

## ADDED Requirements

### Requirement: Etiquetas VR legibles con ajuste automático

Los nombres de los doce cuerpos y las relaciones de satélites SHALL adaptar automáticamente tamaño y rasterización a diagonal y área útil de ambos ojos. En la matriz horizontal, con el cuerpo centrado o la pareja completamente visible, SHALL alcanzar al menos 14 px CSS em para nombres y 12 para relaciones. SHALL poder leerse sin selección ni apuntado y conservar identidad y colores de estado.

#### Scenario: Identificar sin seleccionar
- **WHEN** se observa cada planeta o satélite sin seleccionar ni apuntarlo en las diagonales 6.9, 7 y 8 de la matriz
- **THEN** se lee su nombre y la relación de satélite cuando corresponda, con los mínimos proyectados en ambos ojos
- **AND** aumentar pulgadas no obliga a abrir una ficha para identificar el cuerpo

#### Scenario: Calidad sin cambio de identidad
- **WHEN** cambia la configuración gráfica automática
- **THEN** se mantienen nombre, relación con su planeta y colores correspondientes a los estados actuales
- **AND** las etiquetas siguen alineadas con sus cuerpos sin duplicar su lectura accesible

### Requirement: Etiquetas dentro del área útil del visor

Una etiqueta de un cuerpo completamente visible SHALL mantenerse fuera del área de controles inferiores y de una ficha que la ocluya. Las etiquetas de una pareja completamente visible SHALL permitir distinguir sus nombres sin superponerse entre sí. Su adaptación SHALL NOT mover cuerpos ni interceptar selección, arrastre o acciones de ficha.

#### Scenario: Satélite próximo a la barra inferior
- **WHEN** Tritón u otro satélite está completamente visible y su etiqueta inferior coincidiría con Ajustar visor o Salir de VR
- **THEN** se adapta la posición de la etiqueta dentro del área útil, manteniendo su asociación con el cuerpo
- **AND** los botones siguen operativos y la etiqueta no se dibuja por debajo de ellos

#### Scenario: Pareja y ficha abierta
- **WHEN** están completamente visibles Titán/Saturno o Tritón/Neptuno y después se abre una ficha
- **THEN** se distinguen los nombres de la pareja donde exista área visible
- **AND** las etiquetas ocluidas por la ficha no atraviesan su lectura

### Requirement: Cuerpos reconocibles al aumentar pulgadas

La presentación automática SHALL conservar reconocibles volumen, contornos y rasgos propios de los doce cuerpos al aumentar la diagonal. En las poses centradas de aceptación SHALL distinguirse superficies y colores, continentes de Tierra, bandas de Júpiter y anillos de Saturno. El ajuste SHALL conservar posiciones, radios relativos, composición e identidad sin introducir movimiento o selección adicional.

#### Scenario: Rasgos en la pose de lectura
- **WHEN** se centra cada cuerpo y se compara la presentación automática con el antes en diagonales 6.9, 7 y 8
- **THEN** se documenta definición de su contorno y rasgos sin deformación ajena a la corrección óptica
- **AND** las cuatro lunas conservan sus apariencias diferenciadas y su menor tamaño relativo

#### Scenario: Cuerpo en el límite del campo
- **WHEN** un cuerpo pasa parcialmente fuera de la región visible de una de las lentes
- **THEN** se conserva el recorte que corresponde al campo óptico y no se mueve o agranda artificialmente para impedirlo
- **AND** su nitidez de referencia se evalúa también en una pose centrada y comparable

### Requirement: Detalle gráfico estable durante la exploración

El detalle calculado de superficies y anillos SHALL permanecer estable durante el movimiento y conservar su identidad procedural. Cambiar diagonal SHALL NOT añadir ruido animado, destellos, pérdida de transparencia o duplicación de cuerpos. El fondo y el texto SHALL conservar sus propios criterios de definición al ajustar los recursos de un cuerpo.

#### Scenario: Superficies y anillos en movimiento
- **WHEN** se observa Saturno, Júpiter, Tierra y los satélites durante una secuencia controlada de movimiento
- **THEN** se mantienen superficies y anillos distinguibles, sin parpadeo nuevo que impida reconocer sus formas
- **AND** los cambios de detalle no alteran la escena ni la selección vigente

#### Scenario: Recalcular la diagonal
- **WHEN** se guarda otra diagonal y luego se vuelve a una anterior
- **THEN** la apariencia conserva la misma composición de superficie, identidad y distribución
- **AND** no se acumulan representaciones ni se regeneran rasgos aleatorios en cada fotograma
