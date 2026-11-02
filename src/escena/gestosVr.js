export const INTERVALO_DOBLE_TAP_MS = 300

// La acción se captura al tocar, pero espera a descartar un segundo tap.
// Preparar puede consumir el primer toque para cerrar la instrucción inicial.
export function crearGestosVr({ prepararActivacion, alRecentrar, temporizadores = globalThis }) {
  let pendiente = null

  function cancelar() {
    if (!pendiente) return
    temporizadores.clearTimeout(pendiente.temporizador)
    pendiente = null
  }

  return {
    cancelar,
    pulsar(evento) {
      if (pendiente) {
        cancelar()
        alRecentrar()
        return
      }
      const activar = prepararActivacion(evento)
      pendiente = {
        temporizador: temporizadores.setTimeout(() => {
          pendiente = null
          activar?.()
        }, INTERVALO_DOBLE_TAP_MS),
      }
    },
  }
}
