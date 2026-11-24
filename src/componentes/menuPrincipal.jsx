import { useId } from 'react'
import { DescargaSinConexion } from './descargaSinConexion.jsx'
import { InstalacionMetseri } from './dialogoAplicacionMetseri.jsx'

// Menú del banner (patrón disclosure). «Instalar Metseri» y «Descargar para usar sin conexión» son los
// componentes existentes, sin cambios. El panel permanece montado y se oculta con `hidden` para que
// DescargaSinConexion conserve su estado y la lectura de la copia guardada, como en el diálogo anterior.
export function MenuPrincipal({ abierto, botonRef, alAlternar, alCerrar, alAbrirAdministracion, alAbrirAcerca }) {
  const idPanel = useId()

  return (
    <div className="menu-principal">
      <button className="franja-institucional__accion menu-principal__boton" ref={botonRef} type="button"
        aria-label="Menú" title="Menú" aria-expanded={abierto} aria-controls={idPanel} onClick={alAlternar}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" aria-hidden="true" focusable="false">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="menu-principal__etiqueta">Menú</span>
      </button>
      <div id={idPanel} className="menu-principal__panel" hidden={!abierto}>
        <InstalacionMetseri visible={abierto} alTerminar={alCerrar} />
        <section className="aplicacion-metseri__sin-conexion">
          <DescargaSinConexion />
        </section>
        <div className="menu-principal__opciones">
          <a className="menu-principal__opcion" href="/admin" onClick={alAbrirAdministracion}>
            <span className="franja-institucional__icono-administracion" aria-hidden="true" />
            Administración
          </a>
          <button className="menu-principal__opcion" type="button" onClick={alAbrirAcerca}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5m0-8.5v.01" />
            </svg>
            Acerca de
          </button>
        </div>
      </div>
    </div>
  )
}
