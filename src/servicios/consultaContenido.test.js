import assert from 'node:assert/strict'
import { it } from 'node:test'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { crearFichaPrueba } from '../pruebas/fichasPrueba.js'
import { adaptarFicha, crearConsultaContenido, obtenerMensajeContenido } from './consultaContenido.js'

it('adapta los doce slugs sin sustituir identidad, relación ni recursos locales por el UUID remoto', () => {
  for (const cuerpo of CUERPOS_CELESTES) {
    const datos = crearFichaPrueba(cuerpo)
    const ficha = adaptarFicha(datos, cuerpo)
    assert.equal(ficha.id, cuerpo.id)
    assert.equal(ficha.idRemoto, datos.id)
    for (const campo of ['imagen', 'imagenAlternativa', 'credito', 'imagenOriginal', 'planetaId']) assert.equal(ficha[campo], cuerpo[campo])
    assert.equal(ficha.descripcion, datos.descripcion_breve)
    assert.equal(ficha.rotacionHoras, -72)
    assert.equal(ficha.libros[0].titulo, datos.libros[0].titulo)
    assert.equal(ficha.distanciaSolMillonesKm, cuerpo.tipo === 'planeta' ? 98.7 : undefined)
    assert.equal(ficha.distanciaPlanetaKm, cuerpo.tipo === 'satelite' ? 56789 : undefined)
  }
})

it('distingue nulos, cero y números inválidos; descarta libros inutilizables manteniendo orden y metadatos', () => {
  const cuerpo = CUERPOS_CELESTES[2]
  const datos = crearFichaPrueba(cuerpo)
  datos.datos_principales = { diametro_km: 0, rotacion_horas: NaN, orbita_dias: '12', distancia_sol_millones_km: null }
  datos.subtitulo = null
  datos.descripcion_breve = null
  datos.curiosidades = []
  datos.libros.push({ titulo: 'Sin destino' }, { titulo: 'Protocolo inválido', url: 'javascript:alert(1)' }, { titulo: 'Otro libro', url: 'https://example.org/otro' })
  const ficha = adaptarFicha(datos, cuerpo)
  assert.equal(ficha.diametroKm, 0)
  assert.equal(ficha.rotacionHoras, null)
  assert.equal(ficha.orbitaDias, null)
  assert.equal(ficha.descripcion, '')
  assert.equal(ficha.subtitulo, '')
  assert.deepEqual(ficha.libros.map((libro) => libro.titulo), ['Libro de prueba de Tierra', 'Otro libro'])
  assert.equal(ficha.libros[0].anio, 2020)
  assert.equal(ficha.libros[1].anio, null)
  datos.datos_principales = null
  assert.equal(adaptarFicha(datos, cuerpo).diametroKm, null)
})

it('rechaza cuerpos, tipos, relaciones y estructuras incompatibles', () => {
  const luna = CUERPOS_CELESTES[8]
  for (const cambio of [{ slug: 'tierra' }, { tipo: 'planeta' }, { planeta: { slug: 'jupiter' } }, { id: 'tierra' }, { curiosidades: [null] }, { libros: null }, { datos_principales: [] }]) {
    assert.throws(() => adaptarFicha({ ...crearFichaPrueba(luna), ...cambio }, luna))
  }
})

it('ignora respuestas fuera de orden, no duplica selección y cancela al cerrar incluso con transporte que ignora abort', async (t) => {
  const pendientes = []
  const consulta = crearConsultaContenido({ solicitar: (url, opciones) => new Promise((resolver) => pendientes.push({ url, opciones, resolver })) })
  t.after(() => consulta.destruir())
  const tierra = CUERPOS_CELESTES[2], luna = CUERPOS_CELESTES[8]
  const primera = consulta.seleccionar(tierra)
  consulta.seleccionar(tierra)
  assert.equal(pendientes.length, 1)
  const segunda = consulta.seleccionar(luna)
  assert.equal(pendientes[0].opciones.signal.aborted, true)
  pendientes[1].resolver(Response.json(crearFichaPrueba(luna)))
  await segunda
  pendientes[0].resolver(Response.json(crearFichaPrueba(tierra)))
  await primera
  assert.equal(consulta.obtenerEstado().ficha.id, 'luna')
  assert.equal(pendientes[1].url, '/api/cuerpos-celestes/luna')
  const tercera = consulta.seleccionar(tierra)
  await consulta.cancelar()
  pendientes[2].resolver(Response.json(crearFichaPrueba(tierra)))
  await tercera
  assert.equal(consulta.obtenerEstado().fase, 'sin-seleccion')
})

it('distingue 404, error HTTP, red, JSON y formato, y permite recuperarse sin perder el cuerpo', async (t) => {
  const cuerpo = CUERPOS_CELESTES[2]
  let respuesta = () => Response.json({}, { status: 404 })
  const consulta = crearConsultaContenido({ solicitar: () => respuesta() })
  t.after(() => consulta.destruir())
  await consulta.seleccionar(cuerpo)
  assert.equal(consulta.obtenerEstado().fase, 'no-disponible')
  assert.match(obtenerMensajeContenido(consulta.obtenerEstado(), cuerpo.nombre), /no está disponible/)
  for (const fallo of [() => Response.json({}, { status: 503 }), () => Promise.reject(new Error('Interno')), () => new Response('{'), () => Response.json({})]) {
    respuesta = fallo
    await consulta.reintentar()
    assert.equal(consulta.obtenerEstado().fase, 'error')
    assert.doesNotMatch(obtenerMensajeContenido(consulta.obtenerEstado(), cuerpo.nombre), /Interno|503/)
  }
  respuesta = () => Response.json(crearFichaPrueba(cuerpo))
  await consulta.reintentar()
  assert.equal(consulta.obtenerEstado().fase, 'disponible')
  assert.equal(consulta.obtenerEstado().slug, 'tierra')
})

it('acota la espera a doce segundos y limpia temporizadores y suscripciones', async () => {
  const programados = [], cancelados = []
  const consulta = crearConsultaContenido({ solicitar: () => new Promise(() => {}),
    programar: (accion, plazo) => { programados.push({ accion, plazo }); return programados.length },
    cancelarTemporizador: (id) => cancelados.push(id) })
  let cambios = 0
  const retirar = consulta.suscribirse(() => cambios++)
  const pendiente = consulta.seleccionar(CUERPOS_CELESTES[0])
  assert.equal(consulta.obtenerEstado().fase, 'cargando')
  assert.equal(programados[0].plazo, 12000)
  programados[0].accion()
  await pendiente
  assert.equal(consulta.obtenerEstado().fase, 'error')
  assert.ok(cancelados.includes(1))
  retirar()
  const anteriores = cambios
  consulta.destruir()
  assert.equal(cambios, anteriores)
  await consulta.seleccionar(CUERPOS_CELESTES[1])
  assert.equal(consulta.obtenerEstado().fase, 'sin-seleccion')
})
