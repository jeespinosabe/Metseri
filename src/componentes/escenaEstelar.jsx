import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { crearCampoEstelar } from '../escena/campoEstelar.js'
import {
  calcularCuaternionVista,
  crearControlesVista,
} from '../escena/controlesVista.js'
import { crearSensorOrientacion } from '../escena/orientacionDispositivo.js'
import { crearPantallaInmersiva } from '../escena/pantallaInmersiva.js'
import { PunteroCruz } from './punteroCruz.jsx'
import { FichaCuerpoCeleste } from './fichaCuerpoCeleste.jsx'
import { obtenerCuerpoCeleste } from '../datos/cuerposCelestes.js'
import { abrirFichaBibliografica } from '../datos/librosCuerposCelestes.js'

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
  const [lectura, setLectura] = useState({ cuerpoId: null, pagina: 0, total: 0 })
  const cuerpo = obtenerCuerpoCeleste(lectura.cuerpoId)
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
        alCambiarFicha: setLectura,
        alSolicitarLibro: (libro) => abrirFichaBibliografica(libro, { salirVr: salirModoVr }),
        alPerderContexto: () => {
          setLectura({ cuerpoId: null, pagina: 0, total: 0 })
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
        alActivar: (evento) => campo.activar(evento),
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
        setLectura({ cuerpoId: null, pagina: 0, total: 0 })
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
  }, [intento, mensajeError, salirModoVr])

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

  function cerrarFicha() {
    campoRef.current?.ejecutarAccionFicha('cerrar')
    superficieRef.current?.focus({ preventScroll: true })
  }

  function recentrar() {
    controlesRef.current?.recentrar()
    campoRef.current?.recentrarFicha()
  }

  return (
    <div className={`escena-estelar escena-estelar--${modo}`} ref={raizRef}>
      <div
        className="escena-estelar__superficie"
        ref={superficieRef}
        role="application"
        aria-label={modo === 'vr'
          ? 'Cielo con planetas en VR. Mira un planeta y toca para abrir su ficha frente a ti. Mira una sección o una flecha y toca para navegar. Tocar el área de lectura mantiene la ficha abierta. Usa la equis para cerrar, o mira fuera de la ficha y toca para deseleccionar. Arrastra o usa las flechas para mirar manualmente.'
          : 'Cielo con planetas. Pasa el mouse sobre un planeta para iluminarlo. Haz clic o toca para seleccionarlo y leer su ficha; pulsa de nuevo o toca el fondo para cerrar y deseleccionar. Arrastra o usa las flechas para mirar alrededor.'}
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
          <span className="solo-lectores" role="status">{cuerpo ? `Ficha de ${cuerpo.nombre} abierta.` : 'Sin ficha abierta.'}</span>
          {cuerpo && <FichaCuerpoCeleste
            key={`${cuerpo.id}-${modo}`}
            cuerpo={cuerpo}
            modo={modo}
            lectura={lectura}
            alAccionar={(accion) => campoRef.current?.ejecutarAccionFicha(accion)}
            alEntrar={() => campoRef.current?.limpiarApuntado()}
            alCerrar={cerrarFicha}
            alAbrirLibro={(libro) => abrirFichaBibliografica(libro, { salirVr: modo === 'vr' ? salirModoVr : undefined })}
          />}
          {modo === 'vr' && cuerpo && <div className="ficha-vr-indicaciones" aria-hidden="true">
            <span>Mira una sección o una flecha y toca · × para cerrar</span>
            <span>Mira una sección o una flecha y toca · × para cerrar</span>
          </div>}
          <div className="escena-estelar__avisos" role="status">
            {modo === 'vr' && enVertical && (
              <p className="escena-estelar__indicacion">
                Gira el teléfono a horizontal para usar el visor.
              </p>
            )}
            {aviso && <p className="escena-estelar__aviso">{aviso}</p>}
          </div>
          <div className="escena-estelar__controles" onPointerEnter={() => campoRef.current?.limpiarApuntado()}>
            <button
              type="button"
              onClick={recentrar}
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
