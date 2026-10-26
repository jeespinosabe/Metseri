import assert from 'node:assert/strict'
import { once } from 'node:events'
import { it } from 'node:test'
import { crearAplicacion } from './index.js'
import { crearConsultaSupabase, ErrorConsulta } from './consultaSupabase.js'
import { comprobarSupabase } from './comprobarSupabase.js'

const entornoPrueba = {
  SUPABASE_URL: 'https://proyecto.example.invalid',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_prueba_local',
  CUERPO_PRUEBA_SLUG: 'tierra',
  CUERPO_PRUEBA_ID: '00000000-0000-4000-8000-000000000001',
}
const tierra = {
  id: entornoPrueba.CUERPO_PRUEBA_ID, slug: 'tierra', nombre: 'Tierra',
  clasificacion: 'Planeta rocoso', subtitulo: null, tipo: 'planeta',
  planeta_id: null, planeta_slug: null, orden: 3,
  imagen_path: '/imagenes/planetas/tierra.webp', imagen_alt: 'Imagen de Tierra',
}
const luna = {
  ...tierra, id: '00000000-0000-4000-8000-000000000002', slug: 'luna', nombre: 'Luna',
  tipo: 'satelite', planeta_id: tierra.id, planeta_slug: tierra.slug, orden: 9,
}
const librosPrueba = [
  { libro_id: 'libro-1', titulo: 'Libro sintético A', autor: 'Autora A, Autor B', editorial: 'Editorial de prueba', anio: 2020, url_ficha: 'https://example.org/libro-a', orden: 1 },
  { libro_id: 'libro-2', titulo: 'Libro sintético B', autor: 'Autora C', editorial: 'Editorial de prueba', anio: 2021, url_ficha: 'https://example.org/libro-b', orden: 2 },
]

function crearFicha(cuerpo, libros = []) {
  return {
    id: cuerpo.id, slug: cuerpo.slug, nombre: cuerpo.nombre, clasificacion: cuerpo.clasificacion,
    subtitulo: null, tipo: cuerpo.tipo,
    planeta: cuerpo.tipo === 'satelite' ? { slug: 'tierra', nombre: 'Tierra' } : null,
    imagen: { path: cuerpo.imagen_path, alt: cuerpo.imagen_alt }, descripcion_breve: null,
    datos_principales: cuerpo.tipo === 'satelite'
      ? { diametro_km: null, distancia_planeta_km: null, rotacion_horas: -72, orbita_dias: 3 }
      : { diametro_km: null, distancia_sol_millones_km: null, rotacion_horas: null, orbita_dias: null },
    curiosidades: [],
    libros: libros.map((libro) => ({ titulo: libro.titulo, autor: libro.autor, editorial: libro.editorial, anio: libro.anio, url: libro.url_ficha })),
  }
}

function prepararConsulta({ cuerpos = [tierra, luna], libros = librosPrueba } = {}) {
  const solicitudes = []
  const consulta = crearConsultaSupabase({
    entorno: entornoPrueba,
    solicitar: async (url, opciones) => {
      solicitudes.push({ url, opciones })
      if (url.pathname === '/rest/v1/v_cuerpos_exploracion') return Response.json(cuerpos)
      if (url.pathname === '/rest/v1/v_libros_por_cuerpo') return Response.json(libros)
      assert.equal(url.pathname, '/rest/v1/rpc/ficha_cuerpo')
      const cuerpo = cuerpos.find((registro) => registro.slug === url.searchParams.get('p_slug'))
      return Response.json(cuerpo ? crearFicha(cuerpo, libros) : null)
    },
  })
  return { consulta, solicitudes }
}

async function iniciarServidor(contexto, consulta) {
  const servidor = crearAplicacion({ consulta }).listen(0, '127.0.0.1')
  await once(servidor, 'listening')
  contexto.after(() => new Promise((resolver, rechazar) => servidor.close((error) => error ? rechazar(error) : resolver())))
  return `http://127.0.0.1:${servidor.address().port}`
}

it('consulta solo los tres recursos permitidos con clave pública, GET, proyecciones y orden explícitos', async () => {
  const { consulta, solicitudes } = prepararConsulta()
  assert.deepEqual(await consulta.listarCuerpos(), [tierra, luna])
  assert.equal((await consulta.obtenerFicha('luna')).datos_principales.rotacion_horas, -72)
  assert.deepEqual(await consulta.listarLibros('tierra'), librosPrueba)
  for (const { opciones } of solicitudes) {
    assert.equal(opciones.method, 'GET')
    assert.deepEqual(opciones.headers, { apikey: entornoPrueba.SUPABASE_PUBLISHABLE_KEY, Accept: 'application/json' })
    assert.ok(opciones.signal instanceof AbortSignal)
    assert.equal(opciones.redirect, 'error')
  }
  assert.equal(solicitudes[0].url.searchParams.get('order'), 'orden.asc,slug.asc')
  assert.deepEqual(solicitudes[0].url.searchParams.get('select').split(','), Object.keys(tierra))
  assert.equal(solicitudes[1].url.searchParams.get('p_slug'), 'luna')
  assert.equal(solicitudes[2].url.searchParams.get('cuerpo_slug'), 'eq.tierra')
  assert.equal(solicitudes[2].url.searchParams.get('order'), 'orden.asc,libro_id.asc')
  assert.deepEqual(solicitudes[2].url.searchParams.get('select').split(','), Object.keys(librosPrueba[0]))
})

it('rechaza configuración ausente o inválida y claves privilegiadas antes de hacer solicitudes', async () => {
  let solicitudes = 0
  const configuraciones = [
    {}, { ...entornoPrueba, SUPABASE_PUBLISHABLE_KEY: '' },
    { ...entornoPrueba, SUPABASE_PUBLISHABLE_KEY: 'sb_secret_no_admitida' },
    { ...entornoPrueba, SUPABASE_PUBLISHABLE_KEY: 'eyJ_clave_legacy_no_admitida' },
    ...['http://example.org', 'https://usuario:clave@example.org', 'https://example.org?consulta=1',
      'https://example.org#seccion', 'https://example.org/ruta', 'no-es-url']
      .map((SUPABASE_URL) => ({ ...entornoPrueba, SUPABASE_URL })),
  ]
  for (const entorno of configuraciones) {
    const consulta = crearConsultaSupabase({ entorno, solicitar: () => { solicitudes += 1 } })
    await assert.rejects(consulta.listarCuerpos(), { codigo: 'CONFIGURACION_NO_DISPONIBLE' })
  }
  assert.equal(solicitudes, 0)
})

it('distingue lista vacía, ficha ausente, rechazo remoto, JSON inválido y forma incompatible', async () => {
  const { consulta } = prepararConsulta({ cuerpos: [], libros: [] })
  assert.deepEqual(await consulta.listarCuerpos(), [])
  assert.equal(await consulta.obtenerFicha('oculto'), null)
  const transportes = [
    () => new Response('detalle interno sensible', { status: 403 }),
    () => new Response('no es JSON'),
    () => Response.json({ mensaje: 'forma incorrecta' }),
    () => Response.json([{}]),
    () => { throw new Error(`error privado ${entornoPrueba.SUPABASE_PUBLISHABLE_KEY}`) },
    () => { throw new DOMException('cancelación privada', 'TimeoutError') },
  ]
  for (const solicitar of transportes) {
    const cliente = crearConsultaSupabase({ entorno: entornoPrueba, solicitar })
    await assert.rejects(cliente.listarCuerpos(), (error) => {
      assert.equal(error.codigo, 'CONTENIDO_NO_DISPONIBLE')
      assert.equal(error.message.includes(entornoPrueba.SUPABASE_PUBLISHABLE_KEY), false)
      assert.equal(error.message.includes('privad'), false)
      return true
    })
  }
  for (const contenido of [{}, [], crearFicha(luna)]) {
    const cliente = crearConsultaSupabase({ entorno: entornoPrueba, solicitar: () => Response.json(contenido) })
    await assert.rejects(cliente.obtenerFicha('tierra'), { codigo: 'CONTENIDO_NO_DISPONIBLE' })
  }
})

it('cancela una consulta externa que no responde al cumplirse cinco segundos', async () => {
  let cancelada = false
  const consulta = crearConsultaSupabase({
    entorno: entornoPrueba,
    solicitar: (url, { signal }) => new Promise((resolver, rechazar) => {
      const limitePrueba = setTimeout(() => resolver(Response.json([])), 6500)
      signal.addEventListener('abort', () => {
        cancelada = true
        clearTimeout(limitePrueba)
        rechazar(signal.reason)
      }, { once: true })
    }),
  })
  await assert.rejects(consulta.listarCuerpos(), { codigo: 'CONTENIDO_NO_DISPONIBLE' })
  assert.equal(cancelada, true)
})

it('por HTTP conserva el estado sin configuración y devuelve 503 en las rutas de contenido', async (contexto) => {
  const origen = await iniciarServidor(contexto, crearConsultaSupabase({ entorno: {} }))
  const estado = await fetch(`${origen}/api/estado`)
  assert.equal(estado.status, 200)
  assert.deepEqual(await estado.json(), { proyecto: 'Metseri', mensaje: 'API de Metseri funcionando correctamente', estado: 'activo' })
  for (const ruta of ['', '/tierra', '/tierra/libros']) {
    const respuesta = await fetch(`${origen}/api/cuerpos-celestes${ruta}`)
    assert.equal(respuesta.status, 503)
    assert.equal((await respuesta.json()).error.codigo, 'CONFIGURACION_NO_DISPONIBLE')
  }
})

it('por HTTP recupera planetas y satélites, nulos, unidades y libros conservando el contrato de base', async (contexto) => {
  const { consulta, solicitudes } = prepararConsulta()
  const origen = await iniciarServidor(contexto, consulta)
  const listado = await fetch(`${origen}/api/cuerpos-celestes`, { headers: { Authorization: 'Bearer no-reenviar', apikey: 'no-reenviar' } })
  assert.equal(listado.status, 200)
  assert.deepEqual(await listado.json(), [tierra, luna])
  for (const cuerpo of [tierra, luna]) {
    const respuesta = await fetch(`${origen}/api/cuerpos-celestes/${cuerpo.slug}`)
    assert.equal(respuesta.status, 200)
    assert.deepEqual(await respuesta.json(), crearFicha(cuerpo, librosPrueba))
  }
  const libros = await fetch(`${origen}/api/cuerpos-celestes/tierra/libros`)
  assert.equal(libros.status, 200)
  assert.deepEqual(await libros.json(), librosPrueba)
  assert.equal(solicitudes.at(-2).url.pathname, '/rest/v1/rpc/ficha_cuerpo')
  assert.equal(solicitudes.at(-1).url.pathname, '/rest/v1/v_libros_por_cuerpo')
  assert.equal(solicitudes[0].opciones.headers.Authorization, undefined)
  assert.equal(solicitudes[0].opciones.headers.apikey, entornoPrueba.SUPABASE_PUBLISHABLE_KEY)
  const cabecera = await fetch(`${origen}/api/cuerpos-celestes/tierra`, { method: 'HEAD' })
  assert.equal(cabecera.status, 200)
  assert.equal(await cabecera.text(), '')
})

it('diferencia un cuerpo sin libros de uno no visible y evita consultar asociaciones del segundo', async (contexto) => {
  const { consulta, solicitudes } = prepararConsulta({ libros: [] })
  const origen = await iniciarServidor(contexto, consulta)
  const vacios = await fetch(`${origen}/api/cuerpos-celestes/tierra/libros`)
  assert.equal(vacios.status, 200)
  assert.deepEqual(await vacios.json(), [])
  for (const slug of ['inexistente', 'sin-publicar']) {
    for (const sufijo of ['', '/libros']) {
      const respuesta = await fetch(`${origen}/api/cuerpos-celestes/${slug}${sufijo}`)
      assert.equal(respuesta.status, 404)
      assert.deepEqual(await respuesta.json(), { error: { codigo: 'CUERPO_NO_ENCONTRADO', mensaje: 'No se encontró el cuerpo celeste.' } })
    }
  }
  assert.equal(solicitudes.filter(({ url }) => url.pathname.endsWith('/v_libros_por_cuerpo')).length, 1)
  const clienteVacio = prepararConsulta({ cuerpos: [] })
  const origenVacio = await iniciarServidor(contexto, clienteVacio.consulta)
  const listado = await fetch(`${origenVacio}/api/cuerpos-celestes`)
  assert.equal(listado.status, 200)
  assert.deepEqual(await listado.json(), [])
})

it('slugs inválidos, codificación rota y métodos de escritura no llegan a Supabase', async (contexto) => {
  const { consulta, solicitudes } = prepararConsulta()
  const origen = await iniciarServidor(contexto, consulta)
  for (const slug of ['TIERRA', 'tierra%20nueva', 'tierra,or', '%E0%A4']) {
    const respuesta = await fetch(`${origen}/api/cuerpos-celestes/${slug}`)
    assert.equal(respuesta.status, 400)
    assert.equal((await respuesta.json()).error.codigo, 'SLUG_INVALIDO')
  }
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    for (const ruta of ['', '/tierra', '/tierra/libros']) {
      const respuesta = await fetch(`${origen}/api/cuerpos-celestes${ruta}`, { method, body: '{JSON inválido', headers: { 'Content-Type': 'application/json' } })
      assert.equal(respuesta.status, 405)
      assert.equal(respuesta.headers.get('allow'), 'GET, HEAD')
      assert.equal((await respuesta.json()).error.codigo, 'METODO_NO_PERMITIDO')
    }
  }
  assert.equal(solicitudes.length, 0)
})

it('los fallos de las tres rutas devuelven 503 saneado y nunca una lista vacía', async (contexto) => {
  let llamadas = 0
  const consulta = crearConsultaSupabase({ entorno: entornoPrueba, solicitar: () => {
    llamadas += 1
    throw new Error(`secreto ${entornoPrueba.SUPABASE_PUBLISHABLE_KEY}`)
  } })
  const origen = await iniciarServidor(contexto, consulta)
  for (const ruta of ['', '/tierra', '/tierra/libros']) {
    const respuesta = await fetch(`${origen}/api/cuerpos-celestes${ruta}`)
    assert.equal(respuesta.status, 503)
    assert.deepEqual(await respuesta.json(), { error: { codigo: 'CONTENIDO_NO_DISPONIBLE', mensaje: new ErrorConsulta().message } })
  }
  assert.equal(llamadas, 3)
  const { consulta: disponible } = prepararConsulta()
  const origenLibros = await iniciarServidor(contexto, { ...disponible, listarLibros() { throw new Error('error privado') } })
  const respuesta = await fetch(`${origenLibros}/api/cuerpos-celestes/tierra/libros`)
  assert.equal(respuesta.status, 503)
  assert.equal((await respuesta.json()).error.codigo, 'CONTENIDO_NO_DISPONIBLE')
})

it('la comprobación integrada valida UUID/slug y coherencia bibliográfica mediante HTTP', async () => {
  for (const libros of [librosPrueba, []]) {
    const mensajes = []
    const { consulta } = prepararConsulta({ libros })
    const resultado = await comprobarSupabase({ aplicacion: crearAplicacion({ consulta }), entorno: entornoPrueba, informar: (mensaje) => mensajes.push(mensaje) })
    assert.deepEqual(resultado, { cuerpos: 2, slug: 'tierra', id: tierra.id, libros: libros.length })
    if (!libros.length) assert.ok(mensajes.some((mensaje) => mensaje.includes('permanece sin verificar')))
  }
})

it('la comprobación integrada no acredita configuración ausente, lista vacía, UUID distinto o ficha inaccesible', async () => {
  await assert.rejects(comprobarSupabase({ entorno: {} }), /Completa en .env/)
  await assert.rejects(comprobarSupabase({ entorno: { ...entornoPrueba, CUERPO_PRUEBA_ID: 'no-es-uuid' } }), /no es válido/)
  const configuraciones = [
    { consulta: prepararConsulta({ cuerpos: [] }).consulta, entorno: entornoPrueba },
    { consulta: prepararConsulta().consulta, entorno: { ...entornoPrueba, CUERPO_PRUEBA_ID: luna.id } },
    { consulta: { ...prepararConsulta().consulta, obtenerFicha: async () => null }, entorno: entornoPrueba },
    { consulta: { ...prepararConsulta().consulta, obtenerFicha: async () => crearFicha(luna) }, entorno: entornoPrueba },
    { consulta: { ...prepararConsulta().consulta, listarLibros: async () => [] }, entorno: entornoPrueba },
    { consulta: crearConsultaSupabase({ entorno: {} }), entorno: entornoPrueba },
  ]
  for (const { consulta, entorno } of configuraciones) {
    await assert.rejects(comprobarSupabase({ aplicacion: crearAplicacion({ consulta }), entorno, informar: () => assert.fail('No debe acreditar éxito') }))
  }
})
