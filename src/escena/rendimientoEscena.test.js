import assert from 'node:assert/strict'
import { it } from 'node:test'
import { Scene, Vector3 } from 'three'
import { calcularDensidadRenderizado } from './rendimientoEscena.js'
import { crearEtiquetasVisor } from './etiquetasVisor.js'
import { prepararEntornoEscena } from '../pruebas/entornoEscena.js'

it('acota los píxeles en móvil, VR y 4K, sin aumentar la densidad de pantallas de baja resolución', () => {
  for (const modo of ['normal', 'vr']) {
    for (const [ancho, alto, densidad, tactil] of [[390, 844, 3, true], [844, 390, 3, true], [3840, 2160, 2, false], [1440, 900, 1, false]]) {
      const proporcion = calcularDensidadRenderizado({ ancho, alto, densidad, modo, tactil })
      assert.ok(proporcion > 0 && proporcion <= densidad)
      assert.ok(ancho * alto * proporcion ** 2 <= (modo === 'vr' ? 2_000_000 : 2_073_600) + .001)
      if (modo === 'vr') assert.ok(proporcion <= 1.75)
      else if (tactil) assert.ok(proporcion <= 1.25)
    }
  }
  assert.equal(calcularDensidadRenderizado({ ancho: 390, alto: 844, densidad: 3, tactil: true }), 1.25)
  assert.equal(calcularDensidadRenderizado({ ancho: 1440, alto: 900, densidad: 1 }), 1)
  assert.ok(Number.isFinite(calcularDensidadRenderizado({ ancho: 0, alto: 0 })))
})

it('las etiquetas VR solo actualizan las texturas cuyo resaltado cambió', (t) => {
  prepararEntornoEscena(t)
  const escena = new Scene()
  const planetas = ['tierra', 'marte', 'luna'].map((id) => ({ id, nombre: id, tipo: '', posicion: new Vector3(0, 0, -60), radio: 4 }))
  const etiquetas = crearEtiquetasVisor(escena, planetas)
  t.after(() => etiquetas.destruir())
  const texturas = escena.children[0].children.map((sprite) => sprite.material.map)
  const versiones = () => texturas.map((textura) => textura.version)
  const iniciales = versiones()
  etiquetas.actualizarAspecto({ planetaApuntado: 'tierra', planetaSeleccionado: null })
  assert.deepEqual(versiones(), [iniciales[0] + 1, iniciales[1], iniciales[2]])
  etiquetas.actualizarAspecto({ planetaApuntado: 'tierra', planetaSeleccionado: 'tierra' })
  assert.deepEqual(versiones(), [iniciales[0] + 1, iniciales[1], iniciales[2]])
  etiquetas.actualizarAspecto({ planetaApuntado: 'luna', planetaSeleccionado: null })
  assert.deepEqual(versiones(), [iniciales[0] + 2, iniciales[1], iniciales[2] + 1])
})

it('crea las doce etiquetas al entrar en VR y las reutiliza al alternar modos', (t) => {
  const { campo } = prepararEntornoEscena(t)
  const crearElemento = document.createElement
  let lienzos = 0
  t.mock.method(document, 'createElement', (tipo) => {
    if (tipo === 'canvas') lienzos += 1
    return crearElemento(tipo)
  })
  campo.establecerModo('vr')
  assert.equal(lienzos, 12)
  campo.establecerModo('normal')
  campo.establecerModo('vr')
  assert.equal(lienzos, 12)
})
