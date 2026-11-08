import { useEffect, useMemo, useRef, useState } from 'react'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { REGISTROS_BIBLIOGRAFICOS_EJEMPLO } from '../datos/registrosBibliograficosEjemplo.js'
import { filtrarRegistros, hayCriteriosActivos } from '../administracion/registrosBibliograficos.js'
import { ListadoBibliografico } from './listadoBibliografico.jsx'
import { FormularioLibro } from './formularioLibro.jsx'
import { ConfirmacionEliminarLibro } from './confirmacionEliminarLibro.jsx'
import './panelAdministrativo.css'

const PLANETAS = CUERPOS_CELESTES.filter((cuerpo) => cuerpo.tipo === 'planeta')
const SATELITES = CUERPOS_CELESTES.filter((cuerpo) => cuerpo.tipo === 'satelite')

// Contenedor autenticado del panel. Todo su estado es temporal: no hay rutas
// internas ni almacenamiento, y cerrar sesión desmonta el panel completo.
export function ModuloAdministrativo({ alCerrarSesion, registros = REGISTROS_BIBLIOGRAFICOS_EJEMPLO }) {
  const [pantalla, setPantalla] = useState('listado')
  const [registroActivoId, setRegistroActivoId] = useState(null)
  const [registroEliminarId, setRegistroEliminarId] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [cuerpoId, setCuerpoId] = useState('')
  const contenedor = useRef(null)
  const campoBusqueda = useRef(null)
  const focoAlVolver = useRef(null)

  const resultados = useMemo(() => filtrarRegistros(registros, { busqueda, cuerpoId }), [registros, busqueda, cuerpoId])
  const hayCriterios = hayCriteriosActivos({ busqueda, cuerpoId })
  const registroActivo = registros.find((registro) => registro.id === registroActivoId) ?? null
  const registroEliminar = registros.find((registro) => registro.id === registroEliminarId) ?? null
  const pantallaVisible = pantalla === 'edicion' && !registroActivo ? 'listado' : pantalla

  useEffect(() => {
    if (pantallaVisible !== 'listado' || registroEliminarId !== null || !focoAlVolver.current) return
    const clave = focoAlVolver.current
    focoAlVolver.current = null
    const destino = contenedor.current?.querySelector(`[data-foco="${CSS.escape(clave)}"]`)
    ;(destino ?? campoBusqueda.current)?.focus()
  }, [pantallaVisible, registroEliminarId])

  function abrirAlta(origen) {
    focoAlVolver.current = origen
    setRegistroActivoId(null)
    setPantalla('alta')
  }

  function abrirEdicion(registro) {
    focoAlVolver.current = `editar:${registro.id}`
    setRegistroActivoId(registro.id)
    setPantalla('edicion')
  }

  function volverAlListado() {
    setRegistroActivoId(null)
    setPantalla('listado')
  }

  function abrirConfirmacion(registro) {
    focoAlVolver.current = `eliminar:${registro.id}`
    setRegistroEliminarId(registro.id)
  }

  function limpiarFiltros() {
    setBusqueda('')
    setCuerpoId('')
    campoBusqueda.current?.focus()
  }

  return (
    <main className="admin-modulo panel-admin" ref={contenedor}>
      <header className="admin-modulo__cabecera panel-admin__cabecera">
        <a className="admin-acceso__marca" href="/" aria-label="Metseri, ir a la exploración">MET<span>S</span>ERI</a>
        <div className="panel-admin__sesion">
          <a className="panel-admin__enlace" href="/"><span aria-hidden="true">←</span> Volver a la exploración</a>
          <button type="button" onClick={alCerrarSesion}>Cerrar sesión</button>
        </div>
      </header>

      <div className="panel-admin__cuerpo">
        <nav className="panel-admin__navegacion" aria-label="Panel administrativo">
          <button type="button" className="panel-admin__pestana" aria-current={pantallaVisible !== 'alta' ? 'page' : undefined} onClick={() => { focoAlVolver.current = null; volverAlListado() }}>
            Registros bibliográficos
          </button>
          <button type="button" className="panel-admin__pestana" data-foco="agregar-navegacion" aria-current={pantallaVisible === 'alta' ? 'page' : undefined} onClick={() => abrirAlta('agregar-navegacion')}>
            Agregar libro
          </button>
        </nav>

        {pantallaVisible === 'alta' && <FormularioLibro key="alta" modo="alta" alVolver={volverAlListado} />}
        {pantallaVisible === 'edicion' && (
          <FormularioLibro key={`edicion-${registroActivo.id}`} modo="edicion" registro={registroActivo} alVolver={volverAlListado} />
        )}

        {pantallaVisible === 'listado' && (
          <section className="panel-admin__seccion" aria-label="Listado de registros bibliográficos">
            {registros.length > 0 && (
              <form className="panel-admin__filtros" role="search" aria-label="Buscar registros bibliográficos" onSubmit={(evento) => evento.preventDefault()}>
                <div className="panel-admin__campo">
                  <label htmlFor="panel-admin-busqueda">Buscar por título o autoría</label>
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

            <ListadoBibliografico
              total={registros.length}
              registros={resultados}
              hayCriterios={hayCriterios}
              alAgregar={abrirAlta}
              alEditar={abrirEdicion}
              alEliminar={abrirConfirmacion}
              alLimpiarFiltros={limpiarFiltros}
            />
          </section>
        )}
      </div>

      {pantallaVisible === 'listado' && registroEliminar && (
        <ConfirmacionEliminarLibro key={registroEliminar.id} registro={registroEliminar} alCerrar={() => setRegistroEliminarId(null)} />
      )}
    </main>
  )
}
