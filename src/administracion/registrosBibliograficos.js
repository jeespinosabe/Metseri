import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'

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
  const sustantivo = total === 1 ? 'registro' : 'registros'
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
    autoria: registro?.autores?.join('\n') ?? registro?.autoria ?? '',
    editorial: registro?.editorial ?? '',
    anio: Number.isInteger(registro?.anio) ? String(registro.anio) : '',
    urlFicha: registro?.urlFicha ?? '',
    cuerposIds: [...(registro?.cuerposIds ?? [])],
    ordenPorCuerpo: { ...registro?.ordenPorCuerpo },
    activo: registro?.activo ?? true,
    verificado: registro?.verificado ?? false,
    fotografia: copiarFotografia(registro?.fotografia),
  }
}

// Registro de presentación para la vista previa de la tarjeta a partir del borrador.
export function crearRegistroVistaPrevia(borrador) {
  const anio = String(borrador.anio ?? '').trim()
  return {
    id: 'vista-previa',
    titulo: borrador.titulo.trim() || 'Título del libro',
    autoria: separarAutores(borrador.autoria).join(', ') || 'Autoría del libro',
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
    return /^https?:\/\//i.test(valor) && !url.username && !url.password
  } catch {
    return false
  }
}

function separarAutores(texto) {
  return texto.split('\n').map((nombre) => nombre.trim()).filter(Boolean)
}

export function validarCampoLibro(campo, valor, verificado = false) {
  const texto = String(valor ?? '').trim()
  switch (campo) {
    case 'titulo':
      if (!texto) return 'Escribe el título del libro.'
      return texto.length > 500 ? 'El título admite hasta 500 caracteres.' : ''
    case 'autoria': {
      const autores = separarAutores(texto)
      if (!autores.length) return 'Escribe la autoría del libro.'
      if (autores.length > 50 || autores.some((nombre) => nombre.length > 200)) {
        return 'Escribe hasta 50 nombres, con un máximo de 200 caracteres por nombre.'
      }
      return new Set(autores.map((nombre) => nombre.toLowerCase())).size !== autores.length ? 'Escribe cada nombre una sola vez.' : ''
    }
    case 'editorial':
      if (!texto && verificado) return 'Indica la editorial para confirmar la verificación.'
      return texto.length > 500 ? 'La editorial admite hasta 500 caracteres.' : ''
    case 'urlFicha':
      if (!texto) return verificado ? 'Indica la URL institucional para confirmar la verificación.' : ''
      return texto.length <= 2048 && esUrlBibliograficaValida(texto) ? '' : 'Escribe una dirección completa que comience con http:// o https://.'
    case 'anio':
      if (!texto) return verificado ? 'Indica el año para confirmar la verificación.' : ''
      return /^\d{4}$/.test(texto) && +texto >= 1000 && +texto <= 2100 ? '' : 'Escribe un año entre 1000 y 2100.'
    default:
      return ''
  }
}

export function validarBorradorLibro(borrador) {
  return Object.fromEntries(CAMPOS_LIBRO.map((campo) => [campo, validarCampoLibro(campo, borrador[campo], borrador.verificado)]))
}

export function validarOrdenLibro(valor) {
  return /^\d+$/.test(valor) && +valor >= 1 && +valor <= 32767 ? '' : 'Escribe un número entero entre 1 y 32767.'
}

export function presentarLibroAdministrativo(libro) {
  if (typeof libro?.id !== 'string' || typeof libro.titulo !== 'string'
    || !Array.isArray(libro.autores) || !Array.isArray(libro.cuerpos)) {
    throw new Error('La API devolvió un registro bibliográfico inválido.')
  }
  const autores = libro.autores.map(({ nombre }) => nombre)
  return {
    id: libro.id, titulo: libro.titulo, autores, autoria: autores.join(', '),
    editorial: libro.editorial, anio: libro.anio, urlFicha: libro.url_ficha,
    activo: libro.activo, verificado: libro.verificado,
    cuerposIds: libro.cuerpos.map(({ slug }) => slug),
    ordenPorCuerpo: Object.fromEntries(libro.cuerpos.map(({ slug, orden }) => [slug, orden])),
  }
}

function convertirBorrador(borrador) {
  return {
    titulo: borrador.titulo.trim(),
    autores: separarAutores(borrador.autoria),
    editorial: borrador.editorial.trim() || null,
    anio: Number(borrador.anio) || null,
    url_ficha: normalizarUrlFicha(borrador.urlFicha),
    cuerpos: [...borrador.cuerposIds].sort().map((slug) => ({ slug, orden: Number(borrador.ordenPorCuerpo[slug] ?? 1) })),
    activo: borrador.activo,
    verificado: borrador.verificado,
  }
}

function normalizarUrlFicha(valor) {
  const url = valor.trim()
  if (!url) return null
  return esUrlBibliograficaValida(url) ? new URL(url).href : url
}

export function prepararDatosLibro(borrador, registro = null) {
  const datos = convertirBorrador(borrador)
  if (!registro) return datos
  const anteriores = convertirBorrador(crearBorradorLibro(registro))
  const cambios = Object.fromEntries(Object.entries(datos).filter(([campo, valor]) => JSON.stringify(valor) !== JSON.stringify(anteriores[campo])))
  if (datos.verificado && ['titulo', 'autores', 'editorial', 'anio', 'url_ficha'].some((campo) => Object.hasOwn(cambios, campo))) {
    cambios.verificado = true
  }
  return cambios
}
