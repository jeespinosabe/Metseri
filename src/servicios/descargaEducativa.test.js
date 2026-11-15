import assert from 'node:assert/strict'
import { it } from 'node:test'
import { setImmediate as esperarTurno } from 'node:timers/promises'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { FICHAS_PRUEBA } from '../pruebas/fichasPrueba.js'
import { consultarContenido, iniciarConsultaContenido } from './consultaContenido.js'
import { consultarLibros, iniciarConsultaLibros } from './consultaLibros.js'
import { descargarContenidoEducativo } from './descargaEducativa.js'

const base = '/api/cuerpos-celestes/'
const cuerpo = CUERPOS_CELESTES[0]
const libro = {
  libro_id: 'ecDC008b-4283-46ae-8d41-97bb6fc5dc57',
  titulo: 'Astronomía de prueba',
  url_ficha: 'https://example.com/libro',
}

function responder(ruta) {
  const [slug, libros] = ruta.slice(base.length).split('/')
  if (libros) return Response.json(slug === cuerpo.id ? [] : [libro, { ...libro, libro_id: 'invalido' }, libro])
  return Response.json(FICHAS_PRUEBA.find((ficha) => ficha.slug === slug))
}

it('prepara los 24 recursos públicos frescos y guarda una sola copia con los doce pares', async () => {
  const solicitudes = []
  const progreso = []
  let escrituras = 0
  const copia = await descargarContenidoEducativo((cantidad) => progreso.push(cantidad), {
    solicitar: async (ruta, opciones) => {
      solicitudes.push(ruta)
      assert.equal(opciones.credentials, 'omit')
      assert.equal(opciones.cache, 'no-store')
      return responder(ruta)
    },
    guardar: async ({ cuerpos }) => { escrituras += 1; return cuerpos },
  })
  assert.deepEqual(new Set(solicitudes), new Set(CUERPOS_CELESTES.flatMap(({ id }) => [base + id, base + id + '/libros'])))
  assert.equal(solicitudes.length, 24)
  assert.deepEqual(progreso, Array.from({ length: 12 }, (_, indice) => indice + 1))
  assert.equal(escrituras, 1)
  for (const { id } of CUERPOS_CELESTES) {
    assert.equal(copia[id].ficha.descripcion, FICHAS_PRUEBA.find((ficha) => ficha.slug === id).descripcion_breve)
    assert.deepEqual(copia[id].libros.map(({ titulo }) => titulo), id === cuerpo.id ? [] : [libro.titulo])
  }
})

it('un fallo HTTP, una ficha incompatible o una interrupción conservan la descarga anterior', async () => {
  for (const fallar of [
    () => new Response(null, { status: 404 }),
    () => responder(base + CUERPOS_CELESTES[1].id),
    () => { throw new TypeError('Falló la conexión') },
  ]) {
    let escrituras = 0
    await assert.rejects(descargarContenidoEducativo(() => {}, {
      solicitar: async (ruta) => ruta === base + cuerpo.id ? fallar() : responder(ruta),
      guardar: async () => { escrituras += 1 },
    }), new RegExp(cuerpo.nombre))
    assert.equal(escrituras, 0)
  }
})

it('distingue HTTP, contenido inválido, transporte y cancelación', async () => {
  await assert.rejects(consultarContenido(cuerpo, { solicitar: async () => new Response(null, { status: 503 }) }), { motivo: 'http', estado: 503 })
  await assert.rejects(consultarLibros(cuerpo.id, { solicitar: async () => Response.json({}) }), { motivo: 'datos' })
  await assert.rejects(consultarContenido(cuerpo, { solicitar: async () => { throw new TypeError() } }), { motivo: 'transporte' })
  const controlador = new AbortController()
  const consulta = consultarLibros(cuerpo.id, { signal: controlador.signal, solicitar: () => new Promise(() => {}) })
  controlador.abort()
  await assert.rejects(consulta, { motivo: 'cancelada' })
})

it('usa la copia solo tras un fallo de transporte y distingue libros guardados vacíos', async () => {
  const ficha = await consultarContenido(cuerpo, { solicitar: async (ruta) => responder(ruta) })
  const copia = { ficha, libros: [], fechaDescarga: 1705800000000 }
  let lecturas = 0
  const leerCopia = async () => { lecturas += 1; return copia }
  const obtenerLibros = (solicitar, leer = leerCopia) => new Promise((resolver) => {
    iniciarConsultaLibros(cuerpo.id, (estado) => {
      if (estado.fase !== 'cargando') resolver(estado)
    }, { solicitar, leerCopia: leer })
  })
  const falloRed = async () => { throw new TypeError() }
  assert.deepEqual(await obtenerLibros(falloRed), { fase: 'disponible', libros: [], fechaDescarga: copia.fechaDescarga })
  assert.deepEqual(await obtenerLibros(falloRed, async () => null), { fase: 'error', libros: [] })
  assert.deepEqual(await obtenerLibros(async (ruta) => responder(ruta)), { fase: 'disponible', libros: [] })
  for (const estado of [404, 503]) {
    assert.deepEqual(await obtenerLibros(async () => new Response(null, { status: estado })), { fase: 'error', libros: [] })
  }
  assert.deepEqual(await obtenerLibros(async () => Response.json({})), { fase: 'error', libros: [] })
  assert.equal(lecturas, 1)
})

it('ignora una lectura descargada que termina después de cancelar la selección', async () => {
  const empezarLectura = Promise.withResolvers()
  const terminarLectura = Promise.withResolvers()
  const estados = []
  const cancelar = iniciarConsultaContenido(cuerpo, (estado) => estados.push(estado), {
    solicitar: async () => { throw new TypeError() },
    leerCopia: () => { empezarLectura.resolve(); return terminarLectura.promise },
  })
  await empezarLectura.promise
  cancelar()
  terminarLectura.resolve({ ficha: {}, fechaDescarga: 1705800000000 })
  await esperarTurno()
  assert.deepEqual(estados, [{ fase: 'cargando' }])
})
