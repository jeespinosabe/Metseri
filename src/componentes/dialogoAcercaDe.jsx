import { useEffect, useId, useRef } from 'react'
import { CARRERA, DESARROLLADORES, INSTITUCION } from '../datos/acercaDe.js'

export function DialogoAcercaDe({ abierto, alCerrar }) {
  const idTitulo = useId()
  const dialogoRef = useRef(null)

  useEffect(() => {
    const dialogo = dialogoRef.current
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog ref={dialogoRef} className="aplicacion-metseri"
      aria-labelledby={idTitulo} onClose={(evento) => { if (!evento.currentTarget.open) alCerrar() }}>
      <header className="aplicacion-metseri__cabecera">
        <h2 id={idTitulo}>Acerca de</h2>
        <form method="dialog">
          <button className="aplicacion-metseri__cerrar" type="submit" aria-label="Cerrar">
            <span aria-hidden="true">×</span>
          </button>
        </form>
      </header>
      <div className="acerca-de">
        <h3>Desarrolladores</h3>
        <ul>
          {DESARROLLADORES.map((nombre) => <li key={nombre}>{nombre}</li>)}
        </ul>
        <h3>Carrera</h3>
        <p>{CARRERA}</p>
        <h3>Institución</h3>
        <p>{INSTITUCION}</p>
      </div>
    </dialog>
  )
}
