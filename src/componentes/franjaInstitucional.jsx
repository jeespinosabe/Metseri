import { useEffect, useId, useRef, useState } from 'react'
import logoBiblioteca from '../assets/instituciones/logoBiblioteca.png'
import logoCecan from '../assets/instituciones/logoCecan.png'
import { DialogoAplicacionMetseri } from './dialogoAplicacionMetseri.jsx'
import './franjaInstitucional.css'

export function FranjaInstitucional({ activa, alAbrirAdministracion }) {
  const idPanel = useId()
  const zonaRef = useRef(null)
  const botonRef = useRef(null)
  const enlaceRef = useRef(null)
  const [apertura, setApertura] = useState(null)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const abierta = activa && apertura !== null

  if (!activa && apertura !== null) setApertura(null)
  if (!activa && dialogoAbierto) setDialogoAbierto(false)

  useEffect(() => {
    if (apertura === 'teclado') enlaceRef.current?.focus({ preventScroll: true })
  }, [apertura])

  useEffect(() => {
    if (!abierta) return undefined

    function cerrarAlPulsarFuera(evento) {
      if (!zonaRef.current?.contains(evento.target)) setApertura(null)
    }

    function cerrarConEscape(evento) {
      if (evento.key !== 'Escape' || zonaRef.current?.querySelector('dialog[open]')) return
      if (zonaRef.current?.contains(document.activeElement)) botonRef.current?.focus({ preventScroll: true })
      setApertura(null)
    }

    document.addEventListener('pointerdown', cerrarAlPulsarFuera)
    document.addEventListener('keydown', cerrarConEscape)
    return () => {
      document.removeEventListener('pointerdown', cerrarAlPulsarFuera)
      document.removeEventListener('keydown', cerrarConEscape)
    }
  }, [abierta])

  function abrirConRaton(evento) {
    if (evento.pointerType === 'mouse' && apertura === null) setApertura('raton')
  }

  function cerrarAlSalir(evento) {
    if (evento.pointerType === 'mouse' && apertura === 'raton' && !dialogoAbierto) setApertura(null)
  }

  function abrirConBoton(evento) {
    if (evento.detail === 0) setApertura('teclado')
    else if (apertura === null) setApertura('toque')
  }

  function cerrarAlPerderFoco(evento) {
    if (apertura === 'teclado' && !dialogoAbierto && !evento.currentTarget.contains(evento.relatedTarget)) setApertura(null)
  }

  return (
    <div className="franja-institucional" ref={zonaRef} hidden={!activa} data-abierta={abierta}
      onPointerEnter={abrirConRaton} onPointerLeave={cerrarAlSalir} onBlur={cerrarAlPerderFoco}>
      <button className="franja-institucional__activador" ref={botonRef} type="button"
        aria-label="Mostrar la franja institucional" aria-controls={idPanel} aria-expanded={abierta} onClick={abrirConBoton}>
        <span aria-hidden="true" />
      </button>
      <header id={idPanel} className="franja-institucional__panel" aria-label="Instituciones y acciones" inert={!abierta}>
        <span className="franja-institucional__marca">MET<span>S</span>ERI</span>
        <div className="franja-institucional__marcas">
          <img className="franja-institucional__biblioteca" src={logoBiblioteca} alt="Biblioteca Pública Central Estatal Solón Argüello" />
          <div className="franja-institucional__cecan">
            <img src={logoCecan} alt="Nayarit y Consejo Estatal para la Cultura y las Artes de Nayarit" />
          </div>
        </div>
        <div className="franja-institucional__acciones" role="group" aria-label="Acciones de Metseri">
          <a className="franja-institucional__accion franja-institucional__administracion" href="/admin"
            ref={enlaceRef} aria-label="Administración" title="Administración" onClick={alAbrirAdministracion}>
            <span className="franja-institucional__icono-administracion" aria-hidden="true" />
            <span className="franja-institucional__etiqueta-administracion">Administración</span>
          </a>
          <button className="franja-institucional__accion franja-institucional__descarga" type="button"
            aria-label="Instalar o descargar" aria-haspopup="dialog" title="Instalar o descargar"
            onClick={() => setDialogoAbierto(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12m-4-4 4 4 4-4M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" />
            </svg>
          </button>
        </div>
      </header>
      <DialogoAplicacionMetseri abierto={dialogoAbierto} alCerrar={() => setDialogoAbierto(false)} />
    </div>
  )
}
