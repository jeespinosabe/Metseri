const modoAplicacion = window.matchMedia('(display-mode: standalone)')
const observadores = new Set()
let avisoInstalacion = null
let instalada = false

function marcarInstalada() {
  avisoInstalacion = null
  instalada = true
  observadores.forEach((alCambiar) => alCambiar())
}

if (import.meta.env.PROD && window.isSecureContext) {
  // Captura el aviso al cargar la aplicación, incluso con la franja cerrada.
  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault()
    avisoInstalacion = evento
  })
  window.addEventListener('appinstalled', marcarInstalada)
}

export function estaInstalada() {
  return instalada || modoAplicacion.matches || navigator.standalone === true
}

export function suscribirseAInstalacion(alCambiar) {
  observadores.add(alCambiar)
  modoAplicacion.addEventListener('change', alCambiar)
  return () => {
    observadores.delete(alCambiar)
    modoAplicacion.removeEventListener('change', alCambiar)
  }
}

export async function solicitarInstalacion() {
  if (!import.meta.env.PROD || !window.isSecureContext) return false

  try {
    if (typeof navigator.install === 'function') {
      await navigator.install()
      marcarInstalada()
      return true
    }

    if (!avisoInstalacion) return false
    const aviso = avisoInstalacion
    avisoInstalacion = null
    await aviso.prompt()
    return true
  } catch (error) {
    return error.name === 'AbortError'
  }
}
