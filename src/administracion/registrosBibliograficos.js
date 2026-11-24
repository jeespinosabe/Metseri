import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { obtenerAnioActual } from '../datos/anioPublicacion.js'
import { presentarPortada } from '../servicios/portadasLibros.js'
import {
  listarAutoresDeTexto, normalizarTextoLibro, validarAnioLibro, validarAutoriaLibro, validarEditorialLibro, validarTituloLibro,
} from './reglasLibro.js'

export const CAMPOS_LIBRO = Object.freeze(['titulo', 'autoria', 'editorial', 'anio'])

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

export function etiquetaPestanaRegistros(pantalla) {
  return pantalla === 'edicion' ? 'Editar' : 'Registros bibliográficos'
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
  return fotografia ? { ...fotografia, encuadre: { ...ENCUADRE_INICIAL, ...fotografia.encuadre } } : null
}

export function crearBorradorLibro(registro = null) {
  return {
    titulo: registro?.titulo ?? '',
    autoria: registro?.autores?.join('\n') ?? registro?.autoria ?? '',
    editorial: registro?.editorial ?? '',
    anio: Number.isInteger(registro?.anio) ? String(registro.anio) : '',
    cuerposIds: [...(registro?.cuerposIds ?? [])],
    ordenPorCuerpo: { ...registro?.ordenPorCuerpo },
    activo: registro?.activo ?? true,
    fotografia: copiarFotografia(registro?.fotografia),
  }
}

// Registro de presentación para la vista previa de la tarjeta a partir del borrador.
export function crearRegistroVistaPrevia(borrador) {
  const anio = String(borrador.anio ?? '').trim()
  return {
    id: 'vista-previa',
    titulo: borrador.titulo.trim() || 'Título del libro',
    autoria: separarAutores(borrador.autoria).join(', ') || 'Autor del libro',
    editorial: borrador.editorial.trim() || null,
    anio: anio && !validarCampoLibro('anio', anio) ? Number(anio) : null,
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

function separarAutores(texto) {
  return listarAutoresDeTexto(texto).map(({ nombre }) => nombre)
}

// Reglas compartidas con la API: ver reglasLibro.js. `anioActual` permite fijar el año en las pruebas.
export function validarCampoLibro(campo, valor, anioActual = obtenerAnioActual()) {
  switch (campo) {
    case 'titulo': return validarTituloLibro(valor)
    case 'autoria': return validarAutoriaLibro(listarAutoresDeTexto(valor))
    case 'editorial': return validarEditorialLibro(valor)
    case 'anio': return validarAnioLibro(valor, anioActual)
    default: return ''
  }
}

// La API nombra `autores` al campo que el formulario llama `autoria`.
const CAMPO_DEL_FORMULARIO = Object.freeze({ titulo: 'titulo', autores: 'autoria', editorial: 'editorial', anio: 'anio' })

// Mensajes por campo que devuelve la API en `error.campos`, con los nombres del formulario.
export function leerErroresServidor(error) {
  const campos = error?.campos
  if (!campos || typeof campos !== 'object' || Array.isArray(campos)) return {}
  return Object.fromEntries(Object.entries(campos)
    .filter(([campo, mensaje]) => CAMPO_DEL_FORMULARIO[campo] && typeof mensaje === 'string' && mensaje)
    .map(([campo, mensaje]) => [CAMPO_DEL_FORMULARIO[campo], mensaje]))
}

export function validarBorradorLibro(borrador, anioActual = obtenerAnioActual()) {
  return Object.fromEntries(CAMPOS_LIBRO.map((campo) => [campo, validarCampoLibro(campo, borrador[campo], anioActual)]))
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
  const fotografia = presentarPortada(libro.portada, `/api/admin/libros/${encodeURIComponent(libro.id)}/portada`)
  return {
    id: libro.id, titulo: libro.titulo, autores, autoria: autores.join(', '),
    editorial: libro.editorial, anio: libro.anio, activo: libro.activo,
    cuerposIds: libro.cuerpos.map(({ slug }) => slug),
    ordenPorCuerpo: Object.fromEntries(libro.cuerpos.map(({ slug, orden }) => [slug, orden])),
    ...(fotografia && { fotografia }),
  }
}

function convertirBorrador(borrador) {
  return {
    titulo: normalizarTextoLibro(borrador.titulo),
    autores: separarAutores(borrador.autoria),
    editorial: normalizarTextoLibro(borrador.editorial),
    anio: Number(borrador.anio) || null,
    cuerpos: [...borrador.cuerposIds].sort().map((slug) => ({ slug, orden: Number(borrador.ordenPorCuerpo[slug] ?? 1) })),
    activo: borrador.activo,
  }
}

export function prepararDatosLibro(borrador, registro = null) {
  const datos = convertirBorrador(borrador)
  const anteriores = registro && convertirBorrador(crearBorradorLibro(registro))
  const cambios = anteriores ? Object.fromEntries(Object.entries(datos).filter(([campo, valor]) => JSON.stringify(valor) !== JSON.stringify(anteriores[campo]))) : datos
  const foto = borrador.fotografia
  const fotoAnterior = registro?.fotografia
  if (foto?.archivo) cambios.portada = { archivo: foto.archivo, ...foto.encuadre }
  else if (!foto && fotoAnterior) cambios.portada = null
  else if (fotoAnterior?.version && (foto.encuadre.x !== fotoAnterior.encuadre.x || foto.encuadre.y !== fotoAnterior.encuadre.y)) {
    cambios.portada = { version: fotoAnterior.version, ...foto.encuadre }
  }
  return cambios
}
