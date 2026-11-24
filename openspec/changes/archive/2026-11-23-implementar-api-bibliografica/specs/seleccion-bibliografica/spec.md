# Spec Delta

## Purpose

Mantener una selección bibliográfica trazable para cargar libros reales y elaborar posteriormente fichas uniformes, sin atribuir disponibilidad institucional no comprobada.

## ADDED Requirements

### Requirement: Selección variada y trazable en español
La selección SHALL reunir libros reales y variados con contenido en español mexicano para público general, pudiendo incluir obras infantiles, de divulgación y científicas pertinentes al tema. Cada candidato SHALL identificar título, autoría, editorial, edición o ISBN, fuentes, fecha de consulta y evidencia de adecuación regional, y señalar los datos no confirmados.

#### Scenario: Metadatos contradictorios de una edición
- **WHEN** las fuentes difieren en el año o corresponden a ISBN distintos
- **THEN** el candidato conserva la discrepancia y el año queda sin confirmar hasta cotejar la edición
- **AND** no se mezclan metadatos de ediciones distintas

#### Scenario: Español sin adaptación regional acreditada
- **WHEN** se selecciona una traducción al español sin evidencia de adaptación mexicana
- **THEN** se registra la incertidumbre y el candidato no acredita todavía el requisito de español mexicano
- **AND** no se considera suficiente que una tienda mexicana venda esa edición

### Requirement: Tres títulos por cuerpo celeste
La selección SHALL completar tres títulos distintos para cada uno de los ocho planetas y cuatro satélites de Metseri, con 36 asociaciones justificadas en una matriz de cobertura. Un título SHALL poder asociarse a varios cuerpos si las fuentes justifican cada relación, sin duplicarse dentro de la terna de un mismo cuerpo.

#### Scenario: Comprobar cobertura de los doce cuerpos
- **WHEN** se revisa la selección antes de cargarla
- **THEN** Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano, Neptuno, Luna, Europa, Titán y Tritón tienen cada uno tres títulos distintos documentados
- **AND** las ausencias o relaciones sin respaldo impiden declarar completa la selección

### Requirement: Variedad bibliográfica para público general
La investigación SHALL considerar obras de interés para público general, sin imponer una distribución por edades o niveles en cada terna. La aplicación SHALL mostrar las tres sugerencias del cuerpo sin controles de selección, filtros ni etiquetas de edad o nivel. Las explicaciones SHALL usar lenguaje claro en es-MX.

#### Scenario: Consultar recomendaciones para público general
- **WHEN** cualquier visitante consulta las sugerencias de un cuerpo
- **THEN** ve los mismos tres libros seleccionados por su relación temática
- **AND** no necesita indicar edad o nivel ni elegir una categoría de lectura

### Requirement: Relaciones temáticas justificadas
Cada asociación propuesta SHALL estar respaldada por sinopsis, índice o contenido consultado y conservar una explicación de su alcance. La falta de evidencia sobre un cuerpo específico SHALL permitir dejar el libro sin esa relación. Una asociación temática SHALL NOT declarar automáticamente que el libro es fuente de una ficha astronómica.

#### Scenario: Libro general de cosmología
- **WHEN** la fuente permite confirmar el tema general pero no cuerpos concretos
- **THEN** el candidato puede quedar sin cuerpos asociados hasta revisar su índice
- **AND** no se añaden asociaciones para completar artificialmente los doce cuerpos
- **AND** ese candidato no cubre una plaza de la terna hasta que la relación esté justificada

### Requirement: Carga de candidatos mediante la API
Los candidatos de internet SHALL cargarse mediante la API administrativa como no verificados, sin fecha ni persona de verificación. Los enlaces editoriales SHALL conservarse como fuentes de investigación y SHALL NOT sustituir el registro institucional en `url_ficha`. La carga SHALL registrar UUID y resultados sin credenciales.

#### Scenario: Repetir una carga parcial
- **WHEN** se repite la carga y ya existe un candidato con el mismo título, editorial y año
- **THEN** se omite sin modificarlo y se identifica como existente en el resultado
- **AND** las altas de otros candidatos pueden continuar sin presentarse como una transacción global

#### Scenario: Diferenciar cobertura investigada y pública
- **WHEN** la matriz contiene tres candidatos por cuerpo pero faltan ejemplares institucionalmente verificados
- **THEN** se registra completa solo la cobertura investigada y se mantiene pendiente la cobertura pública correspondiente
- **AND** no se cambia verificado a true para completar artificialmente la interfaz

### Requirement: Fichas posteriores coherentes con los registros
Después de cargar los libros, las fichas de Contenido/QA SHALL elaborarse con los mismos registros e identificadores. SHALL usar estructura uniforme con título, autoría y roles conocidos, editorial, año, ISBN, fuentes, evidencia de español mexicano, relaciones justificadas y disponibilidad institucional, indicando datos pendientes.

#### Scenario: Elaborar fichas de candidatos cargados
- **WHEN** se prepara la entrega de Contenido/QA con los registros creados
- **THEN** cada ficha coincide con el registro correspondiente y conserva sus fuentes e incertidumbres
- **AND** las funciones de compilación o ilustración conocidas no se presentan como autoría textual sin aclaración

### Requirement: Disponibilidad física comprobable
La selección editorial y las fichas SHALL NOT presentarse como evidencia de existencia física en la Biblioteca Solón Argüello. El criterio de QA sobre disponibilidad SHALL permanecer pendiente hasta contar con catálogo institucional o evidencia del ejemplar, independientemente de que el CRUD y los metadatos hayan sido comprobados.

#### Scenario: Fuente editorial sin catálogo institucional
- **WHEN** solo se cuenta con una página editorial o comercial verificable
- **THEN** se declara comprobada la información bibliográfica que la fuente respalda
- **AND** la disponibilidad en la biblioteca se mantiene pendiente y el libro sigue sin verificar
