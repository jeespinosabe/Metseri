/**
 * Gestiona la pantalla completa y el bloqueo de orientación horizontal como
 * mejoras opcionales de la vista dividida. Registra qué estados adquirió la
 * propia experiencia para liberar solo esos al salir, y deshace los resultados
 * que llegan tarde, cuando el usuario ya abandonó VR.
 *
 * `documento` y `orientacion` se inyectan para poder verificar el módulo sin
 * navegador; por defecto usan `document` y `screen.orientation`.
 */
export function crearPantallaInmersiva({
  elemento,
  documento = globalThis.document,
  orientacion = globalThis.screen?.orientation,
  alAbandonarPantallaCompleta,
}) {
  let deseada = false
  let pantallaCompletaAdquirida = false
  let bloqueoAdquirido = false
  let solicitudBloqueoEnCurso = false
  let destruida = false

  async function desbloquear() {
    if (!bloqueoAdquirido) return
    bloqueoAdquirido = false
    try {
      orientacion?.unlock?.()
    } catch {
      // El desbloqueo es opcional: si falla no hay nada más que liberar.
    }
  }

  async function salirDePantallaCompleta() {
    if (!pantallaCompletaAdquirida) return
    pantallaCompletaAdquirida = false
    try {
      if (documento.fullscreenElement) await documento.exitFullscreen?.()
    } catch {
      // Si el navegador ya salió por su cuenta no hay nada que deshacer.
    }
  }

  async function intentarBloqueo() {
    if (bloqueoAdquirido || solicitudBloqueoEnCurso) return
    if (typeof orientacion?.lock !== 'function') return
    solicitudBloqueoEnCurso = true
    try {
      await orientacion.lock('landscape')
      bloqueoAdquirido = true
      // Resultado tardío: el usuario salió mientras se resolvía el bloqueo.
      if (!deseada || destruida) await desbloquear()
    } catch {
      // Rechazado o no disponible: la vista dividida sigue funcionando.
    } finally {
      solicitudBloqueoEnCurso = false
    }
  }

  async function solicitarPantallaCompleta() {
    const yaEnPantallaCompleta = Boolean(documento.fullscreenElement)
    if (!yaEnPantallaCompleta) {
      if (typeof elemento?.requestFullscreen !== 'function') return false
      try {
        await elemento.requestFullscreen()
      } catch {
        return false
      }
      // Resultado tardío: se salió de VR antes de obtener la pantalla completa.
      if (!deseada || destruida) {
        pantallaCompletaAdquirida = true
        await salirDePantallaCompleta()
        return false
      }
      pantallaCompletaAdquirida = true
    }
    return true
  }

  function alCambiarPantallaCompleta() {
    if (!pantallaCompletaAdquirida || documento.fullscreenElement) return
    // El usuario abandonó desde el navegador la pantalla completa adquirida.
    pantallaCompletaAdquirida = false
    desbloquear()
    if (deseada && !destruida) alAbandonarPantallaCompleta?.()
  }

  documento.addEventListener('fullscreenchange', alCambiarPantallaCompleta)

  const interfaz = {
    /**
     * Intenta pantalla completa y, si se obtiene, el bloqueo horizontal. No
     * lanza: devuelve qué capacidades están activas para la experiencia.
     */
    async solicitar() {
      if (destruida) return { pantallaCompleta: false, bloqueo: false }
      deseada = true
      const hayPantallaCompleta = await solicitarPantallaCompleta()
      if (hayPantallaCompleta && deseada && !destruida) await intentarBloqueo()
      return interfaz.obtenerEstado()
    },

    /** Libera únicamente lo que adquirió esta experiencia. */
    async liberar() {
      deseada = false
      await desbloquear()
      await salirDePantallaCompleta()
    },

    obtenerEstado: () => ({
      pantallaCompleta: pantallaCompletaAdquirida,
      bloqueo: bloqueoAdquirido,
    }),

    async destruir() {
      if (destruida) return
      await interfaz.liberar()
      destruida = true
      documento.removeEventListener('fullscreenchange', alCambiarPantallaCompleta)
    },
  }
  return interfaz
}
