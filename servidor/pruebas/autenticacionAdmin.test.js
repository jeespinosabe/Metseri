import test from 'node:test'
import assert from 'node:assert/strict'
import { crearAplicacion } from '../../api/index.js'
import { crearAutenticacionAdmin } from '../servicios/autenticacionAdmin.js'

const entornoPrueba = {
  ADMIN_USUARIO: 'admin-prueba',
  ADMIN_CONTRASENA: 'clave-segura-de-prueba-2026',
  SUPABASE_URL: 'https://proyecto.example.invalid',
  SUPABASE_SECRET_KEY: 'sb_secret_prueba',
}

async function conServidor(app, ejecutar) {
  const servidor = app.listen(0)
  await new Promise((resolver) => servidor.once('listening', resolver))
  const origen = `http://127.0.0.1:${servidor.address().port}`
  try { await ejecutar(origen) } finally { await new Promise((resolver, rechazar) => servidor.close((error) => error ? rechazar(error) : resolver())) }
}

test('dos instancias comparten la sesión, sirven portadas en paralelo y reconocen la revocación', async () => {
  const sesiones = new Set()
  const solicitar = async (url, opciones) => {
    assert.equal(url.origin, entornoPrueba.SUPABASE_URL)
    assert.equal(opciones.headers.apikey, entornoPrueba.SUPABASE_SECRET_KEY)
    const { p_huella: huella } = JSON.parse(opciones.body)
    assert.match(huella, /^[0-9a-f]{64}$/)
    switch (url.pathname) {
      case '/rest/v1/rpc/crearSesionAdministrativa': sesiones.add(huella); return Response.json(true)
      case '/rest/v1/rpc/consultarSesionAdministrativa': return Response.json(sesiones.has(huella))
      case '/rest/v1/rpc/revocarSesionAdministrativa': sesiones.delete(huella); return Response.json(true)
      default: assert.fail('Consulta de sesión inesperada')
    }
  }
  const crearInstancia = () => crearAplicacion({
    autenticacion: crearAutenticacionAdmin({ entorno: entornoPrueba, solicitar }),
    gestionLibros: { obtenerPortada: async () => Buffer.from('ffd8ff00ffd9', 'hex').toString('base64') },
  })

  await conServidor(crearInstancia(), (primera) => conServidor(crearInstancia(), async (segunda) => {
    const denegado = await fetch(`${segunda}/api/admin`)
    assert.equal(denegado.status, 401)

    const inicio = await fetch(`${primera}/api/admin/sesion`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: entornoPrueba.ADMIN_USUARIO, contrasena: entornoPrueba.ADMIN_CONTRASENA }),
    })
    assert.equal(inicio.status, 200)
    assert.match(inicio.headers.get('set-cookie'), /HttpOnly/)
    assert.match(inicio.headers.get('set-cookie'), /SameSite=Strict/)
    assert.match(inicio.headers.get('set-cookie'), /Max-Age=28800/)
    const cookie = inicio.headers.get('set-cookie').split(';')[0]
    assert.equal(sesiones.size, 1)

    const opciones = { headers: { Cookie: cookie } }
    const autorizado = await fetch(`${segunda}/api/admin`, opciones)
    assert.equal(autorizado.status, 200)
    assert.equal((await autorizado.json()).acceso, 'autorizado')
    const ruta = '/api/admin/libros/7b1d605f-99fc-4156-aa14-49d75f89bb92/portada'
    const imagenes = await Promise.all([primera, segunda, primera, segunda].map((origen) => fetch(origen + ruta, opciones)))
    await Promise.all(imagenes.map(async (imagen) => {
      assert.equal(imagen.status, 200)
      assert.equal(imagen.headers.get('content-type'), 'image/jpeg')
      await imagen.arrayBuffer()
    }))

    const salida = await fetch(`${segunda}/api/admin/sesion`, { ...opciones, method: 'DELETE' })
    assert.equal(salida.status, 200)
    assert.match(salida.headers.get('set-cookie'), /Max-Age=0/)
    assert.equal(sesiones.size, 0)
    assert.equal((await fetch(primera + ruta, opciones)).status, 401)
    assert.equal((await fetch(segunda + ruta, opciones)).status, 401)
  }))
})

test('credenciales incorrectas reciben un error claro y no crean una sesión', async () => {
  const app = crearAplicacion({ autenticacion: crearAutenticacionAdmin({ entorno: entornoPrueba, solicitar: () => assert.fail('Credencial inválida consultó Supabase') }) })
  await conServidor(app, async (origen) => {
    const respuesta = await fetch(`${origen}/api/admin/sesion`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: entornoPrueba.ADMIN_USUARIO, contrasena: 'incorrecta' }),
    })
    assert.equal(respuesta.status, 401)
    assert.equal((await respuesta.json()).error.codigo, 'CREDENCIALES_INVALIDAS')
    assert.equal(respuesta.headers.get('set-cookie'), null)
  })
})

test('la sesión no se crea si falta la configuración administrativa', async () => {
  const app = crearAplicacion({ autenticacion: crearAutenticacionAdmin({ entorno: {} }) })
  await conServidor(app, async (origen) => {
    const respuesta = await fetch(`${origen}/api/admin/sesion`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: 'admin', contrasena: 'cualquier-cosa' }),
    })
    assert.equal(respuesta.status, 503)
    assert.equal((await respuesta.json()).error.codigo, 'AUTENTICACION_NO_CONFIGURADA')
  })
})

test('si falla el almacenamiento compartido, la API devuelve 503 y conserva la cookie para reintentar el cierre', async () => {
  const autenticacion = crearAutenticacionAdmin({ entorno: entornoPrueba, solicitar: async () => new Response('detalle privado', { status: 500 }) })
  await conServidor(crearAplicacion({ autenticacion }), async (origen) => {
    const inicio = await fetch(`${origen}/api/admin/sesion`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: entornoPrueba.ADMIN_USUARIO, contrasena: entornoPrueba.ADMIN_CONTRASENA }),
    })
    const headers = { Cookie: `metseri_admin=${'A'.repeat(43)}` }
    const lectura = await fetch(`${origen}/api/admin`, { headers })
    const cierre = await fetch(`${origen}/api/admin/sesion`, { method: 'DELETE', headers })
    for (const respuesta of [inicio, lectura, cierre]) {
      assert.equal(respuesta.status, 503)
      assert.equal(respuesta.headers.get('set-cookie'), null)
      assert.equal((await respuesta.json()).error.codigo, 'SESION_NO_DISPONIBLE')
    }
  })
})
