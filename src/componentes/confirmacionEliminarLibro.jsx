import { useEffect, useId, useRef, useState } from 'react'
import { obtenerCuerposRelacionados } from '../administracion/registrosBibliograficos.js'

// Diálogo modal nativo: mantiene inerte el resto del panel mientras está abierto.
export function ConfirmacionEliminarLibro({ registro, alCerrar, alEliminar, eliminando = false }) {
  const [error, setError] = useState('')
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

  async function confirmar() {
    setError('')
    try {
      await alEliminar(registro.id)
    } catch (fallo) {
      setError(fallo.message)
    }
  }

  return (
    <dialog
      ref={dialogo}
      className="panel-admin__dialogo"
      aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-descripcion`}
      onCancel={(evento) => { evento.preventDefault(); if (!eliminando) alCerrar() }}
      // El evento close llega en una tarea posterior: se ignora si el diálogo ya
      // volvió a abrirse (por ejemplo, tras el doble montaje de StrictMode).
      onClose={(evento) => { if (!evento.currentTarget.open) alCerrar() }}
    >
      <div className="panel-admin__dialogo-cabecera">
        <h2 id={`${id}-titulo`}>Eliminar libro</h2>
        <button type="button" className="panel-admin__cerrar" aria-label="Cerrar confirmación" disabled={eliminando} onClick={alCerrar}>
          <span aria-hidden="true">×</span> Cerrar
        </button>
      </div>
      <p id={`${id}-descripcion`} className="panel-admin__dialogo-texto">
        Se eliminará <strong>«{registro.titulo}»</strong>, de {registro.autoria}, del catálogo y de sus fichas.
      </p>
      <h3 className="panel-admin__dialogo-subtitulo">Relaciones que se retirarían</h3>
      {cuerpos.length > 0
        ? <ul className="panel-admin__cuerpos">{cuerpos.map((cuerpo) => <li key={cuerpo.id}>{cuerpo.nombre}</li>)}</ul>
        : <p className="panel-admin__ausente">Sin asociar: este libro no tiene cuerpos celestes relacionados.</p>}
      {error && <p className="panel-admin__error-campo" role="alert">{error}</p>}
      <div className="panel-admin__botones">
        <button ref={cancelar} type="button" className="panel-admin__boton panel-admin__boton--secundario" disabled={eliminando} onClick={alCerrar}>Cancelar</button>
        <button type="button" className="panel-admin__boton panel-admin__boton--peligro" disabled={eliminando} onClick={confirmar}>{eliminando ? 'Eliminando…' : 'Eliminar libro'}</button>
      </div>
    </dialog>
  )
}
