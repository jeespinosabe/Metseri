export class ErrorConsultaPublica extends Error {
  constructor(motivo, estado) {
    super('Contenido público no disponible.')
    this.motivo = motivo
    this.estado = estado
  }
}

export async function consultarJsonPublico(ruta, adaptar, { solicitar = fetch, signal, plazoMs = 12000 } = {}) {
  if (signal?.aborted) throw new ErrorConsultaPublica('cancelada')

  const controlador = new AbortController()
  let recibioRespuesta = false
  let temporizador
  let cancelar
  const interrupcion = new Promise((_, rechazar) => {
    function interrumpir(motivo) {
      rechazar(new ErrorConsultaPublica(motivo))
      controlador.abort()
    }

    cancelar = () => interrumpir('cancelada')
    signal?.addEventListener('abort', cancelar, { once: true })
    temporizador = setTimeout(() => interrumpir(recibioRespuesta ? 'datos' : 'transporte'), plazoMs)
  })

  async function consultar() {
    let respuesta
    try {
      respuesta = await solicitar(ruta, { signal: controlador.signal, credentials: 'omit', cache: 'no-store' })
    } catch {
      throw new ErrorConsultaPublica('transporte')
    }
    recibioRespuesta = true
    if (!respuesta.ok) throw new ErrorConsultaPublica('http', respuesta.status)
    try {
      return adaptar(await respuesta.json())
    } catch {
      throw new ErrorConsultaPublica('datos')
    }
  }

  try {
    return await Promise.race([interrupcion, consultar()])
  } finally {
    clearTimeout(temporizador)
    signal?.removeEventListener('abort', cancelar)
  }
}

export function iniciarConsultaPublica(consultar, alCambiar, { campo, estadoInicial, leerCopia }) {
  const controlador = new AbortController()
  const { signal } = controlador

  async function publicar() {
    if (signal.aborted) return
    alCambiar({ fase: 'cargando', ...estadoInicial })
    let estado = { fase: 'error', ...estadoInicial }
    try {
      estado = { fase: 'disponible', [campo]: await consultar(signal) }
    } catch (error) {
      if (!signal.aborted && error.motivo === 'transporte' && leerCopia) {
        const copia = await leerCopia().catch(() => null)
        if (copia) estado = { fase: 'disponible', [campo]: copia[campo], fechaDescarga: copia.fechaDescarga }
      }
    }
    if (!signal.aborted) alCambiar(estado)
  }

  void Promise.resolve().then(publicar)
  return () => controlador.abort()
}
