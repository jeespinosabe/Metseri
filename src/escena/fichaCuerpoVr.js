import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, Raycaster, SRGBColorSpace, Vector2, Vector3 } from 'three'
import { calcularEncabezadoFicha, crearEstadoLectura, crearPaginasFicha, detectarAccionFicha, obtenerTextoCategoria, obtenerZonasNavegacion, resolverAccionFicha, SECCIONES_FICHA } from './contenidoFicha.js'
import { calcularPresentacionFicha, configurarTexturaLectura } from './lecturaVisor.js'
import { limitarRasterizacion } from './rendimientoEscena.js'

const DISTANCIA_FICHA = 32

export function crearFichaCuerpoVr({ alInvalidar, alCambiarLectura } = {}) {
  const lienzo = document.createElement('canvas')
  lienzo.width = 800
  lienzo.height = 720
  const contexto = lienzo.getContext('2d')
  let textura = new CanvasTexture(lienzo)
  textura.colorSpace = SRGBColorSpace
  const geometria = new PlaneGeometry(1, 1)
  const material = new MeshBasicMaterial({ map: textura, toneMapped: false })
  const malla = new Mesh(geometria, material)
  malla.visible = false
  const rayo = new Raycaster()
  let cuerpo = null
  let paginas = []
  let contenido = null
  let recomponiendo = false
  const avisarLectura = (estado) => alCambiarLectura?.({ ...estado, seccion: paginas[estado.pagina]?.id ?? null })
  const lectura = crearEstadoLectura((estado) => { if (!recomponiendo) avisarLectura(estado) })
  let zonas = []
  let imagen = null
  let accionApuntada = null
  let enVr = false
  let destruido = false
  let versionImagen = 0
  let revisionLectura = 0
  let presentacion = null
  // Presentación del visor con el encabezado ya repartido para el cuerpo actual.
  let diseno = null
  let factorTextura = 1
  let anchoLogico = lienzo.width
  let altoLogico = lienzo.height

  function dibujar() {
    if (!cuerpo || destruido) return
    const { pagina, total } = lectura.obtenerEstado()
    const contenido = paginas[pagina]
    const ancho = anchoLogico
    const alto = altoLogico
    const fuentes = presentacion?.tipografia
    contexto.setTransform?.(factorTextura, 0, 0, factorTextura, 0, 0)
    contexto.fillStyle = '#111b24'
    contexto.fillRect(0, 0, ancho, alto)
    contexto.strokeStyle = '#35434d'
    contexto.lineWidth = 2
    contexto.strokeRect(2, 2, ancho - 4, alto - 4)
    contexto.textBaseline = 'top'
    contexto.textAlign = 'left'
    contexto.fillStyle = '#c5e49b'
    const tamanoCategoria = fuentes?.categoria ?? Math.max(13, Math.min(20, ancho / 32))
    contexto.font = `${tamanoCategoria}px system-ui, sans-serif`
    const lineasCategoria = diseno?.lineasCategoria ?? [obtenerTextoCategoria(cuerpo)]
    lineasCategoria.forEach((linea, indice) => contexto.fillText(linea, 32, 20 + indice * tamanoCategoria * 1.05))
    contexto.font = `${fuentes?.titulo ?? Math.max(30, Math.min(56, ancho / 12))}px system-ui, sans-serif`
    contexto.fillStyle = '#eef2f4'
    contexto.fillText(cuerpo.nombre, 30, diseno?.tituloY ?? 44)
    if (imagen?.complete && imagen.naturalWidth > 0 && (!diseno || diseno.cajaImagen)) {
      // En el visor la imagen se ajusta a su propia franja del encabezado; fuera de ella conserva la posición original.
      const caja = diseno?.cajaImagen ?? { x: ancho - 76 - Math.min(130, ancho * .22), y: 25, ancho: Math.min(130, ancho * .22), alto: 84 }
      const escala = Math.min(caja.ancho / imagen.naturalWidth, caja.alto / imagen.naturalHeight)
      const anchoImagen = imagen.naturalWidth * escala
      const altoImagen = imagen.naturalHeight * escala
      contexto.globalCompositeOperation = 'screen'
      contexto.drawImage(imagen, diseno ? caja.x + (caja.ancho - anchoImagen) / 2 : caja.x, diseno ? caja.y + (caja.alto - altoImagen) / 2 : caja.y, anchoImagen, altoImagen)
      contexto.globalCompositeOperation = 'source-over'
    }
    zonas = []
    for (const elemento of contenido.elementos) {
      if (elemento.tipo === 'espacio') {
        contexto.fillStyle = '#24323c'
        contexto.fillRect(elemento.x, elemento.y, elemento.ancho, elemento.alto)
      } else {
        contexto.font = `${elemento.negrita ? '700 ' : ''}${elemento.tamano}px system-ui, sans-serif`
        contexto.fillStyle = elemento.acento ? '#c5e49b' : elemento.tenue ? '#8ea0ad' : '#e2e8ed'
        contexto.fillText(elemento.texto, elemento.x, elemento.y)
        if (elemento.accion) zonas.push({ accion: elemento.accion, x: elemento.x, y: elemento.y, ancho: contexto.measureText(elemento.texto).width, alto: elemento.tamano * 1.35 })
      }
    }
    contexto.font = `${fuentes?.nota ?? (ancho < 400 ? 16 : 22)}px system-ui, sans-serif`
    contexto.fillStyle = '#9aadb8'
    contexto.textAlign = 'center'
    contexto.fillText(`${pagina + 1} / ${total}`, ancho / 2, alto - 63)
    for (const zona of obtenerZonasNavegacion(ancho, alto, pagina, total, paginas, diseno)) {
      zonas.push(zona)
      const activa = accionApuntada !== null && resolverAccionFicha(zona.accion, { pagina, total }) === accionApuntada
      contexto.fillStyle = activa ? '#cce89f' : zona.actual ? '#354832' : '#1c2b36'
      contexto.fillRect(zona.x, zona.y, zona.ancho, zona.alto)
      contexto.fillStyle = activa ? '#101a17' : zona.actual ? '#d5edb6' : '#d4dfe5'
      const tamano = fuentes ? (zona.accion.startsWith('seccion:') ? fuentes.pestana : fuentes.navegacion)
        : zona.accion === 'cerrar' ? 30 : ancho < 400 ? 16 : 24
      contexto.font = `${tamano}px system-ui, sans-serif`
      contexto.textAlign = 'center'
      contexto.fillText(zona.texto, zona.x + zona.ancho / 2, zona.y + (zona.accion === 'cerrar' && fuentes ? 8 : 14))
    }
    contexto.textAlign = 'left'
    textura.needsUpdate = true
    alInvalidar?.()
  }

  function componer(reiniciar = false) {
    revisionLectura += 1
    const anterior = lectura.obtenerEstado().pagina
    const seccion = paginas[anterior]?.id
    const continuacion = anterior - paginas.findIndex((pagina) => pagina.id === seccion)
    diseno = presentacion && cuerpo ? {
      ...presentacion,
      ...calcularEncabezadoFicha(presentacion, { categoria: obtenerTextoCategoria(cuerpo), nombre: cuerpo.nombre }, (texto, tamano) => {
        contexto.font = `${tamano}px system-ui, sans-serif`
        return contexto.measureText(texto).width
      }),
    } : presentacion
    paginas = cuerpo ? crearPaginasFicha(cuerpo, contexto, { ancho: anchoLogico, alto: altoLogico, contenido, presentacion: diseno }) : []
    recomponiendo = true
    lectura.actualizar(cuerpo?.id ?? null, paginas.length, reiniciar)
    if (!reiniciar && seccion) {
      const inicio = paginas.findIndex((pagina) => pagina.id === seccion)
      if (inicio >= 0) lectura.irA(inicio + Math.min(continuacion, paginas.filter((pagina) => pagina.id === seccion).length - 1))
    }
    recomponiendo = false
    avisarLectura(lectura.obtenerEstado())
    accionApuntada = null
    dibujar()
  }

  return {
    malla,
    obtenerPresentacion: () => diseno,
    obtenerLectura: lectura.obtenerEstado,
    obtenerRevisionLectura: () => revisionLectura,
    establecerCuerpo(nuevoCuerpo) {
      if (destruido || cuerpo?.id === nuevoCuerpo?.id) return
      cuerpo = nuevoCuerpo
      contenido = null
      versionImagen += 1
      if (imagen) { imagen.onload = null; imagen.onerror = null }
      imagen = null
      malla.visible = enVr && Boolean(cuerpo)
      componer(true)
      if (!cuerpo) return
      const version = versionImagen
      imagen = new Image()
      imagen.onload = imagen.onerror = () => { if (!destruido && version === versionImagen) dibujar() }
      imagen.src = cuerpo.imagen
    },
    establecerContenido(nuevoContenido) {
      if (destruido || !cuerpo || contenido === nuevoContenido) return
      contenido = nuevoContenido
      componer()
    },
    establecerModo(modo) {
      if (destruido) return
      enVr = modo === 'vr'
      malla.visible = enVr && Boolean(cuerpo)
      componer(true)
    },
    ajustar(ancho, alto, configuracion = null) {
      if (destruido) return
      const anterior = JSON.stringify(presentacion)
      const desplazamientoAnterior = presentacion?.desplazamientoY ?? 0
      presentacion = configuracion && ancho > alto ? calcularPresentacionFicha(configuracion) : null
      const anchoAnterior = anchoLogico
      const altoAnterior = altoLogico
      anchoLogico = presentacion?.ancho ?? Math.max(320, Math.min(900, Math.round(ancho * .9)))
      const altoReferencia = Math.max(440, Math.min(1000, Math.round(alto * 1.6)))
      altoLogico = presentacion?.alto ?? Math.max(440, Math.round(altoReferencia * .55))
      const raster = presentacion ? limitarRasterizacion(anchoLogico, altoLogico, configuracion)
        : { ancho: anchoLogico, alto: altoLogico, factor: 1 }
      factorTextura = raster.factor
      if (lienzo.width !== raster.ancho || lienzo.height !== raster.alto) {
        lienzo.width = raster.ancho
        lienzo.height = raster.alto
        // WebGL reserva las dimensiones de la textura al subirla por primera vez.
        // Una actualización parcial tras reducir el Canvas deja restos de la ficha anterior.
        textura.dispose()
        textura = new CanvasTexture(lienzo)
        textura.colorSpace = SRGBColorSpace
        material.map = textura
      }
      if (presentacion) configurarTexturaLectura(textura)
      const altoMundo = 2 * DISTANCIA_FICHA * Math.tan(35 * Math.PI / 180) * .82
      const anchoMundo = altoMundo * (ancho / 2 / alto)
      // Mantener el ancho y la escala del texto al acortar el área de lectura.
      const escala = presentacion?.escala ?? Math.min(anchoMundo / anchoLogico, altoMundo / altoReferencia)
      malla.scale.set(anchoLogico * escala, altoLogico * escala, 1)
      malla.position.add(new Vector3(0, (presentacion?.desplazamientoY ?? 0) - desplazamientoAnterior, 0).applyQuaternion(malla.quaternion))
      if (anchoAnterior !== anchoLogico || altoAnterior !== altoLogico || anterior !== JSON.stringify(presentacion)) componer()
      else dibujar()
    },
    reubicar(camara) {
      if (!cuerpo || destruido) return
      malla.position.set(0, presentacion?.desplazamientoY ?? 0, -DISTANCIA_FICHA).applyQuaternion(camara.quaternion)
      malla.up.set(0, 1, 0).applyQuaternion(camara.quaternion)
      malla.quaternion.copy(camara.quaternion)
      malla.updateWorldMatrix(true, false)
      alInvalidar?.()
    },
    detectar(camara) {
      if (!malla.visible || destruido) return null
      camara.updateWorldMatrix(true, false)
      malla.updateWorldMatrix(true, false)
      rayo.setFromCamera(new Vector2(0, 0), camara)
      const impacto = rayo.intersectObject(malla, false)[0]
      const accion = impacto ? detectarAccionFicha(impacto.uv, anchoLogico, altoLogico, zonas, lectura.obtenerEstado()) : null
      if (accion !== accionApuntada) { accionApuntada = accion; dibujar() }
      return impacto ? { accion, distancia: impacto.distance } : null
    },
    moverPagina(desplazamiento) {
      if (destruido || !lectura.mover(desplazamiento)) return false
      revisionLectura += 1
      accionApuntada = null
      dibujar()
      return true
    },
    mostrarSeccion(indice) {
      const destino = paginas.findIndex((pagina) => pagina.id === SECCIONES_FICHA[indice]?.id)
      if (destruido || destino < 0 || !lectura.irA(destino)) return false
      revisionLectura += 1
      accionApuntada = null
      dibujar()
      return true
    },
    destruir() {
      if (destruido) return
      destruido = true
      versionImagen += 1
      if (imagen) { imagen.onload = null; imagen.onerror = null }
      imagen = null
      cuerpo = null
      paginas = []
      zonas = []
      malla.visible = false
      malla.removeFromParent()
      geometria.dispose()
      material.dispose()
      textura.dispose()
    },
  }
}
