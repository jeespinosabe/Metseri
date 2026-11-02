import { useEffect, useRef, useState } from 'react'
import { obtenerDatosPrincipales } from '../datos/cuerposCelestes.js'
import { obtenerLibrosCuerpo } from '../datos/librosCuerposCelestes.js'
import { SECCIONES_FICHA } from '../escena/contenidoFicha.js'

function EspacioContenido({ lineas = 3, nombre }) {
  return <div className="espacio-contenido" role="img" aria-label={`${nombre}: espacio reservado`}>
    {Array.from({ length: lineas }, (_, indice) => <span key={indice} aria-hidden="true" />)}
  </div>
}

function IconoDestello() {
  return <svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m11 3 2.4 7.6L21 13l-7.6 2.4L11 23l-2.4-7.6L1 13l7.6-2.4L11 3ZM23 2v7m-3.5-3.5h7M23 20v6m-3-3h6" strokeLinejoin="round" /></svg>
}

export function FichaCuerpoCeleste({ cuerpo, modo, lectura, contenido, alAccionar, alEntrar, alCerrar, alAbrirLibro }) {
  const [imagenFallida, setImagenFallida] = useState(false)
  const panelRef = useRef(null)
  const libros = obtenerLibrosCuerpo(cuerpo.id)
  const ficha = contenido?.fase === 'disponible' ? contenido.ficha : null
  const datos = obtenerDatosPrincipales(cuerpo).map((dato, indice) => ficha?.datos[indice] ?? dato)
  const descripcion = ficha?.descripcion || cuerpo.descripcion
  const subtitulo = ficha?.subtitulo || cuerpo.subtitulo
  const curiosidades = ficha?.curiosidades ?? cuerpo.curiosidades
  const mensaje = ficha ? null : contenido?.fase === 'error'
    ? 'No se pudo cargar la información. Cierra la ficha y vuelve a seleccionar el cuerpo para intentarlo de nuevo.'
    : 'Cargando información...'
  useEffect(() => { panelRef.current?.scrollTo(0, 0) }, [modo])
  return (
    <section
      className={`ficha-cuerpo${modo === 'vr' ? ' ficha-cuerpo--accesible' : ''}`}
      aria-labelledby="titulo-ficha"
      ref={panelRef}
      onPointerEnter={alEntrar}
      tabIndex={0}
    >
      <button className="ficha-cuerpo__cerrar" type="button" onClick={alCerrar} aria-label={`Cerrar ficha de ${cuerpo.nombre}`}>×</button>
      <header className="ficha-cuerpo__cabecera">
        <figure className="ficha-cuerpo__imagen">
          {imagenFallida ? <div className="ficha-cuerpo__imagen-alternativa" role="img" aria-label={cuerpo.imagenAlternativa} />
            : <img src={cuerpo.imagen} alt={cuerpo.imagenAlternativa} onError={() => setImagenFallida(true)} />}
        </figure>
        <p className="ficha-cuerpo__categoria">{ficha?.clasificacion || cuerpo.clasificacion}</p>
        <h1 id="titulo-ficha">{cuerpo.nombre}</h1>
        {subtitulo ? <p className="ficha-cuerpo__subtitulo">{subtitulo}</p> : <EspacioContenido lineas={1} nombre="Subtítulo" />}
      </header>
      <div className="ficha-cuerpo__descripcion">
        {mensaje ? <p role="status">{mensaje}</p> : descripcion ? <p>{descripcion}</p> : <EspacioContenido lineas={4} nombre="Descripción" />}
      </div>
      <section className="ficha-cuerpo__datos-seccion" aria-label="Datos principales">
        <dl className="ficha-cuerpo__datos">
          {datos.map((dato) => <div key={dato.etiqueta}>
            <dt>{dato.etiqueta}</dt>
            <dd>{dato.valor || <span className="espacio-valor" role="img" aria-label="Valor pendiente" />}<span className="ficha-cuerpo__unidad">{dato.unidad}</span></dd>
          </div>)}
        </dl>
      </section>
      <section className="ficha-cuerpo__curiosidades" aria-labelledby="curiosidades-ficha">
        <IconoDestello />
        <div>
          <h2 id="curiosidades-ficha">¿Sabías que...?</h2>
          {curiosidades.length ? <ul>{curiosidades.map((curiosidad) => <li key={curiosidad}>{curiosidad}</li>)}</ul>
            : <EspacioContenido lineas={3} nombre="Curiosidades" />}
        </div>
      </section>
      <section className="ficha-cuerpo__libros" aria-labelledby="libros-ficha">
        <h2 id="libros-ficha">Descubrir libros</h2>
        {ficha?.invitacion ? <p>{ficha.invitacion}</p> : libros.length ? <ul>{libros.map((libro) => <li key={libro.url}><a href={libro.url} target="_blank" rel="noopener noreferrer" onClick={(evento) => { evento.preventDefault(); alAbrirLibro(libro) }}>{libro.titulo} <span className="solo-lectores">(abre otra pestaña)</span></a></li>)}</ul>
          : <EspacioContenido lineas={2} nombre="Libros" />}
      </section>
      <footer className="ficha-cuerpo__fuentes"><a href={cuerpo.imagenOriginal} target="_blank" rel="noopener noreferrer" title={cuerpo.credito}>Créditos de imagen ↗</a></footer>
      {modo === 'vr' && <nav className="ficha-cuerpo__navegacion" aria-label="Secciones de la ficha VR">
        {SECCIONES_FICHA.map((seccion) => <button key={seccion.id} type="button" aria-current={(lectura.seccion ?? SECCIONES_FICHA[lectura.pagina]?.id) === seccion.id ? 'page' : undefined} onClick={() => alAccionar(`seccion:${seccion.pagina}`)}>{seccion.nombre}</button>)}
        <p>Página {lectura.pagina + 1} de {lectura.total}</p>
        <button type="button" disabled={lectura.pagina === 0} onClick={() => alAccionar('anterior')}>← Anterior</button>
        <button type="button" disabled={lectura.pagina >= lectura.total - 1} onClick={() => alAccionar('siguiente')}>Siguiente →</button>
      </nav>}
    </section>
  )
}
