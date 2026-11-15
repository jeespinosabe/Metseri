import { useEffect, useState } from 'react'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { admiteDescargaSinConexion, esperarArchivosSinConexion } from '../servicios/archivosSinConexion.js'
import { leerCopiaEducativa } from '../servicios/copiaEducativa.js'
import { descargarContenidoEducativo } from '../servicios/descargaEducativa.js'
import { etiquetaCopiaDescargada } from '../servicios/fechaDescarga.js'

export function DescargaSinConexion({ visible, alEntrar }) {
  const admite = admiteDescargaSinConexion()
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

  if (!visible || !import.meta.env.PROD) return null

  return (
    <div className="descarga-sin-conexion" onPointerEnter={alEntrar}>
      {admite && <button type="button" disabled={progreso !== null} onClick={descargar}>
        {fecha === null ? 'Descargar para usar sin conexión' : 'Actualizar descarga'}
      </button>}
      <div className="descarga-sin-conexion__estado" role="status">
        {!admite && <p>La descarga sin conexión no está disponible en este navegador.</p>}
        {progreso !== null && <p>Preparando {progreso} de {CUERPOS_CELESTES.length} cuerpos…</p>}
        {error && <p>{error} Vuelve a intentarlo con conexión.</p>}
        {fecha !== null && <p>Disponible sin conexión. {etiquetaCopiaDescargada(fecha)}.</p>}
        {admite && fecha === null && progreso === null && !error && <p>Se necesita conexión para descargar las fichas.</p>}
      </div>
    </div>
  )
}
