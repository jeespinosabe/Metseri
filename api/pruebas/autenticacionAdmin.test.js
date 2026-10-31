import test from 'node:test'
import assert from 'node:assert/strict'
import { crearAplicacion } from '../index.js'

const entornoPrueba = {
  ADMIN_USUARIO: 'admin-prueba',
  ADMIN_CONTRASENA: 'clave-segura-de-prueba-2026',
}

async function conServidor(app, ejecutar) {
  const servidor = app.listen(0)
  await new Promise((resolver) => servidor.once('listening', resolver))
  const origen = `http://127.0.0.1:${servidor.address().port}`
  try { await ejecutar(origen) } finally { await new Promise((resolver, rechazar) => servidor.close((error) => error ? rechazar(error) : resolver())) }
}

test('la administración exige sesión, acepta credenciales válidas y revoca el acceso al cerrar sesión', async () => {
  const app = crearAplicacion({ autenticacion: (await import('../servicios/autenticacionAdmin.js')).crearAutenticacionAdmin({ entorno: entornoPrueba }) })
  await conServidor(app, async (origen) => {
    const denegado = await fetch(`${origen}/api/admin`)
    assert.equal(denegado.status, 401)

    const inicio = await fetch(`${origen}/api/admin/sesion`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: entornoPrueba.ADMIN_USUARIO, contrasena: entornoPrueba.ADMIN_CONTRASENA }),
    })
    assert.equal(inicio.status, 200)
    assert.match(inicio.headers.get('set-cookie'), /HttpOnly/)
    assert.match(inicio.headers.get('set-cookie'), /SameSite=Strict/)
    const cookie = inicio.headers.get('set-cookie').split(';')[0]

    const autorizado = await fetch(`${origen}/api/admin`, { headers: { Cookie: cookie } })
    assert.equal(autorizado.status, 200)
    assert.equal((await autorizado.json()).acceso, 'autorizado')

    const salida = await fetch(`${origen}/api/admin/sesion`, { method: 'DELETE', headers: { Cookie: cookie } })
    assert.equal(salida.status, 200)
    assert.equal((await fetch(`${origen}/api/admin`, { headers: { Cookie: cookie } })).status, 401)
  })
})

test('credenciales incorrectas reciben un error claro y no crean una sesión', async () => {
  const app = crearAplicacion({ autenticacion: (await import('../servicios/autenticacionAdmin.js')).crearAutenticacionAdmin({ entorno: entornoPrueba }) })
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
  const { crearAutenticacionAdmin } = await import('../servicios/autenticacionAdmin.js')
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
