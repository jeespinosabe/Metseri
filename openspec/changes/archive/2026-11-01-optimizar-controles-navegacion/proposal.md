# Proposal

## Why

La navegación de Metseri muestra una cruz innecesaria en escritorio, deja los controles generales fuera del alcance de la mirada dentro del visor y cancela el sensor al arrastrar o usar el teclado en VR. Corregir estos comportamientos permitirá combinar las entradas disponibles y manejar la experiencia con el visor puesto.

## What Changes

- Ocultar la cruz en vista única de escritorio, donde el mouse determina el apuntado y la selección. Conservar la guía de la vista táctil y las cruces ópticamente alineadas de VR.
- Retirar Recentrar en VR y sustituirlo por doble tap en cualquier punto del cielo. Conservar Recentrar como botón en vista normal, junto a Entrar VR; mostrar Ajustar visor y Salir de VR abajo únicamente en VR.
- Mostrar al entrar en VR la instrucción «Pulsa tap para seleccionar. Pulsa dos tap para recentrar.» en ambos ojos. Un tap en cualquier parte la oculta sin seleccionar; vuelve a aparecer en cada entrada.
- Conservar Ajustar visor en el formulario HTML anterior, con su entrada decimal, validación y persistencia. No incorporar ajuste mediante mirada ni controles −/+ dentro del visor.
- Combinar arrastre con dedo o mouse y flechas de navegación con el seguimiento del sensor. La intervención manual ajustará la orientación sin cancelar el sensor activo ni una solicitud pendiente y sin que la siguiente lectura revierta el ajuste.
- Conservar los permisos y el aviso breve actuales cuando el sensor no sea utilizable, así como el control completamente manual en ese caso. Salir de VR, destruir la escena o perder el contexto gráfico seguirá deteniendo el seguimiento.
- Distinguir tap y doble tap para que recentrar conserve selección y sección, sin activar fichas. Mantener selección inmediata en vista normal y capturar el objetivo VR al tocar durante la breve espera del segundo tap.

## Capabilities

### New Capabilities

Ninguna; se modifican las capacidades existentes de navegación, VR e interacción.

### Modified Capabilities

- `immersive-starfield`: Mostrar la guía de cruz según el tipo de entrada en vista única y mantener los controles generales accesibles según el modo.
- `mobile-vr-mode`: Incorporar instrucción inicial y recentrado mediante doble tap, conservar la alineación óptica de VR y combinar navegación manual con sensor activo o pendiente.
- `escena-planetaria`: Eliminar la obligación de una cruz visible en las reglas de apuntado de escritorio y distinguir selección y recentrado por doble tap sin cambiar las reglas de selección de los doce cuerpos.

## Impact

- Afectará a `src/componentes/escenaEstelar.jsx`, `punteroCruz.jsx`, la integración de `configuracionVisor.jsx` y las reglas pertinentes de `src/App.css`; a `src/escena/controlesVista.js` y `campoEstelar.js`; y a módulos acotados para la instrucción y los gestos VR.
- Reutilizará React, Three.js, Canvas 2D, el perfil HOMIDO GRAB, la validación y persistencia de `perfilVisor.js` y la ruta actual que distingue toque de arrastre. No requiere dependencias nuevas.
- Las especificaciones principales actuales exigen la cruz en vista única y que el arrastre o las flechas cancelen el sensor. Los deltas sustituyen expresamente esas reglas; no se trata solo de corregir código contrario a la especificación.
- Se actualizarán las pruebas afectadas de navegación, sensor y acciones VR, y las instrucciones pertinentes de `README.md`. La validación de comodidad, sensor y botón físico requerirá móvil y visor; las simulaciones no la acreditan.
- El alcance se limita a estos controles. No incluye cambios en API, Supabase, contenido celeste, distribución de cuerpos, WebXR, PWA ni publicación.

