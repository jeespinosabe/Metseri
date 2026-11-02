# Design

## Context

La vista usa Three.js con dos ojos y corrección óptica en VR. El usuario concretó el flujo final: Recentrar como botón solo en vista normal; Ajustar visor y Salir de VR abajo en VR; recentrado por doble tap e instrucción inicial descartable. Esta decisión sustituye los botones generales dentro de la escena.

## Goals / Non-Goals

- Combinar sensor, arrastre y flechas sin interrumpir el seguimiento.
- Ocultar la cruz redundante en escritorio.
- Distinguir tap de selección y doble tap de recentrado en VR, sin acciones accidentales.
- Conservar formulario de diagonal, fichas y óptica existentes.
- Sin menús ni botones de navegación dentro de la escena, cambios de dependencias, API, contenido o PWA.

## Decisions

### Composición de orientación

Mantener `V = A · D`. Arrastre o flechas producen una vista limitada y actualizan `A = V_nueva · inversa(D)`. El sensor continúa incluso durante el gesto. Durante permiso o primera lectura pendientes, alinear la primera lectura con la última vista alcanzada. Recentrar reconstruye la alineación horizontal conservando inclinación natural; salir o destruir cancela el seguimiento y descarta eventos obsoletos.

### Botones según modo

En vista normal: Recentrar y Entrar VR. En VR: Ajustar visor y Salir de VR en su barra HTML inferior existente. Ajustar abre el mismo formulario decimal con Guardar, Cancelar, rango y persistencia actuales. Se retiran los planos y detección de botones generales VR. El teclado conserva acceso a los botones HTML.

### Tap y doble tap

Usar una sola ruta click tras clasificar Pointer Events. En VR el primer tap prepara la acción y espera 300 ms; un segundo tap antes del plazo cancela la selección o acción de ficha y recentra una sola vez. Las coordenadas del dedo no restringen el gesto: sirven ambas mitades y el click aislado del visor. En vista normal el clic sigue siendo inmediato y no hay recentrado por doble tap.

Capturar el objetivo y acción al primer tap, porque el sensor puede mover la mirada durante la espera. Verificar que selección y modo siguen vigentes antes de ejecutar. Arrastre confirmado, múltiples punteros, cancelación, flechas, pérdida de foco, cambio de modo y destrucción cancelan el tap pendiente. Las lecturas del sensor no lo cancelan. El recentrado recupera la ficha conservando cuerpo y sección y mantiene el sensor activo o pendiente.

### Instrucción inicial

Al entrar en VR, mostrar «Pulsa tap para seleccionar. Pulsa dos tap para recentrar.» en un plano compartido por ambos ojos que atraviesa la óptica existente. Mientras es visible permanece delante de la cámara y se adapta al ancho por ojo. Su texto también se anuncia mediante estado accesible. El primer tap en cualquier punto del cielo lo oculta inmediatamente y no prepara selección; aun así puede iniciar un doble tap. Abrir Ajustar visor o salir también lo oculta. Cada entrada nueva lo muestra de nuevo. Liberar geometría, material y textura al destruir.

### Cruz según entrada

Ocultar la cruz central de vista única con `(hover: hover) and (pointer: fine)`, conservando cursor y selección por coordenadas. Mantener la guía táctil y las cruces ópticas VR.

## Risks / Trade-offs

- La selección VR espera 300 ms para distinguir doble tap; el objetivo se captura antes de esperar.
- Tap seguido de arrastre no debe activar una ficha: cancelar al confirmar desplazamiento o invalidar el gesto.
- La legibilidad real y el botón físico necesitan teléfono y visor; pruebas de escritorio no los acreditan.

## Migration Plan

Sin migraciones ni dependencias nuevas. Mantener almacenamiento de diagonal y formulario. Ejecutar pruebas, lint, build, validación OpenSpec y revisión visual; registrar como pendiente la validación física no disponible.
