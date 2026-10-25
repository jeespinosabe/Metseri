// Identidad e imágenes de los ocho planetas. El contenido editorial queda vacío.
export const CUERPOS_CELESTES = [
  {
    "id": "mercurio",
    "nombre": "Mercurio",
    "clasificacion": "Planeta rocoso",
    "tipo": "planeta",
    "imagen": "/imagenes/planetas/mercurio.webp",
    "imagenAlternativa": "Imagen de Mercurio",
    "credito": "NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington",
    "imagenOriginal": "https://science.nasa.gov/wp-content/uploads/2023/05/mercury-from-messenger-pia15160-1920x640-1.jpg",
    "subtitulo": "",
    "descripcion": "",
    "diametroKm": null,
    "distanciaSolMillonesKm": null,
    "rotacionHoras": null,
    "orbitaDias": null,
    "curiosidades": []
  },
  {
    "id": "venus",
    "nombre": "Venus",
    "clasificacion": "Planeta rocoso",
    "tipo": "planeta",
    "imagen": "/imagenes/planetas/venus.webp",
    "imagenAlternativa": "Imagen de Venus",
    "credito": "NASA/JPL-Caltech",
    "imagenOriginal": "https://science.nasa.gov/wp-content/uploads/2024/03/venus-mariner-10-pia23791-fig2-16x9-1.jpg",
    "subtitulo": "",
    "descripcion": "",
    "diametroKm": null,
    "distanciaSolMillonesKm": null,
    "rotacionHoras": null,
    "orbitaDias": null,
    "curiosidades": []
  },
  {
    "id": "tierra",
    "nombre": "Tierra",
    "clasificacion": "Nuestro hogar · Planeta rocoso",
    "tipo": "planeta",
    "imagen": "/imagenes/planetas/tierra.webp",
    "imagenAlternativa": "Imagen de Tierra",
    "credito": "NASA",
    "imagenOriginal": "https://science.nasa.gov/wp-content/uploads/2023/05/earth-1-jpg.webp",
    "subtitulo": "",
    "descripcion": "",
    "diametroKm": null,
    "distanciaSolMillonesKm": null,
    "rotacionHoras": null,
    "orbitaDias": null,
    "curiosidades": []
  },
  {
    "id": "marte",
    "nombre": "Marte",
    "clasificacion": "Planeta rocoso",
    "tipo": "planeta",
    "imagen": "/imagenes/planetas/marte.webp",
    "imagenAlternativa": "Imagen de Marte",
    "credito": "NASA/JPL-Caltech",
    "imagenOriginal": "https://science.nasa.gov/wp-content/uploads/2016/05/1-mars-nasa-gov-jpg.webp",
    "subtitulo": "",
    "descripcion": "",
    "diametroKm": null,
    "distanciaSolMillonesKm": null,
    "rotacionHoras": null,
    "orbitaDias": null,
    "curiosidades": []
  },
  {
    "id": "jupiter",
    "nombre": "Júpiter",
    "clasificacion": "Gigante gaseoso",
    "tipo": "planeta",
    "imagen": "/imagenes/planetas/jupiter.webp",
    "imagenAlternativa": "Imagen de Júpiter",
    "credito": "Kevin M. Gill (CC BY), a partir de NASA/JPL-Caltech/SwRI/MSSS",
    "imagenOriginal": "https://science.nasa.gov/wp-content/uploads/2024/03/jupiter-marble-pia22946-16x9-1.jpg",
    "subtitulo": "",
    "descripcion": "",
    "diametroKm": null,
    "distanciaSolMillonesKm": null,
    "rotacionHoras": null,
    "orbitaDias": null,
    "curiosidades": []
  },
  {
    "id": "saturno",
    "nombre": "Saturno",
    "clasificacion": "Gigante gaseoso",
    "tipo": "planeta",
    "imagen": "/imagenes/planetas/saturno.webp",
    "imagenAlternativa": "Imagen de Saturno",
    "credito": "NASA/JPL-Caltech/Space Science Institute",
    "imagenOriginal": "https://science.nasa.gov/wp-content/uploads/2024/03/saturn-farewell-pia21345.jpg",
    "subtitulo": "",
    "descripcion": "",
    "diametroKm": null,
    "distanciaSolMillonesKm": null,
    "rotacionHoras": null,
    "orbitaDias": null,
    "curiosidades": []
  },
  {
    "id": "urano",
    "nombre": "Urano",
    "clasificacion": "Gigante helado",
    "tipo": "planeta",
    "imagen": "/imagenes/planetas/urano.webp",
    "imagenAlternativa": "Imagen de Urano",
    "credito": "NASA/JPL-Caltech",
    "imagenOriginal": "https://science.nasa.gov/wp-content/uploads/2016/05/uranus-jpg.webp",
    "subtitulo": "",
    "descripcion": "",
    "diametroKm": null,
    "distanciaSolMillonesKm": null,
    "rotacionHoras": null,
    "orbitaDias": null,
    "curiosidades": []
  },
  {
    "id": "neptuno",
    "nombre": "Neptuno",
    "clasificacion": "Gigante helado",
    "tipo": "planeta",
    "imagen": "/imagenes/planetas/neptuno.webp",
    "imagenAlternativa": "Imagen de Neptuno",
    "credito": "NASA/JPL-Caltech",
    "imagenOriginal": "https://science.nasa.gov/wp-content/uploads/2024/03/pia01492-neptune-full-disk-16x9-1.jpg",
    "subtitulo": "",
    "descripcion": "",
    "diametroKm": null,
    "distanciaSolMillonesKm": null,
    "rotacionHoras": null,
    "orbitaDias": null,
    "curiosidades": []
  }
]

export function obtenerCuerpoCeleste(id) {
  return CUERPOS_CELESTES.find((cuerpo) => cuerpo.id === id) ?? null
}

const formateador = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 })
const numero = (valor) => Number.isFinite(valor) ? formateador.format(valor) : ''

export function obtenerDatosPrincipales(cuerpo) {
  const satelite = cuerpo.tipo === 'satelite'
  const tieneRotacion = Number.isFinite(cuerpo.rotacionHoras)
  const horas = tieneRotacion ? Math.abs(cuerpo.rotacionHoras) : null
  const rotacionEnDias = tieneRotacion && horas >= 48
  const orbitaEnAnos = !satelite && Number.isFinite(cuerpo.orbitaDias) && cuerpo.orbitaDias >= 1000
  return [
    { etiqueta: 'Diámetro', valor: numero(cuerpo.diametroKm), unidad: 'km' },
    { etiqueta: satelite ? 'Distancia al planeta' : 'Distancia al Sol', valor: numero(satelite ? cuerpo.distanciaPlanetaKm : cuerpo.distanciaSolMillonesKm), unidad: satelite ? 'km' : 'millones de km' },
    { etiqueta: satelite ? 'Período de rotación' : 'Un día dura', valor: tieneRotacion ? numero(rotacionEnDias ? horas / 24 : horas) : '', unidad: rotacionEnDias ? 'días terrestres' : 'horas', retrograda: tieneRotacion && cuerpo.rotacionHoras < 0 },
    { etiqueta: satelite ? 'Período orbital' : 'Un año dura', valor: orbitaEnAnos ? numero(cuerpo.orbitaDias / 365.25) : numero(cuerpo.orbitaDias), unidad: orbitaEnAnos ? 'años terrestres' : 'días terrestres' },
  ]
}
