import { Vector2, Vector3 } from 'three'

const GRADOS = Math.PI / 180
const CAMPO_VERTICAL = 70
const CAMPO_DIAGONAL_MAXIMO = 130

export function calcularProyeccionVista(ancho, alto) {
  const aspecto = Math.max(1, ancho) / Math.max(1, alto)
  // La proyección estereográfica conserva los contornos circulares de las esferas.
  // Acotar la diagonal mantiene toda la vista delante de la cámara de recorte.
  const escala = Math.min(
    Math.tan(CAMPO_VERTICAL * GRADOS / 4),
    Math.tan(CAMPO_DIAGONAL_MAXIMO * GRADOS / 4) / Math.hypot(aspecto, 1),
  )
  const limite = escala * escala * (aspecto * aspecto + 1)
  return { aspecto, escala, campoRecorte: 2 * Math.atan(2 * escala / (1 - limite)) / GRADOS }
}

export function proyectarDireccionVista(direccion, { aspecto, escala }) {
  const divisor = direccion.length() - direccion.z
  return new Vector2(direccion.x / (divisor * escala * aspecto), direccion.y / (divisor * escala))
}

export function obtenerDireccionVista(coordenadas, { aspecto, escala }) {
  const x = coordenadas.x * escala * aspecto
  const y = coordenadas.y * escala
  return new Vector3(2 * x, 2 * y, x * x + y * y - 1).normalize()
}

const UNIFORMES = `
uniform bool proyeccionEsfericaActiva;
uniform vec2 escalaProyeccionEsferica;
`
const PROYECCION_VERTICE = `
if (proyeccionEsfericaActiva && mvPosition.z < 0.0) {
  float divisorEsferico = max(length(mvPosition.xyz) - mvPosition.z, 0.0001);
  gl_Position.xy = mvPosition.xy / divisorEsferico / escalaProyeccionEsferica * gl_Position.w;
}
`
const PROYECCION_HALO = `
if (proyeccionEsfericaActiva && mvPosition.z < 0.0) {
  vec3 centroEsferico = modelViewMatrix[3].xyz;
  float divisorEsferico = max(length(centroEsferico) - centroEsferico.z, 0.0001);
  // Un halo circular en pantalla, centrado en la misma dirección que el cuerpo.
  gl_Position.xy = (centroEsferico.xy + rotatedPosition) / divisorEsferico
    / escalaProyeccionEsferica * gl_Position.w;
}
`

/** Aplica la proyección en los vértices, sin otra pasada de renderizado. VR usa su perspectiva habitual. */
export function crearProyeccionVista(escena) {
  const activa = { value: true }
  const escala = { value: new Vector2() }
  let parametros = calcularProyeccionVista(1, 1)
  const materiales = new Set()
  escena.traverse((objeto) => {
    if (objeto.material) materiales.add(objeto.material)
  })
  materiales.forEach((material) => {
    const prepararMaterial = material.onBeforeCompile
    const claveMaterial = material.customProgramCacheKey()
    material.onBeforeCompile = (programa, renderizador) => {
      prepararMaterial.call(material, programa, renderizador)
      programa.uniforms.proyeccionEsfericaActiva = activa
      programa.uniforms.escalaProyeccionEsferica = escala
      programa.vertexShader = UNIFORMES + programa.vertexShader
      if (material.isSpriteMaterial) {
        programa.vertexShader = programa.vertexShader.replace(
          'gl_Position = projectionMatrix * mvPosition;',
          `gl_Position = projectionMatrix * mvPosition;\n${PROYECCION_HALO}`,
        )
      } else {
        programa.vertexShader = programa.vertexShader.replace(
          '#include <project_vertex>',
          `#include <project_vertex>\n${PROYECCION_VERTICE}`,
        )
      }
    }
    material.customProgramCacheKey = () => `metseri-proyeccion-esferica-2:${claveMaterial}`
  })

  return {
    ajustar(camara, ancho, alto, modo) {
      parametros = calcularProyeccionVista(ancho, alto)
      activa.value = modo === 'normal'
      escala.value.set(parametros.escala * parametros.aspecto, parametros.escala)
      camara.aspect = parametros.aspecto
      camara.fov = activa.value ? parametros.campoRecorte : CAMPO_VERTICAL
      camara.updateProjectionMatrix()
    },
    obtenerParametros: () => activa.value ? parametros : null,
    obtenerDireccion: (coordenadas) => activa.value ? obtenerDireccionVista(coordenadas, parametros) : null,
  }
}
