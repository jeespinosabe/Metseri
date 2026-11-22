import { useEffect, useId, useRef, useState } from 'react'
import { alternarCuerpo, crearBorradorLibro, crearRegistroVistaPrevia, prepararDatosLibro, validarBorradorLibro } from '../administracion/registrosBibliograficos.js'
import { CampoFotografiaLibro } from './campoFotografiaLibro.jsx'
import { SelectorCuerposCelestes } from './selectorCuerposCelestes.jsx'

const CAMPOS_FORMULARIO = [
  { campo: 'titulo', etiqueta: 'Título', obligatorio: true, completo: true },
  { campo: 'autoria', etiqueta: 'Autoría', obligatorio: true, ayuda: 'Escribe un nombre por línea, en el orden de la ficha.' },
  { campo: 'editorial', etiqueta: 'Editorial', obligatorio: false },
  { campo: 'anio', etiqueta: 'Año de publicación', obligatorio: false, inputMode: 'numeric', ayuda: 'Año entre 1000 y 2100.' },
]

function agregarCampo(conjunto, campo) {
  return conjunto.has(campo) ? conjunto : new Set(conjunto).add(campo)
}

export function FormularioLibro({ modo, registro = null, alVolver, alGuardar, guardando = false }) {
  const [borrador, setBorrador] = useState(() => crearBorradorLibro(registro))
  const [conErrorVisible, setConErrorVisible] = useState(() => new Set())
  const [enviado, setEnviado] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState('')
  const campoInicial = useRef(null)
  const id = useId()
  const edicion = modo === 'edicion'
  const nombreOperacion = edicion ? 'Editar libro' : 'Agregar libro'
  const errores = validarBorradorLibro(borrador)

  useEffect(() => { campoInicial.current?.focus() }, [])

  function cambiarCampo(campo, valor) {
    setBorrador((actual) => ({ ...actual, [campo]: valor }))
  }

  async function guardar(evento) {
    evento.preventDefault()
    if (guardando) return
    setEnviado(true)
    setErrorGuardado('')
    const campoInvalido = Object.keys(errores).find((campo) => errores[campo])
    if (campoInvalido) {
      evento.currentTarget.elements.namedItem(campoInvalido)?.focus()
      return
    }
    const datos = prepararDatosLibro(borrador, registro)
    if (!Object.keys(datos).length) return alVolver()
    try {
      await alGuardar(datos, registro?.id)
    } catch (error) {
      setErrorGuardado(error.message)
    }
  }

  return (
    <section className="panel-admin__seccion" aria-label={nombreOperacion}>
      <button type="button" className="panel-admin__volver" disabled={guardando} onClick={alVolver}><span aria-hidden="true">←</span> Volver al listado</button>

      <form className="panel-admin__formulario" noValidate aria-label={nombreOperacion} onSubmit={guardar}>
        <fieldset className="panel-admin__contenido-formulario" disabled={guardando}>
          <div className="panel-admin__campos">
            {CAMPOS_FORMULARIO.map(({ campo, etiqueta, obligatorio, completo, inputMode, ayuda }) => {
              const error = enviado || conErrorVisible.has(campo) ? errores[campo] : ''
              const descripcion = [ayuda && `${id}-${campo}-ayuda`, error && `${id}-${campo}-error`].filter(Boolean).join(' ')
              const Control = campo === 'autoria' ? 'textarea' : 'input'
              return (
                <div key={campo} className={`panel-admin__campo${completo ? ' panel-admin__campo--completo' : ''}`}>
                  <label htmlFor={`${id}-${campo}`}>
                    {etiqueta} <span className="panel-admin__marca-campo">{obligatorio ? 'Obligatorio' : 'Opcional'}</span>
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
                    aria-describedby={descripcion || undefined}
                    onChange={(evento) => cambiarCampo(campo, evento.target.value)}
                    onBlur={() => setConErrorVisible((actuales) => agregarCampo(actuales, campo))}
                  />
                  {ayuda && <p id={`${id}-${campo}-ayuda`} className="panel-admin__ayuda">{ayuda}</p>}
                  <p id={`${id}-${campo}-error`} className="panel-admin__error-campo" aria-live="polite">{error}</p>
                </div>
              )
            })}
          </div>

          <CampoFotografiaLibro
            fotografia={borrador.fotografia}
            alCambiar={(fotografia) => setBorrador((actual) => ({ ...actual, fotografia }))}
            registroVistaPrevia={crearRegistroVistaPrevia(borrador)}
          />

          <SelectorCuerposCelestes
            seleccionados={borrador.cuerposIds}
            alAlternar={(cuerpoId) => setBorrador((actual) => ({ ...actual, cuerposIds: alternarCuerpo(actual.cuerposIds, cuerpoId) }))}
          />

          <fieldset className="panel-admin__grupo-cuerpos panel-admin__publicacion">
            <legend>Visibilidad en fichas</legend>
            <label className="panel-admin__opcion-cuerpo">
              <input type="checkbox" checked={borrador.activo} onChange={(evento) => { const activo = evento.target.checked; setBorrador((actual) => ({ ...actual, activo })) }} />
              <span>Libro activo</span>
            </label>
            <p className="panel-admin__ayuda">Los libros activos aparecen en las fichas de los cuerpos celestes relacionados.</p>
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
