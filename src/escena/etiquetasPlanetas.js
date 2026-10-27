import { StereoCamera, Vector3 } from 'three'

export function etiquetaCubiertaPorFicha(posicion, ficha, camara, ancho, alto) {
  if (!ficha?.visible) return false
  ficha.updateWorldMatrix(true, false)
  const puntos = [[-.5, -.5], [-.5, .5], [.5, -.5], [.5, .5]].map(([x, y]) => new Vector3(x, y, 0).applyMatrix4(ficha.matrixWorld).applyMatrix4(camara.matrixWorldInverse))
  if (puntos.some((punto) => punto.z >= 0)) return false
  puntos.forEach((punto) => punto.applyMatrix4(camara.projectionMatrix))
  const izquierda = (Math.min(...puntos.map((p) => p.x)) + 1) * ancho / 2
  const derecha = (Math.max(...puntos.map((p) => p.x)) + 1) * ancho / 2
  const arriba = (1 - Math.max(...puntos.map((p) => p.y))) * alto / 2
  const abajo = (1 - Math.min(...puntos.map((p) => p.y))) * alto / 2
  return posicion.x + 86 >= izquierda && posicion.x - 86 <= derecha && posicion.y + 52 >= arriba && posicion.y <= abajo
}

export function calcularPosicionEtiqueta(posicion, radio, camara, ancho, alto, proyeccion = null, contorno = []) {
  const punto = new Vector3().copy(posicion).applyMatrix4(camara.matrixWorldInverse)
  if (punto.z >= 0) return null
  let x
  let y
  let radioVisible
  if (proyeccion) {
    const distancia = punto.length()
    const seno = Math.min(.99, radio / distancia)
    const divisor = Math.sqrt(1 - seno * seno) - punto.z / distancia
    const escala = alto / (2 * proyeccion.escala)
    x = ancho / 2 + punto.x / distancia / divisor * escala
    y = alto / 2 - punto.y / distancia / divisor * escala
    radioVisible = seno / divisor * escala
  } else {
    radioVisible = radio * alto * camara.projectionMatrix.elements[5] / (-2 * punto.z)
    punto.applyMatrix4(camara.projectionMatrix)
    x = (punto.x + 1) * ancho / 2
    y = (1 - punto.y) * alto / 2
  }
  let izquierda = x - radioVisible
  let derecha = x + radioVisible
  let arriba = y - radioVisible
  let abajo = y + radioVisible
  contorno.forEach((muestra) => {
    const vertice = new Vector3().copy(muestra).applyMatrix4(camara.matrixWorldInverse)
    if (vertice.z >= 0) return
    let px
    let py
    if (proyeccion) {
      const divisor = vertice.length() - vertice.z
      px = ancho / 2 + vertice.x / divisor / proyeccion.escala * alto / 2
      py = alto / 2 - vertice.y / divisor / proyeccion.escala * alto / 2
    } else {
      vertice.applyMatrix4(camara.projectionMatrix)
      px = (vertice.x + 1) * ancho / 2
      py = (1 - vertice.y) * alto / 2
    }
    izquierda = Math.min(izquierda, px)
    derecha = Math.max(derecha, px)
    arriba = Math.min(arriba, py)
    abajo = Math.max(abajo, py)
  })
  if (derecha < 0 || izquierda > ancho || abajo < 0 || arriba > alto) return null
  return {
    x: Math.max(54, Math.min(ancho - 54, x)),
    y: abajo + 24 < alto - 130 ? abajo + 24 : Math.max(12, arriba - 64),
    radioVisible,
  }
}

export function crearEtiquetasPlanetas(contenedor, planetas) {
  const raiz = document.createElement('div')
  raiz.className = 'etiquetas-planetas'
  const vistas = [0, 1].map((indice) => {
    const elemento = document.createElement('div')
    elemento.className = 'etiquetas-planetas__vista'
    if (indice === 1) elemento.setAttribute('aria-hidden', 'true')
    const etiquetas = planetas.map((planeta) => {
      const etiqueta = document.createElement('span')
      etiqueta.className = 'etiqueta-planeta'
      if (planeta.id === 'tierra') etiqueta.classList.add('etiqueta-planeta--tierra')
      const nombre = document.createElement('span')
      nombre.className = 'etiqueta-planeta__nombre'
      nombre.textContent = planeta.nombre
      const tipo = document.createElement('small')
      tipo.className = 'etiqueta-planeta__tipo'
      tipo.textContent = planeta.tipo
      etiqueta.append(nombre, tipo)
      etiqueta.hidden = true
      elemento.appendChild(etiqueta)
      return etiqueta
    })
    raiz.appendChild(elemento)
    return { elemento, etiquetas }
  })
  contenedor.appendChild(raiz)
  const estereo = new StereoCamera()
  estereo.aspect = .5

  return {
    actualizarAspecto({ planetaApuntado, planetaSeleccionado }) {
      vistas.forEach((vista) => vista.etiquetas.forEach((etiqueta, indice) => {
        const id = planetas[indice].id
        etiqueta.classList.toggle('etiqueta-planeta--activa', id === planetaSeleccionado || id === planetaApuntado)
      }))
    },
    actualizar(camara, modo, proyeccion, ancho, alto, ficha = null) {
      // Las etiquetas del visor se dibujan dentro de WebGL para corregir sus lentes.
      raiz.hidden = modo === 'vr'
      if (raiz.hidden) return
      camara.updateWorldMatrix(true, false)
      const enVr = modo === 'vr'
      raiz.classList.toggle('etiquetas-planetas--vr', enVr)
      if (enVr) {
        estereo.update(camara)
        estereo.cameraL.updateMatrixWorld(true)
        estereo.cameraR.updateMatrixWorld(true)
      }
      vistas.forEach((vista, indice) => {
        vista.elemento.hidden = !enVr && indice === 1
        vista.elemento.style.left = enVr && indice === 1 ? '50%' : '0'
        vista.elemento.style.width = enVr ? '50%' : '100%'
        if (vista.elemento.hidden) return
        const camaraVista = enVr ? indice === 0 ? estereo.cameraL : estereo.cameraR : camara
        planetas.forEach((planeta, numero) => {
          const anchoVista = enVr ? ancho / 2 : ancho
          const posicion = calcularPosicionEtiqueta(planeta.posicion, planeta.radio, camaraVista, anchoVista, alto, enVr ? null : proyeccion, planeta.contorno)
          const etiqueta = vista.etiquetas[numero]
          etiqueta.hidden = posicion === null
          if (!posicion) return
          const x = enVr ? posicion.x : Math.max(32, Math.min(anchoVista - 172, posicion.x + Math.min(160, posicion.radioVisible * 1.15)))
          if (enVr && etiquetaCubiertaPorFicha(posicion, ficha, camaraVista, anchoVista, alto)) etiqueta.hidden = true
          etiqueta.style.left = `${x}px`
          etiqueta.style.top = `${posicion.y}px`
        })
      })
    },
    destruir: () => raiz.remove(),
  }
}
