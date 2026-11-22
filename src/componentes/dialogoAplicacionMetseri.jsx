import { useEffect, useId, useRef } from 'react'
import { DescargaSinConexion } from './descargaSinConexion.jsx'

function GuiaInstalacion() {
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

export function DialogoAplicacionMetseri({ seccion, alCerrar }) {
  const idTitulo = useId()
  const dialogoRef = useRef(null)
  const muestraInstalacion = seccion === 'instalacion'

  useEffect(() => {
    const dialogo = dialogoRef.current
    if (seccion && !dialogo.open) dialogo.showModal()
    if (!seccion && dialogo.open) dialogo.close()
  }, [seccion])

  return (
    <dialog ref={dialogoRef} className="aplicacion-metseri"
      aria-labelledby={idTitulo} onClose={(evento) => { if (!evento.currentTarget.open) alCerrar() }}>
      <header className="aplicacion-metseri__cabecera">
        <h2 id={idTitulo}>{muestraInstalacion ? 'Instalar Metseri' : 'Uso sin conexión'}</h2>
        <form method="dialog">
          <button className="aplicacion-metseri__cerrar" type="submit" aria-label="Cerrar">
            <span aria-hidden="true">×</span>
          </button>
        </form>
      </header>
      {muestraInstalacion && <GuiaInstalacion />}
      <section className="aplicacion-metseri__sin-conexion" hidden={muestraInstalacion}>
        <DescargaSinConexion />
      </section>
    </dialog>
  )
}
