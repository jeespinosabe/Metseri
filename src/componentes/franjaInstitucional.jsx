import { useEffect, useId, useRef, useState } from 'react'
import logoBiblioteca from '../assets/instituciones/logoBiblioteca.png'
import logoCecan from '../assets/instituciones/logoCecan.png'
import { DialogoAcercaDe } from './dialogoAcercaDe.jsx'
import { MenuPrincipal } from './menuPrincipal.jsx'
import './franjaInstitucional.css'

export function FranjaInstitucional({ activa, alAbrirAdministracion }) {
  const idPanel = useId()
  const zonaRef = useRef(null)
  const botonRef = useRef(null)
  const menuBotonRef = useRef(null)
  const [apertura, setApertura] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [acercaAbierto, setAcercaAbierto] = useState(false)
  const abierta = activa && apertura !== null

  if (!activa && apertura !== null) setApertura(null)
  if (!abierta && menuAbierto) setMenuAbierto(false)
  if (!activa && acercaAbierto) setAcercaAbierto(false)

  useEffect(() => {
    if (apertura === 'teclado') menuBotonRef.current?.focus({ preventScroll: true })
  }, [apertura])

  useEffect(() => {
    if (!abierta) return undefined

    function cerrarAlPulsarFuera(evento) {
      if (!zonaRef.current?.contains(evento.target)) setApertura(null)
      else if (menuAbierto && !evento.target.closest?.('.menu-principal')) setMenuAbierto(false)
    }

    function cerrarConEscape(evento) {
      if (evento.key !== 'Escape' || zonaRef.current?.querySelector('dialog[open]')) return
      if (menuAbierto) {
        // Con el Menú abierto, Escape cierra primero el Menú y conserva el banner.
        setMenuAbierto(false)
        menuBotonRef.current?.focus({ preventScroll: true })
        return
      }
      if (zonaRef.current?.contains(document.activeElement)) botonRef.current?.focus({ preventScroll: true })
      setApertura(null)
    }

    document.addEventListener('pointerdown', cerrarAlPulsarFuera)
    document.addEventListener('keydown', cerrarConEscape)
    return () => {
      document.removeEventListener('pointerdown', cerrarAlPulsarFuera)
      document.removeEventListener('keydown', cerrarConEscape)
    }
  }, [abierta, menuAbierto])

  function abrirConRaton(evento) {
    if (evento.pointerType === 'mouse' && apertura === null) setApertura('raton')
  }

  function cerrarAlSalir(evento) {
    if (evento.pointerType === 'mouse' && apertura === 'raton' && !menuAbierto && !acercaAbierto) setApertura(null)
  }

  function abrirConBoton(evento) {
    if (evento.detail === 0) setApertura('teclado')
    else if (apertura === null) setApertura('toque')
  }

  function cerrarAlPerderFoco(evento) {
    if (apertura === 'teclado' && !menuAbierto && !acercaAbierto && !evento.currentTarget.contains(evento.relatedTarget)) setApertura(null)
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
          <div className="franja-institucional__cecan">
            <img src={logoCecan} alt="Nayarit y Consejo Estatal para la Cultura y las Artes de Nayarit" />
          </div>
          <img className="franja-institucional__biblioteca" src={logoBiblioteca} alt="Biblioteca Pública Central Estatal Solón Argüello" />
        </div>
        <div className="franja-institucional__acciones" role="group" aria-label="Acciones de Metseri">
          <MenuPrincipal
            abierto={menuAbierto}
            botonRef={menuBotonRef}
            alAlternar={() => setMenuAbierto((actual) => !actual)}
            alCerrar={() => setMenuAbierto(false)}
            alAbrirAdministracion={alAbrirAdministracion}
            alAbrirAcerca={() => { setMenuAbierto(false); setAcercaAbierto(true) }}
          />
        </div>
      </header>
      <DialogoAcercaDe abierto={acercaAbierto} alCerrar={() => { setAcercaAbierto(false); menuBotonRef.current?.focus({ preventScroll: true }) }} />
    </div>
  )
}
