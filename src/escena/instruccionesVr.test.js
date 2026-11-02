import assert from 'node:assert/strict'
import { it } from 'node:test'
import { PerspectiveCamera } from 'three'
import { crearInstruccionesVr, INSTRUCCION_VR } from './instruccionesVr.js'
import { calcularOpticaVisor } from './perfilVisor.js'

it('muestra el texto al entrar, se oculta y vuelve a mostrarse al reentrar', (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document')
  const textos = []
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: () => ({ getContext: () => ({ fillRect() {}, fillText(texto) { textos.push(texto) } }) }) } })
  t.after(() => { if (descriptor) Object.defineProperty(globalThis, 'document', descriptor); else delete globalThis.document })
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
    for (const ojo of calcularOpticaVisor(parametros).ojos) {
      assert.ok(mitad < ojo.izquierda - ojo.desplazamiento / 24)
      assert.ok(mitad < ojo.derecha + ojo.desplazamiento / 24)
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
