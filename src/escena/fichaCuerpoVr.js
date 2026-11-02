import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, Raycaster, SRGBColorSpace, Vector2 } from 'three'
import { crearEstadoLectura, crearPaginasFicha, detectarAccionFicha, dividirLineas, obtenerSeccionesFicha, obtenerZonasNavegacion } from './contenidoFicha.js'

const DISTANCIA_FICHA = 32

export function crearFichaCuerpoVr({ alInvalidar, alCambiarLectura } = {}) {
  const lienzo = document.createElement('canvas')
  lienzo.width = 800
  lienzo.height = 720
  const contexto = lienzo.getContext('2d')
  const textura = new CanvasTexture(lienzo)
  textura.colorSpace = SRGBColorSpace
  const geometria = new PlaneGeometry(1, 1)
  const material = new MeshBasicMaterial({ map: textura, toneMapped: false })
  const malla = new Mesh(geometria, material)
  malla.visible = false
  const rayo = new Raycaster()
  const lectura = crearEstadoLectura()
  let cuerpo = null
  let paginas = []
  let zonas = []
  let imagen = null
  let accionApuntada = null
  let enVr = false
  let destruido = false
  let versionImagen = 0
  let versionContenido = 0
  let contenido = { fase: 'cargando' }

  function informarLectura() {
    const estado = lectura.obtenerEstado()
    alCambiarLectura?.({ ...estado, seccion: paginas[estado.pagina]?.id ?? null })
  }

  function dibujar() {
    if (!cuerpo || destruido) return
    const { pagina, total } = lectura.obtenerEstado()
    const contenido = paginas[pagina]
    const ancho = lienzo.width
    const alto = lienzo.height
    contexto.fillStyle = '#111b24'
    contexto.fillRect(0, 0, ancho, alto)
    contexto.strokeStyle = '#35434d'
    contexto.lineWidth = 2
    contexto.strokeRect(2, 2, ancho - 4, alto - 4)
    contexto.textBaseline = 'top'
    contexto.textAlign = 'left'
    contexto.fillStyle = '#c5e49b'
    const fuenteCategoria = Math.max(12, Math.min(18, ancho / 32))
    contexto.font = `${fuenteCategoria}px system-ui, sans-serif`
    const categoria = (contenido.ficha ?? cuerpo).clasificacion.split('·').at(-1).trim().toUpperCase()
    dividirLineas(categoria, (texto) => contexto.measureText(texto).width, ancho - 110).forEach((linea, indice) => contexto.fillText(linea, 32, 16 + indice * (fuenteCategoria + 2)))
    contexto.font = `${Math.max(26, Math.min(48, ancho / 14))}px system-ui, sans-serif`
    contexto.fillStyle = '#eef2f4'
    contexto.fillText(cuerpo.nombre, 30, 62)
    if (imagen?.complete && imagen.naturalWidth > 0) {
      const anchoImagen = Math.min(130, ancho * .22)
      const escala = Math.min(anchoImagen / imagen.naturalWidth, 50 / imagen.naturalHeight)
      contexto.globalCompositeOperation = 'screen'
      contexto.drawImage(imagen, ancho - 32 - anchoImagen, 62, imagen.naturalWidth * escala, imagen.naturalHeight * escala)
      contexto.globalCompositeOperation = 'source-over'
    }
    zonas = []
    for (const elemento of contenido.elementos) {
      if (elemento.tipo === 'espacio') {
        contexto.fillStyle = '#24323c'
        contexto.fillRect(elemento.x, elemento.y, elemento.ancho, elemento.alto)
      } else {
        contexto.font = `${elemento.tamano}px system-ui, sans-serif`
        if (elemento.accion) {
          const zona = { accion: elemento.accion, x: elemento.x, y: elemento.y, ancho: Math.max(44, contexto.measureText(elemento.texto).width + 16), alto: 44 }
          zonas.push(zona)
          contexto.fillStyle = accionApuntada === elemento.accion ? '#cce89f' : '#354832'
          contexto.fillRect(zona.x, zona.y, zona.ancho, zona.alto)
        }
        contexto.fillStyle = elemento.accion && accionApuntada === elemento.accion ? '#101a17' : elemento.acento ? '#c5e49b' : elemento.tenue ? '#a8b9c5' : '#e2e8ed'
        contexto.fillText(elemento.texto, elemento.x + (elemento.accion ? 8 : 0), elemento.y + (elemento.accion ? 10 : 0))
      }
    }
    contexto.font = `${ancho < 400 ? 14 : 20}px system-ui, sans-serif`
    contexto.fillStyle = '#9aadb8'
    contexto.textAlign = 'center'
    const seccion = paginas[pagina].id
    const paginasSeccion = paginas.filter((entrada) => entrada.id === seccion)
    const inicioSeccion = paginas.findIndex((entrada) => entrada.id === seccion)
    const nombreSeccion = obtenerSeccionesFicha(paginas).find((entrada) => entrada.id === seccion).nombre
    contexto.fillText(`${nombreSeccion} · ${pagina - inicioSeccion + 1} / ${paginasSeccion.length}`, ancho / 2, alto - 111)
    for (const zona of obtenerZonasNavegacion(ancho, alto, pagina, total, obtenerSeccionesFicha(paginas), seccion)) {
      zonas.push(zona)
      const activa = zona.accion === accionApuntada
      contexto.fillStyle = activa ? '#cce89f' : zona.actual ? '#354832' : '#1c2b36'
      contexto.fillRect(zona.x, zona.y, zona.ancho, zona.alto)
      contexto.fillStyle = activa ? '#101a17' : zona.actual ? '#d5edb6' : '#d4dfe5'
      contexto.font = `${zona.accion === 'cerrar' ? 30 : Math.min(22, Math.max(12, zona.ancho / 5))}px system-ui, sans-serif`
      contexto.textAlign = 'center'
      contexto.fillText(zona.texto, zona.x + zona.ancho / 2, zona.y + 14)
    }
    contexto.textAlign = 'left'
    textura.needsUpdate = true
    alInvalidar?.()
  }

  function componer(reiniciar = false) {
    const anterior = lectura.obtenerEstado().pagina
    const seccionAnterior = paginas[anterior]?.id
    const subpagina = anterior - paginas.findIndex((pagina) => pagina.id === seccionAnterior)
    paginas = cuerpo ? crearPaginasFicha(contenido.ficha ?? cuerpo, contexto, { ancho: lienzo.width, alto: lienzo.height, contenido }) : []
    lectura.actualizar(cuerpo?.id ?? null, paginas.length, reiniciar)
    if (!reiniciar && seccionAnterior) {
      const inicio = paginas.findIndex((pagina) => pagina.id === seccionAnterior)
      const cantidad = paginas.filter((pagina) => pagina.id === seccionAnterior).length
      if (inicio >= 0) lectura.irA(inicio + Math.min(Math.max(0, subpagina), cantidad - 1))
    }
    accionApuntada = null
    informarLectura()
    dibujar()
  }

  return {
    malla,
    obtenerLectura: lectura.obtenerEstado,
    obtenerVersionContenido: () => versionContenido,
    obtenerLibro: (indice) => contenido.fase === 'disponible' ? contenido.ficha.libros[indice] : undefined,
    establecerContenido(nuevoContenido) {
      if (destruido || !cuerpo || nuevoContenido.slug !== cuerpo.id || nuevoContenido === contenido
        || (nuevoContenido.fase === 'disponible' && nuevoContenido.ficha?.id !== cuerpo.id)) return false
      contenido = nuevoContenido
      versionContenido += 1
      componer()
      return true
    },
    establecerCuerpo(nuevoCuerpo) {
      if (destruido || cuerpo?.id === nuevoCuerpo?.id) return
      cuerpo = nuevoCuerpo
      contenido = { fase: 'cargando' }
      versionContenido += 1
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
    establecerModo(modo) {
      if (destruido) return
      enVr = modo === 'vr'
      malla.visible = enVr && Boolean(cuerpo)
      componer(true)
    },
    ajustar(ancho, alto) {
      if (destruido) return
      lienzo.width = Math.max(320, Math.min(900, Math.round(ancho * .9)))
      lienzo.height = Math.max(440, Math.min(1000, Math.round(alto * 1.6)))
      const altoMundo = 2 * DISTANCIA_FICHA * Math.tan(35 * Math.PI / 180) * .82
      const anchoMundo = altoMundo * (ancho / 2 / alto)
      // Conservar la relación del canvas y limitarlo a la parte visible de cada ojo.
      const escala = Math.min(anchoMundo / lienzo.width, altoMundo / lienzo.height)
      malla.scale.set(lienzo.width * escala, lienzo.height * escala, 1)
      componer()
    },
    reubicar(camara) {
      if (!cuerpo || destruido) return
      malla.position.set(0, 0, -DISTANCIA_FICHA).applyQuaternion(camara.quaternion)
      malla.up.set(0, 1, 0).applyQuaternion(camara.quaternion)
      malla.lookAt(camara.position)
      malla.updateWorldMatrix(true, false)
      alInvalidar?.()
    },
    detectar(camara) {
      if (!malla.visible || destruido) return null
      camara.updateWorldMatrix(true, false)
      malla.updateWorldMatrix(true, false)
      rayo.setFromCamera(new Vector2(0, 0), camara)
      const impacto = rayo.intersectObject(malla, false)[0]
      const accion = impacto ? detectarAccionFicha(impacto.uv, lienzo.width, lienzo.height, zonas) : null
      if (accion !== accionApuntada) { accionApuntada = accion; dibujar() }
      return impacto ? { accion, distancia: impacto.distance } : null
    },
    moverPagina(desplazamiento) {
      if (destruido || !lectura.mover(desplazamiento)) return false
      accionApuntada = null
      informarLectura()
      dibujar()
      return true
    },
    mostrarSeccion(destino) {
      const indice = typeof destino === 'string' ? paginas.findIndex((pagina) => pagina.id === destino) : destino
      if (destruido || indice < 0 || !lectura.irA(indice)) return false
      accionApuntada = null
      informarLectura()
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
