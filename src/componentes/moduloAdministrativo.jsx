import { useEffect, useMemo, useRef, useState } from 'react'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { etiquetaPestanaRegistros, filtrarRegistros, hayCriteriosActivos } from '../administracion/registrosBibliograficos.js'
import { eliminarLibroAdministrativo, guardarLibroAdministrativo, listarLibrosAdministrativos } from '../servicios/gestionBibliografica.js'
import { ListadoBibliografico } from './listadoBibliografico.jsx'
import { FormularioLibro } from './formularioLibro.jsx'
import { ConfirmacionEliminarLibro } from './confirmacionEliminarLibro.jsx'
import { PieInstitucional } from './pieInstitucional.jsx'
import './panelAdministrativo.css'

const PLANETAS = CUERPOS_CELESTES.filter((cuerpo) => cuerpo.tipo === 'planeta')
const SATELITES = CUERPOS_CELESTES.filter((cuerpo) => cuerpo.tipo === 'satelite')

const REGISTROS_VACIOS = []

export function ModuloAdministrativo({ alCerrarSesion }) {
  const [catalogo, setCatalogo] = useState({ fase: 'cargando' })
  const [intentoConsulta, setIntentoConsulta] = useState(0)
  const [operando, setOperando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [errorSesion, setErrorSesion] = useState('')
  const [pantalla, setPantalla] = useState('listado')
  const [registroActivoId, setRegistroActivoId] = useState(null)
  const [registroEliminarId, setRegistroEliminarId] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [cuerpoId, setCuerpoId] = useState('')
  const contenedor = useRef(null)
  const campoBusqueda = useRef(null)
  const focoAlVolver = useRef(null)
  const operacionEnCurso = useRef(false)

  const registros = catalogo.registros ?? REGISTROS_VACIOS
  const resultados = useMemo(() => filtrarRegistros(registros, { busqueda, cuerpoId }), [registros, busqueda, cuerpoId])
  const hayCriterios = hayCriteriosActivos({ busqueda, cuerpoId })
  const registroActivo = registros.find((registro) => registro.id === registroActivoId) ?? null
  const registroEliminar = registros.find((registro) => registro.id === registroEliminarId) ?? null
  const pantallaVisible = pantalla === 'edicion' && !registroActivo ? 'listado' : pantalla
  const etiquetaRegistros = etiquetaPestanaRegistros(pantallaVisible)

  useEffect(() => {
    const controlador = new AbortController()
    listarLibrosAdministrativos(controlador.signal).then((registros) => {
      if (!controlador.signal.aborted) setCatalogo({ fase: 'disponible', registros })
    }).catch((error) => {
      if (!controlador.signal.aborted) setCatalogo({ fase: 'error', mensaje: error.message })
    })
    return () => controlador.abort()
  }, [intentoConsulta])

  useEffect(() => {
    if (pantallaVisible !== 'listado' || registroEliminarId !== null || !focoAlVolver.current) return
    const clave = focoAlVolver.current
    focoAlVolver.current = null
    const destino = contenedor.current?.querySelector(`[data-foco="${CSS.escape(clave)}"]`)
    const alternativo = campoBusqueda.current ?? contenedor.current?.querySelector('[data-foco="agregar-navegacion"]')
    ;(destino ?? alternativo)?.focus()
  }, [pantallaVisible, registroEliminarId])

  function abrirAlta(origen) {
    setAviso('')
    focoAlVolver.current = origen
    setRegistroActivoId(null)
    setPantalla('alta')
  }

  function abrirEdicion(registro) {
    setAviso('')
    focoAlVolver.current = `editar:${registro.id}`
    setRegistroActivoId(registro.id)
    setPantalla('edicion')
  }

  function volverAlListado() {
    setRegistroActivoId(null)
    setPantalla('listado')
  }

  function abrirConfirmacion(registro) {
    setAviso('')
    focoAlVolver.current = `eliminar:${registro.id}`
    setRegistroEliminarId(registro.id)
  }

  function limpiarFiltros() {
    setBusqueda('')
    setCuerpoId('')
    campoBusqueda.current?.focus()
  }

  function volverAConsultar() {
    setCatalogo({ fase: 'cargando' })
    setIntentoConsulta((anterior) => anterior + 1)
  }

  async function realizarOperacion(operacion) {
    if (operacionEnCurso.current) return
    operacionEnCurso.current = true
    setOperando(true)
    try {
      await operacion()
    } finally {
      operacionEnCurso.current = false
      setOperando(false)
    }
  }

  function cerrarSesion() {
    return realizarOperacion(async () => {
      setErrorSesion('')
      try {
        await alCerrarSesion()
      } catch {
        setErrorSesion('No se pudo cerrar la sesión. Inténtalo de nuevo.')
      }
    })
  }

  function guardarLibro(datos, id) {
    return realizarOperacion(async () => {
      const libro = await guardarLibroAdministrativo(datos, id)
      if (id) {
        setCatalogo(({ registros }) => ({
          fase: 'disponible',
          registros: registros.map((registro) => registro.id === id ? libro : registro),
        }))
      } else {
        volverAConsultar()
      }
      setAviso(id ? 'Cambios guardados.' : 'Libro agregado al catálogo.')
      volverAlListado()
    })
  }

  function eliminarLibro(id) {
    return realizarOperacion(async () => {
      await eliminarLibroAdministrativo(id)
      setCatalogo(({ registros }) => ({ fase: 'disponible', registros: registros.filter((registro) => registro.id !== id) }))
      setRegistroEliminarId(null)
      setAviso('Libro eliminado del catálogo.')
    })
  }

  return (
    <main className="admin-modulo panel-admin" ref={contenedor}>
      <header className="admin-modulo__cabecera panel-admin__cabecera">
        <a className="admin-acceso__marca" href="/" aria-label="Metseri, ir a la exploración">MET<span>S</span>ERI</a>
        <div className="panel-admin__menu">
          <nav className="panel-admin__navegacion" aria-label="Panel administrativo">
            <button type="button" className="panel-admin__pestana" disabled={operando} aria-label={etiquetaRegistros} aria-current={pantallaVisible !== 'alta' ? 'page' : undefined} onClick={() => { if (pantallaVisible === 'edicion') return; focoAlVolver.current = null; volverAlListado(); volverAConsultar() }}>
              <span className="panel-admin__icono-menu panel-admin__icono-menu--registros" aria-hidden="true" />
              <span className="panel-admin__texto-registros">{etiquetaRegistros}</span>
              <span className="panel-admin__texto-movil" aria-hidden="true">{pantallaVisible === 'edicion' ? etiquetaRegistros : 'Registros'}</span>
            </button>
            <button type="button" className="panel-admin__pestana" data-foco="agregar-navegacion" disabled={operando} aria-current={pantallaVisible === 'alta' ? 'page' : undefined} onClick={() => { if (pantallaVisible !== 'alta') abrirAlta('agregar-navegacion') }}>
              <svg className="panel-admin__icono-menu" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M11 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M3 17h8m6-4v8m-4-4h8" />
              </svg>
              <span>Agregar libro</span>
            </button>
          </nav>
          <div className="panel-admin__sesion">
            <a className="panel-admin__enlace" href="/" aria-label="Volver a la exploración" title="Volver a la exploración">
              <span className="panel-admin__icono-exploracion" aria-hidden="true" />
              <span className="panel-admin__texto-movil" aria-hidden="true">Exploración</span>
            </a>
            <button type="button" disabled={operando} aria-label="Cerrar sesión" title="Cerrar sesión" onClick={cerrarSesion}>
              <svg className="panel-admin__icono-salida" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M10 17v3H4V4h6v3m3 1 4 4-4 4M8 12h9" />
              </svg>
              <span className="panel-admin__etiqueta-salida">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="panel-admin__cuerpo">
        {errorSesion && <p className="panel-admin__error-campo" role="alert">{errorSesion}</p>}

        {pantallaVisible === 'alta' && <FormularioLibro key="alta" modo="alta" alVolver={volverAlListado} alGuardar={guardarLibro} guardando={operando} />}
        {pantallaVisible === 'edicion' && (
          <FormularioLibro key={`edicion-${registroActivo.id}`} modo="edicion" registro={registroActivo} alVolver={volverAlListado} alGuardar={guardarLibro} guardando={operando} />
        )}

        {pantallaVisible === 'listado' && (
          <section className="panel-admin__seccion" aria-label="Listado de registros bibliográficos">
            <div className="panel-admin__aviso" role="status">{aviso}</div>
            {catalogo.fase === 'cargando' && <p role="status">Cargando catálogo…</p>}
            {catalogo.fase === 'error' && (
              <div className="panel-admin__vacio">
                <p role="alert">{catalogo.mensaje}</p>
                <button type="button" className="panel-admin__boton" onClick={volverAConsultar}>Reintentar</button>
              </div>
            )}
            {registros.length > 0 && (
              <form className="panel-admin__filtros" role="search" aria-label="Buscar registros bibliográficos" onSubmit={(evento) => evento.preventDefault()}>
                <div className="panel-admin__campo">
                  <label htmlFor="panel-admin-busqueda">Buscar por título o autor</label>
                  <input id="panel-admin-busqueda" ref={campoBusqueda} type="search" autoComplete="off" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} />
                </div>
                <div className="panel-admin__campo">
                  <label htmlFor="panel-admin-cuerpo">Cuerpo celeste</label>
                  <select id="panel-admin-cuerpo" value={cuerpoId} onChange={(evento) => setCuerpoId(evento.target.value)}>
                    <option value="">Todos los cuerpos</option>
                    <optgroup label="Planetas">
                      {PLANETAS.map((cuerpo) => <option key={cuerpo.id} value={cuerpo.id}>{cuerpo.nombre}</option>)}
                    </optgroup>
                    <optgroup label="Satélites">
                      {SATELITES.map((cuerpo) => <option key={cuerpo.id} value={cuerpo.id}>{cuerpo.nombre} ({cuerpo.planetaPrincipal})</option>)}
                    </optgroup>
                  </select>
                </div>
                <button type="button" className="panel-admin__boton panel-admin__boton--secundario" onClick={limpiarFiltros}>Limpiar filtros</button>
              </form>
            )}

            {catalogo.fase === 'disponible' && <ListadoBibliografico
              total={registros.length}
              registros={resultados}
              hayCriterios={hayCriterios}
              alAgregar={abrirAlta}
              alEditar={abrirEdicion}
              alEliminar={abrirConfirmacion}
              alLimpiarFiltros={limpiarFiltros}
            />}
          </section>
        )}
      </div>

      <PieInstitucional />

      {pantallaVisible === 'listado' && registroEliminar && (
        <ConfirmacionEliminarLibro key={registroEliminar.id} registro={registroEliminar} eliminando={operando}
          alCerrar={() => setRegistroEliminarId(null)} alEliminar={eliminarLibro} />
      )}
    </main>
  )
}
