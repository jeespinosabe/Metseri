import { once } from 'node:events'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { crearAplicacion } from '../index.js'
import { esSlugValido } from '../servicios/consultaSupabase.js'

export async function comprobarSupabase({
  aplicacion = crearAplicacion(), entorno = process.env, informar = console.log,
} = {}) {
  const variables = ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'CUERPO_PRUEBA_SLUG', 'CUERPO_PRUEBA_ID']
  const faltantes = variables.filter((nombre) => !entorno[nombre]?.trim())
  if (faltantes.length) throw new Error(`Completa en .env: ${faltantes.join(', ')}.`)
  const slug = entorno.CUERPO_PRUEBA_SLUG
  const id = entorno.CUERPO_PRUEBA_ID
  if (!esSlugValido(slug) || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) {
    throw new Error('El slug o UUID del cuerpo de prueba no es válido.')
  }

  const servidor = aplicacion.listen(0, '127.0.0.1')
  try {
    await once(servidor, 'listening')
    const origen = `http://127.0.0.1:${servidor.address().port}`
    async function consultar(ruta) {
      const respuesta = await fetch(`${origen}${ruta}`, { signal: AbortSignal.timeout(15000) })
      if (!respuesta.ok) throw new Error(`GET ${ruta}: HTTP ${respuesta.status}. Revisa conexión, configuración y publicación.`)
      return respuesta.json()
    }

    const cuerpos = await consultar('/api/cuerpos-celestes')
    if (!Array.isArray(cuerpos) || !cuerpos.some((cuerpo) => cuerpo.id === id && cuerpo.slug === slug)) {
      throw new Error('El listado no contiene el UUID y slug indicados. Comprueba que el cuerpo ya esté publicado.')
    }
    const ficha = await consultar(`/api/cuerpos-celestes/${slug}`)
    if (ficha.id !== id || ficha.slug !== slug) {
      throw new Error('La ficha no coincide con el UUID y slug del registro esperado.')
    }
    const libros = await consultar(`/api/cuerpos-celestes/${slug}/libros`)
    if (!Array.isArray(libros) || !Array.isArray(ficha.libros) || libros.length !== ficha.libros.length
      || libros.some((libro, indice) => !['libro_id', 'titulo', 'autor', 'editorial', 'anio', 'url_ficha', 'orden']
        .every((campo) => Object.hasOwn(libro, campo))
        || !ficha.libros.some((asociado) => asociado.titulo === libro.titulo
          && asociado.url === libro.url_ficha && asociado.autor === libro.autor
          && asociado.editorial === libro.editorial && asociado.anio === libro.anio)
        || (indice > 0 && libros[indice - 1].orden > libro.orden))) {
      throw new Error('Los libros no coinciden entre la ficha y las asociaciones consultadas.')
    }
    informar(`Listado: HTTP 200, ${cuerpos.length} cuerpos públicos. Ficha y libros: HTTP 200.`)
    informar(`Registro recuperado: ${slug}, UUID ${id}.`)
    informar(libros.length
      ? `Asociaciones bibliográficas comprobadas: ${libros.length}.`
      : 'Sin libros públicos asociados: la rama con libros reales permanece sin verificar.')
    informar('La exclusión de registros privados requiere casos conocidos y evidencia separada.')
    return { cuerpos: cuerpos.length, slug, id, libros: libros.length }
  } finally {
    await new Promise((resolver, rechazar) => servidor.close((error) => error ? rechazar(error) : resolver()))
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    await comprobarSupabase()
  } catch (error) {
    console.error(`Comprobación no completada: ${error.message}`)
    process.exitCode = 1
  }
}
