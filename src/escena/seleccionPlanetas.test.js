import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DoubleSide, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, RingGeometry, SphereGeometry, Vector3 } from 'three'
import { crearDetectorPlanetas, crearSeleccionPlanetas } from './seleccionPlanetas.js'

function crearEntorno(t) {
  const camara = new PerspectiveCamera(70, 2, .1, 1000)
  const geometria = new SphereGeometry(1, 24, 16)
  const material = new MeshBasicMaterial({ side: DoubleSide })
  const seleccionables = []
  function agregar(id, posicion) {
    const cuerpo = new Mesh(geometria, material)
    cuerpo.position.set(...posicion)
    cuerpo.userData.planetaId = id
    seleccionables.push(cuerpo)
    return cuerpo
  }
  t.after(() => { geometria.dispose(); material.dispose() })
  const detector = crearDetectorPlanetas({ camara, seleccionables })
  return { camara, agregar, detector, seleccionables }
}

function proyectar(camara, posicion, rectangulo) {
  camara.updateWorldMatrix(true, false)
  const punto = new Vector3(...posicion).project(camara)
  return {
    clientX: rectangulo.left + (punto.x + 1) * rectangulo.width / 2,
    clientY: rectangulo.top + (1 - punto.y) * rectangulo.height / 2,
  }
}

describe('detección planetaria', () => {
  it('selecciona por coordenadas fuera del centro usando el rectángulo real del lienzo', (t) => {
    const { camara, agregar, detector } = crearEntorno(t)
    agregar('tierra', [0, 0, -10])
    agregar('marte', [4, 2, -10])
    const rectangulo = { left: 130, top: 70, width: 900, height: 450 }
    assert.equal(detector.detectarPosicion(proyectar(camara, [4, 2, -10], rectangulo), rectangulo), 'marte')
    assert.equal(detector.detectarMirada(), 'tierra')
    assert.equal(detector.detectarPosicion({ clientX: 20, clientY: 20 }, rectangulo), null)
    assert.equal(detector.detectarPosicion({}, rectangulo), null)
    assert.equal(detector.detectarPosicion({}, { ...rectangulo, width: 0 }), null)
  })

  it('responde al tamaño y la orientación actual sin esperar otro render', (t) => {
    const { camara, agregar, detector } = crearEntorno(t)
    agregar('tierra', [0, 0, -10])
    agregar('jupiter', [-10, 0, 0])
    camara.rotation.y = Math.PI / 2
    assert.equal(detector.detectarMirada(), 'jupiter')
    camara.aspect = .5
    camara.updateProjectionMatrix()
    const rectangulo = { left: 0, top: 0, width: 300, height: 600 }
    assert.equal(detector.detectarPosicion({ clientX: 150, clientY: 300 }, rectangulo), 'jupiter')
  })

  it('elige el impacto más cercano y excluye objetos que no sean seleccionables', (t) => {
    const { agregar, detector } = crearEntorno(t)
    agregar('neptuno', [0, 0, -20])
    const cercano = agregar('tierra', [0, 0, -10])
    const halo = cercano.clone()
    halo.position.z = -3
    halo.userData = { planetaId: 'halo-no-seleccionable' }
    assert.equal(detector.detectarMirada(), 'tierra')
  })

  it('resuelve los anillos transformados como parte de Saturno', (t) => {
    const { seleccionables, detector } = crearEntorno(t)
    const geometria = new RingGeometry(1.3, 2.5, 64)
    const material = new MeshBasicMaterial({ side: DoubleSide })
    const anillo = new Mesh(geometria, material)
    anillo.userData.planetaId = 'saturno'
    const grupo = new Group()
    grupo.position.set(-2, 0, -10)
    grupo.add(anillo)
    seleccionables.push(anillo)
    assert.equal(detector.detectarMirada(), 'saturno')
    t.after(() => { geometria.dispose(); material.dispose() })
  })
})

function crearSeleccionSimulada() {
  let objetivo = null
  let objetivoPulsado = null
  const cambios = []
  const seleccion = crearSeleccionPlanetas({
    detector: {
      detectarMirada: () => objetivo,
      detectarPosicion: () => objetivoPulsado,
    },
    alCambiar: (estado) => cambios.push(estado),
  })
  return {
    seleccion, cambios,
    mirar(id) { objetivo = id; seleccion.actualizarMirada() },
    pulsar(id) { objetivoPulsado = id; seleccion.activar({}, {}) },
    fijarObjetivo(id) { objetivo = id },
  }
}

describe('selección y mirada independientes', () => {
  it('en vista única selecciona, sustituye y quita por cuerpo o fondo', () => {
    const { seleccion, mirar, pulsar } = crearSeleccionSimulada()
    mirar('jupiter')
    pulsar('tierra')
    assert.deepEqual(seleccion.obtenerEstado(), { planetaApuntado: null, planetaSeleccionado: 'tierra' })
    pulsar('marte')
    assert.equal(seleccion.obtenerEstado().planetaSeleccionado, 'marte')
    pulsar('marte')
    assert.equal(seleccion.obtenerEstado().planetaSeleccionado, null)
    pulsar('tierra')
    pulsar(null)
    assert.equal(seleccion.obtenerEstado().planetaSeleccionado, null)
  })

  it('en VR mirar resalta sin seleccionar y el toque ignora su posición', () => {
    const { seleccion, mirar, pulsar } = crearSeleccionSimulada()
    seleccion.establecerModo('vr')
    mirar('tierra')
    assert.deepEqual(seleccion.obtenerEstado(), { planetaApuntado: 'tierra', planetaSeleccionado: null })
    pulsar('jupiter')
    assert.equal(seleccion.obtenerEstado().planetaSeleccionado, 'tierra')
    mirar(null)
    assert.equal(seleccion.obtenerEstado().planetaSeleccionado, 'tierra')
    pulsar(null)
    assert.equal(seleccion.obtenerEstado().planetaSeleccionado, null)
    pulsar('jupiter')
    assert.equal(seleccion.obtenerEstado().planetaSeleccionado, null)
  })

  it('mirar otro cuerpo exige un toque para deseleccionar y otro para seleccionarlo', () => {
    const { seleccion, mirar, pulsar } = crearSeleccionSimulada()
    seleccion.establecerModo('vr')
    mirar('tierra')
    pulsar(null)
    mirar('marte')
    assert.deepEqual(seleccion.obtenerEstado(), { planetaApuntado: 'marte', planetaSeleccionado: 'tierra' })
    pulsar(null)
    assert.deepEqual(seleccion.obtenerEstado(), { planetaApuntado: 'marte', planetaSeleccionado: null })
    pulsar(null)
    assert.equal(seleccion.obtenerEstado().planetaSeleccionado, 'marte')
    pulsar(null)
    assert.deepEqual(seleccion.obtenerEstado(), { planetaApuntado: 'marte', planetaSeleccionado: null })
  })

  it('usa el objetivo vigente al tocar y conserva la selección entre modos', () => {
    const { seleccion, mirar, pulsar, fijarObjetivo } = crearSeleccionSimulada()
    pulsar('tierra')
    seleccion.establecerModo('vr')
    mirar('marte')
    seleccion.establecerModo('normal')
    assert.deepEqual(seleccion.obtenerEstado(), { planetaApuntado: null, planetaSeleccionado: 'tierra' })
    pulsar(null)
    seleccion.establecerModo('vr')
    fijarObjetivo('saturno')
    pulsar(null)
    assert.equal(seleccion.obtenerEstado().planetaSeleccionado, 'saturno')
  })

  it('no notifica estados idénticos y después de destruir ignora activaciones', () => {
    const { seleccion, cambios, mirar, pulsar } = crearSeleccionSimulada()
    seleccion.establecerModo('vr')
    mirar('tierra')
    mirar('tierra')
    assert.equal(cambios.length, 1)
    seleccion.destruir()
    mirar('marte')
    pulsar('jupiter')
    seleccion.establecerModo('vr')
    assert.deepEqual(seleccion.obtenerEstado(), { planetaApuntado: null, planetaSeleccionado: null })
    assert.equal(cambios.length, 1)
  })
})
