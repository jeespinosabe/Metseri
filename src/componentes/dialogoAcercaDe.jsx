import { useEffect, useId, useRef } from 'react'
import escudoTecnologico from '../assets/instituciones/escudoTecnologico.png'
import logoTecnm from '../assets/instituciones/logoTecnm.png'
import { DESARROLLADORES, FORMACION_ACADEMICA } from '../datos/acercaDe.js'

export function DialogoAcercaDe({ abierto, alCerrar }) {
  const idTitulo = useId()
  const dialogoRef = useRef(null)

  useEffect(() => {
    const dialogo = dialogoRef.current
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog ref={dialogoRef} className="aplicacion-metseri acerca-de"
      aria-labelledby={idTitulo} onClose={(evento) => { if (!evento.currentTarget.open) alCerrar() }}>
      <header className="aplicacion-metseri__cabecera">
        <h2 id={idTitulo}>Acerca de</h2>
        <form method="dialog">
          <button className="aplicacion-metseri__cerrar" type="submit" aria-label="Cerrar">
            <span aria-hidden="true">×</span>
          </button>
        </form>
      </header>
      <section className="acerca-de__equipo">
        <h3>Desarrolladores</h3>
        <ul role="list">
          {DESARROLLADORES.map((nombre) => <li key={nombre}>{nombre}</li>)}
        </ul>
        <p>{FORMACION_ACADEMICA}</p>
      </section>
      <footer className="acerca-de__pie">
        <img src={logoTecnm} alt="Tecnológico Nacional de México" width="285" height="141" />
        <img src={escudoTecnologico} alt="" width="176" height="176" />
      </footer>
    </dialog>
  )
}
