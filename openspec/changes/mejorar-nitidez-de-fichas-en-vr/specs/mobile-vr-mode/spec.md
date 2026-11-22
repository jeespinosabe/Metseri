# Spec Delta

## ADDED Requirements

### Requirement: Ajuste automático integral a partir de la diagonal

Al guardar una diagonal válida, la aplicación SHALL adaptar automáticamente la presentación VR de fichas, nombres, cuerpos y cielo según pulgadas, área disponible, DPR y capacidades gráficas. Ajustar visor SHALL conservar la diagonal como único dato de configuración elegido por el visitante, con Guardar y Cancelar. SHALL NOT incorporar selectores de calidad ni tamaño de lectura.

#### Scenario: Cambiar únicamente las pulgadas
- **WHEN** se guarda sucesivamente 6.9, 7 y 8 pulgadas con el mismo viewport y DPR
- **THEN** el programa recalcula y aplica la presentación integral de ambos ojos sin pedir otra elección
- **AND** se conserva la diagonal real declarada y la calibración óptica correspondiente

#### Scenario: Cancelar la calibración
- **WHEN** se modifica la diagonal en el formulario y se pulsa Cancelar
- **THEN** permanecen la diagonal guardada y la presentación automática vigentes

#### Scenario: Calibración anterior y almacenamiento no disponible
- **WHEN** existe una diagonal válida guardada, falta o el almacenamiento no se puede utilizar
- **THEN** se conserva la calibración válida o se usa el valor inicial existente según corresponda
- **AND** el ajuste automático sigue disponible para la sesión sin crear preferencias manuales adicionales

### Requirement: Compensación de nitidez al aumentar las pulgadas

Con viewport, DPR y capacidades constantes, aumentar las pulgadas SHALL NOT reducir el objetivo automático de resolución por ojo ni el tamaño mínimo de los textos de referencia. Al alcanzar un límite gráfico, la aplicación SHALL preservar lectura y controles mediante la adaptación del contenido y registrar esa limitación en la verificación, sin prometer píxeles físicos adicionales.

#### Scenario: Aumento dentro de los límites
- **WHEN** la diagonal pasa de 6.9 a 8 pulgadas y existe capacidad para el objetivo calculado
- **THEN** se aplica la compensación automática de resolución y escala de textos en ambos ojos
- **AND** fichas y nombres cumplen sus criterios de lectura y los cuerpos y el cielo sus criterios de definición

#### Scenario: Límite de capacidad alcanzado
- **WHEN** el objetivo calculado supera DPR, presupuesto o capacidad gráfica
- **THEN** se aplica una configuración soportada, uniforme entre ambos ojos y sin desbordamientos
- **AND** los textos se adaptan sin ocultar controles ni solicitar al visitante que elija una calidad
- **AND** cualquier criterio no satisfecho queda registrado como pendiente en la aceptación

### Requirement: Adaptación estable sin elecciones adicionales

El ajuste automático SHALL conservar cuerpo seleccionado, orientación y sección. Si cambia la composición, SHALL conservar la continuación válida o acotarla al nuevo rango. Entradas de configuración iguales SHALL mantener la presentación sin cambios oscilantes ni reinicios de lectura. Salir de VR SHALL recuperar los límites y comportamiento existentes de la vista normal.

#### Scenario: Guardar con una ficha abierta
- **WHEN** se guarda otra diagonal con una ficha en una continuación de Datos o Libros
- **THEN** permanece el cuerpo y la sección y se recupera una continuación válida en ambos ojos
- **AND** no se ejecuta un tap pendiente contra una composición sustituida

#### Scenario: Recalcular sin cambios
- **WHEN** se repite el ajuste con la misma diagonal, dimensiones, DPR y capacidad
- **THEN** no se reinicia lectura ni se alternan resoluciones innecesariamente

#### Scenario: Rotar y salir
- **WHEN** se rota o redimensiona durante VR y después se sale
- **THEN** ambos ojos mantienen una presentación coherente y la salida permanece utilizable
- **AND** la vista normal recupera su presentación previa

### Requirement: Presupuesto y aceptación integral de VR

La adaptación SHALL respetar DPR y capacidad gráfica y mantener operativo el recorrido 360. En la comparación física de 60 segundos de movimiento equivalente, el percentil 95 del intervalo de fotograma SHALL NOT empeorar más del 10 % frente a su línea base. La lectura, identificación y estabilidad visual SHALL validarse por separado; los FPS en reposo no sustituyen esa aceptación.

#### Scenario: Comparar antes y después
- **WHEN** se evalúa la versión base y la propuesta en el mismo equipo, navegador y secuencia
- **THEN** se registran diagonal, resolución automática, intervalos y resultados de lectura de fichas y nombres e identificación de cuerpos
- **AND** se verifican conjuntamente nitidez y presupuesto de fluidez

#### Scenario: Sin acceso físico
- **WHEN** solo se dispone de emulación y capturas
- **THEN** se documenta ese alcance y la aceptación física permanece pendiente
- **AND** no se afirma enfoque óptico universal ni mejora física de FPS no medida
