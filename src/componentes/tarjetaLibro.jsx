import { formatearAnio, formatearEditorial, obtenerCuerposRelacionados } from '../administracion/registrosBibliograficos.js'

// La portada es decorativa: muestra la parte elegida de la fotografía o, sin
// ella, un espacio vacío. Los datos y las relaciones están en la información.
function PortadaLibro({ fotografia }) {
  if (!fotografia) return <div className="panel-admin__portada panel-admin__portada--vacia" aria-hidden="true" />
  return (
    <div className="panel-admin__portada">
      <img src={fotografia.url} alt="" loading="lazy" decoding="async" style={{ objectPosition: `${fotografia.encuadre.x}% ${fotografia.encuadre.y}%` }} />
    </div>
  )
}

export function TarjetaLibro({ registro, alEditar, alEliminar, vistaPrevia = false }) {
  const cuerpos = obtenerCuerposRelacionados(registro.cuerposIds)
  const editorial = formatearEditorial(registro.editorial)
  const anio = formatearAnio(registro.anio)
  const Titulo = vistaPrevia ? 'p' : 'h2'
  return (
    <article className={`panel-admin__tarjeta${vistaPrevia ? ' panel-admin__tarjeta--previa' : ''}`}>
      <PortadaLibro fotografia={registro.fotografia} />
      <div className="panel-admin__tarjeta-cuerpo">
        <Titulo className="panel-admin__tarjeta-titulo">{registro.titulo}</Titulo>
        <p className="panel-admin__tarjeta-autoria">{registro.autoria}</p>
        <p className="panel-admin__tarjeta-datos">
          <span className={editorial !== registro.editorial ? 'panel-admin__ausente' : undefined}>{editorial}</span>
          <span aria-hidden="true"> · </span>
          <span className={Number.isInteger(registro.anio) ? undefined : 'panel-admin__ausente'}>{anio}</span>
        </p>
        {cuerpos.length > 0 ? (
          <ul className="panel-admin__cuerpos" aria-label="Cuerpos celestes relacionados">
            {cuerpos.map((cuerpo) => <li key={cuerpo.id}>{cuerpo.nombre}</li>)}
          </ul>
        ) : (
          <p className="panel-admin__tarjeta-sin-cuerpos panel-admin__ausente">Sin asociar</p>
        )}
      </div>
      {!vistaPrevia && (
        <div className="panel-admin__tarjeta-acciones">
          <button type="button" className="panel-admin__tarjeta-accion" data-foco={`editar:${registro.id}`} aria-label={`Editar ${registro.titulo}`} onClick={() => alEditar(registro)}>Editar</button>
          <button type="button" className="panel-admin__tarjeta-accion panel-admin__tarjeta-accion--peligro" data-foco={`eliminar:${registro.id}`} aria-label={`Eliminar ${registro.titulo}`} onClick={() => alEliminar(registro)}>Eliminar</button>
        </div>
      )}
    </article>
  )
}
