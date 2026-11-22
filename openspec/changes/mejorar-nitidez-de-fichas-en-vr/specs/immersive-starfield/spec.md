# Spec Delta

## ADDED Requirements

### Requirement: Nitidez estable del cielo con ajuste automático

El cielo VR SHALL utilizar la configuración automática derivada de la diagonal y mantener estrellas distinguibles sobre el fondo oscuro, sin desenfoque adicional, manchas, cuadrados o parpadeo que dificulten explorar. La adaptación SHALL conservar cantidad, posiciones, variaciones de brillo y halo suave intencional. SHALL NOT simular nitidez aumentando ruido o brillo de forma indiscriminada.

#### Scenario: Aumentar pulgadas al observar el cielo
- **WHEN** se compara la misma dirección del cielo con ajustes 6.9, 7 y 8 en la matriz de referencia
- **THEN** se aplica automáticamente la compensación de presentación y se revisa la definición de estrellas en ambos ojos
- **AND** el fondo mantiene su distribución y no oculta nombres ni rasgos de los cuerpos mediante saturación nueva

#### Scenario: Estrellas durante el movimiento
- **WHEN** se realiza una secuencia controlada de movimiento y se vuelve a la misma dirección
- **THEN** el cielo conserva sus estrellas, sin aparición de ruido animado ni destellos nuevos asociados al ajuste
- **AND** no se regenera la distribución para aparentar mayor calidad

### Requirement: Evidencia integral del antes y después en VR

La aceptación SHALL incorporar las tres capturas aportadas del cielo como evidencia del antes, junto con las dos capturas previas de fichas. La comparación SHALL revisar conjuntamente estrellas, formas, nombres e información, registrando las condiciones conocidas y desconocidas de reproducción. Mejorar únicamente una ficha SHALL NOT acreditar la nitidez integral de la escena.

#### Scenario: Recorrer las vistas aportadas
- **WHEN** se prepara la evidencia del después en las vistas Tierra/Venus/Luna, Saturno/Titán/Neptuno/Tritón y Marte/Júpiter/Europa/Luna
- **THEN** se documentan diagonal, pose, resolución y escala de captura cuando puedan medirse
- **AND** las condiciones originales desconocidas no se inventan ni se presentan como una comparación controlada exacta

#### Scenario: Mejoras parciales
- **WHEN** las fichas pueden leerse pero los nombres, cuerpos o cielo siguen sin cumplir sus criterios de aceptación
- **THEN** el cambio permanece pendiente de aceptación integral
- **AND** se conservan las dificultades observadas y los resultados físicos y emulados por separado
