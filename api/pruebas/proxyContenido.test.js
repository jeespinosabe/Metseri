import assert from 'node:assert/strict'
import { once } from 'node:events'
import { it } from 'node:test'
import { createServer } from 'vite'
import { crearAplicacion } from '../index.js'

it('Vite usa PORT para estado y sesión administrativa sin publicar secretos en el cliente', async (t) => {
  const api = crearAplicacion().listen(0, '127.0.0.1')
  await once(api, 'listening')
  t.after(() => new Promise((resolver) => api.close(resolver)))
  const puertoAnterior = process.env.PORT
  process.env.PORT = String(api.address().port)
  t.after(() => { if (puertoAnterior === undefined) delete process.env.PORT; else process.env.PORT = puertoAnterior })
  const vite = await createServer({ mode: 'test', cacheDir: 'node_modules/.vite-pruebas-proxy', logLevel: 'silent', server: { host: '127.0.0.1', port: 0, watch: null }, optimizeDeps: { noDiscovery: true, include: [] } })
  t.after(() => vite.close())
  await vite.listen()
  const origen = `http://127.0.0.1:${vite.httpServer.address().port}`
  const estado = await fetch(`${origen}/api/estado`)
  assert.equal(estado.status, 200)
  assert.equal((await estado.json()).proyecto, 'Metseri')
  const sesion = await fetch(`${origen}/api/admin/sesion`)
  assert.equal(sesion.status, 200)
  assert.equal((await sesion.json()).autenticado, false)
  assert.ok(!Object.keys(vite.config.env).some((nombre) => nombre.startsWith('SUPABASE_') || nombre.startsWith('ADMIN_')))
  assert.equal(vite.config.define?.['process.env'], undefined)
})
