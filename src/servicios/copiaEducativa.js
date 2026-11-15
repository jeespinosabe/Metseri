import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'

const BASE = 'metseri-sin-conexion'
const ALMACEN = 'contenido-publico'
const CLAVE = 'copia-completa'
const VERSION = 1

function esParCompleto(par) {
  const ficha = par?.ficha
  return typeof ficha?.descripcion === 'string' && Array.isArray(ficha.datos) && ficha.datos.length === 4
    && Array.isArray(ficha.curiosidades) && Array.isArray(par.libros)
}

function esCopiaCompatible(copia) {
  return copia?.version === VERSION && Number.isFinite(copia.fechaDescarga) && Number.isFinite(copia.inicio)
    && copia.cuerpos && Object.keys(copia.cuerpos).length === CUERPOS_CELESTES.length
    && CUERPOS_CELESTES.every(({ id }) => esParCompleto(copia.cuerpos[id]))
}

function abrirBase() {
  return new Promise((resolver, rechazar) => {
    const solicitud = globalThis.indexedDB.open(BASE, 1)
    let bloqueada = false
    solicitud.onupgradeneeded = () => solicitud.result.createObjectStore(ALMACEN)
    solicitud.onerror = () => rechazar(solicitud.error)
    solicitud.onblocked = () => {
      bloqueada = true
      rechazar(new Error('El almacenamiento está ocupado.'))
    }
    solicitud.onsuccess = () => {
      const base = solicitud.result
      if (bloqueada) base.close()
      else {
        base.onversionchange = () => base.close()
        resolver(base)
      }
    }
  })
}

async function usarCopia(modo, operar) {
  const base = await abrirBase()
  try {
    return await new Promise((resolver, rechazar) => {
      const transaccion = base.transaction(ALMACEN, modo)
      const almacen = transaccion.objectStore(ALMACEN)
      const solicitar = almacen.get(CLAVE)
      let resultado
      transaccion.oncomplete = () => resolver(resultado)
      transaccion.onabort = () => rechazar(transaccion.error ?? new Error('No se completó el almacenamiento.'))
      solicitar.onsuccess = () => {
        const copia = esCopiaCompatible(solicitar.result) ? solicitar.result : null
        resultado = operar(almacen, copia)
      }
    })
  } finally {
    base.close()
  }
}

export async function leerCopiaEducativa() {
  if (!globalThis.indexedDB) return null
  return usarCopia('readonly', (_almacen, copia) => copia)
}

export async function guardarCopiaEducativa({ cuerpos, inicio }) {
  const nueva = { version: VERSION, cuerpos, inicio, fechaDescarga: Date.now() }
  if (!esCopiaCompatible(nueva)) throw new Error('La copia educativa está incompleta.')

  return usarCopia('readwrite', (almacen, anterior) => {
    if (anterior && anterior.inicio >= inicio) return anterior
    almacen.put(nueva, CLAVE)
    return nueva
  })
}

export async function leerCuerpoDescargado(id) {
  const copia = await leerCopiaEducativa()
  const par = copia?.cuerpos[id]
  return par ? { ...par, fechaDescarga: copia.fechaDescarga } : null
}
