import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:net'
import { it } from 'node:test'
import { fileURLToPath } from 'node:url'

it('un puerto ocupado termina con error y no anuncia que la API está ejecutándose', { timeout: 5000 }, async (contexto) => {
  const servidorOcupado = createServer().listen(0)
  await once(servidorOcupado, 'listening')
  contexto.after(() => new Promise((resolver) => servidorOcupado.close(resolver)))
  const procesoServidor = spawn(process.execPath, [fileURLToPath(new URL('../server.js', import.meta.url))], {
    env: { ...process.env, PORT: String(servidorOcupado.address().port) },
    windowsHide: true,
  })
  contexto.after(() => { if (procesoServidor.exitCode === null) procesoServidor.kill() })
  let salida = ''
  let errores = ''
  procesoServidor.stdout.on('data', (datos) => { salida += datos })
  procesoServidor.stderr.on('data', (datos) => { errores += datos })
  const [codigo] = await once(procesoServidor, 'close')
  assert.equal(codigo, 1)
  assert.match(errores, /puerto \d+ está ocupado/)
  assert.doesNotMatch(salida, /Servidor de Metseri ejecutándose/)
})
