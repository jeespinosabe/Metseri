import assert from 'node:assert/strict'
import { it } from 'node:test'
import { PerspectiveCamera, Vector3 } from 'three'
import { crearFichaCuerpoVr } from './fichaCuerpoVr.js'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { obtenerZonasNavegacion } from './contenidoFicha.js'
import { FICHAS_PRUEBA } from '../pruebas/fichasPrueba.js'
import { adaptarContenido } from '../servicios/consultaContenido.js'
import { calcularConfiguracionVisor } from './rendimientoEscena.js'
import { DISTANCIA_FICHA_VR } from './lecturaVisor.js'

function preparar(t, anchoLetra = .5) {
  const anteriores = ['document', 'Image'].map((clave) => [clave, Object.getOwnPropertyDescriptor(globalThis, clave)])
  const imagenes = []
  let dibujos = 0
  const textos = []
  const dibujosImagen = []
  const contexto = { font: '', fillRect() { dibujos += 1 }, strokeRect() {}, fillText(texto) { textos.push(texto) },
    drawImage(_imagen, x, y, ancho, alto) { dibujosImagen.push({ x, y, ancho, alto }) },
    measureText(texto) { return { width: texto.length * Number(this.font.match(/([\d.]+)px/)[1]) * anchoLetra } } }
  const lienzo = { width: 0, height: 0, getContext: () => contexto }
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { createElement: () => lienzo } })
  Object.defineProperty(globalThis, 'Image', { configurable: true, value: class ImagenSimulada { constructor() { imagenes.push(this) } } })
  t.after(() => anteriores.forEach(([clave, descriptor]) => { if (descriptor) Object.defineProperty(globalThis, clave, descriptor); else delete globalThis[clave] }))
  const cambios = []
  const ficha = crearFichaCuerpoVr({ alCambiarLectura: (estado) => cambios.push(estado) })
  t.after(() => ficha.destruir())
  return { ficha, cambios, imagenes, lienzo, textos, dibujosImagen, obtenerDibujos: () => dibujos }
}

it('recrea la textura al cambiar dimensiones para no conservar otra ficha en la GPU', (t) => {
  const { ficha, cambios } = preparar(t)
  ficha.ajustar(1440, 900)
  ficha.establecerCuerpo(CUERPOS_CELESTES.find((cuerpo) => cuerpo.id === 'tierra'))
  ficha.establecerModo('vr')
  ficha.mostrarSeccion(1)
  const anterior = ficha.malla.material.map
  let liberaciones = 0
  anterior.addEventListener('dispose', () => { liberaciones += 1 })
  ficha.ajustar(686, 421)
  const actual = ficha.malla.material.map
  assert.notEqual(actual, anterior)
  assert.notEqual(actual.source, anterior.source)
  assert.equal(liberaciones, 1)
  assert.equal(actual.image.width, 617)
  assert.equal(actual.image.height, 440)
  assert.equal(actual.colorSpace, anterior.colorSpace)
  assert.equal(cambios.at(-1).seccion, 'datos')
  ficha.ajustar(686, 421)
  assert.equal(ficha.malla.material.map, actual, 'el mismo tamaño reutiliza la textura')
  assert.equal(liberaciones, 1)
  let actualLiberada = 0
  actual.addEventListener('dispose', () => { actualLiberada += 1 })
  ficha.destruir()
  ficha.destruir()
  assert.equal(actualLiberada, 1)
})

it('la rasterización física conserva páginas, orientación y acciones lógicas sin recomponer la lectura', t => {
  const { ficha } = preparar(t)
  const c = calcularConfiguracionVisor({ ancho: 844, alto: 390, diagonal: 8, densidad: 3 })
  ficha.ajustar(844, 390, c)
  const cuerpo = CUERPOS_CELESTES.find(c => c.id === 'saturno')
  ficha.establecerCuerpo(cuerpo)
  ficha.establecerContenido({ fase: 'disponible', ficha: adaptarContenido(cuerpo, FICHAS_PRUEBA.find(f => f.slug === cuerpo.id)) })
  ficha.establecerModo('vr')
  ficha.mostrarSeccion(1)
  const camara = new PerspectiveCamera(70, 2, .1, 1000)
  ficha.reubicar(camara)
  const estado = ficha.obtenerLectura(), revision = ficha.obtenerRevisionLectura(), posicion = ficha.malla.position.clone()
  assert.equal(posicion.z, -DISTANCIA_FICHA_VR)
  const original = ficha.malla.material.map
  let liberaciones = 0
  original.addEventListener('dispose', () => { liberaciones += 1 })
  ficha.ajustar(844, 390, { ...c, factorTextura: 1 })
  assert.equal(liberaciones, 1)
  assert.deepEqual(ficha.obtenerLectura(), estado)
  assert.equal(ficha.obtenerRevisionLectura(), revision)
  assert.deepEqual(ficha.malla.position, posicion)
  assert.equal(ficha.malla.material.map.image.width, 900)
  const p = ficha.obtenerPresentacion()
  for (const zona of obtenerZonasNavegacion(p.ancho, p.alto, estado.pagina, estado.total, null, p)) {
    const punto = ficha.malla.localToWorld(new Vector3((zona.x + zona.ancho / 2) / p.ancho - .5, .5 - (zona.y + zona.alto / 2) / p.alto, 0))
    camara.lookAt(punto)
    assert.equal(ficha.detectar(camara)?.accion, zona.accion)
  }
  ficha.ajustar(844, 390, c)
  assert.equal(ficha.malla.material.map.image.width, 1800)
  assert.equal(ficha.obtenerRevisionLectura(), revision)
  assert.equal(ficha.malla.material.map.generateMipmaps, false)
})

it('rellena el Canvas, conserva Libros al llegar la API y navega continuaciones con las mismas pestañas', (t) => {
  const { ficha, cambios, textos, obtenerDibujos } = preparar(t)
  const cuerpo = CUERPOS_CELESTES.find((registro) => registro.id === 'luna')
  const fuente = FICHAS_PRUEBA.find((registro) => registro.slug === cuerpo.id)
  const contenido = { fase: 'disponible', ficha: adaptarContenido(cuerpo, fuente) }
  ficha.ajustar(350, 200)
  ficha.establecerCuerpo(cuerpo)
  ficha.establecerModo('vr')
  ficha.mostrarSeccion(3)
  ficha.establecerContenido(contenido)
  assert.equal(cambios.at(-1).seccion, 'libros')
  assert.ok(ficha.obtenerLectura().pagina > 3)
  ficha.mostrarSeccion(0)
  textos.length = 0
  ficha.establecerModo('vr')
  while (cambios.at(-1).seccion === 'resumen') {
    if (!ficha.moverPagina(1)) break
  }
  assert.ok(textos.some((texto) => texto.includes('La Luna')))
  const cantidad = obtenerDibujos()
  ficha.establecerContenido(contenido)
  assert.equal(obtenerDibujos(), cantidad)
  ficha.mostrarSeccion(3)
  ficha.ajustar(900, 450)
  assert.equal(cambios.at(-1).seccion, 'libros')
  ficha.establecerModo('normal')
  assert.equal(ficha.obtenerLectura().pagina, 0)
  ficha.establecerModo('vr')
  assert.equal(cambios.at(-1).seccion, 'resumen')
  ficha.establecerCuerpo(CUERPOS_CELESTES[0])
  assert.equal(ficha.obtenerLectura().total, 4)
  ficha.destruir()
  const ultimo = obtenerDibujos()
  ficha.establecerContenido(contenido)
  assert.equal(obtenerDibujos(), ultimo)
})

it('la imagen dibujada ocupa su franja del encabezado y no se cruza con pestañas, cierre ni lectura', (t) => {
  const { ficha, imagenes, dibujosImagen } = preparar(t, .65)
  const cruzan = (a, b) => a.x < b.x + b.ancho && a.x + a.ancho > b.x && a.y < b.y + b.alto && a.y + a.alto > b.y
  ficha.establecerModo('vr')
  for (const [ancho, alto, diagonal] of [[740, 360, 5.5], [844, 390, 6.9], [1381, 645, 6.1], [1381, 645, 8]]) {
    ficha.ajustar(ancho, alto, calcularConfiguracionVisor({ ancho, alto, diagonal, densidad: 3 }))
    for (const cuerpo of CUERPOS_CELESTES) {
      const mensaje = `${ancho}×${alto} ${diagonal}" ${cuerpo.id}`
      ficha.establecerCuerpo(cuerpo)
      Object.assign(imagenes.at(-1), { complete: true, naturalWidth: 900, naturalHeight: 506 })
      dibujosImagen.length = 0
      imagenes.at(-1).onload()
      assert.equal(dibujosImagen.length, 1, mensaje)
      const dibujo = dibujosImagen[0]
      const p = ficha.obtenerPresentacion()
      for (const zona of obtenerZonasNavegacion(p.ancho, p.alto, 0, 4, null, p)) assert.ok(!cruzan(dibujo, zona), `${mensaje}: la imagen toca ${zona.accion}`)
      assert.ok(dibujo.y + dibujo.alto <= p.inicio, `${mensaje}: la imagen invade el contenido`)
      assert.ok(dibujo.x >= p.cajaImagen.x - .01 && dibujo.x + dibujo.ancho <= p.cajaImagen.x + p.cajaImagen.ancho + .01
        && dibujo.y >= p.cajaImagen.y - .01 && dibujo.y + dibujo.alto <= p.cajaImagen.y + p.cajaImagen.alto + .01, `${mensaje}: la imagen sale de su franja`)
    }
  }
})

it('carga y error aparecen dentro del visor y no impiden cerrar o cambiar seccion', (t) => {
  const { ficha, textos, cambios } = preparar(t)
  ficha.establecerCuerpo(CUERPOS_CELESTES[0])
  ficha.establecerModo('vr')
  ficha.establecerContenido({ fase: 'cargando' })
  assert.ok(textos.includes('Cargando información...'))
  ficha.establecerContenido({ fase: 'error' })
  ficha.mostrarSeccion(3)
  assert.equal(cambios.at(-1).seccion, 'libros')
  assert.ok(textos.join(' ').includes('No se pudo cargar la información.'))
  ficha.establecerCuerpo(null)
  assert.equal(ficha.malla.visible, false)
})

it('cada luna conserva identidad, relación e imagen al navegar y alternar modos', (t) => {
  const { ficha, textos, imagenes } = preparar(t)
  const camara = new PerspectiveCamera(70, 2, .1, 1000)
  ficha.establecerModo('vr')
  for (const cuerpo of CUERPOS_CELESTES.filter((registro) => registro.tipo === 'satelite')) {
    textos.length = 0
    ficha.establecerCuerpo(cuerpo)
    ficha.reubicar(camara)
    assert.ok(textos.includes(cuerpo.nombre))
    assert.ok(textos.includes(cuerpo.clasificacion.toUpperCase()))
    assert.equal(imagenes.at(-1).src, cuerpo.imagen)
    assert.deepEqual(ficha.obtenerLectura(), { cuerpoId: cuerpo.id, pagina: 0, total: 4 })
    ficha.mostrarSeccion(1)
    assert.ok(textos.includes('Distancia al planeta'))
    ficha.mostrarSeccion(3)
    ficha.reubicar(camara)
    assert.equal(ficha.obtenerLectura().pagina, 3)
    ficha.establecerModo('normal')
    assert.equal(ficha.obtenerLectura().cuerpoId, cuerpo.id)
    assert.equal(ficha.obtenerLectura().pagina, 0)
    assert.equal(ficha.malla.visible, false)
    ficha.establecerModo('vr')
    ficha.establecerCuerpo(CUERPOS_CELESTES.find((registro) => registro.id === cuerpo.planetaId))
    assert.equal(ficha.obtenerLectura().cuerpoId, cuerpo.planetaId)
  }
})

it('un plano compartido permite apuntar acciones reales y conserva la lectura al reubicar', (t) => {
  const { ficha, lienzo } = preparar(t)
  const camara = new PerspectiveCamera(70, 2, .1, 1000)
  ficha.ajustar(900, 450)
  ficha.establecerCuerpo(CUERPOS_CELESTES[0])
  assert.equal(ficha.malla.visible, false)
  ficha.establecerModo('vr')
  ficha.reubicar(camara)
  assert.equal(ficha.malla.visible, true)
  assert.equal(ficha.detectar(camara)?.accion, 'siguiente', 'el centro de la lectura permite avanzar')
  const { pagina, total } = ficha.obtenerLectura()
  const zona = obtenerZonasNavegacion(lienzo.width, lienzo.height, pagina, total).find((z) => z.accion === 'siguiente')
  const punto = new Vector3((zona.x + zona.ancho / 2) / lienzo.width - .5, .5 - (zona.y + zona.alto / 2) / lienzo.height, 0)
  ficha.malla.localToWorld(punto)
  camara.lookAt(punto)
  assert.equal(ficha.detectar(camara).accion, 'siguiente')
  ficha.moverPagina(1)
  const despues = ficha.obtenerLectura().pagina
  ficha.reubicar(camara)
  assert.equal(ficha.obtenerLectura().pagina, despues)
  ficha.mostrarSeccion(3)
  assert.equal(ficha.obtenerLectura().pagina, 3)
  assert.equal(ficha.mostrarSeccion(3), false)
  ficha.establecerModo('normal')
  assert.equal(ficha.malla.visible, false)
  assert.equal(ficha.obtenerLectura().pagina, 0)
})

it('el rayo distingue ambas mitades, consume el límite inicial y respeta pestañas y cierre', (t) => {
  const { ficha, lienzo } = preparar(t)
  const camara = new PerspectiveCamera(70, 2, .1, 1000)
  ficha.ajustar(900, 450)
  ficha.establecerCuerpo(CUERPOS_CELESTES[0])
  ficha.establecerModo('vr')
  ficha.reubicar(camara)
  const apuntar = (x, y) => {
    camara.lookAt(ficha.malla.localToWorld(new Vector3(x - .5, .5 - y, 0)))
    return ficha.detectar(camara)
  }
  assert.ok(apuntar(.25, .5), 'la mitad sin acción sigue bloqueando el cielo')
  assert.equal(apuntar(.25, .5).accion, null)
  assert.equal(apuntar(.46, .5).accion, 'siguiente', 'permite avanzar antes de alcanzar el centro')
  ficha.moverPagina(1)
  assert.equal(apuntar(.25, .5).accion, 'anterior')
  ficha.mostrarSeccion(3)
  assert.equal(apuntar(.46, .5).accion, 'cerrar')
  for (const zona of obtenerZonasNavegacion(lienzo.width, lienzo.height, 3, 4)) {
    assert.equal(apuntar((zona.x + zona.ancho / 2) / lienzo.width, (zona.y + zona.alto / 2) / lienzo.height).accion,
      zona.accion === 'siguiente' ? 'cerrar' : zona.accion)
  }
  assert.equal(apuntar(1.5, .5), null)
})

it('la revisión invalida lectura sustituida, pero no mirada, resaltado, imagen ni recentrado', (t) => {
  const { ficha, imagenes } = preparar(t)
  const camara = new PerspectiveCamera(70, 2, .1, 1000)
  ficha.establecerCuerpo(CUERPOS_CELESTES[0])
  ficha.establecerModo('vr')
  ficha.reubicar(camara)
  const inicial = ficha.obtenerRevisionLectura()
  ficha.detectar(camara)
  imagenes[0].onload()
  ficha.reubicar(camara)
  assert.equal(ficha.obtenerRevisionLectura(), inicial)
  for (const cambiar of [() => ficha.moverPagina(1), () => ficha.mostrarSeccion(3), () => ficha.establecerContenido({ fase: 'cargando' }), () => ficha.ajustar(900, 450), () => ficha.establecerCuerpo(CUERPOS_CELESTES[1])]) {
    const antes = ficha.obtenerRevisionLectura()
    cambiar()
    assert.ok(ficha.obtenerRevisionLectura() > antes)
  }
})

it('sin cambios no redibuja; libera cada recurso una vez e ignora imágenes tardías', (t) => {
  const { ficha, imagenes, obtenerDibujos } = preparar(t)
  ficha.establecerCuerpo(CUERPOS_CELESTES[0])
  const dibujoAntes = obtenerDibujos()
  ficha.establecerCuerpo(CUERPOS_CELESTES[0])
  assert.equal(obtenerDibujos(), dibujoAntes)
  const tardia = imagenes[0].onload
  ficha.establecerCuerpo(CUERPOS_CELESTES[1])
  const actual = obtenerDibujos()
  tardia()
  assert.equal(obtenerDibujos(), actual)
  const recursos = [ficha.malla.geometry, ficha.malla.material, ficha.malla.material.map]
  const liberados = recursos.map(() => 0)
  recursos.forEach((r, i) => r.addEventListener('dispose', () => { liberados[i] += 1 }))
  const callback = imagenes[1].onload
  ficha.destruir(); ficha.destruir(); callback()
  assert.deepEqual(liberados, [1, 1, 1])
  assert.equal(ficha.malla.visible, false)
  assert.equal(imagenes[1].onload, null)
})
