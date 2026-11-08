// Registros de ejemplo exclusivos del panel administrativo: libros publicados
// reales en español, con los datos de una edición en español. No representan
// existencias de la biblioteca, y la escena, sus fichas y la API de consulta no
// los utilizan.
// Modelo de presentación: { id, titulo, autoria, editorial, anio, urlFicha, cuerposIds, fotografia }.
// `cuerposIds` usa los slugs locales de `cuerposCelestes.js`, no identificadores de base de datos.
// `urlFicha` usa el dominio reservado example.org mientras no existan fichas reales.
// `fotografia` es null o { url, encuadre: { x, y } }. Provisionalmente, las
// portadas se enlazan por ISBN desde el servicio de portadas de Open Library.
const PORTADAS_OPEN_LIBRARY = 'https://covers.openlibrary.org/b/isbn'

function crearPortada(isbn, y = 50) {
  return { url: `${PORTADAS_OPEN_LIBRARY}/${isbn}-L.jpg`, encuadre: { x: 50, y } }
}

function crearRegistroEjemplo(registro) {
  const fotografia = registro.fotografia
    ? Object.freeze({ url: registro.fotografia.url, encuadre: Object.freeze({ ...registro.fotografia.encuadre }) })
    : null
  return Object.freeze({ ...registro, cuerposIds: Object.freeze([...registro.cuerposIds]), fotografia })
}

export const REGISTROS_BIBLIOGRAFICOS_EJEMPLO = Object.freeze([
  {
    id: 'ejemplo-1',
    titulo: 'De la Tierra a la Luna',
    autoria: 'Julio Verne',
    editorial: 'Nórdica Libros',
    anio: 2019,
    urlFicha: 'https://example.org/fichas/ejemplo-1',
    cuerposIds: ['tierra', 'luna'],
    fotografia: crearPortada('9788417651855'),
  },
  {
    id: 'ejemplo-2',
    titulo: '2010: Odisea dos',
    autoria: 'Arthur C. Clarke',
    editorial: 'Debolsillo',
    anio: 2007,
    urlFicha: 'https://example.org/fichas/ejemplo-2',
    cuerposIds: ['jupiter', 'europa'],
    fotografia: crearPortada('9788483463475'),
  },
  {
    id: 'ejemplo-3',
    titulo: 'El marciano',
    autoria: 'Andy Weir',
    editorial: 'Ediciones B',
    anio: 2014,
    urlFicha: 'https://example.org/fichas/ejemplo-3',
    cuerposIds: ['marte'],
    fotografia: crearPortada('9788466655057'),
  },
  {
    id: 'ejemplo-4',
    titulo: 'Cosmos',
    autoria: 'Carl Sagan',
    editorial: 'Planeta',
    anio: 2004,
    urlFicha: 'https://example.org/fichas/ejemplo-4',
    cuerposIds: ['venus', 'marte', 'jupiter'],
    fotografia: crearPortada('9788408053040'),
  },
  {
    id: 'ejemplo-5',
    titulo: 'Los planetas',
    autoria: 'Dava Sobel',
    editorial: 'Anagrama',
    anio: 2006,
    urlFicha: 'https://example.org/fichas/ejemplo-5',
    cuerposIds: ['mercurio', 'venus', 'tierra', 'marte', 'jupiter', 'saturno', 'urano', 'neptuno'],
    fotografia: crearPortada('9788433962492'),
  },
  {
    id: 'ejemplo-6',
    titulo: 'Historia del tiempo: del big bang a los agujeros negros',
    autoria: 'Stephen Hawking',
    editorial: 'Crítica',
    anio: 1989,
    urlFicha: 'https://example.org/fichas/ejemplo-6',
    cuerposIds: [],
    fotografia: crearPortada('9789802930739'),
  },
].map(crearRegistroEjemplo))
