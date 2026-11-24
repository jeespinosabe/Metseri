import assert from 'node:assert/strict'
import { it } from 'node:test'
import { Euler, Quaternion, Vector3 } from 'three'
import { calcularConfiguracionVisor, limitarRasterizacion } from './rendimientoEscena.js'
import { calcularPresentacionFicha, DISTANCIA_FICHA_VR } from './lecturaVisor.js'
import { proyectarPuntoVisor, proyectarRectanguloVisor, medirFuenteVisor, rectangulosSeCruzan } from './proyeccionVisor.js'
import { crearPaginasFicha } from './contenidoFicha.js'
import { FICHAS_PRUEBA } from '../pruebas/fichasPrueba.js'
import { adaptarContenido } from '../servicios/consultaContenido.js'
import { obtenerCuerpoCeleste } from '../datos/cuerposCelestes.js'
import { prepararEntornoEscena } from '../pruebas/entornoEscena.js'

const ventanas = [[844, 390], [1045, 552], [1381, 645]]
const contexto = { font: '', measureText(texto) { return { width: texto.length * Number(this.font.match(/([\d.]+)px/)[1]) * .55 } } }

it('la medición de pantalla invierte la distorsión utilizada por el shader de lentes', () => {
  for (const diagonal of [6.9, 7, 8]) {
    const c = calcularConfiguracionVisor({ ancho: 844, alto: 390, diagonal, densidad: 3 })
    for (const indice of [0, 1]) for (const punto of [{ x: 0, y: 0, z: -32 }, { x: 8, y: -4, z: -60 }, { x: -12, y: 12, z: -60 }]) {
      const p = proyectarPuntoVisor(punto, c, indice), ojo = c.optica.ojos[indice]
      const x = (p.x * c.optica.milimetrosPorPixel - ojo.centroX) / 40
      const y = ((c.alto - p.y) * c.optica.milimetrosPorPixel - ojo.centroY) / 40
      const r2 = x * x + y * y
      const factor = 1 + .34 * r2 + .1 * r2 * r2
      assert.ok(Math.abs(x * factor - (punto.x - ojo.desplazamiento) / -punto.z) < 1e-8)
      assert.ok(Math.abs(y * factor - punto.y / -punto.z) < 1e-8)
    }
  }
})

it('la calidad automática no decrece con pulgadas y respeta DPR, presupuesto y GPU', () => {
  for (const [ancho, alto] of ventanas) for (const densidad of [1, 2, 3]) {
    let anterior = 0
    for (const diagonal of [6.9, 7, 8]) {
      const c = calcularConfiguracionVisor({ ancho, alto, diagonal, densidad })
      assert.ok(c.proporcion >= anterior && c.proporcion <= densidad && c.proporcion <= 1.75)
      assert.ok(ancho * alto * c.proporcion ** 2 <= 2_000_000 + .001)
      anterior = c.proporcion
    }
    const limitada = calcularConfiguracionVisor({ ancho, alto, densidad, diagonal: 8, maxTextura: 512, maxRenderbuffer: 256 })
    assert.ok(Math.max(ancho, alto) * limitada.proporcion <= 256)
  }
  assert.deepEqual(limitarRasterizacion(900, 800), { ancho: 1800, alto: 1600, factor: 2 })
  const limitada = limitarRasterizacion(900, 800, { maxTextura: 512 })
  assert.equal(limitada.ancho, 512)
  assert.ok(limitada.alto <= 512)
})

it('las doce fichas mantienen contenido completo, sin recorte y con letra proyectada legible', () => {
  const formatos = [...ventanas.flatMap(([ancho, alto]) => [{ ancho, alto }, { ancho, alto, tactil: true }]),
    { ancho: 1368, alto: 678, escritorio: true }, { ancho: 1920, alto: 1080, escritorio: true }]
  for (const formato of formatos) for (const diagonal of [6.9, 7, 8]) {
    const { ancho, alto } = formato
    const c = calcularConfiguracionVisor({ ...formato, diagonal, densidad: 3 })
    const p = calcularPresentacionFicha(c)
    const cajas = proyectarRectanguloVisor({ y: p.desplazamientoY, z: -DISTANCIA_FICHA_VR, ancho: p.ancho * p.escala, alto: p.alto * p.escala }, c)
    for (const caja of cajas) {
      assert.ok(caja.visible && caja.x >= 12 && caja.x + caja.ancho <= ancho / 2 - 12)
      assert.ok(caja.y >= 40 && caja.y + caja.alto <= alto - c.margenInferior)
    }
    const primeraFila = p.alto * 11 / 40
    const objetivos = formato.tactil ? { parrafo: 15.19, etiqueta: 13.23, unidad: 13.23, valor: 16.66, seccion: 16.66, titulo: 20.58 }
      : { parrafo: 16, etiqueta: 14, unidad: 14, valor: 17.5, seccion: 17.5, titulo: 21.5 }
    for (const [estilo, objetivo] of Object.entries(objetivos)) {
      const filas = [p.alto * .5, p.alto * .625, p.alto * .85]
      if (estilo === 'titulo') filas.push(primeraFila)
      else filas.push(Math.min(p.inicio, primeraFila), p.inicio)
      let minimo = Infinity
      for (const x of [32, 225, 450, 675, 868]) for (const y of filas) {
        const medidas = medirFuenteVisor({ x: (x - p.ancho / 2) * p.escala, y: p.desplazamientoY + (p.alto / 2 - y) * p.escala,
          z: -DISTANCIA_FICHA_VR, tamano: p.tipografia[estilo] * p.escala }, c)
        minimo = Math.min(minimo, ...medidas)
      }
      assert.ok(minimo >= objetivo - .08 && minimo <= objetivo + .2, `${ancho}/${diagonal}/${estilo}: ${minimo} px`)
    }
    for (const fuente of FICHAS_PRUEBA) for (const copia of [false, true]) {
      const cuerpo = obtenerCuerpoCeleste(fuente.slug)
      const ficha = adaptarContenido(cuerpo, fuente)
      const libros = [{ titulo: 'Un título largo que debe conservar todas sus palabras al continuar la lectura', autor: 'Autor de prueba', editorial: 'Editorial de prueba', anio: 2026 }]
      const paginas = crearPaginasFicha(cuerpo, contexto, { ancho: p.ancho, alto: p.alto, presentacion: p,
        contenido: { fase: 'disponible', ficha, bibliografia: { fase: 'disponible', libros }, ...(copia ? { fechaDescarga: 1_794_952_800_000 } : {}) } })
      for (const pagina of paginas) for (const e of pagina.elementos) {
        if (e.tipo !== 'texto') continue
        assert.ok(e.y + e.tamano * 1.2 <= p.alto - p.pie + .1, `${ancho}/${diagonal}/${cuerpo.id}: ${e.texto}`)
        contexto.font = `${e.negrita ? '700 ' : ''}${e.tamano}px system-ui`
        assert.ok(e.x + contexto.measureText(e.texto).width <= p.ancho - p.margen + .1)
      }
      const datos = paginas.filter(pagina => pagina.id === 'datos').flatMap(pagina => pagina.elementos).map(e => e.texto ?? '').join(' ').replace(/\s+/g, ' ')
      for (const dato of ficha.datos.filter(Boolean)) for (const texto of [dato.etiqueta, dato.valor, dato.unidad]) assert.ok(datos.includes(texto), texto)
      const reconstruir = id => paginas.filter(pagina => pagina.id === id).flatMap(pagina => pagina.elementos)
        .filter(e => e.tipo === 'texto' && e.tamano === p.tipografia.parrafo && !e.acento).map(e => e.texto).join(' ')
      assert.equal(reconstruir('resumen'), ficha.descripcion)
      assert.equal(reconstruir('curiosidades'), ficha.curiosidades.join(' '))
      const titulos = paginas.filter(pagina => pagina.id === 'libros').flatMap(pagina => pagina.elementos).filter(e => e.negrita).map(e => e.texto).join(' ')
      assert.equal(titulos, libros[0].titulo)
      const metadatos = reconstruir('libros')
      assert.ok(metadatos.includes(libros[0].autor))
      assert.ok(metadatos.includes(`${libros[0].editorial} · ${libros[0].anio}`))
    }
  }
})

it('con entrada táctil la ficha dibuja letra más pequeña en la misma textura', t => {
  const entorno = prepararEntornoEscena(t)
  const { campo } = entorno
  let tactil = false
  window.matchMedia = consulta => ({ matches: tactil && consulta === '(pointer: coarse)' })
  entorno.redimensionar(844, 390, { rotarPantalla: true })
  campo.establecerModo('vr')
  campo.ocultarInstruccionVr()
  entorno.apuntarCuerpo('tierra')
  campo.activar({})
  entorno.dibujar()

  const material = entorno.tarjeta().material
  const textura = material.map
  const tamanos = new Map()
  t.mock.method(textura.image.getContext('2d'), 'fillText', function (texto) {
    tamanos.set(texto, Number.parseFloat(this.font))
  })
  campo.establecerContenidoFicha('tierra', { fase: 'cargando' })
  const tamanosAnteriores = new Map(tamanos)
  tamanos.clear()

  tactil = true
  entorno.redimensionar(844, 390, { rotarPantalla: true })
  assert.ok(tamanos.get('Tierra') < tamanosAnteriores.get('Tierra'))
  assert.ok(tamanos.get('Cargando información...') < tamanosAnteriores.get('Cargando información...'))
  assert.equal(tamanos.get('Datos'), tamanosAnteriores.get('Datos'))
  assert.equal(material.map, textura)
})

it('en escritorio la ficha ocupa menos pantalla y conserva su sección y resolución de texto', t => {
  const entorno = prepararEntornoEscena(t)
  const { campo } = entorno
  let tipoPuntero = 'coarse'
  window.matchMedia = consulta => ({ matches: consulta === `(pointer: ${tipoPuntero})` })
  const ancho = 1920, alto = 1080
  const configuracion = calcularConfiguracionVisor({ ancho, alto })
  entorno.redimensionar(ancho, alto, { rotarPantalla: true })
  campo.establecerModo('vr')
  campo.ocultarInstruccionVr()
  entorno.apuntarCuerpo('tierra')
  campo.activar({})
  campo.ejecutarAccionFicha('seccion:1')
  entorno.dibujar()
  const tarjeta = entorno.tarjeta()
  const medir = () => proyectarRectanguloVisor({ ...tarjeta.position, ancho: tarjeta.scale.x, alto: tarjeta.scale.y }, configuracion)
  const antes = medir()
  assert.equal(tarjeta.material.map.image.height, 1600)

  tipoPuntero = 'fine'
  entorno.redimensionar(ancho, alto, { rotarPantalla: true })
  entorno.dibujar()
  assert.equal(entorno.lectura().cuerpoId, 'tierra')
  assert.equal(entorno.lectura().seccion, 'datos')
  const presentacion = calcularPresentacionFicha({ ...configuracion, escritorio: true })
  assert.equal(tarjeta.material.map.image.width, presentacion.ancho * 2)
  assert.equal(tarjeta.material.map.image.height, presentacion.alto * 2)
  assert.equal(tarjeta.material.map.generateMipmaps, false)
  assert.ok(medir().every((caja, ojo) => caja.visible && caja.ancho < 560 && caja.alto < antes[ojo].alto * .6))

  const ventanaEstrecha = calcularConfiguracionVisor({ ancho: 1045, alto: 552, diagonal: 8 })
  assert.deepEqual(calcularPresentacionFicha({ ...ventanaEstrecha, escritorio: true }), calcularPresentacionFicha(ventanaEstrecha))
})

it('los nombres centrados se pueden leer sin seleccionar y no quedan debajo de los botones', t => {
  const entorno = prepararEntornoEscena(t)
  entorno.campo.establecerModo('vr')
  entorno.campo.ocultarInstruccionVr()
  for (const [ancho, alto] of ventanas) for (const diagonal of [6.9, 7, 8]) {
    entorno.redimensionar(ancho, alto, { rotarPantalla: true })
    entorno.campo.establecerDiagonalPantalla(diagonal)
    for (const cuerpo of FICHAS_PRUEBA) {
      entorno.apuntarCuerpo(cuerpo.slug)
      entorno.dibujar()
      let etiqueta
      const visibles = []
      entorno.escena().traverse(o => {
        if (o.isSprite && o.userData.cuerpoId) {
          if (o.userData.cuerpoId === cuerpo.slug) etiqueta = o
          if (o.visible && o.userData.cajas) visibles.push(o.userData.cajas)
        }
      })
      assert.ok(etiqueta?.visible, `etiqueta de ${cuerpo.slug}`)
      const posicion = etiqueta.getWorldPosition(new Vector3()).applyQuaternion(entorno.campo.obtenerOrientacion().invert())
      const c = calcularConfiguracionVisor({ ancho, alto, diagonal })
      const medidas = medirFuenteVisor({ x: posicion.x, y: posicion.y + etiqueta.scale.y * (.5 - 8 / 160), z: posicion.z, tamano: etiqueta.scale.y * 52 / 160 }, c)
      assert.ok(medidas.every(valor => valor >= 14 - .1), `${cuerpo.slug}: ${medidas}`)
      for (const caja of etiqueta.userData.cajas) assert.ok(caja.y + caja.alto <= alto - 80)
      for (let i = 0; i < visibles.length; i += 1) for (let j = i + 1; j < visibles.length; j += 1) {
        assert.ok(visibles[i].every((caja, ojo) => !rectangulosSeCruzan(caja, visibles[j][ojo])))
      }
    }
  }
})

it('todos los nombres visibles del visor tienen el mismo tamaño proyectado', t => {
  const entorno = prepararEntornoEscena(t)
  entorno.campo.establecerModo('vr')
  entorno.campo.ocultarInstruccionVr()
  for (const [ancho, alto] of ventanas) for (const diagonal of [6.9, 8]) {
    entorno.redimensionar(ancho, alto, { rotarPantalla: true })
    entorno.campo.establecerDiagonalPantalla(diagonal)
    const c = calcularConfiguracionVisor({ ancho, alto, diagonal })
    const tamanos = []
    for (const cuerpo of FICHAS_PRUEBA) {
      entorno.apuntarCuerpo(cuerpo.slug)
      entorno.dibujar()
      const orientacionInversa = entorno.campo.obtenerOrientacion().invert()
      entorno.escena().traverse(o => {
        if (!o.isSprite || !o.userData.cuerpoId || !o.visible) return
        const posicion = o.getWorldPosition(new Vector3()).applyQuaternion(orientacionInversa)
        tamanos.push(Math.min(...medirFuenteVisor({ x: posicion.x, y: posicion.y + o.scale.y * (.5 - 8 / 160), z: posicion.z, tamano: o.scale.y * 52 / 160 }, c)))
      })
    }
    assert.ok(tamanos.length >= FICHAS_PRUEBA.length, `${ancho}/${diagonal}: hay nombres visibles`)
    assert.ok(Math.max(...tamanos) - Math.min(...tamanos) <= .3, `${ancho}/${diagonal}: ${Math.min(...tamanos)}–${Math.max(...tamanos)}`)
  }
})

it('cambiar pulgadas conserva estrellas, cuerpos y texturas y reutiliza entradas idénticas', t => {
  const entorno = prepararEntornoEscena(t)
  entorno.redimensionar(844, 390, { rotarPantalla: true })
  entorno.dibujar()
  const estrellas = []
  entorno.escena().traverse(o => { if (o.isPoints) estrellas.push({ objeto: o, posicion: o.geometry.attributes.position, color: o.geometry.attributes.color, textura: o.material.map }) })
  assert.equal(estrellas.reduce((total, e) => total + e.posicion.count, 0), 6000)
  entorno.campo.establecerModo('vr')
  entorno.campo.establecerDiagonalPantalla(8)
  entorno.apuntarCuerpo('tierra')
  entorno.campo.activar({})
  entorno.dibujar()
  const textura = entorno.tarjeta().material.map, version = textura.version
  entorno.campo.establecerDiagonalPantalla(8)
  entorno.dibujar()
  assert.equal(entorno.tarjeta().material.map, textura)
  assert.equal(textura.version, version)
  for (const diagonal of [6.9, 7, 8]) {
    entorno.campo.establecerDiagonalPantalla(diagonal)
    entorno.dibujar()
    for (const e of estrellas) {
      assert.equal(e.objeto.geometry.attributes.position, e.posicion)
      assert.equal(e.objeto.geometry.attributes.color, e.color)
      assert.equal(e.objeto.material.map, e.textura)
    }
  }
})

it('las etiquetas VR de las parejas de referencia se mantienen separadas entre sí y de la barra', t => {
  const entorno = prepararEntornoEscena(t)
  entorno.redimensionar(1381, 645, { rotarPantalla: true })
  entorno.campo.establecerDiagonalPantalla(8)
  entorno.campo.establecerModo('vr')
  entorno.campo.ocultarInstruccionVr()
  const etiquetas = []
  entorno.dibujar()
  entorno.escena().traverse(o => { if (o.isSprite && o.userData.cuerpoId) etiquetas.push(o) })
  for (const [ancho, alto] of ventanas) for (const diagonal of [6.9, 7, 8]) for (const movimiento of [-.02, 0, .02]) {
    entorno.redimensionar(ancho, alto, { rotarPantalla: true })
    entorno.campo.establecerDiagonalPantalla(diagonal)
    const orientacion = new Quaternion().setFromEuler(new Euler(10 * Math.PI / 180, 175 * Math.PI / 180 + movimiento, 0, 'YXZ'))
    entorno.campo.establecerOrientacion(orientacion)
    entorno.dibujar()
    const c = calcularConfiguracionVisor({ ancho, alto, diagonal })
    for (const id of ['saturno', 'titan', 'neptuno', 'triton']) {
      const cuerpo = entorno.escena().getObjectByName(id), posicion = cuerpo.position.clone().applyQuaternion(orientacion.clone().invert())
      const radio = cuerpo.children.find(o => o.isMesh).scale.x
      const cajas = proyectarRectanguloVisor({ ...posicion, ancho: radio * 2, alto: radio * 2 }, c)
      const anillo = cuerpo.children.find(o => o.geometry?.type === 'RingGeometry')
      const posiciones = anillo?.geometry.attributes.position
      let anillosVisibles = true
      for (let i = 0; posiciones && i < posiciones.count; i += 1) {
        const punto = anillo.localToWorld(new Vector3().fromBufferAttribute(posiciones, i)).applyQuaternion(orientacion.clone().invert())
        anillosVisibles &&= [0, 1].every(ojo => proyectarPuntoVisor(punto, c, ojo)?.visible)
      }
      if (anillosVisibles && cajas.every(caja => caja?.visible)) assert.equal(etiquetas.find(e => e.userData.cuerpoId === id)?.visible, true, `${ancho}/${diagonal}/${movimiento}/${id}`)
    }
    const visibles = etiquetas.filter(e => e.visible)
    for (let i = 0; i < visibles.length; i += 1) for (let j = i + 1; j < visibles.length; j += 1) {
      assert.ok(visibles[i].userData.cajas.every((c, ojo) => !rectangulosSeCruzan(c, visibles[j].userData.cajas[ojo])))
    }
  }
})

it('al abrir y cerrar una ficha, las etiquetas VR conservan su posición aunque la ficha las cubra', t => {
  const entorno = prepararEntornoEscena(t)
  const { campo } = entorno
  const ancho = 1381, alto = 645, diagonal = 8
  entorno.redimensionar(ancho, alto, { rotarPantalla: true })
  campo.establecerDiagonalPantalla(diagonal)
  campo.establecerModo('vr')
  campo.ocultarInstruccionVr()
  entorno.apuntarCuerpo('saturno')
  entorno.dibujar()

  const etiquetas = []
  entorno.escena().traverse(objeto => { if (objeto.isSprite && objeto.userData.cuerpoId) etiquetas.push(objeto) })
  const posicionesVisibles = () => etiquetas.filter(etiqueta => etiqueta.visible).map(etiqueta => ({
    id: etiqueta.userData.cuerpoId, posicion: etiqueta.position.toArray(), escala: etiqueta.scale.toArray(),
  }))
  const posicionesAnteriores = posicionesVisibles()
  const etiquetaSaturno = etiquetas.find(etiqueta => etiqueta.userData.cuerpoId === 'saturno')
  assert.ok(etiquetaSaturno.visible)

  campo.activar({})
  entorno.dibujar()
  const tarjeta = entorno.tarjeta()
  assert.ok(tarjeta.visible)
  assert.deepEqual(posicionesVisibles(), posicionesAnteriores)

  const configuracion = calcularConfiguracionVisor({ ancho, alto, diagonal })
  const centroTarjeta = tarjeta.position.clone().applyQuaternion(campo.obtenerOrientacion().invert())
  const cajasTarjeta = proyectarRectanguloVisor({ ...centroTarjeta, ancho: tarjeta.scale.x, alto: tarjeta.scale.y }, configuracion)
  assert.ok(etiquetaSaturno.userData.cajas.every((caja, ojo) => rectangulosSeCruzan(caja, cajasTarjeta[ojo])))
  assert.ok(etiquetaSaturno.material.transparent && tarjeta.renderOrder > etiquetaSaturno.renderOrder,
    'la ficha se dibuja después de la etiqueta que cubre')

  const anillos = entorno.escena().getObjectByName('saturno').children.find(o => o.geometry?.type === 'RingGeometry')
  assert.ok(tarjeta.material.transparent && !tarjeta.material.depthTest && tarjeta.renderOrder > anillos.renderOrder,
    'la ficha se dibuja sobre los anillos aunque queden más cerca que el plano')

  campo.ejecutarAccionFicha('cerrar')
  entorno.dibujar()
  assert.equal(tarjeta.visible, false)
  assert.deepEqual(posicionesVisibles(), posicionesAnteriores)
})
