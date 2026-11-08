# Verificacion

> La primera fase documentada abajo corresponde al alcance inicial de vista normal. La aclaracion posterior de la usuaria amplia el relleno a VR; la nueva verificacion se registra al final y las tareas afectadas se reabren.

## Referencia inicial

- Rama `main`, sincronizada con `origin/main`; al comenzar no había modificaciones de archivos con seguimiento. Ya existían sin seguimiento `bd/` y la planificación de este cambio; se conservarán.
- Referencia visual anterior a la implementación: `evidencias/rellenarFichas/fichaAntes.jpg`, ficha de Tierra desde el encabezado, desplazamiento 0, ventana de 431 × 548 píxeles CSS. Controles: cerrar, Recentrar y Entrar VR.
- API HTTP comprobada durante esta implementación: doce respuestas 200; coincidencia de UUID/slug con el listado, descripción, dos curiosidades, cuatro datos y la invitación de cada cuerpo frente al bloque del SQL corregido. Los doce arreglos de libros están vacíos. Solo se realizaron lecturas; no se ejecutó SQL.

## Implementación y comprobaciones finales

Verificación realizada el 2 de noviembre de 2026 para el alcance acordado: rellenar las fichas de vista normal, conservando el diseño del sprint anterior.

### Cambios aplicados

- Consulta relativa de una ficha por selección, adaptación por slug/nombre/tipo/planeta y conservación de los identificadores, imágenes y créditos locales.
- Cada montaje de ficha controla una consulta cancelable con plazo de 12 segundos. Cerrar, cambiar de cuerpo o entrar en VR invalida su resultado; una respuesta tardía no puede reabrir ni sustituir la selección.
- Descripción, clasificación, cuatro datos y curiosidades dentro de sus elementos y clases originales. El valor numérico y su unidad se separan como texto, sin recalcular el contenido del PDF.
- Invitación bibliográfica publicada dentro de «Descubrir libros», incluso con `libros: []`; no se añadieron títulos o enlaces provisionales.
- Estados de espera/error en el espacio de descripción, con el cierre existente. La composición y las reservas del modo VR permanecen como antes.
- Proxy de Vite alineado con `PORT` y documentación de los dos servidores en `README.md`.

### Pruebas y conexión real

| Comprobación | Resultado |
|---|---|
| Pruebas acotadas de consulta y renderizado | 13/13 correctas: 48 datos literales, identidad, ausencia de campos, respuestas tardías, cierre, plazo, errores, texto seguro y reservas VR. |
| Prueba del proxy | Correcta: `PORT` del archivo, precedencia de la variable del proceso, valor por defecto y ausencia de credenciales exportadas. |
| `npm test -- --test-reporter=spec` | 189 pruebas, 18 grupos, 189 correctas, sin fallos, cancelaciones ni omisiones. Incluye las regresiones de escena, sensores, navegación, visor, API y administración. |
| `npm run lint` | Correcto, sin errores. |
| `npm run build` | Correcto; CSS 14.55 kB y paquete JS 826.42 kB. Se conserva un aviso de paquete mayor de 500 kB; no se amplió el alcance para optimizarlo. |
| `npm run test:integracion` | Correcto: 12 cuerpos públicos; Tierra coincide en UUID/slug (`e8e30d37-49aa-4f4b-84cc-0af40ee7105e`, `tierra`); ficha y libros HTTP 200, sin libros públicos. |
| Verificación final API → adaptación → renderizado | Las doce fichas reales devolvieron HTTP 200 y coincidieron con la descripción, curiosidades y contenido editorial del SQL corregido. Las 48 cifras conservaron su texto y las doce invitaciones aparecieron en el renderizado real. Los doce endpoints de libros devolvieron `[]`. |
| Archivos y compilación | `git diff --check` correcto; sin coincidencias de `SUPABASE_`, `ADMIN_CONTRASENA` o `sb_publishable_` en los recursos de `dist/assets`. `.env` permanece ignorado. |
| `openspec validate rellenar-fichas-con-contenido-publicado --strict` | Correcto; los cuatro artefactos de planificación y las quince tareas están completos. |

La última comprobación inició una API y un renderizador temporal, consultó la base real, pasó sus respuestas por el adaptador implementado y renderizó el componente mediante React. Las instancias de esa comprobación se cerraron al terminar. No utilizó respuestas simuladas para acreditar la recuperación real.

La API del puerto 3001 ya estaba ocupada al probar su arranque; no se detuvo ese proceso. La demostración del navegador utilizó una instancia propia en un puerto libre, con Vite en `http://127.0.0.1:5195/`. La desconexión y recuperación se probaron solo sobre esa instancia temporal. No se ejecutaron escrituras, SQL o modificaciones de RLS en Supabase.

### Conservación del diseño

Comparación de Tierra antes y después, con ventana de **431 × 548 píxeles CSS**, desplazamiento del panel 0 y el mismo foco de lectura:

| Medida del panel | Antes | Después |
|---|---:|---:|
| Posición izquierda | 12.00 px | 12.00 px |
| Posición superior | 28.00 px | 28.00 px |
| Ancho | 407.12 px | 407.12 px |
| Alto | 443.78 px | 443.78 px |
| Botones de la vista normal | Cerrar, Recentrar, Entrar VR | Cerrar, Recentrar, Entrar VR |

Las hojas de estilo, fuentes, imágenes, datos locales, módulos de escena y visor, servidor, rutas/servicios de API y administración no se modificaron. Los únicos archivos previamente existentes modificados son `README.md`, los dos componentes de ficha/escena y `vite.config.js`. Se añadieron el módulo de consulta, sus pruebas, las pruebas de renderizado/proxy y las evidencias. Los archivos anteriores de `bd/` permanecen separados y no fueron reescritos.

La llegada de texto hace crecer el contenido desplazable, como permite el panel original. No se agregaron barras, pantallas, botones, clases o estilos para acomodarlo.

### Criterios de aceptación y evidencias

| Criterio | Evidencia observada |
|---|---|
| Seleccionar un cuerpo abre su ficha | [Tierra](../../../../evidencias/rellenarFichas/fichaTierra.jpg) y [Luna](../../../../evidencias/rellenarFichas/fichaLuna.jpg), seleccionadas mediante la escena. |
| La información coincide con la selección | [Datos propios de Luna](../../../../evidencias/rellenarFichas/datosLuna.jpg), [cambio directo a Luna](../../../../evidencias/rellenarFichas/cambioDirectoALuna.jpg), cotejo HTTP de doce cuerpos y pruebas de respuestas fuera de orden. |
| «Descubrir libros» está incorporado y es accesible | [Invitación de Tierra](../../../../evidencias/rellenarFichas/descubrirLibrosTierra.jpg) e [invitación de Luna](../../../../evidencias/rellenarFichas/descubrirLibrosLuna.jpg), dentro del espacio anterior. |
| Navegación entre escena, ficha y libros | Recorrido real documentado abajo y [escena después del cierre](../../../../evidencias/rellenarFichas/escenaTrasCerrar.jpg). El cierre dejó cero paneles y devolvió el foco al elemento de exploración. |

Otras evidencias: [referencia anterior](../../../../evidencias/rellenarFichas/fichaAntes.jpg), [vista de escritorio](../../../../evidencias/rellenarFichas/fichaEscritorio.jpg), [API no disponible](../../../../evidencias/rellenarFichas/apiNoDisponible.jpg) y [visor conservado](../../../../evidencias/rellenarFichas/vrConservado.jpg).

### Demostración ejecutada en navegador

1. Abrir la escena y seleccionar Tierra. Se observó primero el estado de carga y después su descripción, datos, curiosidades e invitación publicados.
2. Recorrer el panel hasta «Descubrir libros». El título y la invitación fueron accesibles con el desplazamiento existente; la selección siguió siendo Tierra.
3. Volver al encabezado y cerrar con la equis. La ficha desapareció y el foco regresó a la escena.
4. Seleccionar Luna desde su representación 3D. Aparecieron su imagen e identidad, distancia de 384 400 km desde la Tierra y períodos de 27,3 días, sin conservar datos planetarios. Se recorrieron sus datos y su invitación y se cerró nuevamente.
5. Probar cambios directos con el panel lateral de escritorio existente, a 1200 × 750 píxeles CSS: Tierra → Luna y la secuencia rápida Marte → Tierra → Luna. El resultado fue una sola ficha con título, descripción y cuatro datos de Luna. La prueba controlada de transporte completó además una respuesta antigua después de la nueva y verificó su descarte.
6. Detener solo la API temporal y volver a seleccionar Tierra. Se mostró la indisponibilidad manteniendo imagen, estructura y cierre. Cerrar dejó cero fichas y devolvió el foco al cielo. Restaurar la API y seleccionar de nuevo recuperó el contenido.
7. Entrar y salir de VR con Tierra seleccionada. Se conservaron cuerpo, cuatro secciones, controles y reservas anteriores en Canvas y lectura accesible. Al salir, la vista normal recuperó la información publicada. La prueba se realizó con la alternativa manual del navegador, sin afirmar seguimiento físico por sensores.
8. Restablecer el tamaño habitual de la ventana y dejar la ficha de Tierra disponible para revisión. El ajuste temporal de tamaño de la prueba de escritorio se retiró.

Las capturas corresponden a estos recorridos ejecutados, no a una maqueta ni a un guion sin probar. No se grabó un vídeo: la demostración se entrega como secuencia documentada de capturas y resultados reales, como permite el diseño de este cambio.

### Límites de la aceptación

Los criterios del navegador están acreditados. No se verificó un catálogo de títulos reales, porque todavía no fue entregado y las consultas bibliográficas están vacías. La adaptación móvil, el relleno del Canvas y la comodidad/sensores/botón de un visor físico permanecen en sus avances posteriores; no se presentan como terminados aquí. No se realizó una auditoría integral de RLS, publicación, commit, push o archivo del cambio.

## Ampliación confirmada: contenido en VR y prueba con iPhone

La usuaria aclaró que consulta Metseri desde un iPhone 17 Pro Max mediante el túnel de VS Code del puerto 5173 y necesita ver el contenido al entrar en VR. Esta aclaración amplía la primera fase: se rellenan también las fichas del visor, conservando su apariencia, óptica y controles. Las afirmaciones anteriores sobre reservas VR corresponden únicamente a la fase inicial.

### Corrección aplicada

- La consulta se comparte por cuerpo entre vista normal, lectura accesible y Canvas del visor. Cambiar de modo ya no descarta su contenido ni exige haber abierto antes la ficha normal.
- Un puente de contenido en el campo valida el cuerpo seleccionado antes de actualizar la ficha VR. Cerrar o cambiar de cuerpo sigue descartando respuestas tardías.
- Descripción, cuatro datos editoriales, curiosidades e invitación se dibujan en la tarjeta compartida por ambos ojos. Se conservan imagen, cabecera, colores, familia tipográfica, cuadrícula, cuatro pestañas, flechas y cierre.
- El texto se ajusta al ancho medido. Si no cabe, las flechas existentes recorren continuaciones; las pestañas conservan su significado y saltan al inicio de su sección. Recibir datos o redimensionar conserva la sección actual.
- El CSS, los parámetros ópticos, los sensores y los gestos no se modificaron. El valor 6.9 se interpreta como diagonal en pulgadas y no participa en la consulta del contenido.

### Comprobaciones de esta ampliación

| Comprobación | Resultado |
|---|---|
| Pruebas de consulta, HTML y Canvas | 30/30 correctas en la ejecución acotada. |
| Doce fichas en tres tamaños Canvas | Texto íntegro y dentro del área disponible en 320 × 440, 750 × 624 y 900 × 1000; 48 datos conservados y cuatro pestañas con sección activa correcta. |
| Navegación Canvas | Conserva Libros al llegar la respuesta y al redimensionar; cambiar de modo reinicia la lectura según la regla anterior, manteniendo el contenido. Carga/error visibles y actualizaciones posteriores a destrucción ignoradas. |
| `npm test -- --test-reporter=spec` | 194/194 correctas, 18 grupos, sin fallos, cancelaciones ni omisiones. |
| `npm run lint` | Correcto. |
| `npm run build` | Correcto; CSS sin cambios, 14.55 kB; JS 828.88 kB, con el aviso previo de tamaño del paquete. |
| Puerto utilizado por el túnel | `http://127.0.0.1:5173/`: HTTP 200. `/api/cuerpos-celestes/tierra` por ese mismo puerto: HTTP 200, slug Tierra, cuatro datos e invitación presentes. No es necesario exponer el puerto de Supabase o sus credenciales al teléfono. |
| Prueba visual del navegador | La tarjeta VR muestra la descripción real en ambos ojos. Se guardó [la captura del contenido VR](../../../../evidencias/rellenarFichas/vrFichaConInformacion.jpg). |
| Confirmación física de la usuaria | Tras recargar su túnel en Safari y probar Ficha y Libros en VR respondió: «Sí, ahora aparece la información en VR». Esto confirma la recuperación del contenido en su iPhone; no se presenta como evaluación completa de comodidad óptica o sensores. |

El túnel privado pidió autenticación de GitHub al navegador de prueba; no se cambió su visibilidad ni se inició sesión. Por eso su lectura real se acredita con la confirmación de la usuaria, separada de las pruebas locales. Para reproducir el ajuste indicado se utilizó 6.9 en el navegador de prueba; no se alteró la configuración guardada de su teléfono.

Durante la captura, la pantalla completa del navegador de prueba se interrumpió en algunas transiciones; se conservó únicamente la captura cuyo contenido VR es visible. Una prueba auxiliar aislada se cerró al terminar. La aplicación permanece servida en el puerto 5173 para el túnel de la usuaria. La prueba física positiva cubre la descripción y la sección Libros que se le pidió comprobar.

No se realizaron escrituras en Supabase, modificaciones de CSS, cambios de óptica, instalación de dependencias, commit, push ni archivo del cambio.

Cierre de la ampliacion: 18/18 tareas completas. La comprobacion real de integracion volvio a pasar tras la correccion; validacion estricta de OpenSpec correcta.
