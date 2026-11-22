import { useEffect, useState, useSyncExternalStore } from 'react'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { admiteDescargaSinConexion, esperarArchivosSinConexion } from '../servicios/archivosSinConexion.js'
import { leerCopiaEducativa } from '../servicios/copiaEducativa.js'
import { descargarContenidoEducativo } from '../servicios/descargaEducativa.js'
import { etiquetaCopiaDescargada } from '../servicios/fechaDescarga.js'

function suscribirseAConexion(alCambiar) {
  window.addEventListener('online', alCambiar)
  window.addEventListener('offline', alCambiar)
  return () => {
    window.removeEventListener('online', alCambiar)
    window.removeEventListener('offline', alCambiar)
  }
}

function estaSinConexion() {
  return !navigator.onLine
}

export function DescargaSinConexion() {
  const admite = admiteDescargaSinConexion()
  const sinConexion = useSyncExternalStore(suscribirseAConexion, estaSinConexion)
  const [fecha, setFecha] = useState(null)
  const [progreso, setProgreso] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!admite) return undefined
    let vigente = true
    void Promise.all([leerCopiaEducativa(), esperarArchivosSinConexion()]).then(([copia]) => {
      if (vigente && copia) setFecha((actual) => actual ?? copia.fechaDescarga)
    }).catch(() => {})
    return () => { vigente = false }
  }, [admite])

  async function descargar() {
    setError('')
    setProgreso(0)
    try {
      await esperarArchivosSinConexion()
      const copia = await descargarContenidoEducativo(setProgreso)
      setFecha(copia.fechaDescarga)
    } catch (fallo) {
      setError(fallo.message || 'No se pudo preparar la descarga.')
    } finally {
      setProgreso(null)
    }
  }

  if (!import.meta.env.PROD) return <p>La descarga está disponible en la versión de producción.</p>

  const etiqueta = fecha === null ? 'Descargar para usar sin conexión' : 'Actualizar descarga'

  return (
    <div className="descarga-sin-conexion">
      {admite && <button className="descarga-sin-conexion__boton"
        type="button" disabled={progreso !== null} onClick={descargar}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M12 3v12m-4-4 4 4 4-4M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" />
        </svg>
        {etiqueta}
      </button>}
      <div className="descarga-sin-conexion__estado" role="status">
        {!admite && <p>La descarga sin conexión no está disponible en este navegador.</p>}
        {progreso !== null && <p>Preparando {progreso} de {CUERPOS_CELESTES.length} cuerpos…</p>}
        {error && <p>{error} Vuelve a intentarlo con conexión.</p>}
        {fecha !== null && <p>Disponible sin conexión. {etiquetaCopiaDescargada(fecha)}.</p>}
        {admite && sinConexion && fecha === null && progreso === null && !error && <p>Se necesita conexión para descargar las fichas.</p>}
      </div>
    </div>
  )
}
