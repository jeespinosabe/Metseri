import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { estaInstalada, solicitarInstalacion, suscribirseAInstalacion } from '../servicios/instalacionMetseri.js'
import { DescargaSinConexion } from './descargaSinConexion.jsx'

export function GuiaInstalacion() {
  if (!import.meta.env.PROD) {
    return <p>Prueba la versión de producción para instalar Metseri.</p>
  }

  if (!window.isSecureContext) {
    return <p>Abre Metseri por HTTPS para instalarla como aplicación.</p>
  }

  const navegador = navigator.userAgent
  const esMac = /Macintosh/u.test(navegador)
  if (/iPhone|iPad|iPod/u.test(navegador) || (esMac && navigator.maxTouchPoints > 1)) {
    return (
      <ol>
        <li>Abre Metseri en Safari y toca <strong>Compartir</strong> en la barra o en el menú de la página.</li>
        <li>Selecciona <strong>Agregar a Inicio</strong>.</li>
        <li>Activa <strong>Abrir como app web</strong> si aparece y toca <strong>Agregar</strong>.</li>
      </ol>
    )
  }

  if (esMac) {
    return (
      <ol>
        <li>Abre Metseri en Safari en macOS Sonoma 14 o posterior.</li>
        <li>En el menú <strong>Archivo</strong>, elige <strong>Agregar al Dock</strong> y confirma.</li>
      </ol>
    )
  }

  if (/Android/u.test(navegador)) {
    return (
      <ol>
        <li>Abre Metseri en Chrome y toca el menú <strong>⋮</strong>.</li>
        <li>Elige <strong>Instalar y crear acceso directo</strong> o <strong>Agregar a la pantalla principal</strong>. Después, toca <strong>Instalar</strong>.</li>
      </ol>
    )
  }

  return <p>En Chrome o Edge, busca la opción para instalar Metseri en la barra de direcciones o en el menú del navegador.</p>
}

export function InstalacionMetseri({ visible, alTerminar }) {
  const [instalando, setInstalando] = useState(false)
  const [muestraGuia, setMuestraGuia] = useState(false)
  const instalada = useSyncExternalStore(suscribirseAInstalacion, estaInstalada)

  if (!visible && muestraGuia) setMuestraGuia(false)

  async function instalar() {
    if (instalando) return
    setInstalando(true)
    try {
      if (await solicitarInstalacion()) alTerminar()
      else setMuestraGuia(true)
    } finally {
      setInstalando(false)
    }
  }

  return (
    <>
      {!instalada && (
        <section className="aplicacion-metseri__instalacion">
          <button className="aplicacion-metseri__opcion" type="button" aria-disabled={instalando} onClick={instalar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <path d="M12 8v8m-3-3 3 3 3-3" />
            </svg>
            Instalar Metseri
          </button>
          <div aria-live="polite">{muestraGuia && <GuiaInstalacion />}</div>
        </section>
      )}
    </>
  )
}

export function DialogoAplicacionMetseri({ abierto, alCerrar }) {
  const idTitulo = useId()
  const dialogoRef = useRef(null)

  useEffect(() => {
    const dialogo = dialogoRef.current
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog ref={dialogoRef} className="aplicacion-metseri"
      aria-labelledby={idTitulo} onClose={(evento) => { if (!evento.currentTarget.open) alCerrar() }}>
      <header className="aplicacion-metseri__cabecera">
        <h2 id={idTitulo}>Instalar o descargar</h2>
        <form method="dialog">
          <button className="aplicacion-metseri__cerrar" type="submit" aria-label="Cerrar">
            <span aria-hidden="true">×</span>
          </button>
        </form>
      </header>
      <InstalacionMetseri visible={abierto} alTerminar={alCerrar} />
      <section className="aplicacion-metseri__sin-conexion">
        <DescargaSinConexion />
      </section>
    </dialog>
  )
}
