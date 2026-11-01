import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PerspectiveCamera, Vector3 } from 'three'
import { crearPlanetas } from './planetas.js'
import { crearDetectorPlanetas } from './seleccionPlanetas.js'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'

// Solo se sustituye Canvas 2D. Mallas, rayos, materiales y dispose son de Three.js.
// La apariencia de las texturas se comprueba en el navegador.
function prepararLienzos(t) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document')
  const noHacerNada = () => undefined
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      createElement() {
        return {
          getContext: () => ({
            fillRect: noHacerNada, beginPath: noHacerNada, moveTo: noHacerNada,
            lineTo: noHacerNada, bezierCurveTo: noHacerNada, closePath: noHacerNada, fill: noHacerNada,
            ellipse: noHacerNada, stroke: noHacerNada,
            scale: noHacerNada, arc: noHacerNada,
            createRadialGradient: () => ({ addColorStop: noHacerNada }),
          }),
        }
      },
    },
  })
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'document', descriptor)
    else delete globalThis.document
  })
}

describe('cuerpos planetarios y recursos', () => {
  it('los doce coinciden con el catálogo y son apuntables individualmente alrededor del observador', (t) => {
    prepararLienzos(t)
    const planetas = crearPlanetas()
    t.after(() => planetas.destruir())
    const camara = new PerspectiveCamera(70, 1, .1, 1000)
    const detector = crearDetectorPlanetas({ camara, seleccionables: planetas.seleccionables })
    assert.deepEqual(new Set(planetas.raiz.children.map((grupo) => grupo.name)),
      new Set(CUERPOS_CELESTES.map((cuerpo) => cuerpo.id)))
    assert.equal(planetas.raiz.children.length, 12)
    assert.equal(planetas.etiquetas.length, 12)
    for (const cuerpo of CUERPOS_CELESTES) {
      const etiqueta = planetas.etiquetas.find((dato) => dato.id === cuerpo.id)
      assert.equal(etiqueta.nombre, cuerpo.nombre)
      assert.equal(etiqueta.planetaId, cuerpo.planetaId ?? null)
      if (cuerpo.tipo === 'satelite') {
        assert.ok(etiqueta.tipo.includes(cuerpo.planetaPrincipal))
        const planeta = planetas.etiquetas.find((dato) => dato.id === cuerpo.planetaId)
        assert.ok(etiqueta.radio < planeta.radio)
        assert.ok(etiqueta.posicion.angleTo(planeta.posicion) < Math.PI / 4, `${cuerpo.id} permanece cerca de su planeta`)
      }
    }
    for (const grupo of planetas.raiz.children) {
      camara.lookAt(grupo.position)
      assert.equal(detector.detectarMirada(), grupo.name, `${grupo.name} es apuntable sin quedar oculto`)
    }
    const posiciones = planetas.raiz.children.map((grupo) => grupo.position)
    assert.ok(posiciones.some((punto) => punto.z > 40), 'hay cuerpos detrás del observador')
    assert.ok(posiciones.some((punto) => punto.x > 40) && posiciones.some((punto) => punto.x < -40))
    assert.ok(posiciones.some((punto) => punto.y > 15) && posiciones.some((punto) => punto.y < -15))
  })

  it('conserva las posiciones de los ocho planetas y separa Titán de los anillos', (t) => {
    prepararLienzos(t)
    const planetas = crearPlanetas()
    t.after(() => planetas.destruir())
    const anteriores = [[0, 0], [45, 18], [90, -12], [140, 22], [180, -18], [225, 26], [270, -20], [315, 14]]
    anteriores.forEach(([giro, elevacion], indice) => {
      const horizontal = giro * Math.PI / 180
      const vertical = elevacion * Math.PI / 180
      const esperada = new Vector3(-Math.sin(horizontal) * Math.cos(vertical) * 60, Math.sin(vertical) * 60, -Math.cos(horizontal) * Math.cos(vertical) * 60)
      assert.ok(planetas.raiz.children[indice].position.distanceTo(esperada) < 1e-10)
    })
    const camara = new PerspectiveCamera(70, 1, .1, 1000)
    const detector = crearDetectorPlanetas({ camara, seleccionables: planetas.seleccionables })
    const anillos = planetas.seleccionables.find((malla) => malla.geometry.type === 'RingGeometry')
    anillos.updateWorldMatrix(true, false)
    const borde = new Vector3(1.7, 0, 0).applyMatrix4(anillos.matrixWorld)
    camara.lookAt(borde)
    assert.equal(detector.detectarMirada(), 'saturno')
    camara.lookAt(planetas.etiquetas.find((etiqueta) => etiqueta.id === 'titan').posicion)
    assert.equal(detector.detectarMirada(), 'titan')
  })

  it('distingue el apuntado de la selección y restaura el aspecto al deseleccionar', (t) => {
    prepararLienzos(t)
    const planetas = crearPlanetas()
    t.after(() => planetas.destruir())
    const tierra = planetas.seleccionables.find((malla) => malla.userData.planetaId === 'tierra')
    const marte = planetas.seleccionables.find((malla) => malla.userData.planetaId === 'marte')
    const halo = tierra.parent.children.find((objeto) => objeto.isSprite)
    const normal = tierra.material.emissiveIntensity
    planetas.actualizarAspecto({ planetaApuntado: 'tierra', planetaSeleccionado: null })
    const apuntado = tierra.material.emissiveIntensity
    assert.ok(apuntado > normal)
    assert.equal(halo.visible, false)
    planetas.actualizarAspecto({ planetaApuntado: 'marte', planetaSeleccionado: 'tierra' })
    assert.ok(tierra.material.emissiveIntensity > apuntado)
    assert.ok(marte.material.emissiveIntensity > normal)
    assert.equal(halo.visible, true)
    planetas.actualizarAspecto({ planetaApuntado: 'tierra', planetaSeleccionado: null })
    assert.equal(tierra.material.emissiveIntensity, apuntado)
    assert.equal(marte.material.emissiveIntensity, normal)
    assert.equal(halo.visible, false)
  })

  it('aplica apuntado, selección y deselección a cada luna sin iluminar su planeta', (t) => {
    prepararLienzos(t)
    const planetas = crearPlanetas()
    t.after(() => planetas.destruir())
    for (const id of ['luna', 'europa', 'titan', 'triton']) {
      const malla = planetas.seleccionables.find((objeto) => objeto.userData.planetaId === id)
      const halo = malla.parent.children.find((objeto) => objeto.isSprite)
      planetas.actualizarAspecto({ planetaApuntado: id, planetaSeleccionado: null })
      const brillo = malla.material.emissiveIntensity
      assert.ok(brillo > 0)
      assert.equal(halo.visible, false)
      planetas.actualizarAspecto({ planetaApuntado: id, planetaSeleccionado: id })
      assert.ok(malla.material.emissiveIntensity > brillo)
      assert.equal(halo.visible, true)
      planetas.actualizarAspecto({ planetaApuntado: id, planetaSeleccionado: null })
      assert.equal(malla.material.emissiveIntensity, brillo)
      assert.equal(halo.visible, false)
      planetas.actualizarAspecto({ planetaApuntado: null, planetaSeleccionado: null })
      assert.ok(planetas.seleccionables.filter((objeto) => objeto.geometry.type === 'SphereGeometry').every((objeto) => objeto.material.emissiveIntensity === 0))
    }
  })

  it('libera cada recurso compartido exactamente una vez y recrea una instancia limpia', (t) => {
    prepararLienzos(t)
    const planetas = crearPlanetas()
    const posiciones = planetas.raiz.children.map((grupo) => grupo.position.toArray())
    const recursos = new Set()
    planetas.raiz.traverse((objeto) => {
      // Sprite usa un quad global propiedad de Three.js; aquí solo contamos mallas propias.
      if (objeto.isMesh && objeto.geometry) recursos.add(objeto.geometry)
      if (objeto.material) {
        recursos.add(objeto.material)
        if (objeto.material.map) recursos.add(objeto.material.map)
      }
    })
    const liberaciones = new Map([...recursos].map((recurso) => [recurso, 0]))
    recursos.forEach((recurso) => recurso.addEventListener('dispose', () => liberaciones.set(recurso, liberaciones.get(recurso) + 1)))
    planetas.actualizarAspecto({ planetaApuntado: 'triton', planetaSeleccionado: 'luna' })
    planetas.destruir()
    planetas.destruir()
    planetas.actualizarAspecto({ planetaApuntado: 'tierra', planetaSeleccionado: 'marte' })
    assert.ok([...liberaciones.values()].every((cantidad) => cantidad === 1))
    assert.equal(planetas.raiz.children.length, 0)
    assert.equal(planetas.seleccionables.length, 0)
    const nuevos = crearPlanetas()
    t.after(() => nuevos.destruir())
    assert.deepEqual(nuevos.raiz.children.map((grupo) => grupo.position.toArray()), posiciones)
    nuevos.raiz.traverse((objeto) => {
      if (objeto.isSprite) assert.equal(objeto.visible, false)
      if (objeto.material?.isMeshStandardMaterial && objeto.geometry.type === 'SphereGeometry') assert.equal(objeto.material.emissiveIntensity, 0)
    })
  })
})
