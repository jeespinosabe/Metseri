import {
  normalizarTextoLibro, validarAnioLibro, validarAutoriaLibro, validarEditorialLibro, validarTituloLibro,
} from '../../src/administracion/reglasLibro.js'
import { esSlugValido } from './consultaSupabase.js'
import { decodificarPortada } from './portadasLibros.js'
import { obtenerConfiguracionPrivada, solicitarRpcPrivada } from './supabasePrivada.js'

const CAMPOS = ['titulo', 'editorial', 'anio', 'url_ficha', 'activo', 'verificado', 'autores', 'cuerpos', 'portada']
export const esIdLibroValido = (valor) => typeof valor === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor)

export class ErrorLibros extends Error {
  // `campos` es opcional: mensaje de cada campo inválido, con las claves de la API.
  constructor(estado = 503, codigo = 'BIBLIOGRAFIA_NO_DISPONIBLE', mensaje = 'No se pudo acceder a los libros. Inténtalo más tarde.', campos = null) {
    super(mensaje)
    this.estado = estado
    this.codigo = codigo
    if (campos && Object.keys(campos).length) this.campos = campos
  }
}

function esPortadaValida(portada, parcial) {
  if (portada === null) return true
  if (!portada || typeof portada !== 'object' || Array.isArray(portada)
    || [portada.x, portada.y].some((valor) => !Number.isInteger(valor) || valor < 0 || valor > 100)) return false
  if (Object.hasOwn(portada, 'datos')) return Object.keys(portada).length === 3 && Boolean(decodificarPortada(portada.datos))
  return parcial && Object.keys(portada).length === 3 && esIdLibroValido(portada.version)
}

// Las reglas de título, autores, editorial y año son las mismas del formulario (reglasLibro.js).
// `anioActual` se puede fijar en las pruebas; el servidor decide el año máximo (año actual + 1).
export function validarLibro(datos, parcial = false, { anioActual = new Date().getUTCFullYear() } = {}) {
  const invalido = () => { throw new ErrorLibros(400, 'LIBRO_INVALIDO', 'Revisa los campos del libro, sus autores y cuerpos celestes.') }
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)
    || !Object.keys(datos).length || Object.keys(datos).some((campo) => !CAMPOS.includes(campo))) invalido()
  const libro = { ...datos }
  if (Object.hasOwn(libro, 'portada') && !esPortadaValida(libro.portada, parcial)) {
    throw new ErrorLibros(400, 'PORTADA_INVALIDA', 'La portada no es válida. Selecciona la fotografía de nuevo.')
  }
  if (Object.hasOwn(libro, 'url_ficha') && libro.url_ficha !== null) {
    try {
      if (typeof libro.url_ficha !== 'string' || libro.url_ficha.length > 2048) invalido()
      const url = new URL(libro.url_ficha)
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) invalido()
      libro.url_ficha = url.href
    } catch { invalido() }
  }
  for (const campo of ['activo', 'verificado']) {
    if (Object.hasOwn(libro, campo) && typeof libro[campo] !== 'boolean') invalido()
  }
  if (Object.hasOwn(libro, 'cuerpos')) {
    if (!Array.isArray(libro.cuerpos) || libro.cuerpos.length > 100) invalido()
    libro.cuerpos = libro.cuerpos.map((cuerpo) => {
      if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)
        || Object.keys(cuerpo).some((campo) => !['slug', 'orden'].includes(campo))
        || !esSlugValido(cuerpo.slug) || cuerpo.slug.length > 100
        || !Number.isInteger(cuerpo.orden) || cuerpo.orden < 1 || cuerpo.orden > 32767) invalido()
      return { slug: cuerpo.slug, orden: cuerpo.orden }
    })
    if (new Set(libro.cuerpos.map((cuerpo) => cuerpo.slug)).size !== libro.cuerpos.length) invalido()
  }

  // Campos del libro: se recogen todos los errores para devolver un mensaje por campo.
  const campos = {}
  const exige = (campo) => !parcial || Object.hasOwn(libro, campo)
  if (exige('titulo')) {
    const error = validarTituloLibro(typeof libro.titulo === 'string' ? libro.titulo : '')
    if (error) campos.titulo = error
    else libro.titulo = normalizarTextoLibro(libro.titulo)
  }
  if (exige('autores')) {
    const entradas = Array.isArray(libro.autores)
      ? libro.autores.map((nombre, indice) => ({ nombre: typeof nombre === 'string' ? nombre.trim() : '', linea: indice + 1 }))
      : []
    const error = validarAutoriaLibro(entradas)
    if (error) campos.autores = error
    else libro.autores = entradas.map(({ nombre }) => nombre)
  }
  if (exige('editorial')) {
    const error = validarEditorialLibro(typeof libro.editorial === 'string' ? libro.editorial : '')
    if (error) campos.editorial = error
    else libro.editorial = normalizarTextoLibro(libro.editorial)
  }
  if (Object.hasOwn(libro, 'anio') && libro.anio !== null) {
    const error = validarAnioLibro(typeof libro.anio === 'number' ? libro.anio : 'no numérico', anioActual)
    if (error) campos.anio = error
  }
  if (Object.keys(campos).length) {
    throw new ErrorLibros(400, 'LIBRO_INVALIDO', Object.values(campos).join(' '), campos)
  }
  return libro
}

export function crearGestionLibros({ entorno = process.env, solicitar = fetch } = {}) {
  async function ejecutar(funcion, parametros) {
    const configuracion = obtenerConfiguracionPrivada(entorno)
    if (!configuracion) {
      throw new ErrorLibros(503, 'BIBLIOGRAFIA_NO_CONFIGURADA', 'La administración de libros aún no está configurada.')
    }
    try {
      const respuesta = await solicitarRpcPrivada(configuracion, funcion, parametros, solicitar)
      const contenido = await respuesta.json()
      if (!respuesta.ok) {
        const errores = {
          P0002: [404, 'LIBRO_NO_ENCONTRADO', 'No se encontró el libro.'],
          '23505': [409, 'LIBRO_DUPLICADO', 'Ya existe ese libro o una relación equivalente.'],
          '23503': [409, 'RELACION_INVALIDA', 'Una relación bibliográfica no existe o sigue en uso.'],
          '23514': [400, 'LIBRO_INVALIDO', 'Revisa los campos obligatorios y las relaciones del libro.'],
          '22023': [400, 'LIBRO_INVALIDO', 'Los datos bibliográficos no son válidos.'],
          P0001: [409, 'LIBRO_ES_FUENTE', 'El libro respalda una ficha astronómica. Revisa esa referencia antes de retirarlo.'],
          '40001': [409, 'PORTADA_MODIFICADA', 'La portada cambió durante la edición. Vuelve a abrir el libro y repite el cambio.'],
        }
        throw new ErrorLibros(...(errores[contenido?.code] ?? []))
      }
      const valido = funcion === 'listarLibrosAdministrativos'
        ? Array.isArray(contenido) && contenido.every((libro) => esIdLibroValido(libro?.id))
        : funcion === 'eliminarLibroAdministrativo' ? contenido === true
          : funcion === 'obtenerPortadaAdministrativa' ? contenido === null || typeof contenido === 'string'
            : esIdLibroValido(contenido?.id)
      if (!valido) throw new ErrorLibros()
      return contenido
    } catch (error) {
      if (error instanceof ErrorLibros) throw error
      throw new ErrorLibros()
    }
  }
  return {
    listar: (limite, desplazamiento) => ejecutar('listarLibrosAdministrativos', { p_limite: limite, p_desplazamiento: desplazamiento }),
    obtener: (id) => ejecutar('obtenerLibroAdministrativo', { p_id: id }),
    obtenerPortada: (id) => ejecutar('obtenerPortadaAdministrativa', { p_id: id }),
    guardar: (id, datos) => ejecutar(Object.hasOwn(datos, 'portada') ? 'guardarLibroConPortada' : 'guardarLibroAdministrativo', { p_id: id, p_datos: datos }),
    eliminar: (id) => ejecutar('eliminarLibroAdministrativo', { p_id: id }),
  }
}
