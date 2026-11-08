import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'

// Lógica de presentación del panel administrativo. Ninguna función modifica
// la colección recibida ni realiza escrituras: devuelven valores nuevos.

export const CAMPOS_LIBRO = Object.freeze(['titulo', 'autoria', 'editorial', 'anio', 'urlFicha'])

// Proporción ancho:alto del espacio de portada de las tarjetas (11:5).
export const PROPORCION_PORTADA = 11 / 5
export const ENCUADRE_INICIAL = Object.freeze({ x: 50, y: 50 })
export const FORMATOS_FOTOGRAFIA = Object.freeze(['image/jpeg', 'image/png', 'image/webp'])
export const TAMANO_MAXIMO_FOTOGRAFIA = 5 * 1024 * 1024

export function normalizarTexto(texto) {
  return String(texto ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function hayCriteriosActivos({ busqueda = '', cuerpoId = '' } = {}) {
  return normalizarTexto(busqueda) !== '' || cuerpoId !== ''
}

export function filtrarRegistros(registros, { busqueda = '', cuerpoId = '' } = {}) {
  const consulta = normalizarTexto(busqueda)
  return registros.filter((registro) => {
    const coincideTexto = !consulta
      || normalizarTexto(registro.titulo).includes(consulta)
      || normalizarTexto(registro.autoria).includes(consulta)
    const coincideCuerpo = !cuerpoId || (registro.cuerposIds ?? []).includes(cuerpoId)
    return coincideTexto && coincideCuerpo
  })
}

export function describirCantidadRegistros(visibles, total, filtrado) {
  const sustantivo = total === 1 ? 'registro de ejemplo' : 'registros de ejemplo'
  return filtrado ? `${visibles} de ${total} ${sustantivo}` : `${total} ${sustantivo}`
}

export function obtenerCuerposRelacionados(cuerposIds = []) {
  return CUERPOS_CELESTES.filter((cuerpo) => cuerposIds.includes(cuerpo.id))
}

export function formatearEditorial(editorial) {
  return typeof editorial === 'string' && editorial.trim() ? editorial : 'Sin editorial'
}

export function formatearAnio(anio) {
  return Number.isInteger(anio) ? String(anio) : 'Año no indicado'
}

function copiarFotografia(fotografia) {
  return fotografia ? { url: fotografia.url, encuadre: { ...ENCUADRE_INICIAL, ...fotografia.encuadre } } : null
}

export function crearBorradorLibro(registro = null) {
  return {
    titulo: registro?.titulo ?? '',
    autoria: registro?.autoria ?? '',
    editorial: registro?.editorial ?? '',
    anio: Number.isInteger(registro?.anio) ? String(registro.anio) : '',
    urlFicha: registro?.urlFicha ?? '',
    cuerposIds: [...(registro?.cuerposIds ?? [])],
    fotografia: copiarFotografia(registro?.fotografia),
  }
}

// Registro de presentación para la vista previa de la tarjeta a partir del borrador.
export function crearRegistroVistaPrevia(borrador) {
  const anio = String(borrador.anio ?? '').trim()
  return {
    id: 'vista-previa',
    titulo: borrador.titulo.trim() || 'Título del libro',
    autoria: borrador.autoria.trim() || 'Autoría del libro',
    editorial: borrador.editorial.trim() || null,
    anio: /^[1-9]\d{0,3}$/.test(anio) ? Number(anio) : null,
    urlFicha: borrador.urlFicha,
    cuerposIds: borrador.cuerposIds,
    fotografia: borrador.fotografia,
  }
}

export function validarArchivoFotografia(archivo) {
  if (!archivo || !FORMATOS_FOTOGRAFIA.includes(archivo.type)) {
    return 'Ese archivo no es una imagen admitida. Elige una imagen JPG, PNG o WebP de hasta 5 MB.'
  }
  if (archivo.size > TAMANO_MAXIMO_FOTOGRAFIA) {
    return 'La imagen pesa más de 5 MB. Elige una imagen JPG, PNG o WebP de hasta 5 MB.'
  }
  return ''
}

const redondear = (valor) => Math.round(valor * 100) / 100

// Tamaño en píxeles con el que se muestra la fotografía completa en el editor.
export function calcularTamanoVistaFotografia(dimensiones, anchoMaximo = 340, altoMaximo = 280) {
  const { ancho, alto } = dimensiones ?? {}
  if (!(ancho > 0 && alto > 0)) return null
  const escala = Math.min(anchoMaximo / ancho, altoMaximo / alto, 1)
  return { ancho: Math.round(ancho * escala), alto: Math.round(alto * escala) }
}

// Calcula qué eje recorta la portada y qué parte de la foto queda visible, en
// porcentajes de la imagen completa. Coincide con `object-fit: cover` y
// `object-position: x% y%` aplicados con la misma proporción.
export function calcularMarcoEncuadre(dimensiones, encuadre = ENCUADRE_INICIAL, proporcion = PROPORCION_PORTADA) {
  const { ancho, alto } = dimensiones ?? {}
  if (!(ancho > 0 && alto > 0)) return null
  const proporcionFoto = ancho / alto
  if (Math.abs(proporcionFoto - proporcion) < 0.01) return { eje: null, x: 0, y: 0, ancho: 100, alto: 100 }
  if (proporcionFoto < proporcion) {
    const altoVisible = (proporcionFoto / proporcion) * 100
    return { eje: 'y', x: 0, y: redondear(((100 - altoVisible) * encuadre.y) / 100), ancho: 100, alto: redondear(altoVisible) }
  }
  const anchoVisible = (proporcion / proporcionFoto) * 100
  return { eje: 'x', x: redondear(((100 - anchoVisible) * encuadre.x) / 100), y: 0, ancho: redondear(anchoVisible), alto: 100 }
}

export function alternarCuerpo(cuerposIds, cuerpoId) {
  return cuerposIds.includes(cuerpoId)
    ? cuerposIds.filter((id) => id !== cuerpoId)
    : [...cuerposIds, cuerpoId]
}

function esUrlBibliograficaValida(valor) {
  try {
    const url = new URL(valor)
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== ''
  } catch {
    return false
  }
}

export function validarCampoLibro(campo, valor) {
  const texto = String(valor ?? '').trim()
  switch (campo) {
    case 'titulo':
      return texto ? '' : 'Escribe el título del libro.'
    case 'autoria':
      return texto ? '' : 'Escribe la autoría del libro.'
    case 'urlFicha':
      if (!texto) return 'Escribe la URL de la ficha bibliográfica.'
      return esUrlBibliograficaValida(texto) ? '' : 'Escribe una dirección completa que comience con http:// o https://.'
    case 'anio':
      return !texto || /^[1-9]\d{0,3}$/.test(texto) ? '' : 'Escribe el año como un número entero entre 1 y 9999, o déjalo vacío.'
    default:
      return ''
  }
}

export function validarBorradorLibro(borrador) {
  return Object.fromEntries(CAMPOS_LIBRO.map((campo) => [campo, validarCampoLibro(campo, borrador[campo])]))
}
