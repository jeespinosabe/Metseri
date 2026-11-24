import { useEffect, useId, useRef, useState } from 'react'
import { alternarCuerpo, crearBorradorLibro, crearRegistroVistaPrevia, leerErroresServidor, prepararDatosLibro, validarBorradorLibro } from '../administracion/registrosBibliograficos.js'
import { anioMaximoLibro, LIMITES_LIBRO } from '../administracion/reglasLibro.js'
import { obtenerAnioActual } from '../datos/anioPublicacion.js'
import { CampoFotografiaLibro } from './campoFotografiaLibro.jsx'
import { SelectorCuerposCelestes } from './selectorCuerposCelestes.jsx'

function agregarCampo(conjunto, campo) {
  return conjunto.has(campo) ? conjunto : new Set(conjunto).add(campo)
}

function identificarAyudaEtiqueta({ pointerType, target, relatedTarget }) {
  if (pointerType !== 'mouse') return
  const etiqueta = target.closest('[data-ayuda-etiqueta]')
  if (etiqueta !== relatedTarget?.closest?.('[data-ayuda-etiqueta]')) return etiqueta?.dataset.ayudaEtiqueta
}

export function FormularioLibro({ modo, registro = null, alVolver, alGuardar, guardando = false }) {
  const [borrador, setBorrador] = useState(() => crearBorradorLibro(registro))
  const [conErrorVisible, setConErrorVisible] = useState(() => new Set())
  const [enviado, setEnviado] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState('')
  const [erroresServidor, setErroresServidor] = useState({})
  const [ayudaActiva, setAyudaActiva] = useState('')
  const campoInicial = useRef(null)
  const id = useId()
  const edicion = modo === 'edicion'
  const nombreOperacion = edicion ? 'Editar libro' : 'Agregar libro'
  const errores = validarBorradorLibro(borrador)
  const anioActual = obtenerAnioActual()
  const camposFormulario = [
    { campo: 'titulo', etiqueta: 'Título', obligatorio: true, completo: true, ayuda: 'Escribe el título tal como aparece en el libro. Incluye el subtítulo si lo tiene.' },
    { campo: 'autoria', etiqueta: 'Autor', obligatorio: true, ayuda: 'Autores (uno por línea), en el orden en que aparecen en el libro. Pueden ser personas o instituciones.' },
    { campo: 'editorial', etiqueta: 'Editorial', obligatorio: true, ayuda: 'Empresa o institución que publicó esta edición.' },
    { campo: 'anio', etiqueta: 'Año de publicación', obligatorio: false, inputMode: 'numeric', ayuda: `Escribe el año de esta edición en cuatro cifras, de ${LIMITES_LIBRO.anioMinimo} a ${anioMaximoLibro(anioActual)}. Déjalo vacío si no lo conoces.` },
  ]

  useEffect(() => { campoInicial.current?.focus() }, [])

  useEffect(() => {
    if (!ayudaActiva) return
    function cerrarAyuda(evento) {
      if (evento.key === 'Escape') setAyudaActiva('')
    }
    document.addEventListener('keydown', cerrarAyuda)
    return () => document.removeEventListener('keydown', cerrarAyuda)
  }, [ayudaActiva])

  function mostrarAyuda(evento) {
    const campo = identificarAyudaEtiqueta(evento)
    if (campo) setAyudaActiva(campo)
  }

  function ocultarAyuda(evento) {
    const campo = identificarAyudaEtiqueta(evento)
    if (campo) setAyudaActiva((actual) => actual === campo ? '' : actual)
  }

  function cambiarCampo(campo, valor) {
    setBorrador((actual) => ({ ...actual, [campo]: valor }))
    setErroresServidor((actuales) => {
      if (!actuales[campo]) return actuales
      const restantes = { ...actuales }
      delete restantes[campo]
      return restantes
    })
  }

  async function guardar(evento) {
    evento.preventDefault()
    if (guardando) return
    const formulario = evento.currentTarget
    setEnviado(true)
    setErrorGuardado('')
    setErroresServidor({})
    const erroresGuardado = validarBorradorLibro(borrador)
    const campoInvalido = Object.keys(erroresGuardado).find((campo) => erroresGuardado[campo])
    if (campoInvalido) {
      formulario.elements.namedItem(campoInvalido)?.focus()
      return
    }
    const datos = prepararDatosLibro(borrador, registro)
    if (!Object.keys(datos).length) return alVolver()
    try {
      await alGuardar(datos, registro?.id)
    } catch (error) {
      const delServidor = leerErroresServidor(error)
      const primero = camposFormulario.find(({ campo }) => delServidor[campo])
      if (primero) {
        setErroresServidor(delServidor)
        formulario.elements.namedItem(primero.campo)?.focus()
      } else {
        setErrorGuardado(error.message)
      }
    }
  }

  return (
    <section className="panel-admin__seccion" aria-label={nombreOperacion}>
      <button type="button" className="panel-admin__volver" disabled={guardando} onClick={alVolver}><span aria-hidden="true">←</span> Volver al listado</button>

      <form
        className="panel-admin__formulario"
        noValidate
        aria-label={nombreOperacion}
        onSubmit={guardar}
        onPointerOver={mostrarAyuda}
        onPointerOut={ocultarAyuda}
      >
        <fieldset className="panel-admin__contenido-formulario" disabled={guardando}>
          <div className="panel-admin__campos">
            {camposFormulario.map(({ campo, etiqueta, obligatorio, completo, inputMode, ayuda }) => {
              const error = (enviado || conErrorVisible.has(campo) ? errores[campo] : '') || erroresServidor[campo] || ''
              const idAyuda = `${id}-${campo}-ayuda`
              const idError = `${id}-${campo}-error`
              const Control = campo === 'autoria' ? 'textarea' : 'input'
              return (
                <div key={campo} className={`panel-admin__campo${completo ? ' panel-admin__campo--completo' : ''}`} data-ayuda-campo={campo}>
                  <label htmlFor={`${id}-${campo}`}>
                    <span data-ayuda-etiqueta={campo}>{etiqueta}</span>{' '}
                    <span className="panel-admin__marca-campo">{obligatorio ? 'Obligatorio' : 'Opcional'}</span>
                  </label>
                  <Control
                    ref={campo === 'titulo' ? campoInicial : undefined}
                    id={`${id}-${campo}`}
                    name={campo}
                    type={Control === 'input' ? 'text' : undefined}
                    rows={Control === 'textarea' ? 3 : undefined}
                    inputMode={inputMode}
                    autoComplete="off"
                    required={obligatorio}
                    value={borrador[campo]}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={error ? `${idAyuda} ${idError}` : idAyuda}
                    onChange={(evento) => cambiarCampo(campo, evento.target.value)}
                    onBlur={() => setConErrorVisible((actuales) => agregarCampo(actuales, campo))}
                  />
                  <p id={idAyuda} className="panel-admin__ayuda-emergente" role="tooltip" hidden={ayudaActiva !== campo}>{ayuda}</p>
                  <p id={idError} className="panel-admin__error-campo" aria-live="polite">{error}</p>
                </div>
              )
            })}
          </div>

          <CampoFotografiaLibro
            fotografia={borrador.fotografia}
            ayudaVisible={ayudaActiva === 'fotografia'}
            alCambiar={(fotografia) => setBorrador((actual) => ({ ...actual, fotografia }))}
            registroVistaPrevia={crearRegistroVistaPrevia(borrador)}
          />

          <SelectorCuerposCelestes
            seleccionados={borrador.cuerposIds}
            ayudaVisible={ayudaActiva === 'cuerpos'}
            alAlternar={(cuerpoId) => setBorrador((actual) => ({ ...actual, cuerposIds: alternarCuerpo(actual.cuerposIds, cuerpoId) }))}
          />

          <fieldset className="panel-admin__grupo-cuerpos" data-ayuda-campo="activo">
            <legend>Visibilidad en fichas</legend>
            <label className="panel-admin__opcion-cuerpo">
              <input type="checkbox" aria-describedby={`${id}-activo-ayuda`} checked={borrador.activo} onChange={(evento) => { const activo = evento.target.checked; setBorrador((actual) => ({ ...actual, activo })) }} />
              <span data-ayuda-etiqueta="activo">Libro activo</span>
            </label>
            <p id={`${id}-activo-ayuda`} className="panel-admin__ayuda-emergente" role="tooltip" hidden={ayudaActiva !== 'activo'}>Marca esta casilla para mostrar el libro en las fichas de los cuerpos celestes relacionados.</p>
          </fieldset>
        </fieldset>
        {errorGuardado && <p className="panel-admin__error-campo" role="alert">{errorGuardado}</p>}
        <div className="panel-admin__pie-formulario">
          <div className="panel-admin__botones">
            <button type="button" className="panel-admin__boton panel-admin__boton--secundario" disabled={guardando} onClick={alVolver}>Cancelar</button>
            <button type="submit" className="panel-admin__boton" disabled={guardando}>{guardando ? 'Guardando…' : edicion ? 'Guardar cambios' : 'Guardar libro'}</button>
          </div>
        </div>
      </form>
    </section>
  )
}
