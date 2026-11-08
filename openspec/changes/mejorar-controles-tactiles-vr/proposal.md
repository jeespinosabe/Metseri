# Proposal

## Why

En VR, navegar una ficha exige apuntar a flechas pequeñas y tocar el texto no permite avanzar. Aprovechar ambas mitades de la tarjeta y mostrar la acción en el puntero facilitará la lectura y permitirá volver a la exploración al terminarla.

## What Changes

- Permitir navegar con un tap apuntando a cualquier zona de la tarjeta que no tenga un control explícito: mitad izquierda para la página anterior y mitad derecha para la siguiente. La mitad se determina por la mirada sobre la tarjeta, independientemente del lugar del toque en la pantalla.
- Mostrar una flecha izquierda o derecha en el puntero VR cuando corresponda retroceder o avanzar; indicar cierre cuando avanzar vaya a salir de la ficha. En la primera página, la mitad izquierda consume el tap sin retroceder ni cerrar.
- Hacer que avanzar desde la última página cierre la ficha y quite la selección, permaneciendo en VR. Mantener disponible esa acción tanto en la mitad derecha como en el control de avance, con indicación de cierre.
- Conservar la prioridad de pestañas, cierre × y demás controles explícitos, el doble tap para recentrar y la navegación por páginas de continuación dentro de una sección.
- Actualizar las indicaciones visibles y accesibles de navegación de la ficha VR.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `mobile-vr-mode`: navegación por mitades de la tarjeta mediante mirada y tap, puntero contextual y cierre al avanzar desde el final, compatibles con los gestos VR existentes.
- `fichas-cuerpos-celestes`: navegación secuencial por páginas, controles de avance disponibles hasta el cierre y coherencia entre ambos ojos y la alternativa accesible VR.

## Impact

- Áreas previstas: `src/escena/contenidoFicha.js`, `src/escena/fichaCuerpoVr.js`, `src/escena/campoEstelar.js` y `src/escena/efectoVisor.js`; indicaciones en `src/componentes/escenaEstelar.jsx` y controles VR accesibles en `src/componentes/fichaCuerpoCeleste.jsx`.
- Pruebas de detección UV, paginación, gestos y presentación del puntero; instrucciones de comprobación en `README.md`.
- La verificación del cambio se realiza mediante pruebas automatizadas locales, sin abrir navegadores ni aplicaciones externas, conforme a la indicación del usuario.
- Sin dependencias ni cambios en API, base de datos, contenido educativo, navegación de la vista normal o configuración óptica del visor. No requiere migraciones ni publicación.
- El cambio completado `rellenar-fichas-con-contenido-publicado` sigue sin archivar y modifica también el requisito de contenido VR. Al sincronizar, deberán conservarse sus reglas de contenido y los controles de este cambio.
