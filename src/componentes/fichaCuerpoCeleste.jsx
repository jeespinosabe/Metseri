import { useEffect, useRef, useState } from 'react'
import { obtenerDatosPrincipales } from '../datos/cuerposCelestes.js'
import { INVITACION_BIBLIOTECA } from '../datos/librosCuerposCelestes.js'
import { SECCIONES_FICHA } from '../escena/contenidoFicha.js'
import { obtenerMensajeContenido } from '../servicios/consultaContenido.js'

function IconoDestello() {
  return <svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m11 3 2.4 7.6L21 13l-7.6 2.4L11 23l-2.4-7.6L1 13l7.6-2.4L11 3ZM23 2v7m-3.5-3.5h7M23 20v6m-3-3h6" strokeLinejoin="round" /></svg>
}

function IconoEnlace() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M14 4h6v6m0-6-10 10M10 4H4v16h16v-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

export function FichaCuerpoCeleste({ cuerpo, contenido, modo, lectura, alAccionar, alEntrar, alCerrar, alAbrirLibro, alReintentar, libroBloqueado }) {
  const [imagenFallida, setImagenFallida] = useState(false)
  const panelRef = useRef(null)
  const tituloRef = useRef(null)
  const librosRef = useRef(null)
  const disponible = contenido.fase === 'disponible'
  const libros = disponible ? cuerpo.libros : []
  useEffect(() => {
    panelRef.current?.scrollTo(0, 0)
    if (modo === 'normal') panelRef.current?.focus({ preventScroll: true })
  }, [modo])
  function irASeccion(referencia) {
    if (referencia === tituloRef) panelRef.current?.scrollTo(0, 0)
    else referencia.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    referencia.current?.focus({ preventScroll: true })
  }
  return (
    <section className={`ficha-cuerpo${modo === 'vr' ? ' ficha-cuerpo--accesible' : ''}`}
      aria-labelledby="titulo-ficha" ref={panelRef} onPointerEnter={alEntrar} tabIndex={0}>
      <div className="ficha-cuerpo__barra">
        <nav aria-label="Ir a una sección de la ficha">
          <button type="button" onClick={() => irASeccion(tituloRef)}>Ficha</button>
          <button type="button" onClick={() => irASeccion(librosRef)}>Descubrir libros</button>
        </nav>
        <button className="ficha-cuerpo__cerrar" type="button" onClick={alCerrar} aria-label={`Cerrar ficha de ${cuerpo.nombre} y volver a la escena`}>×</button>
      </div>
      <header className="ficha-cuerpo__cabecera">
        <figure className="ficha-cuerpo__imagen">
          {imagenFallida ? <div className="ficha-cuerpo__imagen-alternativa" role="img" aria-label={cuerpo.imagenAlternativa} />
            : <img src={cuerpo.imagen} alt={cuerpo.imagenAlternativa} onError={() => setImagenFallida(true)} />}
        </figure>
        <p className="ficha-cuerpo__categoria">{cuerpo.clasificacion}</p>
        <h1 id="titulo-ficha" ref={tituloRef} tabIndex={-1}>{cuerpo.nombre}</h1>
        {disponible && cuerpo.subtitulo && <p className="ficha-cuerpo__subtitulo">{cuerpo.subtitulo}</p>}
      </header>
      {!disponible && <div className="ficha-cuerpo__estado" role="status">
        <p>{obtenerMensajeContenido(contenido, cuerpo.nombre)}</p>
        {contenido.fase === 'error' && <button type="button" onClick={() => { alReintentar(); panelRef.current?.focus({ preventScroll: true }) }}>Reintentar</button>}
      </div>}
      {disponible && <>
        <div className="ficha-cuerpo__descripcion"><p>{cuerpo.descripcion || 'Descripción no disponible.'}</p></div>
        <section className="ficha-cuerpo__datos-seccion" aria-label="Datos principales">
          <dl className="ficha-cuerpo__datos">
            {obtenerDatosPrincipales(cuerpo).map((dato) => <div key={dato.etiqueta}>
              <dt>{dato.etiqueta}</dt>
              <dd>{dato.valor === '' ? <span className="ficha-cuerpo__ausencia">Dato no disponible</span> : dato.valor}
                <span className="ficha-cuerpo__unidad">{dato.unidad}</span>
                {dato.retrograda && <span className="ficha-cuerpo__unidad">Rotación retrógrada</span>}
              </dd>
            </div>)}
          </dl>
        </section>
        <section className="ficha-cuerpo__curiosidades" aria-labelledby="curiosidades-ficha">
          <IconoDestello /><div><h2 id="curiosidades-ficha">¿Sabías que...?</h2>
            {cuerpo.curiosidades.length ? <ul>{cuerpo.curiosidades.map((curiosidad, indice) => <li key={indice}>{curiosidad}</li>)}</ul>
              : <p>No hay curiosidades publicadas para este cuerpo.</p>}
          </div>
        </section>
      </>}
      <section className="ficha-cuerpo__libros" aria-labelledby="libros-ficha">
        <h2 id="libros-ficha" ref={librosRef} tabIndex={-1}>Descubrir libros</h2>
        {disponible && (libros.length ? <ul className="ficha-cuerpo__lista-libros">{libros.map((libro, indice) => <li key={`${libro.url}-${indice}`}>
          <h3>{libro.titulo}</h3>
          {libro.autor && <p>{libro.autor}</p>}
          {(libro.editorial || libro.anio !== null) && <p>{[libro.editorial, libro.anio].filter((valor) => valor !== '' && valor !== null).join(' · ')}</p>}
          <a href={libro.url} target="_blank" rel="noopener noreferrer" onClick={(evento) => { evento.preventDefault(); alAbrirLibro(libro) }}>
            Ver ficha bibliográfica <IconoEnlace /><span className="solo-lectores"> (abre otra pestaña)</span>
          </a>
        </li>)}</ul> : <div><p>Aún no hay libros verificados asociados a {cuerpo.nombre}.</p><p>{INVITACION_BIBLIOTECA}</p></div>)}
        {!disponible && <p>{obtenerMensajeContenido(contenido, cuerpo.nombre)}</p>}
        {libroBloqueado && <div className="ficha-cuerpo__estado" role="alert">
          <p>El navegador bloqueó la apertura. Puedes abrir la ficha con este enlace.</p>
          <a href={libroBloqueado.url} target="_blank" rel="noopener noreferrer">Abrir ficha bibliográfica <IconoEnlace /></a>
        </div>}
      </section>
      <footer className="ficha-cuerpo__fuentes"><a href={cuerpo.imagenOriginal} target="_blank" rel="noopener noreferrer" title={cuerpo.credito}>Créditos de imagen <IconoEnlace /></a></footer>
      {modo === 'vr' && <nav className="ficha-cuerpo__navegacion" aria-label="Secciones de la ficha VR">
        {SECCIONES_FICHA.map((seccion) => <button key={seccion.id} type="button" aria-current={lectura.seccion === seccion.id ? 'page' : undefined} onClick={() => alAccionar(`seccion:${seccion.id}`)}>{seccion.nombre}</button>)}
        <p>Página {lectura.pagina + 1} de {lectura.total}</p>
        <button type="button" disabled={lectura.pagina === 0} onClick={() => alAccionar('anterior')}>← Anterior</button>
        <button type="button" disabled={lectura.pagina >= lectura.total - 1} onClick={() => alAccionar('siguiente')}>Siguiente →</button>
      </nav>}
    </section>
  )
}
