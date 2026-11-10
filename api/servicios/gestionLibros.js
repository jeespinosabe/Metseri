import { esSlugValido } from './consultaSupabase.js'

const CAMPOS = ['titulo', 'editorial', 'anio', 'url_ficha', 'activo', 'verificado', 'autores', 'cuerpos']
export const esIdLibroValido = (valor) => typeof valor === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor)

export class ErrorLibros extends Error {
  constructor(estado = 503, codigo = 'BIBLIOGRAFIA_NO_DISPONIBLE', mensaje = 'No se pudo acceder a los libros. Inténtalo más tarde.') {
    super(mensaje)
    this.estado = estado
    this.codigo = codigo
  }
}

export function validarLibro(datos, parcial = false) {
  const invalido = () => { throw new ErrorLibros(400, 'LIBRO_INVALIDO', 'Revisa los campos del libro, sus autores y cuerpos celestes.') }
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)
    || !Object.keys(datos).length || Object.keys(datos).some((campo) => !CAMPOS.includes(campo))) invalido()
  const libro = { ...datos }
  for (const campo of ['titulo', 'editorial']) {
    if (!Object.hasOwn(libro, campo)) continue
    if (campo === 'editorial' && libro[campo] === null) continue
    if (typeof libro[campo] !== 'string' || !libro[campo].trim() || libro[campo].length > 500) invalido()
    libro[campo] = libro[campo].trim()
  }
  if (!parcial && !libro.titulo) invalido()
  if (Object.hasOwn(libro, 'anio') && libro.anio !== null
    && (!Number.isInteger(libro.anio) || libro.anio < 1000 || libro.anio > 2100)) invalido()
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
  if (!parcial && !Object.hasOwn(libro, 'autores')) invalido()
  if (Object.hasOwn(libro, 'autores')) {
    if (!Array.isArray(libro.autores) || !libro.autores.length || libro.autores.length > 50) invalido()
    libro.autores = libro.autores.map((nombre) => {
      if (typeof nombre !== 'string' || !nombre.trim() || nombre.length > 200) invalido()
      return nombre.trim()
    })
    if (new Set(libro.autores.map((nombre) => nombre.toLowerCase())).size !== libro.autores.length) invalido()
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
  return libro
}

export function crearGestionLibros({ entorno = process.env, solicitar = fetch } = {}) {
  async function ejecutar(funcion, parametros) {
    let url
    const clave = entorno.SUPABASE_SECRET_KEY
    try {
      url = new URL(entorno.SUPABASE_URL)
      if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash
        || url.pathname !== '/' || !/^sb_secret_[A-Za-z0-9_-]+$/.test(clave ?? '')) throw new Error()
    } catch {
      throw new ErrorLibros(503, 'BIBLIOGRAFIA_NO_CONFIGURADA', 'La administración de libros aún no está configurada.')
    }
    url.pathname = `/rest/v1/rpc/${funcion}`
    try {
      const respuesta = await solicitar(url, {
        method: 'POST', headers: { apikey: clave, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(parametros), signal: AbortSignal.timeout(5000), redirect: 'error',
      })
      const contenido = await respuesta.json()
      if (!respuesta.ok) {
        const errores = {
          P0002: [404, 'LIBRO_NO_ENCONTRADO', 'No se encontró el libro.'],
          '23505': [409, 'LIBRO_DUPLICADO', 'Ya existe ese libro o una relación equivalente.'],
          '23503': [409, 'RELACION_INVALIDA', 'Una relación bibliográfica no existe o sigue en uso.'],
          '23514': [400, 'LIBRO_INVALIDO', 'Revisa los campos obligatorios y las relaciones del libro.'],
          '22023': [400, 'LIBRO_INVALIDO', 'Los datos bibliográficos no son válidos.'],
          P0001: [409, 'LIBRO_ES_FUENTE', 'El libro respalda una ficha astronómica. Revisa esa referencia antes de retirarlo.'],
        }
        throw new ErrorLibros(...(errores[contenido?.code] ?? []))
      }
      const valido = funcion === 'listarLibrosAdministrativos'
        ? Array.isArray(contenido) && contenido.every((libro) => esIdLibroValido(libro?.id))
        : funcion === 'eliminarLibroAdministrativo' ? contenido === true : esIdLibroValido(contenido?.id)
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
    guardar: (id, datos) => ejecutar('guardarLibroAdministrativo', { p_id: id, p_datos: datos }),
    eliminar: (id) => ejecutar('eliminarLibroAdministrativo', { p_id: id }),
  }
}
