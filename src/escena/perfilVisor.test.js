import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PerspectiveCamera, Vector3, Vector4 } from 'three'
import { ajustarCamaraOjo, crearEfectoVisor } from './efectoVisor.js'
import { calcularOpticaVisor, distorsionarRadio, esDiagonalValida, PERFIL_HOMIDO_GRAB } from './perfilVisor.js'

const cerca = (real, esperado) => assert.ok(Math.abs(real - esperado) < 1e-8, `${real} ≠ ${esperado}`)

describe('óptica del HOMIDO GRAB', () => {
  for (const [ancho, alto, diagonal] of [[1920, 1080, 5.5], [2400, 1080, 6.5], [2532, 1170, 6.1]]) {
    it(`mantiene 60 mm entre ejes ópticos en pantalla de ${diagonal} pulgadas`, () => {
      const optica = calcularOpticaVisor({ ancho, alto, diagonal })
      const [izquierdo, derecho] = optica.ojos
      cerca(optica.anchoFisico / 2 + derecho.centroX - izquierdo.centroX, 60)
      cerca(izquierdo.centroX + derecho.centroX, optica.anchoFisico / 2)
      cerca(izquierdo.centroY, optica.altoFisico / 2)
      cerca(izquierdo.izquierda, derecho.derecha)
      cerca(izquierdo.derecha, derecho.izquierda)
      const longitudDiagonal = Math.hypot(optica.anchoFisico, optica.altoFisico)
      cerca(longitudDiagonal, diagonal * 25.4)
    })
  }

  it('la corrección coincide con el polinomio Cardboard del perfil y aumenta hacia los bordes', () => {
    cerca(distorsionarRadio(0), 0)
    cerca(distorsionarRadio(1), 1.44)
    cerca(distorsionarRadio(.5), .545625)
    assert.ok(distorsionarRadio(1.2) > 1.2)
  })

  it('compensa la densidad CSS, la rotación y una ventana menor que el panel completo', () => {
    const horizontal = calcularOpticaVisor({ ancho: 844, alto: 390, diagonal: 6.1 })
    const vertical = calcularOpticaVisor({ ancho: 390, alto: 844, diagonal: 6.1 })
    cerca(horizontal.milimetrosPorPixel, vertical.milimetrosPorPixel)
    const reducido = calcularOpticaVisor({ ancho: 844, alto: 350, anchoPantalla: 844, altoPantalla: 390, diagonal: 6.1 })
    cerca(horizontal.anchoFisico, reducido.anchoFisico)
    cerca(reducido.altoFisico / horizontal.altoFisico, 350 / 390)
    const doble = calcularOpticaVisor({ ancho: 1688, alto: 780, diagonal: 6.1 })
    cerca(horizontal.anchoFisico, doble.anchoFisico)
  })

  it('la proyección de cada ojo sitúa el frente en el eje de su lente, también al girar la cabeza', () => {
    const camara = new PerspectiveCamera(70, 1, .1, 1000)
    camara.rotation.set(.3, .8, -.1)
    camara.updateMatrixWorld(true)
    const optica = calcularOpticaVisor({ ancho: 844, alto: 390, diagonal: 6.1 })
    optica.ojos.forEach((parametros) => {
      const ojo = new PerspectiveCamera()
      ojo.matrixAutoUpdate = false
      ajustarCamaraOjo(ojo, camara, parametros)
      const eje = new Vector3(0, 0, -60).applyMatrix4(ojo.matrixWorld).project(ojo)
      const tangenteX = (eje.x + 1) / 2 * (parametros.izquierda + parametros.derecha) - parametros.izquierda
      const tangenteY = (eje.y + 1) / 2 * (parametros.abajo + parametros.arriba) - parametros.abajo
      cerca(tangenteX, 0)
      cerca(tangenteY, 0)
      cerca(ojo.projectionMatrix.clone().multiply(ojo.projectionMatrixInverse).elements[0], 1)
    })
    const [izquierdo, derecho] = optica.ojos
    cerca(derecho.desplazamiento - izquierdo.desplazamiento, .06)
    assert.ok(izquierdo.izquierda !== izquierdo.derecha, 'el centro óptico no coincide con el centro de media pantalla')
  })

  it('limita el campo al del visor y rechaza diagonales inválidas sin producir matrices no finitas', () => {
    for (const diagonal of [NaN, Infinity, 0, 3, 9]) {
      assert.equal(esDiagonalValida(diagonal), false)
      const optica = calcularOpticaVisor({ ancho: 390, alto: 844, diagonal })
      optica.ojos.forEach((ojo) => {
        for (const campo of [ojo.izquierda, ojo.derecha, ojo.arriba, ojo.abajo]) {
          assert.ok(Number.isFinite(campo) && campo > 0 && campo <= Math.tan(PERFIL_HOMIDO_GRAB.semiCampoMaximo))
        }
      })
    }
  })
})

describe('ciclo de renderizado del visor', () => {
  function crearRenderizador() {
    const estado = { destino: null, viewport: new Vector4(0, 0, 844, 390), recorte: new Vector4(4, 5, 800, 350), prueba: false }
    const pasadas = []
    return {
      estado, pasadas, autoClear: false,
      getPixelRatio: () => 1.5,
      getSize: (vector) => vector.set(844, 390),
      getRenderTarget: () => estado.destino,
      setRenderTarget: (destino) => { estado.destino = destino },
      getViewport: (vector) => vector.copy(estado.viewport),
      setViewport: (...valores) => { estado.viewport = valores[0]?.isVector4 ? valores[0].clone() : new Vector4(...valores) },
      getScissor: (vector) => vector.copy(estado.recorte),
      setScissor: (...valores) => { estado.recorte = valores[0]?.isVector4 ? valores[0].clone() : new Vector4(...valores) },
      getScissorTest: () => estado.prueba,
      setScissorTest: (prueba) => { estado.prueba = prueba },
      render: () => { pasadas.push({ ...estado, viewport: estado.viewport.clone() }) },
    }
  }

  it('cada ojo se dibuja primero a textura y después a su mitad; restaura el área para volver a vista única', () => {
    const renderizador = crearRenderizador()
    const efecto = crearEfectoVisor(renderizador)
    efecto.ajustar({ ancho: 844, alto: 390, diagonal: 6.1 })
    efecto.render({}, new PerspectiveCamera())
    assert.equal(renderizador.pasadas.length, 4)
    assert.ok(renderizador.pasadas[0].destino.isWebGLRenderTarget)
    assert.ok(renderizador.pasadas[2].destino.isWebGLRenderTarget)
    assert.equal(renderizador.pasadas[1].destino, null)
    assert.deepEqual(renderizador.pasadas[1].viewport.toArray(), [0, 0, 422, 390])
    assert.deepEqual(renderizador.pasadas[3].viewport.toArray(), [422, 0, 422, 390])
    assert.deepEqual(renderizador.estado.viewport.toArray(), [0, 0, 844, 390])
    assert.deepEqual(renderizador.estado.recorte.toArray(), [4, 5, 800, 350])
    assert.equal(renderizador.estado.prueba, false)
    assert.equal(renderizador.autoClear, false)
    let liberado = false
    renderizador.pasadas[0].destino.addEventListener('dispose', () => { liberado = true })
    efecto.destruir()
    assert.equal(liberado, true)
  })

  it('restaura destino, recorte y limpieza si falla una pasada', () => {
    const renderizador = crearRenderizador()
    renderizador.render = () => { throw new Error('fallo gráfico') }
    const efecto = crearEfectoVisor(renderizador)
    efecto.ajustar({ ancho: 844, alto: 390 })
    assert.throws(() => efecto.render({}, new PerspectiveCamera()), /fallo gráfico/)
    assert.equal(renderizador.estado.destino, null)
    assert.deepEqual(renderizador.estado.viewport.toArray(), [0, 0, 844, 390])
    assert.equal(renderizador.estado.prueba, false)
    assert.equal(renderizador.autoClear, false)
    efecto.destruir()
  })
})
