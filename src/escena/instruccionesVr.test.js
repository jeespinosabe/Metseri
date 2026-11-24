import assert from 'node:assert/strict'
import { it } from 'node:test'
import { PerspectiveCamera } from 'three'
import { calcularDemostracionTapVr } from './demostracionTapVr.js'
import { crearInstruccionesVr, INSTRUCCION_VR } from './instruccionesVr.js'
import { calcularOpticaVisor } from './perfilVisor.js'

function simularGlobal(t, clave, valor) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, clave)
  Object.defineProperty(globalThis, clave, { configurable: true, value: valor })
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, clave, descriptor)
    else delete globalThis[clave]
  })
}

it('muestra el texto al entrar, se oculta y vuelve a mostrarse al reentrar', (t) => {
  const textos = []
  simularGlobal(t, 'document', {
    createElement: () => ({ getContext: () => ({ fillRect() {}, fillText(texto) { textos.push(texto) } }) }),
  })
  const estados = []
  const instrucciones = crearInstruccionesVr({ alCambiarVisibilidad: (visible) => estados.push(visible) })
  t.after(() => instrucciones.destruir())
  const camara = new PerspectiveCamera()
  assert.equal(textos.join(' '), INSTRUCCION_VR)
  assert.equal(instrucciones.esVisible(), false)
  instrucciones.ajustar({ ancho: 1280, alto: 720 })
  instrucciones.mostrar(camara)
  assert.equal(instrucciones.esVisible(), true)
  const posicion = instrucciones.malla.position.clone()
  camara.rotation.y = .8
  instrucciones.actualizar(camara)
  assert.ok(!instrucciones.malla.position.equals(posicion))
  const ancho = instrucciones.malla.scale.x
  instrucciones.ajustar({ ancho: 390, alto: 844 })
  assert.ok(instrucciones.malla.scale.x < ancho)
  for (const parametros of [
    { ancho: 844, alto: 390, anchoPantalla: 1280, altoPantalla: 720 },
    { ancho: 844, alto: 390, diagonal: 4 },
    { ancho: 844, alto: 390, diagonal: 8 },
  ]) {
    instrucciones.ajustar(parametros)
    const mitad = instrucciones.malla.scale.x / 2 / 24
    const semiAltura = instrucciones.malla.scale.y / 2 / 24
    for (const ojo of calcularOpticaVisor(parametros).ojos) {
      assert.ok(mitad < ojo.izquierda - ojo.desplazamiento / 24)
      assert.ok(mitad < ojo.derecha + ojo.desplazamiento / 24)
      assert.ok(semiAltura < ojo.arriba)
      assert.ok(semiAltura < ojo.abajo)
    }
  }
  instrucciones.ocultar()
  instrucciones.ocultar()
  instrucciones.mostrar(camara)
  assert.deepEqual(estados, [true, false, true])
  const recursos = [instrucciones.malla.geometry, instrucciones.malla.material, instrucciones.malla.material.map]
  const liberaciones = [0, 0, 0]
  recursos.forEach((recurso, indice) => recurso.addEventListener('dispose', () => { liberaciones[indice] += 1 }))
  instrucciones.destruir()
  instrucciones.destruir()
  instrucciones.mostrar(camara)
  assert.equal(instrucciones.esVisible(), false)
  assert.deepEqual(liberaciones, [1, 1, 1])
})

it('distingue un toque de dos contactos separados por menos de 300 ms', () => {
  const contactos = []
  let presionAnterior = 0
  for (let tiempo = 0; tiempo < 4000; tiempo += 1) {
    const { dobleTap, presion } = calcularDemostracionTapVr(tiempo)
    if (presion === 1 && presionAnterior < 1) contactos.push({ dobleTap, tiempo })
    presionAnterior = presion
  }
  assert.deepEqual(contactos.map(({ dobleTap }) => dobleTap), [false, true, true])
  assert.ok(contactos[2].tiempo - contactos[1].tiempo < 300)
  assert.deepEqual(calcularDemostracionTapVr(4000), calcularDemostracionTapVr(0))
})

it('actualiza la textura al animar, se detiene al ocultar y reinicia al entrar', (t) => {
  const dedos = []
  const estadoMovimiento = { matches: false }
  const operaciones = [
    'fillRect', 'fillText', 'save', 'beginPath', 'roundRect', 'clip', 'drawImage', 'ellipse',
    'stroke', 'moveTo', 'bezierCurveTo', 'lineTo', 'closePath', 'fill', 'restore',
  ]
  const contexto = Object.fromEntries(operaciones.map((operacion) => [operacion, () => {}]))
  contexto.translate = (x, y) => dedos.push({ x, y })
  const imagen = { complete: false, naturalWidth: 0 }
  simularGlobal(t, 'document', {
    createElement: (etiqueta) => etiqueta === 'img' ? imagen : { getContext: () => contexto },
  })
  simularGlobal(t, 'window', { matchMedia: () => estadoMovimiento })
  const instrucciones = crearInstruccionesVr()
  t.after(() => instrucciones.destruir())
  const camara = new PerspectiveCamera()

  instrucciones.mostrar(camara)
  instrucciones.actualizarAnimacion(500)
  assert.equal(dedos.length, 0)
  imagen.complete = true
  imagen.naturalWidth = 420
  instrucciones.actualizarAnimacion(1000)
  const reposo = dedos[0]
  instrucciones.actualizarAnimacion(1300)
  assert.equal(dedos.length, 1)
  instrucciones.actualizarAnimacion(1525)
  assert.ok(dedos[1].y > reposo.y)
  instrucciones.ocultar()
  instrucciones.actualizarAnimacion(1800)
  assert.equal(dedos.length, 2)

  instrucciones.mostrar(camara)
  instrucciones.actualizarAnimacion(1800)
  assert.deepEqual(dedos[2], reposo)
  estadoMovimiento.matches = true
  instrucciones.actualizarAnimacion(2400)
  instrucciones.actualizarAnimacion(5000)
  assert.equal(dedos.length, 4)
})
