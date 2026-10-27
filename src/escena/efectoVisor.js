import { Mesh, OrthographicCamera, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector4, WebGLRenderTarget } from 'three'
import { calcularOpticaVisor, PERFIL_HOMIDO_GRAB } from './perfilVisor.js'

const PROGRAMA_VERTICES = `
varying vec2 coordenadaPantalla;
void main() {
  coordenadaPantalla = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`

const PROGRAMA_FRAGMENTOS = `
uniform sampler2D imagenOjo;
uniform vec2 tamanoFisico;
uniform vec2 centroLente;
uniform vec2 coeficientes;
uniform float distanciaPantalla;
uniform vec4 campo;
uniform float pasoPuntero;
uniform float centroPuntero;
varying vec2 coordenadaPantalla;
void main() {
  vec2 panel = (coordenadaPantalla * tamanoFisico - centroLente) / distanciaPantalla;
  float radioCuadrado = dot(panel, panel);
  vec2 direccion = panel * (1.0 + coeficientes.x * radioCuadrado + coeficientes.y * radioCuadrado * radioCuadrado);
  vec2 muestra = (direccion + campo.xy) / (campo.xy + campo.zw);
  if (any(lessThan(muestra, vec2(0.0))) || any(greaterThan(muestra, vec2(1.0)))) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else {
    vec2 borde = min(muestra, 1.0 - muestra);
    float vineta = smoothstep(0.0, 0.025, min(borde.x, borde.y));
    gl_FragColor = vec4(texture2D(imagenOjo, muestra).rgb * vineta, 1.0);
    // La cruz atraviesa la misma corrección óptica y converge sobre el eje común.
    vec2 cruz = abs((direccion - vec2(centroPuntero, 0.0)) / pasoPuntero);
    float horizontal = (1.0 - smoothstep(0.7, 1.3, cruz.y)) * smoothstep(2.5, 3.5, cruz.x) * (1.0 - smoothstep(10.5, 11.5, cruz.x));
    float vertical = (1.0 - smoothstep(0.7, 1.3, cruz.x)) * smoothstep(2.5, 3.5, cruz.y) * (1.0 - smoothstep(10.5, 11.5, cruz.y));
    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0), max(horizontal, vertical));
  }
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

export function ajustarCamaraOjo(ojo, camara, parametros) {
  ojo.near = camara.near
  ojo.far = camara.far
  ojo.projectionMatrix.makePerspective(
    -parametros.izquierda * ojo.near, parametros.derecha * ojo.near,
    parametros.arriba * ojo.near, -parametros.abajo * ojo.near, ojo.near, ojo.far,
  )
  ojo.projectionMatrixInverse.copy(ojo.projectionMatrix).invert()
  ojo.matrix.copy(camara.matrixWorld)
  ojo.matrix.elements[12] += camara.matrixWorld.elements[0] * parametros.desplazamiento
  ojo.matrix.elements[13] += camara.matrixWorld.elements[1] * parametros.desplazamiento
  ojo.matrix.elements[14] += camara.matrixWorld.elements[2] * parametros.desplazamiento
  ojo.matrixWorldNeedsUpdate = true
  ojo.updateMatrixWorld(true)
}

/** Renderiza cada ojo a una textura y la compensa para las lentes del GRAB. */
export function crearEfectoVisor(renderizador) {
  const texturaOjo = new WebGLRenderTarget(1, 1, { samples: 2 })
  const ojos = [new PerspectiveCamera(), new PerspectiveCamera()]
  ojos.forEach((ojo) => { ojo.matrixAutoUpdate = false })
  const geometria = new PlaneGeometry(2, 2)
  const material = new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      imagenOjo: { value: texturaOjo.texture },
      tamanoFisico: { value: new Vector2() },
      centroLente: { value: new Vector2() },
      coeficientes: { value: new Vector2(...PERFIL_HOMIDO_GRAB.coeficientes) },
      distanciaPantalla: { value: PERFIL_HOMIDO_GRAB.distanciaPantalla },
      campo: { value: new Vector4() },
      pasoPuntero: { value: 1 },
      centroPuntero: { value: 0 },
    },
    vertexShader: PROGRAMA_VERTICES,
    fragmentShader: PROGRAMA_FRAGMENTOS,
  })
  const escenaSalida = new Scene()
  escenaSalida.add(new Mesh(geometria, material))
  const camaraSalida = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  let optica

  return {
    ajustar(parametros) {
      optica = calcularOpticaVisor(parametros)
      const proporcion = renderizador.getPixelRatio()
      texturaOjo.setSize(Math.max(1, Math.ceil(parametros.ancho / 2 * proporcion)), Math.max(1, Math.ceil(parametros.alto * proporcion)))
      material.uniforms.tamanoFisico.value.set(optica.anchoFisico / 2, optica.altoFisico)
      material.uniforms.pasoPuntero.value = optica.milimetrosPorPixel / PERFIL_HOMIDO_GRAB.distanciaPantalla
    },
    render(escena, camara) {
      camara.updateWorldMatrix(true, false)
      const tamano = renderizador.getSize(new Vector2())
      const destinoAnterior = renderizador.getRenderTarget()
      const viewportAnterior = renderizador.getViewport(new Vector4())
      const recorteAnterior = renderizador.getScissor(new Vector4())
      const pruebaRecorteAnterior = renderizador.getScissorTest()
      const limpiezaAnterior = renderizador.autoClear
      try {
        renderizador.autoClear = true
        ojos.forEach((ojo, indice) => {
          const parametros = optica.ojos[indice]
          ajustarCamaraOjo(ojo, camara, parametros)
          renderizador.setRenderTarget(texturaOjo)
          renderizador.setScissorTest(false)
          renderizador.render(escena, ojo)
          renderizador.setRenderTarget(destinoAnterior)
          renderizador.setViewport(indice * tamano.x / 2, 0, tamano.x / 2, tamano.y)
          renderizador.setScissor(indice * tamano.x / 2, 0, tamano.x / 2, tamano.y)
          renderizador.setScissorTest(true)
          material.uniforms.centroLente.value.set(parametros.centroX, parametros.centroY)
          material.uniforms.campo.value.set(parametros.izquierda, parametros.abajo, parametros.derecha, parametros.arriba)
          material.uniforms.centroPuntero.value = -parametros.desplazamiento / camara.focus
          renderizador.render(escenaSalida, camaraSalida)
        })
      } finally {
        renderizador.setRenderTarget(destinoAnterior)
        renderizador.setViewport(viewportAnterior)
        renderizador.setScissor(recorteAnterior)
        renderizador.setScissorTest(pruebaRecorteAnterior)
        renderizador.autoClear = limpiezaAnterior
      }
    },
    destruir() {
      texturaOjo.dispose()
      geometria.dispose()
      material.dispose()
    },
  }
}
