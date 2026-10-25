/** Mantiene una posición real de mouse, incluso con captura durante un arrastre. */
export function crearApuntadoMouse({ elemento, alActualizar, documento = document, ventana = window }) {
  let posicion = null
  let destruido = false
  function limpiar() {
    posicion = null
    if (!destruido) alActualizar(null, elemento.getBoundingClientRect())
  }
  function recalcular() {
    if (destruido) return
    const rectangulo = elemento.getBoundingClientRect()
    if (posicion) {
      const { clientX: x, clientY: y } = posicion
      const visible = documento.elementFromPoint?.(x, y)
      if (x < rectangulo.left || x > rectangulo.right || y < rectangulo.top || y > rectangulo.bottom || (visible && !elemento.contains(visible))) posicion = null
    }
    alActualizar(posicion, rectangulo)
  }
  function alMover(evento) {
    if (evento.pointerType !== 'mouse') return
    posicion = { clientX: evento.clientX, clientY: evento.clientY }
    recalcular()
  }
  function alPresionar(evento) { if (evento.pointerType !== 'mouse') limpiar() }
  function alVisibilidad() { if (documento.hidden) limpiar() }
  elemento.addEventListener('pointermove', alMover)
  elemento.addEventListener('pointerleave', limpiar)
  elemento.addEventListener('pointercancel', limpiar)
  elemento.addEventListener('pointerdown', alPresionar)
  ventana.addEventListener('blur', limpiar)
  documento.addEventListener('visibilitychange', alVisibilidad)
  return {
    recalcular, limpiar,
    destruir() {
      limpiar()
      destruido = true
      elemento.removeEventListener('pointermove', alMover)
      elemento.removeEventListener('pointerleave', limpiar)
      elemento.removeEventListener('pointercancel', limpiar)
      elemento.removeEventListener('pointerdown', alPresionar)
      ventana.removeEventListener('blur', limpiar)
      documento.removeEventListener('visibilitychange', alVisibilidad)
    },
  }
}
