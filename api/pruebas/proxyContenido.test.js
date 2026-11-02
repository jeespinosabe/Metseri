import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { it } from 'node:test'
import { createServer as crearServidorVite, resolveConfig } from 'vite'

it('proxy: PORT del archivo, precedencia del proceso y valor por defecto, sin exportar secretos', async (t) => {
  const carpeta = await mkdtemp(join(tmpdir(), 'metseri-proxy-'))
  const directorioAnterior = process.cwd()
  const puertoAnterior = process.env.PORT
  const api = createServer((_peticion, respuesta) => {
    respuesta.setHeader('Content-Type', 'application/json')
    respuesta.end(JSON.stringify({ proyecto: 'Metseri', estado: 'activo' }))
  })
  let vite
  t.after(async () => {
    await vite?.close()
    if (api.listening) await new Promise((resolver) => api.close(resolver))
    process.chdir(directorioAnterior)
    if (puertoAnterior === undefined) delete process.env.PORT
    else process.env.PORT = puertoAnterior
    assert.ok(resolve(carpeta).startsWith(resolve(tmpdir()) + sep))
    await rm(carpeta, { recursive: true, force: true })
  })
  api.listen(0, '127.0.0.1')
  await once(api, 'listening')
  const puerto = api.address().port
  await writeFile(join(carpeta, '.env'), `PORT=${puerto}\nSUPABASE_PUBLISHABLE_KEY=sb_publishable_secretoDePrueba\nADMIN_CONTRASENA=secretoAdministrativoDePrueba\n`)
  process.chdir(carpeta)
  delete process.env.PORT
  const configFile = fileURLToPath(new URL('../../vite.config.js', import.meta.url))
  vite = await crearServidorVite({ root: directorioAnterior, envDir: carpeta, configFile, cacheDir: join(carpeta, '.vite'), server: { host: '127.0.0.1', port: 0, watch: null } })
  await vite.listen()
  assert.equal(vite.config.server.proxy['/api'], `http://localhost:${puerto}`)
  const origen = `http://127.0.0.1:${vite.httpServer.address().port}`
  const respuesta = await fetch(`${origen}/api/estado`)
  assert.equal(respuesta.status, 200)
  assert.deepEqual(await respuesta.json(), { proyecto: 'Metseri', estado: 'activo' })
  assert.equal(Object.keys(vite.config.env).some((clave) => /SUPABASE|ADMIN/u.test(clave)), false)
  const entornoCliente = await (await fetch(`${origen}/@vite/env`)).text()
  assert.equal(entornoCliente.includes('secretoDePrueba'), false)
  assert.equal(entornoCliente.includes('secretoAdministrativoDePrueba'), false)
  await vite.close()
  vite = null
  process.env.PORT = '3201'
  assert.equal((await resolveConfig({ root: directorioAnterior, envDir: carpeta, configFile }, 'serve')).server.proxy['/api'], 'http://localhost:3201')
  delete process.env.PORT
  await writeFile(join(carpeta, '.env'), '')
  assert.equal((await resolveConfig({ root: directorioAnterior, envDir: carpeta, configFile }, 'serve')).server.proxy['/api'], 'http://localhost:3000')
})
