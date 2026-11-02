import assert from 'node:assert/strict'
import { it } from 'node:test'
import { obtenerCuerpoCeleste } from '../datos/cuerposCelestes.js'
import { FICHAS_PRUEBA } from '../pruebas/fichasPrueba.js'
import { adaptarContenido, iniciarConsultaContenido } from './consultaContenido.js'

const mercurio = obtenerCuerpoCeleste('mercurio')
const europa = obtenerCuerpoCeleste('europa')
const fichaMercurio = FICHAS_PRUEBA.find((ficha) => ficha.slug === mercurio.id)
const fichaEuropa = FICHAS_PRUEBA.find((ficha) => ficha.slug === europa.id)
const dejarResolver = () => new Promise((resolver) => setTimeout(resolver, 0))

it('los 48 datos conservan el texto del PDF y las identidades locales no se reemplazan', () => {
  for (const ficha of FICHAS_PRUEBA) {
    const cuerpo = obtenerCuerpoCeleste(ficha.slug)
    const copia = structuredClone(cuerpo)
    const contenido = adaptarContenido(cuerpo, ficha)
    assert.equal(contenido.descripcion, ficha.descripcion_breve)
    assert.deepEqual(contenido.curiosidades, ficha.curiosidades)
    assert.equal(contenido.invitacion, ficha.contenido_ficha.descubrir_libros)
    assert.equal(contenido.subtitulo, '')
    contenido.datos.forEach((dato, indice) => {
      assert.equal(dato.etiqueta, ficha.contenido_ficha.datos_principales[indice].etiqueta)
      assert.equal(`${dato.valor} ${dato.unidad}`, ficha.contenido_ficha.datos_principales[indice].valor)
    })
    assert.deepEqual(cuerpo, copia)
    assert.equal(Object.hasOwn(contenido, 'id'), false)
    assert.equal(Object.hasOwn(contenido, 'imagen'), false)
  }
})

it('rechaza slug, nombre, tipo y planeta ajenos a la seleccion', () => {
  for (const cambio of [{ slug: 'tierra' }, { nombre: 'Tierra' }, { tipo: 'satelite' }, { planeta: { slug: 'tierra' } }]) {
    assert.throws(() => adaptarContenido(mercurio, { ...fichaMercurio, ...cambio }))
  }
  assert.throws(() => adaptarContenido(europa, { ...fichaEuropa, planeta: { slug: 'saturno', nombre: 'Saturno' } }))
  assert.throws(() => adaptarContenido(mercurio, null))
})

it('campos ausentes no se convierten en cero ni en periodos normalizados de otra fuente', () => {
  const ficha = structuredClone(fichaMercurio)
  ficha.descripcion_breve = null
  ficha.curiosidades = [null, '', 'Una curiosidad publicada']
  ficha.contenido_ficha.datos_principales[2] = null
  ficha.contenido_ficha.datos_principales[3].valor = null
  const contenido = adaptarContenido(mercurio, ficha)
  assert.equal(contenido.descripcion, '')
  assert.deepEqual(contenido.curiosidades, ['Una curiosidad publicada'])
  assert.deepEqual(contenido.datos.slice(2), [null, null])
  assert.deepEqual(adaptarContenido(mercurio, { ...ficha, contenido_ficha: null }).datos, [null, null, null, null])
  assert.equal(adaptarContenido(mercurio, { ...ficha, contenido_ficha: null }).invitacion, '')
})

it('consulta solo la ficha relativa y entrega el contenido publicado', async (t) => {
  const estados = []
  const terminado = Promise.withResolvers()
  let ruta
  const cancelar = iniciarConsultaContenido(mercurio, (estado) => {
    estados.push(estado)
    if (estado.fase !== 'cargando') terminado.resolve()
  }, { solicitar: async (destino) => { ruta = destino; return Response.json(fichaMercurio) } })
  t.after(cancelar)
  await terminado.promise
  assert.equal(ruta, '/api/cuerpos-celestes/mercurio')
  assert.deepEqual(estados.map((estado) => estado.fase), ['cargando', 'disponible'])
  assert.equal(estados[1].ficha.datos[2].valor, '176')
})

it('cancelar una seleccion impide que una respuesta tardia sustituya la nueva ficha', async (t) => {
  const pendiente = Promise.withResolvers()
  const terminado = Promise.withResolvers()
  const estados = []
  let senal
  const cancelarPrimera = iniciarConsultaContenido(mercurio, (estado) => estados.push(estado), {
    solicitar: (_ruta, opciones) => { senal = opciones.signal; return pendiente.promise },
  })
  await dejarResolver()
  cancelarPrimera()
  const cancelarSegunda = iniciarConsultaContenido(europa, (estado) => {
    estados.push(estado)
    if (estado.fase === 'disponible') terminado.resolve()
  }, { solicitar: async () => Response.json(fichaEuropa) })
  t.after(cancelarSegunda)
  await terminado.promise
  pendiente.resolve(Response.json(fichaMercurio))
  await dejarResolver()
  assert.equal(senal.aborted, true)
  assert.equal(estados.filter((estado) => estado.fase === 'disponible').length, 1)
  assert.equal(estados.at(-1).ficha.descripcion, fichaEuropa.descripcion_breve)
})

it('cerrar o abandonar el modo antes de resolver no actualiza la ficha retirada', async () => {
  const pendiente = Promise.withResolvers()
  const estados = []
  const cancelar = iniciarConsultaContenido(mercurio, (estado) => estados.push(estado), {
    solicitar: () => pendiente.promise,
  })
  await dejarResolver()
  cancelar()
  pendiente.resolve(Response.json(fichaMercurio))
  await dejarResolver()
  assert.deepEqual(estados, [{ fase: 'cargando' }])
})

it('cancelar antes del inicio no consulta ni comunica estados', async () => {
  let consultas = 0
  let cambios = 0
  iniciarConsultaContenido(mercurio, () => { cambios += 1 }, {
    solicitar: async () => { consultas += 1; return Response.json(fichaMercurio) },
  })()
  await dejarResolver()
  assert.equal(consultas, 0)
  assert.equal(cambios, 0)
})

it('404, red, JSON invalido y cuerpo incorrecto producen error sin detalles internos', async () => {
  for (const solicitar of [
    async () => new Response(null, { status: 404 }),
    async () => { throw new Error('Detalle interno que no debe mostrarse') },
    async () => new Response('JSON incorrecto'),
    async () => Response.json(fichaEuropa),
  ]) {
    const terminado = Promise.withResolvers()
    const estados = []
    const cancelar = iniciarConsultaContenido(mercurio, (estado) => {
      estados.push(estado)
      if (estado.fase !== 'cargando') terminado.resolve()
    }, { solicitar })
    await terminado.promise
    cancelar()
    assert.deepEqual(estados, [{ fase: 'cargando' }, { fase: 'error' }])
  }
})

it('el plazo de espera termina incluso si el transporte ignora el aborto', async (t) => {
  const pendiente = Promise.withResolvers()
  const terminado = Promise.withResolvers()
  const estados = []
  let senal
  const cancelar = iniciarConsultaContenido(mercurio, (estado) => {
    estados.push(estado)
    if (estado.fase === 'error') terminado.resolve()
  }, { plazoMs: 15, solicitar: (_ruta, opciones) => { senal = opciones.signal; return pendiente.promise } })
  t.after(cancelar)
  await terminado.promise
  pendiente.resolve(Response.json(fichaMercurio))
  await dejarResolver()
  assert.equal(senal.aborted, true)
  assert.deepEqual(estados, [{ fase: 'cargando' }, { fase: 'error' }])
})
