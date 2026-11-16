import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import { crearAplicacion } from '../index.js'
import { crearGestionLibros } from '../servicios/gestionLibros.js'

test('la API acepta portadas en alta y edición, y sirve solo la imagen disponible', async (contexto) => {
  const id = '7b1d605f-99fc-4156-aa14-49d75f89bb92'
  const jpeg = Buffer.concat([Buffer.from('ffd8ff', 'hex'), Buffer.alloc(70 * 1024), Buffer.from('ffd9', 'hex')])
  const datos = jpeg.toString('base64')
  const entorno = { SUPABASE_URL: 'https://proyecto.example.invalid', SUPABASE_SECRET_KEY: 'sb_secret_prueba' }
  const escrituras = []
  let portada
  const gestionLibros = crearGestionLibros({ entorno, solicitar: async (url, opciones) => {
    if (url.pathname.endsWith('/obtenerPortadaAdministrativa')) return Response.json(portada?.datos ?? null)
    assert.ok(url.pathname.endsWith('/guardarLibroConPortada'))
    const solicitud = JSON.parse(opciones.body)
    escrituras.push(solicitud)
    portada = solicitud.p_datos.portada
    return Response.json({ id })
  } })
  const consulta = { obtenerPortada: async (slug, libroId) => slug === 'luna' && libroId === id ? portada?.datos ?? null : null }
  const autenticacion = { exigirAdministrador: (peticion, respuesta, siguiente) => {
    if (peticion.get('Cookie') === 'sesion=prueba') return siguiente()
    respuesta.sendStatus(401)
  } }
  const servidor = crearAplicacion({ gestionLibros, consulta, autenticacion }).listen(0, '127.0.0.1')
  await once(servidor, 'listening')
  contexto.after(() => new Promise((resolver) => servidor.close(resolver)))
  const base = `http://127.0.0.1:${servidor.address().port}/api`
  const admin = `${base}/admin/libros`
  const privada = `${admin}/${id}/portada`
  const publica = `${base}/cuerpos-celestes/luna/libros/${id}/portada`
  const sesion = { Cookie: 'sesion=prueba' }
  const enviar = (url, method, body) => fetch(url, { method, headers: { ...sesion, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

  assert.equal((await fetch(privada)).status, 401)
  const alta = await enviar(admin, 'POST', { titulo: 'Libro', autores: ['Autora'], portada: { datos, x: 50, y: 50 } })
  assert.equal(alta.status, 201)
  assert.equal(escrituras[0].p_id, null)
  for (const imagen of [await fetch(privada, { headers: sesion }), await fetch(publica)]) {
    assert.equal(imagen.status, 200)
    assert.equal(imagen.headers.get('content-type'), 'image/jpeg')
    assert.deepEqual(Buffer.from(await imagen.arrayBuffer()), jpeg)
  }
  assert.equal((await fetch(publica.replace('/luna/', '/tierra/'))).status, 404)
  assert.equal((await enviar(`${admin}/${id}`, 'PATCH', { portada: { datos: 'R0lGODlh', x: 50, y: 50 } })).status, 400)
  assert.equal(escrituras.length, 1)
  assert.equal((await enviar(`${admin}/${id}`, 'PATCH', { portada: { datos, x: 20, y: 60 } })).status, 200)
  assert.equal(escrituras[1].p_datos.portada.y, 60)
  assert.equal((await enviar(`${admin}/${id}`, 'PATCH', { portada: null })).status, 200)
  assert.equal((await fetch(publica)).status, 404)
})
