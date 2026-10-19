// Guía visual: indica hacia dónde apunta la mirada. No tiene comportamiento:
// no recibe foco ni eventos y es ignorada por la tecnología de asistencia.
// En vista única hay una cruz en el centro; en VR, una en el centro de cada mitad.
const POSICIONES = {
  normal: ['central'],
  vr: ['izquierdo', 'derecho'],
}

export function PunteroCruz({ modo }) {
  return (POSICIONES[modo] ?? POSICIONES.normal).map((posicion) => (
    <svg
      key={posicion}
      className={`puntero-cruz puntero-cruz--${posicion}`}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
    >
      {/* Cuatro trazos con un hueco central para no tapar lo que se apunta. */}
      <path d="M12 1v8M12 15v8M1 12h8M15 12h8" />
    </svg>
  ))
}
