# Tasks

Apply solicitado por Sophia después de la revisión. Las casillas completadas se respaldan en verificacion.md; el borrador adelantado no se acreditó automáticamente. La comparación del esquema remoto se completó con el informe compartido por Sophia, después de la migración: esa desviación de orden queda registrada. La cobertura pública requiere evidencia institucional independiente.

## 1. Conciliación del borrador y esquema

- [x] 1.1 Contrastar los archivos adelantados con las decisiones revisadas y registrar las diferencias a corregir; verificar una correspondencia explícita entre rutas, contrato, selección y presentación pública de las tres capacidades.
- [x] 1.2 Contrastar el módulo 01 aportado y las correcciones existentes con el esquema vigente de Supabase antes de migrar; verificar tablas, índices, permisos, vistas y ausencia de dependencia del módulo 02 en una nota de verificación sin secretos.
- [x] 1.3 Inventariar el código adelantado sin OpenSpec: api/index.js, rutas/administracion.js, rutas/libros.js, servicios/gestionLibros.js, pruebas/gestionLibros.test.js, herramientas/cargarLibrosInvestigados.js, SQL y verificador de bd, conjunto investigado, .env.example y documentación; verificar una matriz archivo → requisito → prueba o revisión pertinente, con diferencias y cobertura faltante documentadas.

## 2. Persistencia y permisos

- [x] 2.1 Revisar o ajustar las funciones aditivas para detalle, listado, guardado y borrado sin recargar el esquema; verificar que ejecutar dos veces el script en PostgreSQL aislado conserva datos y produce el mismo conjunto de funciones.
- [x] 2.2 Comprobar atomicidad, reutilización de autores, edición de relaciones y protección de fuentes; verificar rollback de alta y edición fallidas, preservación de autores compartidos y rechazo del borrado o retiro de una fuente.
- [x] 2.3 Comprobar revocación de ejecución pública y mantener las políticas existentes; verificar que anon/authenticated no ejecutan las funciones y que solo los libros activos/verificados son visibles en las vistas públicas.
- [x] 2.4 Documentar preparación, credencial exclusiva del servidor y reversión de la migración; verificar que la guía no requiere ejecutar el núcleo otra vez ni contiene valores privados.

## 3. API administrativa

- [x] 3.1 Conciliar el servicio y las rutas con el contrato propuesto y el login existente; verificar mediante HTTP los cinco endpoints, códigos de éxito, Location, detalle y paginación de borradores e inactivos.
- [x] 3.2 Conciliar validaciones y errores controlados; verificar pruebas de UUID, JSON, límite de tamaño, campos desconocidos, duplicados, año, URL, órdenes, 401 sin sesión y fallos saneados del proveedor.
- [x] 3.3 Verificar edición y verificación institucional explícita; comprobar campos omitidos, listas reemplazadas, fecha generada por servidor e invalidación después de cambiar metadatos sin reconfirmación.
- [x] 3.4 Completar la documentación de consumo y los pasos reproducibles de CRUD temporal; verificar el contrato final, cookies del login y ausencia de claves de Supabase en las peticiones. Si se usa Postman, conservar su colección únicamente fuera del repositorio.
- [x] 3.5 Extender las pruebas del borrador para sesión cerrada/vencida, JSON inválido/excesivo y timeout o respuestas incompatibles del proveedor; verificar rechazos sin escritura y sin exposición de configuración privada en los endpoints integrados.

## 4. Selección y preparación de carga

- [x] 4.1 Ampliar o sustituir los cuatro candidatos adelantados hasta documentar tres títulos distintos por cada uno de los doce cuerpos; verificar una matriz de 36 asociaciones con fuentes, ISBN/edición y evidencia temática individual, permitiendo reutilización justificada entre cuerpos.
- [x] 4.2 Comprobar el contenido en español mexicano y la variedad de la selección para público general; verificar evidencia editorial o muestras y explicaciones en es-MX, sin deducir adaptación regional por la tienda ni exigir categorías por edad o nivel para cada terna.
- [x] 4.3 Revisar fuentes, año, autoría, disponibilidad y relaciones de toda la selección; verificar que las incertidumbres permanecen registradas, las marcas de fuente científica de candidatos nuevos siguen desactivadas y los casos sin relación acreditada no cubren plazas de la matriz.
- [x] 4.4 Conciliar el cargador con la selección aprobada y documentar repetición parcial; verificar con una prueba reproducible que usa la API, omite coincidencias sin editarlas, conserva altas previas tras interrupción y guarda resultados sin credenciales.
- [x] 4.5 Añadir una comprobación ejecutable de cobertura y procedencia; verificar los doce cuerpos con tres títulos distintos, órdenes 1–3, ausencia de duplicados, justificación y evidencia de idioma, distinguiendo selección documentada de cobertura institucional verificada.

## 5. Presentación de las recomendaciones

- [x] 5.1 Conciliar la evolución de «Descubrir libros» con la spec principal y el cambio abierto de contenido publicado; verificar que el delta aprobado conserva la invitación y habilita recomendaciones sin restaurar restricciones antiguas ni modificar otros cambios.
- [x] 5.2 Integrar hasta tres recomendaciones elegibles y sus metadatos curados por UUID dentro de la ficha; verificar pruebas de cero, uno, dos, tres y más resultados, orden estable, exclusión de privados, identidad del cuerpo y ausencia de duplicados.
- [x] 5.3 Aplicar los tres bloques verticales del diseño con fondo #111b24, acento #c7e69d y tipografía existente; verificar visualmente escritorio y móvil estrecho con títulos largos, zoom, contraste, foco y objetivos táctiles de 44 × 44 px, sin mover el cielo al desplazar la ficha.
- [x] 5.4 Adaptar la lectura de las recomendaciones a las páginas VR; verificar igualdad entre ojos, continuaciones legibles, una sola lectura accesible y conservación de pestañas, puntero, avance, retroceso, cierre y recentrado con pruebas de contenido y controles.
- [x] 5.5 Cubrir estados de carga, error, vacío, cobertura parcial y respuestas tardías; verificar que no aparecen títulos inventados, datos del cuerpo anterior, aperturas sin activación ni bloqueos del cierre, y documentar el consumo público y la sincronización de UUID.

## 6. Integración real y entrega de contenido

- [x] 6.1 Ejecutar las comprobaciones globales después de conciliar todo el borrador y las recomendaciones; verificar npm test, npm run lint, npm run build, prueba SQL aislada y cobertura 12 × 3, documentando resultados y cualquier limitación.
- [x] 6.2 Aplicar la migración revisada y configurar el entorno privado cuando esté disponible; verificar conexión administrativa autenticada sin exponer secretos y documentar el límite de sesiones en memoria del entorno utilizado.
- [x] 6.3 Comprobar CRUD real y relaciones mediante HTTP contra Supabase con un libro temporal; verificar lecturas posteriores de cada operación, borrado final y capturas sin credenciales, distinguiéndolas de pruebas simuladas.
- [x] 6.4 Cargar los candidatos revisados como no verificados y conservar sus identificadores; verificar que las lecturas administrativas coinciden con las 36 asociaciones y los resultados de carga, y que los candidatos siguen excluidos del catálogo público.
- [x] 6.5 Elaborar las fichas uniformes de Contenido/QA en el destino documental autorizado de Notion después de cargar los libros; verificar UUID, metadatos, evidencia regional y fuentes de cada edición y mantener pendiente la disponibilidad institucional sin evidencia.
- [x] 6.6 Contrastar las tres recomendaciones visibles por cuerpo con ejemplares realmente verificados; comprobar IDs, orden y datos entre base, API, ficha normal y VR, o registrar los cuerpos cuya cobertura pública sigue pendiente sin publicar candidatos para completar el conteo.

## 7. Ajuste de presentación VR solicitado el 10 de noviembre

- [x] 7.1 Resumir cada libro VR a título, autor y editorial/año con número alineado; verificar negrita al mismo tamaño, medición y continuaciones, ausencia de explicación/enlace/invitación y conservación del contenido web en pruebas de páginas, Canvas y HTML accesible.
- [x] 7.2 Contrastar el Canvas con la referencia de Sophia y registrar evidencia; verificar captura de la segunda recomendación, 33 pruebas pertinentes, lint, compilación y coherencia del delta de OpenSpec.

## Workflow follow-up

- Esperar la revisión de Sophia antes de solicitar o iniciar apply.
- Mantener sin completar la verificación física de QA hasta contar con evidencia institucional; no cambiar responsables ni estados de Notion por inferencia.
- No hacer commit ni push sin autorización explícita; si se autoriza el commit, usar la identidad de Sophia y no añadir coautoría.
