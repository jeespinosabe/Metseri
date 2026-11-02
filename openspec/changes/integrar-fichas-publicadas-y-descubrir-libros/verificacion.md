# Verificación de la integración de fichas y libros

Fecha: 2 de noviembre de 2026. Cambio: `integrar-fichas-publicadas-y-descubrir-libros`.

## Estado

Implementación funcional realizada. Queda pendiente la comprobación de interacción táctil y lectura en móvil/visor físicos y, por tanto, el cierre de aceptación. La usuaria respondió expresamente: «Ahora no tengo disponible el móvil o visor». No se archiva el cambio ni se afirma una verificación física que no se realizó.

El contenido ya fue cargado por la usuaria y comprobado por GET; la dependencia inicial de una sola ficha publicada está resuelta. Los libros tienen metadatos y enlaces editoriales reales, y siguen siendo provisionales respecto al acervo de la biblioteca, según la decisión posterior de la usuaria. No se añadieron marcas de demostración ni se hicieron escrituras en Supabase durante esta implementación.

## Matriz de contenido público

Listado y ficha completa: HTTP 200 para los doce slugs. UUID coincidentes entre listado y detalle; la conservación de los doce UUID originales se acreditó también en la verificación previa de la carga, recogida en `bd/README.md`. La adaptación conserva el slug como identidad de escena y valida tipo y planeta principal.

| Slug | Tipo | Planeta principal | Palabras | Datos | Curiosidades | Libros | HTML / composición VR |
|---|---|---|---:|---:|---:|---:|---|
| mercurio | planeta | No corresponde | 38 | 4 | 2 | 2 | Correctos |
| venus | planeta | No corresponde | 43 | 4 | 2 | 2 | Correctos |
| tierra | planeta | No corresponde | 43 | 4 | 2 | 2 | Correctos |
| marte | planeta | No corresponde | 43 | 4 | 2 | 2 | Correctos |
| jupiter | planeta | No corresponde | 39 | 4 | 2 | 2 | Correctos |
| saturno | planeta | No corresponde | 39 | 4 | 2 | 2 | Correctos |
| urano | planeta | No corresponde | 41 | 4 | 2 | 2 | Correctos |
| neptuno | planeta | No corresponde | 41 | 4 | 2 | 2 | Correctos |
| luna | satelite | tierra | 41 | 4 | 2 | 2 | Correctos |
| europa | satelite | jupiter | 42 | 4 | 2 | 2 | Correctos |
| titan | satelite | saturno | 41 | 4 | 2 | 2 | Correctos |
| triton | satelite | neptuno | 41 | 4 | 2 | 2 | Correctos |

La comprobación real usó una instancia temporal de Express y el componente `FichaCuerpoCeleste` cargado mediante Vite SSR. Cada respuesta real se adaptó, se representó como HTML y se compuso para Canvas en 320 × 440, 750 × 624 y 900 × 1000. Se comprobaron descripción y curiosidades completas, cuatro secciones, dos acciones bibliográficas y límites verticales del contenido. Es una comprobación del componente y su composición; no se presenta como doce recorridos manuales en un visor.

Los textos coinciden con la carga derivada de las páginas 3–14 del PDF aportado. Las diferencias de rotación/día solar y redondeo están documentadas en `design.md` y `bd/README.md`: el cliente presenta rotación sideral como «Período de rotación», conserva su signo retrógrado como indicación y no inventa el día solar. No existe todavía un campo de día solar en el contrato público.

## Pruebas automatizadas

- `npm test -- --test-reporter=spec`: **189 pruebas, 18 suites, 189 correctas, cero fallos, cancelaciones u omisiones**.
- `npm run lint`: correcto.
- `npm run build`: correcto; 44 módulos, JavaScript 832,44 kB y 226,52 kB comprimido. Persiste la advertencia de tamaño de fragmento mayor de 500 kB, ya existente; no bloquea la compilación.
- `npm run test:integracion`: listado de doce cuerpos, ficha y libros HTTP 200; Tierra mantiene el UUID configurado y recupera dos asociaciones coherentes con la ficha completa.
- Colección Postman contra una API temporal: **seis peticiones y doce comprobaciones correctas**, incluidos 400 por slug inválido y 404 por cuerpo inexistente. Ejecución local, sin publicación de resultados en Postman Cloud.

Cobertura añadida: adaptación de doce identidades, relaciones y recursos; nulos/cero/números inválidos; datos fuera de orden y cierre durante carga; error HTTP/red/JSON/formato, plazo de doce segundos y reintento; HTML de cada ficha; contenido vacío y enlaces bloqueados; texto largo y títulos partidos sin pérdida; secciones VR con índices variables; actualizaciones del mismo cuerpo, limpieza e imágenes tardías. Se mantienen las pruebas anteriores de API, administración, selección, navegación, sensores, doble tap y visor.

La prueba de proxy inicia un backend y un Vite temporales y verifica `/api/estado` y `/api/admin/sesion` a través de `PORT`, sin variables de Supabase/administración publicadas al cliente. Las pruebas Vite/SSR usan cachés separadas para no interferir con el servidor habitual de desarrollo.

## Comprobación en navegador integrado

Se utilizó el navegador Chromium integrado de la aplicación, con API conectada al Supabase real. Se inspeccionaron estados y capturas, con viewport efectivo de escritorio de 1280 × 720 y móvil de 320 × 740; el ajuste temporal se restableció al finalizar.

- Selección de Tierra desde el cielo, llegada de sus datos publicados y sustitución por Luna: identidad, distancia al planeta, períodos y curiosidades correctos, sin mantener datos de Tierra.
- Accesos «Ficha» / «Descubrir libros», desplazamiento interno y foco del encabezado; navegación por Tab/Enter en la ficha de Luna. A 320 px no hay desbordamiento horizontal del documento ni del panel.
- Cierre de la ficha: desaparece el panel y el foco vuelve al elemento de exploración con `role="application"`.
- Apertura de «Un punto azul pálido»: se crea otra pestaña con la URL editorial esperada y la selección permanece en Metseri. El resultado de bloqueo y su enlace alternativo se verificaron mediante pruebas automatizadas; no se forzó una configuración de bloqueo del navegador de la usuaria.
- Entrada a VR con Tierra y Luna seleccionadas: mismo contenido en ambas vistas, controles y lectura accesible conservados. Se observó la alternativa manual al no disponer de sensor en el navegador. La paginación, las zonas accionables, el salto a Libros, el recentrado y la salida bibliográfica se respaldan además con pruebas de composición, rayos, gestos y apertura; no se atribuyen estas pruebas a un dispositivo físico.
- API temporal independiente detenida: el panel conserva Tierra e imagen, informa del error y ofrece Reintentar, sin anunciar «sin libros». Al restablecer esa API y pulsar Reintentar vuelven descripción, datos, curiosidades y libros con la misma selección. No se detuvieron servidores habituales ni se modificó la BD para simular el fallo.

Captura del resultado: `metseriLibros.jpg`, entregada en la conversación. La vista local de revisión se dejó en `http://127.0.0.1:5193/`; para uso habitual se ejecutan `npm run start:api` y `npm run dev` en terminales separadas.

## Alcance de las pruebas bibliográficas

Hay dos libros asociados a cada cuerpo público, por lo que la rama con títulos, metadatos y enlaces se comprobó con datos realmente almacenados y una apertura en navegador. El estado sin asociaciones y la distinción frente al fallo de red se verificaron con respuestas sintéticas en pruebas HTML/Canvas; no se eliminó ninguna asociación de Supabase para fabricar ese caso. La visibilidad sigue dependiendo de las políticas actuales y no se acredita aquí una auditoría exhaustiva de RLS o de registros privados conocidos.

## Criterios de aceptación

| Criterio | Evidencia | Estado |
|---|---|---|
| Seleccionar un cuerpo muestra su ficha | Selección existente de doce cuerpos, adaptación/HTML de doce fichas y recorrido en navegador Tierra → Luna | Cubierto en código, pruebas y navegador |
| Información correspondiente al cuerpo | Validación slug/tipo/planeta, respuestas diferidas, matriz real y sustitución planeta/satélite | Cubierto |
| Descubrir libros incorporado y accesible | Acceso directo, foco por teclado, libros reales, apertura externa y estado vacío probado | Cubierto; tacto físico pendiente |
| Navegación escena ↔ ficha ↔ libros | Foco de cierre, retorno interno, error/recuperación, composición normal/VR y regresión de controles | Cubierto en pruebas/navegador; recorrido físico pendiente |

## Pendientes para cerrar

- **3.1**: interfaz y verificación responsive/teclado realizadas; falta acreditar el uso táctil en el móvil de la usuaria.
- **6.3**: comprobar selección, lectura, libros, regreso, apertura externa y salida de VR en móvil/visor físicos, registrando navegador, teléfono y visor.
- **6.4**: completar el cierre de aceptación después de esas comprobaciones. La matriz y validación estructural ya están disponibles, pero no se marca aceptación final anticipadamente.

No se ejecuta commit, push, sincronización de especificaciones principales ni archivo del cambio. No hay cambios en geometría, recursos gráficos, sensores, óptica ni autenticación de los compañeros; el puente con la ficha se modifica únicamente para entregar contenido y acciones remotas.
