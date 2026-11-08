import { useEffect, useId, useRef, useState } from 'react'
import { alternarCuerpo, crearBorradorLibro, crearRegistroVistaPrevia, validarCampoLibro } from '../administracion/registrosBibliograficos.js'
import { CampoFotografiaLibro } from './campoFotografiaLibro.jsx'
import { SelectorCuerposCelestes } from './selectorCuerposCelestes.jsx'

const CAMPOS_FORMULARIO = [
  { campo: 'titulo', etiqueta: 'Título', obligatorio: true, completo: true },
  { campo: 'autoria', etiqueta: 'Autoría', obligatorio: true, ayuda: 'Persona o personas responsables, como aparecen en la ficha.' },
  { campo: 'editorial', etiqueta: 'Editorial', obligatorio: false },
  { campo: 'anio', etiqueta: 'Año de publicación', obligatorio: false, inputMode: 'numeric', ayuda: 'Número entero de hasta cuatro cifras, por ejemplo 2021.' },
  { campo: 'urlFicha', etiqueta: 'URL de la ficha bibliográfica', obligatorio: true, completo: true, tipo: 'url', ayuda: 'Dirección completa que comience con http:// o https://.' },
]

function agregarCampo(conjunto, campo) {
  return conjunto.has(campo) ? conjunto : new Set(conjunto).add(campo)
}

// Alta y edición comparten este formulario. El borrador vive solo mientras el
// formulario está abierto: cancelar o volver lo descarta sin tocar el listado.
export function FormularioLibro({ modo, registro = null, alVolver }) {
  const [borrador, setBorrador] = useState(() => crearBorradorLibro(registro))
  const [editados, setEditados] = useState(() => new Set())
  const [conErrorVisible, setConErrorVisible] = useState(() => new Set())
  const campoInicial = useRef(null)
  const id = useId()
  const edicion = modo === 'edicion'
  const nombreOperacion = edicion ? 'Editar libro' : 'Agregar libro'

  useEffect(() => { campoInicial.current?.focus() }, [])

  function cambiarCampo(campo, valor) {
    setBorrador((actual) => ({ ...actual, [campo]: valor }))
    setEditados((actuales) => agregarCampo(actuales, campo))
  }

  function abandonarCampo(campo) {
    if (editados.has(campo)) setConErrorVisible((actuales) => agregarCampo(actuales, campo))
  }

  return (
    <section className="panel-admin__seccion" aria-label={nombreOperacion}>
      <button type="button" className="panel-admin__volver" onClick={alVolver}><span aria-hidden="true">←</span> Volver al listado</button>

      <form className="panel-admin__formulario" noValidate aria-label={nombreOperacion} onSubmit={(evento) => evento.preventDefault()}>
        <div className="panel-admin__campos">
          {CAMPOS_FORMULARIO.map(({ campo, etiqueta, obligatorio, completo, tipo = 'text', inputMode, ayuda }) => {
            const error = conErrorVisible.has(campo) ? validarCampoLibro(campo, borrador[campo]) : ''
            const descripcion = [ayuda && `${id}-${campo}-ayuda`, error && `${id}-${campo}-error`].filter(Boolean).join(' ')
            return (
              <div key={campo} className={`panel-admin__campo${completo ? ' panel-admin__campo--completo' : ''}`}>
                <label htmlFor={`${id}-${campo}`}>
                  {etiqueta} <span className="panel-admin__marca-campo">{obligatorio ? 'Obligatorio' : 'Opcional'}</span>
                </label>
                <input
                  ref={campo === 'titulo' ? campoInicial : undefined}
                  id={`${id}-${campo}`}
                  name={campo}
                  type={tipo}
                  inputMode={inputMode}
                  autoComplete="off"
                  value={borrador[campo]}
                  aria-invalid={error ? 'true' : undefined}
                  aria-describedby={descripcion || undefined}
                  onChange={(evento) => cambiarCampo(campo, evento.target.value)}
                  onBlur={() => abandonarCampo(campo)}
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

        <div className="panel-admin__pie-formulario">
          <div className="panel-admin__botones">
            <button type="button" className="panel-admin__boton panel-admin__boton--secundario" onClick={alVolver}>Cancelar</button>
            <button type="submit" className="panel-admin__boton" disabled>{edicion ? 'Guardar cambios' : 'Guardar libro'}</button>
          </div>
        </div>
      </form>
    </section>
  )
}
