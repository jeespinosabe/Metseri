import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SphereGeometry, StereoCamera, Vector2, Vector3 } from 'three'
import { calcularProyeccionVista, crearProyeccionVista, obtenerDireccionVista, proyectarDireccionVista } from './proyeccionVista.js'
import { crearDetectorPlanetas } from './seleccionPlanetas.js'
import { calcularPosicionEtiqueta } from './etiquetasPlanetas.js'

describe('proyección sin estiramiento en los bordes', () => {
  for (const [ancho, alto] of [[1440, 900], [2560, 1080], [390, 780]]) {
    it(`conserva el contorno circular de una esfera lateral en ${ancho} × ${alto}`, () => {
      const parametros = calcularProyeccionVista(ancho, alto)
      const angulo = 55 * Math.PI / 180
      const centro = new Vector3(Math.sin(angulo), 0, -Math.cos(angulo))
      const tangente = new Vector3(Math.cos(angulo), 0, Math.sin(angulo))
      const apertura = Math.asin(4.3 / 60)
      const puntos = Array.from({ length: 256 }, (_, indice) => {
        const fase = indice * Math.PI * 2 / 256
        const direccion = centro.clone().multiplyScalar(Math.cos(apertura))
          .addScaledVector(tangente, Math.sin(apertura) * Math.cos(fase))
          .add(new Vector3(0, Math.sin(apertura) * Math.sin(fase), 0))
        const punto = proyectarDireccionVista(direccion, parametros)
        return { x: punto.x * ancho / 2, y: punto.y * alto / 2 }
      })
      const diametroX = Math.max(...puntos.map((punto) => punto.x)) - Math.min(...puntos.map((punto) => punto.x))
      const diametroY = Math.max(...puntos.map((punto) => punto.y)) - Math.min(...puntos.map((punto) => punto.y))
      assert.ok(Math.abs(diametroX / diametroY - 1) < .001)
      for (const esquina of [new Vector2(-1, -1), new Vector2(1, 1)]) {
        assert.ok(obtenerDireccionVista(esquina, parametros).z < 0, 'el recorte sigue delante de la cámara')
      }
    })
  }

  it('el clic y la etiqueta siguen la misma proyección fuera del centro', (t) => {
    const camara = new PerspectiveCamera(70, 1, .1, 1000)
    const geometria = new SphereGeometry(1, 24, 16)
    const material = new MeshBasicMaterial()
    const cuerpo = new Mesh(geometria, material)
    cuerpo.position.set(8, 2, -10)
    cuerpo.userData.planetaId = 'marte'
    const escena = new Scene()
    escena.add(cuerpo)
    const proyeccion = crearProyeccionVista(escena)
    proyeccion.ajustar(camara, 1200, 700, 'normal')
    const parametros = proyeccion.obtenerParametros()
    const coordenadas = proyectarDireccionVista(cuerpo.position, parametros)
    const detector = crearDetectorPlanetas({ camara, seleccionables: [cuerpo], obtenerDireccion: proyeccion.obtenerDireccion })
    const rectangulo = { left: 80, top: 50, width: 1200, height: 700 }
    assert.equal(detector.detectarPosicion({
      clientX: rectangulo.left + (coordenadas.x + 1) * 600,
      clientY: rectangulo.top + (1 - coordenadas.y) * 350,
    }, rectangulo), 'marte')
    const etiqueta = calcularPosicionEtiqueta(cuerpo.position, 1, camara, 1200, 700, parametros)
    assert.ok(Math.abs(etiqueta.x - (coordenadas.x + 1) * 600) < 2)
    assert.ok(etiqueta.y > (1 - coordenadas.y) * 350)
    assert.equal(calcularPosicionEtiqueta(new Vector3(0, 0, 10), 1, camara, 1200, 700, parametros), null)
    proyeccion.ajustar(camara, 1200, 700, 'vr')
    assert.equal(proyeccion.obtenerParametros(), null)
    assert.equal(proyeccion.obtenerDireccion(new Vector2()), null)
    assert.equal(camara.fov, 70, 'VR conserva su perspectiva')
    t.after(() => { geometria.dispose(); material.dispose() })
  })

  it('la transformación de pantalla a dirección es reversible también en las esquinas', () => {
    const parametros = calcularProyeccionVista(1920, 1080)
    for (const coordenadas of [new Vector2(), new Vector2(-.95, .9), new Vector2(.96, -.9)]) {
      const direccion = obtenerDireccionVista(coordenadas, parametros)
      assert.ok(proyectarDireccionVista(direccion, parametros).distanceTo(coordenadas) < 1e-10)
    }
  })

  it('las etiquetas VR se proyectan en el centro relativo de cada ojo', () => {
    const camara = new PerspectiveCamera(70, 1440 / 900, .1, 1000)
    camara.focus = 60
    camara.updateMatrixWorld(true)
    const estereo = new StereoCamera()
    estereo.aspect = .5
    estereo.update(camara)
    for (const ojo of [estereo.cameraL, estereo.cameraR]) {
      ojo.updateMatrixWorld(true)
      const etiqueta = calcularPosicionEtiqueta(new Vector3(0, 0, -60), 4.3, ojo, 720, 900)
      assert.ok(Math.abs(etiqueta.x - 360) < .1)
      assert.ok(etiqueta.y > 450)
    }
  })

  it('la etiqueta respeta el contorno de los anillos y reserva espacio para los controles', () => {
    const camara = new PerspectiveCamera(70, 1200 / 700, .1, 1000)
    camara.updateMatrixWorld(true)
    const posicion = new Vector3(0, 0, -10)
    const sencilla = calcularPosicionEtiqueta(posicion, 1, camara, 1200, 700)
    const conAnillos = calcularPosicionEtiqueta(posicion, 1, camara, 1200, 700, null, [new Vector3(0, -3, -10)])
    assert.ok(conAnillos.y > sencilla.y, 'el nombre queda debajo del contorno completo')
    const cercaDelBorde = calcularPosicionEtiqueta(new Vector3(0, -4, -10), 1, camara, 1200, 700)
    assert.ok(cercaDelBorde.y < 600, 'el nombre no ocupa la franja de controles')
  })
})
