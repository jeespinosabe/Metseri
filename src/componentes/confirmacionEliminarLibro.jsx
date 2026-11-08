import { useEffect, useId, useRef } from 'react'
import { obtenerCuerposRelacionados } from '../administracion/registrosBibliograficos.js'

// Diálogo modal nativo: mantiene inerte el resto del panel mientras está abierto.
// La confirmación queda deshabilitada hasta que exista una eliminación real.
export function ConfirmacionEliminarLibro({ registro, alCerrar }) {
  const dialogo = useRef(null)
  const cancelar = useRef(null)
  const id = useId()
  const cuerpos = obtenerCuerposRelacionados(registro.cuerposIds)

  useEffect(() => {
    const elemento = dialogo.current
    if (!elemento.open) elemento.showModal()
    cancelar.current?.focus()
    return () => { if (elemento.open) elemento.close() }
  }, [])

  return (
    <dialog
      ref={dialogo}
      className="panel-admin__dialogo"
      aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-descripcion`}
      onCancel={(evento) => { evento.preventDefault(); alCerrar() }}
      // El evento close llega en una tarea posterior: se ignora si el diálogo ya
      // volvió a abrirse (por ejemplo, tras el doble montaje de StrictMode).
      onClose={(evento) => { if (!evento.currentTarget.open) alCerrar() }}
    >
      <div className="panel-admin__dialogo-cabecera">
        <h2 id={`${id}-titulo`}>Eliminar libro</h2>
        <button type="button" className="panel-admin__cerrar" aria-label="Cerrar confirmación" onClick={alCerrar}>
          <span aria-hidden="true">×</span> Cerrar
        </button>
      </div>
      <p id={`${id}-descripcion`} className="panel-admin__dialogo-texto">
        Revisa qué ocurriría al eliminar <strong>«{registro.titulo}»</strong>, de {registro.autoria}.
      </p>
      <h3 className="panel-admin__dialogo-subtitulo">Relaciones que se retirarían</h3>
      {cuerpos.length > 0
        ? <ul className="panel-admin__cuerpos">{cuerpos.map((cuerpo) => <li key={cuerpo.id}>{cuerpo.nombre}</li>)}</ul>
        : <p className="panel-admin__ausente">Sin asociar: este libro no tiene cuerpos celestes relacionados.</p>}
      <p id={`${id}-pendiente`} className="panel-admin__pendiente">
        La eliminación estará disponible en una próxima etapa. El libro se conserva en el listado.
      </p>
      <div className="panel-admin__botones">
        <button ref={cancelar} type="button" className="panel-admin__boton panel-admin__boton--secundario" onClick={alCerrar}>Cancelar</button>
        <button type="button" className="panel-admin__boton panel-admin__boton--peligro" disabled aria-describedby={`${id}-pendiente`}>Eliminar libro</button>
      </div>
    </dialog>
  )
}
