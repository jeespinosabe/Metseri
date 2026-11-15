import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { consultarContenido } from './consultaContenido.js'
import { consultarLibros } from './consultaLibros.js'
import { guardarCopiaEducativa } from './copiaEducativa.js'

const CUERPOS_POR_LOTE = 3

export async function descargarContenidoEducativo(alProgresar, { solicitar, guardar = guardarCopiaEducativa } = {}) {
  const inicio = Date.now()
  const controlador = new AbortController()
  const opciones = { solicitar, signal: controlador.signal }
  const cuerpos = {}
  let completados = 0

  async function descargarCuerpo(cuerpo) {
    try {
      const [ficha, libros] = await Promise.all([
        consultarContenido(cuerpo, opciones),
        consultarLibros(cuerpo.id, opciones),
      ])
      cuerpos[cuerpo.id] = { ficha, libros }
      completados += 1
      alProgresar(completados)
    } catch (error) {
      const mensaje = error.estado === 404 ? 'La ficha o sus recomendaciones aún no están publicadas' : 'No se pudo descargar el contenido'
      throw new Error(`${mensaje} de ${cuerpo.nombre}.`, { cause: error })
    }
  }

  try {
    for (let indice = 0; indice < CUERPOS_CELESTES.length; indice += CUERPOS_POR_LOTE) {
      await Promise.all(CUERPOS_CELESTES.slice(indice, indice + CUERPOS_POR_LOTE).map(descargarCuerpo))
    }
  } catch (error) {
    controlador.abort()
    throw error
  }

  try {
    return await guardar({ cuerpos, inicio })
  } catch {
    throw new Error('No se pudo guardar la descarga en este navegador.')
  }
}
