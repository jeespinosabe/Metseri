# Verificación de controles táctiles VR

Fecha: 2026-11-07.

## Implementación

- La mirada sobre una zona de tarjeta sin control explícito determina Anterior a la izquierda y Siguiente desde el centro hacia la derecha. Las pestañas y × conservan prioridad.
- Anterior al inicio consume el tap sin cambiar la ficha. Avanzar desde la última página cierra y quita la selección mediante la misma ruta de ×, permaneciendo en VR.
- El avance final muestra «Cerrar →» tanto en Canvas como en la alternativa HTML. Su activación con teclado utiliza el cierre existente y devuelve el foco a la exploración.
- El puntero utiliza la corrección óptica existente y representa cruz neutra, flechas izquierda/derecha o × según la acción efectiva compartida por ambos ojos.
- El tap conserva la espera de 300 ms. Se captura la acción y la revisión de lectura para descartar activaciones obsoletas; el doble tap sigue recentrando sin navegar ni cerrar.
- Se actualizaron las indicaciones de ficha, la descripción accesible de la escena y los pasos relacionados de `README.md`.

## Comprobaciones automáticas

| Comprobación | Resultado |
| --- | --- |
| `npm test` | 221 pruebas aprobadas, 0 fallos, 0 omitidas; ejecutadas fuera del aislamiento para permitir conexiones HTTP locales de las pruebas existentes. |
| `npm run lint` | Aprobado. |
| `npm run build` | Aprobado; Vite informa una advertencia por un chunk JavaScript de más de 500 kB. |
| `openspec validate mejorar-controles-tactiles-vr --strict` | Aprobado. |
| `git diff --check` | Aprobado. |

Las pruebas HTTP existentes requieren acceso a sockets de `127.0.0.1`, bloqueado por el aislamiento. La ejecución local autorizada con ese acceso aprobó las 221 pruebas sin modificar el código de API ni sus pruebas. Las solicitudes remotas utilizan transportes simulados. No se iniciaron navegadores ni aplicaciones externas para esta comprobación.

La cobertura añadida comprueba prioridades de controles, extremos y coordenadas UV inválidas, rayos reales contra la tarjeta, cierre por mitad derecha/control/acción accesible, captura durante los 300 ms, invalidación por cambio de cuerpo/página/contenido/tamaño, doble tap final, actualización contextual en ambos ojos y conservación de parámetros ópticos. Se mantienen las pruebas existentes de orientación, sensores y cancelación de gestos. El renderizador simulado sustituye únicamente el dispositivo gráfico y el DOM/Canvas; la escena, la selección, los rayos y las acciones de las nuevas pruebas de integración son los de producción.

### Recorridos locales completos

`campoEstelar.test.js` recorre Tierra y Luna con contenido disponible, en carga y con error. Cada caso utiliza 350 × 200, 844 × 390 y 390 × 844, y rota el tamaño durante la lectura: son 18 combinaciones de cuerpo, estado y tamaño inicial.

En cada combinación se comprueban:

- Apertura por mirada y toque, sin usar la posición del dedo como objetivo.
- Mitad izquierda inicial consumida sin cambiar de página o perder la selección.
- Avance y retroceso de todas las páginas, incluidas continuaciones reales en las fichas compactas disponibles.
- Coincidencia de la figura de puntero entre ojos y con la acción disponible.
- Salto de la pestaña Libros a su primera página, sin añadir un avance por estar en la mitad derecha.
- Conservación de cuerpo y sección al rotar el tamaño y ajustar la diagonal.
- Doble tap en la última página sin paginar ni cerrar.
- Cierre final permaneciendo en VR, retirada de tarjeta y regreso al puntero neutro.
- Nueva apertura, prioridad de × y selección/cierre en vista única.

### Matriz local de ambos ojos

`perfilVisor.test.js` añade 18 combinaciones: resoluciones 844 × 390, 390 × 844 y 1280 × 720; diagonales 5.5, 6.1 y 6.5 pulgadas; densidades de renderizado 1 y 1.5.

En cada combinación se verifican cruz neutra, flechas izquierda/derecha, cierre y retorno a neutral sobre pestañas. Se comprueban los dos estados contextuales, sus áreas por ojo, la escala física del puntero, los 60 mm entre centros ópticos, la convergencia, la validez de los campos y el tamaño de la textura según densidad. Se inspeccionan los parámetros enviados al renderizador simulado; esta comprobación no se presenta como una nueva captura ni como una ejecución del shader en GPU.

La compilación aprobada corresponde al mismo código de aplicación: esta actualización amplía pruebas y documentación, sin modificar el comportamiento implementado.

## Evidencia histórica de la sesión anterior

Se utilizó Microsoft Edge en Windows, con la aplicación servida únicamente en `127.0.0.1:5174`. Un middleware temporal del servidor Vite respondió con las fichas locales de prueba; no se ejecutó una carga de datos ni se modificó Supabase. Se detuvo el servidor al finalizar.

En la ventana de escritorio de aproximadamente 1432 × 768/720 se observó:

- Apertura de Tierra en vista única y presentación de la misma ficha en ambos ojos al entrar en VR.
- Instrucción inicial con cruz neutra y retirada mediante el primer tap sin paginar.
- Flecha derecha en el área de lectura y avance de la página 1 a Datos, página 2, tocando lejos de la tarjeta.
- Flecha izquierda sobre Datos y cruz neutra sobre la mitad izquierda de la primera página.
- Salto directo a Libros por teclado, con página 4 de 4 y control final «Cerrar →» habilitado.
- Símbolo × en ambos ojos al apuntar al avance final.
- Doble tap sobre la acción final conservando Tierra en la página 4 y recuperando la tarjeta al frente.
- Activación de «Cerrar →» con teclado: estado «Sin ficha abierta», conservación de VR y foco en el área de exploración.
- Apertura de Luna en vista única y estado accesible VR de página 1 de 7 al reducir el tamaño disponible, sin acreditar con ello su revisión visual completa.

Capturas locales, tomadas antes de la interrupción de la herramienta:

- [Avance a la derecha](../../../evidencias/mejorarControlesTactilesVr/avanceDerecha.jpg).
- [Límite inicial con cruz neutra](../../../evidencias/mejorarControlesTactilesVr/limiteInicial.jpg).
- [Flecha de retroceso en Datos](../../../evidencias/mejorarControlesTactilesVr/retrocesoIzquierda.jpg).
- [Símbolo y control de cierre final](../../../evidencias/mejorarControlesTactilesVr/cierreFinal.jpg).
- [Cierre mediante teclado](../../../evidencias/mejorarControlesTactilesVr/cierreConTeclado.jpg).

## Alcance y estado final

Por indicación posterior del usuario, las tareas 3.3 y 5.2 se ajustaron a verificación automatizada local. Se completaron con las matrices anteriores; la revisión externa dejó de ser un requisito del seguimiento. La tarea 5.3 se retiró del alcance solicitado en vez de marcarse como realizada.

El seguimiento queda en **14/14 tareas completas**, sin verificaciones pendientes dentro de este alcance. No se archivó ni sincronizó el cambio. El requisito compartido de contenido VR conserva las reglas de contenido publicado del cambio previo; antes de una sincronización posterior deberá respetarse el orden documentado en `design.md`. No se hizo commit, push ni despliegue.
