import { describirCantidadRegistros } from '../administracion/registrosBibliograficos.js'
import { TarjetaLibro } from './tarjetaLibro.jsx'

export function ListadoBibliografico({ total, registros, hayCriterios, alAgregar, alEditar, alEliminar, alLimpiarFiltros }) {
  if (total === 0) {
    return (
      <div className="panel-admin__vacio">
        <h2>Todavía no hay registros bibliográficos</h2>
        <p>Cuando el catálogo administrativo tenga libros, aparecerán en este listado. Mientras tanto puedes revisar el formulario de alta.</p>
        <button type="button" className="panel-admin__boton" data-foco="agregar-vacio" onClick={() => alAgregar('agregar-vacio')}>Agregar libro</button>
      </div>
    )
  }

  return (
    <>
      <p className="panel-admin__cantidad" role="status">{describirCantidadRegistros(registros.length, total, hayCriterios)}</p>
      {registros.length === 0 ? (
        <div className="panel-admin__vacio">
          <h2>Ningún registro coincide con la búsqueda</h2>
          <p>Prueba con otra parte del título o de la autoría, elige otro cuerpo celeste o limpia los filtros para recuperar todos los registros.</p>
          <button type="button" className="panel-admin__boton panel-admin__boton--secundario" onClick={alLimpiarFiltros}>Limpiar filtros</button>
        </div>
      ) : (
        <ul className="panel-admin__galeria" aria-label="Registros bibliográficos de ejemplo">
          {registros.map((registro) => (
            <li key={registro.id}><TarjetaLibro registro={registro} alEditar={alEditar} alEliminar={alEliminar} /></li>
          ))}
          {!hayCriterios && (
            <li>
              <button type="button" className="panel-admin__tarjeta-agregar" data-foco="agregar-galeria" onClick={() => alAgregar('agregar-galeria')}>
                <span className="panel-admin__tarjeta-agregar-icono" aria-hidden="true">+</span>
                Agregar libro
              </button>
            </li>
          )}
        </ul>
      )}
    </>
  )
}
