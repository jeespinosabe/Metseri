const CAMPOS_CUERPO = ['id', 'slug', 'nombre', 'clasificacion', 'subtitulo', 'tipo', 'planeta_id', 'planeta_slug', 'orden', 'imagen_path', 'imagen_alt']
const CAMPOS_LIBRO = ['libro_id', 'titulo', 'autor', 'editorial', 'anio', 'url_ficha', 'orden']
const CAMPOS_FICHA = ['id', 'slug', 'nombre', 'clasificacion', 'subtitulo', 'tipo', 'planeta', 'imagen', 'descripcion_breve', 'datos_principales', 'curiosidades', 'libros']

export class ErrorConsulta extends Error {
  constructor(codigo = 'CONTENIDO_NO_DISPONIBLE') {
    super(codigo === 'CONFIGURACION_NO_DISPONIBLE'
      ? 'La conexión de contenido no está configurada correctamente.'
      : 'No se pudo consultar el contenido. Inténtalo de nuevo más tarde.')
    this.name = 'ErrorConsulta'
    this.codigo = codigo
  }
}

export function esSlugValido(slug) {
  return typeof slug === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
}

function esObjeto(valor) {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor)
}

function contieneCampos(valor, campos) {
  return esObjeto(valor) && campos.every((campo) => Object.hasOwn(valor, campo))
}

function esFicha(valor) {
  return valor === null || (
    contieneCampos(valor, CAMPOS_FICHA)
    && typeof valor.id === 'string'
    && esSlugValido(valor.slug)
    && ['planeta', 'satelite'].includes(valor.tipo)
    && contieneCampos(valor.imagen, ['path', 'alt'])
    && (valor.datos_principales === null || esObjeto(valor.datos_principales))
    && Array.isArray(valor.curiosidades)
    && Array.isArray(valor.libros)
  )
}

export function crearConsultaSupabase({ entorno = process.env, solicitar = fetch } = {}) {
  function obtenerConfiguracion() {
    try {
      const url = new URL(entorno.SUPABASE_URL)
      const clave = entorno.SUPABASE_PUBLISHABLE_KEY
      if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash
        || url.pathname !== '/' || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(clave ?? '')) {
        throw new ErrorConsulta('CONFIGURACION_NO_DISPONIBLE')
      }
      return { url, clave }
    } catch {
      throw new ErrorConsulta('CONFIGURACION_NO_DISPONIBLE')
    }
  }

  async function consultar(recurso, parametros, validar) {
    const { url, clave } = obtenerConfiguracion()
    url.pathname = `/rest/v1/${recurso}`
    url.search = new URLSearchParams(parametros).toString()
    try {
      const respuesta = await solicitar(url, {
        method: 'GET',
        headers: { apikey: clave, Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
        redirect: 'error',
      })
      if (!respuesta.ok) throw new ErrorConsulta()
      const contenido = await respuesta.json()
      if (!validar(contenido)) throw new ErrorConsulta()
      return contenido
    } catch {
      // Los errores del proveedor y del transporte pueden contener datos internos.
      throw new ErrorConsulta()
    }
  }

  return {
    listarCuerpos() {
      return consultar('v_cuerpos_exploracion', {
        select: CAMPOS_CUERPO.join(','), order: 'orden.asc,slug.asc',
      }, (contenido) => Array.isArray(contenido) && contenido.every((cuerpo) =>
        contieneCampos(cuerpo, CAMPOS_CUERPO) && typeof cuerpo.id === 'string'
        && esSlugValido(cuerpo.slug) && ['planeta', 'satelite'].includes(cuerpo.tipo)))
    },

    obtenerFicha(slug) {
      return consultar('rpc/ficha_cuerpo', { p_slug: slug },
        (contenido) => esFicha(contenido) && (contenido === null || contenido.slug === slug))
    },

    listarLibros(slug) {
      return consultar('v_libros_por_cuerpo', {
        select: CAMPOS_LIBRO.join(','), cuerpo_slug: `eq.${slug}`, order: 'orden.asc,libro_id.asc',
      }, (contenido) => Array.isArray(contenido)
        && contenido.every((libro) => contieneCampos(libro, CAMPOS_LIBRO)))
    },
  }
}
