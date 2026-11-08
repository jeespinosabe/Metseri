import { useEffect, useId, useRef, useState } from 'react'
import {
  calcularMarcoEncuadre, calcularTamanoVistaFotografia, ENCUADRE_INICIAL, validarArchivoFotografia,
} from '../administracion/registrosBibliograficos.js'
import { TarjetaLibro } from './tarjetaLibro.jsx'

const FORMATOS_ACEPTADOS = 'image/jpeg,image/png,image/webp'
const EXTREMOS_EJE = { y: ['Arriba', 'Abajo', 'desde arriba'], x: ['Izquierda', 'Derecha', 'desde la izquierda'] }

// La fotografía solo existe en el borrador: se muestra con una URL de objeto
// local, nunca se envía ni se guarda, y sus URL se revocan al sustituirla,
// quitarla o cerrar el formulario.
export function CampoFotografiaLibro({ fotografia, alCambiar, registroVistaPrevia }) {
  const id = useId()
  const entrada = useRef(null)
  const botonElegir = useRef(null)
  const urlsCreadas = useRef(new Set())
  const enfocarSeleccion = useRef(false)
  const [dimensiones, setDimensiones] = useState(null)
  const [error, setError] = useState('')
  const [arrastrando, setArrastrando] = useState(false)

  const dimensionesVigentes = dimensiones?.url === fotografia?.url ? dimensiones : null
  const marco = fotografia ? calcularMarcoEncuadre(dimensionesVigentes, fotografia.encuadre) : null
  const tamanoVista = calcularTamanoVistaFotografia(dimensionesVigentes)

  useEffect(() => {
    const urls = urlsCreadas.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.clear()
    }
  }, [])

  useEffect(() => {
    if (fotografia || !enfocarSeleccion.current) return
    enfocarSeleccion.current = false
    botonElegir.current?.focus()
  }, [fotografia])

  function liberarUrl(url) {
    if (!url || !urlsCreadas.current.has(url)) return
    URL.revokeObjectURL(url)
    urlsCreadas.current.delete(url)
  }

  function recibirArchivo(archivo) {
    const mensaje = validarArchivoFotografia(archivo)
    setError(mensaje)
    if (mensaje) return
    const url = URL.createObjectURL(archivo)
    urlsCreadas.current.add(url)
    liberarUrl(fotografia?.url)
    alCambiar({ url, encuadre: { ...ENCUADRE_INICIAL } })
  }

  function quitarFotografia() {
    liberarUrl(fotografia?.url)
    setError('')
    enfocarSeleccion.current = true
    alCambiar(null)
  }

  function cambiarEncuadre(eje, valor) {
    alCambiar({ ...fotografia, encuadre: { ...fotografia.encuadre, [eje]: Number(valor) } })
  }

  const elegirArchivo = () => entrada.current?.click()
  const descripcion = [`${id}-formatos`, error && `${id}-error`].filter(Boolean).join(' ')
  const eventosArrastre = {
    onDragOver: (evento) => { evento.preventDefault(); setArrastrando(true) },
    onDragLeave: (evento) => { if (!evento.currentTarget.contains(evento.relatedTarget)) setArrastrando(false) },
    onDrop: (evento) => {
      evento.preventDefault()
      setArrastrando(false)
      recibirArchivo(evento.dataTransfer.files?.[0])
    },
  }

  return (
    <fieldset className={`panel-admin__fotografia${arrastrando ? ' panel-admin__fotografia--arrastrando' : ''}`} {...eventosArrastre}>
      <legend>Fotografía del libro <span className="panel-admin__marca-campo">Opcional</span></legend>
      <input
        ref={entrada}
        type="file"
        accept={FORMATOS_ACEPTADOS}
        hidden
        onChange={(evento) => {
          recibirArchivo(evento.target.files?.[0])
          evento.target.value = ''
        }}
      />
      <div className="panel-admin__foto-disposicion">
        {fotografia ? (
          <div className="panel-admin__foto-editor">
            <div className={`panel-admin__foto-completa${tamanoVista ? ' panel-admin__foto-completa--medida' : ''}`} style={tamanoVista ? { width: `${tamanoVista.ancho}px` } : undefined}>
              <img
                src={fotografia.url}
                alt="Fotografía elegida del libro, con la parte visible en la tarjeta marcada"
                onLoad={(evento) => setDimensiones({ url: fotografia.url, ancho: evento.currentTarget.naturalWidth, alto: evento.currentTarget.naturalHeight })}
              />
              {marco?.eje && (
                <span className="panel-admin__foto-marco" aria-hidden="true" style={{ left: `${marco.x}%`, top: `${marco.y}%`, width: `${marco.ancho}%`, height: `${marco.alto}%` }} />
              )}
            </div>
            <div className="panel-admin__foto-controles">
              {marco?.eje ? (
                <>
                  <label htmlFor={`${id}-encuadre`}>Parte visible en la tarjeta</label>
                  <input
                    id={`${id}-encuadre`}
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={fotografia.encuadre[marco.eje]}
                    aria-valuetext={`${fotografia.encuadre[marco.eje]} % ${EXTREMOS_EJE[marco.eje][2]}`}
                    onChange={(evento) => cambiarEncuadre(marco.eje, evento.target.value)}
                  />
                  <div className="panel-admin__foto-extremos" aria-hidden="true">
                    <span>{EXTREMOS_EJE[marco.eje][0]}</span><span>{EXTREMOS_EJE[marco.eje][1]}</span>
                  </div>
                </>
              ) : (
                <p className="panel-admin__ayuda">{marco ? 'La fotografía cabe completa en la portada.' : 'Cargando la fotografía…'}</p>
              )}
              <div className="panel-admin__botones-foto">
                <button type="button" className="panel-admin__boton panel-admin__boton--secundario" aria-describedby={descripcion} onClick={elegirArchivo}>Cambiar foto</button>
                <button type="button" className="panel-admin__boton panel-admin__boton--peligro" onClick={quitarFotografia}>Quitar foto</button>
              </div>
              <p id={`${id}-formatos`} className="panel-admin__ayuda">JPG, PNG o WebP · hasta 5 MB</p>
              <p id={`${id}-error`} className="panel-admin__error-campo" aria-live="polite">{error}</p>
            </div>
          </div>
        ) : (
          <div className="panel-admin__foto-zona">
            <span className="panel-admin__foto-icono" aria-hidden="true">+</span>
            <p>Arrastra aquí una fotografía o</p>
            <button ref={botonElegir} type="button" className="panel-admin__boton panel-admin__boton--secundario" aria-describedby={descripcion} onClick={elegirArchivo}>Elegir fotografía</button>
            <p id={`${id}-formatos`} className="panel-admin__ayuda">JPG, PNG o WebP · hasta 5 MB</p>
            <p id={`${id}-error`} className="panel-admin__error-campo" aria-live="polite">{error}</p>
          </div>
        )}
        <div className="panel-admin__foto-previa">
          <p className="panel-admin__etiqueta-previa">Vista previa</p>
          <TarjetaLibro registro={registroVistaPrevia} vistaPrevia />
        </div>
      </div>
    </fieldset>
  )
}
