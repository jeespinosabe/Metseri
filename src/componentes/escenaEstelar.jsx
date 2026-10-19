import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { crearCampoEstelar } from '../escena/campoEstelar.js'
import {
  calcularCuaternionVista,
  crearControlesVista,
} from '../escena/controlesVista.js'
import { crearSensorOrientacion } from '../escena/orientacionDispositivo.js'
import { crearPantallaInmersiva } from '../escena/pantallaInmersiva.js'
import { PunteroCruz } from './punteroCruz.jsx'

const MENSAJE_SIN_RENDERIZADO =
  'Tu navegador no pudo iniciar los gráficos necesarios para mostrar el cielo. Comprueba que la aceleración gráfica esté activada e inténtalo de nuevo.'
const MENSAJE_CONTEXTO_PERDIDO =
  'Se interrumpió la conexión con los gráficos del dispositivo y el cielo dejó de mostrarse. Puedes intentar cargarlo de nuevo.'

// Avisos breves y no bloqueantes cuando el sensor de orientación no se puede usar.
const AVISO_PERMISO_DENEGADO =
  'No se concedió el permiso de orientación. Arrastra para mirar alrededor.'
const AVISO_SENSOR_NO_DISPONIBLE =
  'No se pudo usar el sensor de orientación. Arrastra para mirar alrededor.'
const DURACION_AVISO_MS = 6000

const CONSULTA_VERTICAL = '(orientation: portrait)'

function suscribirseAOrientacion(alCambiar) {
  const consulta = window.matchMedia(CONSULTA_VERTICAL)
  consulta.addEventListener('change', alCambiar)
  return () => consulta.removeEventListener('change', alCambiar)
}

function estaEnVertical() {
  return window.matchMedia(CONSULTA_VERTICAL).matches
}

function obtenerAnguloPantalla() {
  return window.screen?.orientation?.angle ?? window.orientation ?? 0
}

export function EscenaEstelar() {
  const raizRef = useRef(null)
  const superficieRef = useRef(null)
  const campoRef = useRef(null)
  const pantallaRef = useRef(null)
  const controlesRef = useRef(null)
  const [estado, setEstado] = useState({ intento: 0, mensajeError: null })
  const [modo, setModo] = useState('normal')
  const [aviso, setAviso] = useState(null)
  const { intento, mensajeError } = estado
  const enVertical = useSyncExternalStore(suscribirseAOrientacion, estaEnVertical)

  const salirModoVr = useCallback(() => {
    controlesRef.current?.salirVr()
    campoRef.current?.establecerModo('normal')
    pantallaRef.current?.liberar()
    setModo('normal')
  }, [])

  useEffect(() => {
    if (mensajeError) return undefined

    let campo = null
    let controles = null
    let pantalla = null
    try {
      campo = crearCampoEstelar(superficieRef.current, {
        alPerderContexto: () => {
          setModo('normal')
          setAviso(null)
          setEstado((anterior) => ({
            ...anterior,
            mensajeError: MENSAJE_CONTEXTO_PERDIDO,
          }))
        },
      })
      controles = crearControlesVista({
        elemento: superficieRef.current,
        sensor: crearSensorOrientacion(),
        obtenerAnguloPantalla,
        alCambiar: (orientacion) =>
          campo.establecerOrientacion(calcularCuaternionVista(orientacion)),
        alAvisar: (motivo) =>
          setAviso(
            motivo === 'denegado'
              ? AVISO_PERMISO_DENEGADO
              : AVISO_SENSOR_NO_DISPONIBLE,
          ),
      })
      pantalla = crearPantallaInmersiva({
        elemento: raizRef.current,
        // El navegador cerró la pantalla completa que la experiencia había adquirido.
        alAbandonarPantallaCompleta: () => {
          controles.salirVr()
          campo.establecerModo('normal')
          setModo('normal')
        },
      })
      campoRef.current = campo
      controlesRef.current = controles
      pantallaRef.current = pantalla
    } catch {
      controles?.destruir()
      campo?.destruir()
      campo = null
      controles = null
      queueMicrotask(() => {
        setModo('normal')
        setEstado((anterior) => ({
          ...anterior,
          mensajeError: MENSAJE_SIN_RENDERIZADO,
        }))
      })
    }

    return () => {
      pantalla?.destruir()
      controles?.destruir()
      controlesRef.current = null
      campoRef.current = null
      pantallaRef.current = null
      campo?.destruir()
    }
  }, [intento, mensajeError])

  useEffect(() => {
    if (modo !== 'vr') return undefined
    function alPulsarTecla(evento) {
      if (evento.key === 'Escape') salirModoVr()
    }
    document.addEventListener('keydown', alPulsarTecla)
    return () => document.removeEventListener('keydown', alPulsarTecla)
  }, [modo, salirModoVr])

  useEffect(() => {
    if (!aviso) return undefined
    const temporizador = setTimeout(() => setAviso(null), DURACION_AVISO_MS)
    return () => clearTimeout(temporizador)
  }, [aviso])

  function entrarModoVr() {
    setAviso(null)
    // Primero el sensor: el permiso debe pedirse dentro del gesto, antes de
    // cualquier operación (como la pantalla completa) que consuma la activación.
    controlesRef.current?.entrarVr()
    campoRef.current?.establecerModo('vr')
    setModo('vr')
    // Pantalla completa y bloqueo horizontal son mejoras opcionales: nunca impiden VR.
    pantallaRef.current?.solicitar()
  }

  function reintentar() {
    setEstado((anterior) => ({
      intento: anterior.intento + 1,
      mensajeError: null,
    }))
  }

  return (
    <div className={`escena-estelar escena-estelar--${modo}`} ref={raizRef}>
      <div
        className="escena-estelar__superficie"
        ref={superficieRef}
        role="application"
        aria-label="Cielo estrellado. Arrastra o usa las flechas del teclado para mirar alrededor."
        tabIndex={mensajeError ? -1 : 0}
      />
      {mensajeError ? (
        <div className="escena-estelar__error" role="alert">
          <p>{mensajeError}</p>
          <button type="button" onClick={reintentar}>
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <PunteroCruz modo={modo} />
          <div className="escena-estelar__avisos" role="status">
            {modo === 'vr' && enVertical && (
              <p className="escena-estelar__indicacion">
                Gira el teléfono a horizontal para usar el visor.
              </p>
            )}
            {aviso && <p className="escena-estelar__aviso">{aviso}</p>}
          </div>
          <div className="escena-estelar__controles">
            <button
              type="button"
              onClick={() => controlesRef.current?.recentrar()}
            >
              Recentrar
            </button>
            <button
              type="button"
              onClick={modo === 'vr' ? salirModoVr : entrarModoVr}
            >
              {modo === 'vr' ? 'Salir de VR' : 'Entrar VR'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
