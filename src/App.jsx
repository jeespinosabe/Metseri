import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Compass, Download, Glasses, Maximize, Minus, Orbit, Plus, RotateCcw, Search, Smartphone, Sparkles, X } from 'lucide-react';
import EscenaEspacial, { VR_EXIT_TARGET } from './EscenaEspacial.jsx';
import { allObjects, buscarObjetoCeleste } from './catalogoCeleste.js';
import { obtenerImagenPlaneta } from './texturas.js';

function MiniaturaPlaneta({ body, className = '' }) {
  if (body.kind === 'constellation') return <span className={`planet-thumb constellation-thumb ${className}`}><Sparkles size={28} strokeWidth={1} /></span>;
  return <span className={`planet-thumb thumb-${body.id} ${className}`} style={{ '--planet-image': `url(${obtenerImagenPlaneta(body.id)})`, '--planet-color': body.color }}><span className="planet-ball" />{body.id === 'saturn' && <span className="thumb-ring" />}</span>;
}

function VentanaModal({ title, alCerrar, children, className = '' }) {
  const box = useRef(null);
  const close = useRef(alCerrar);
  close.current = alCerrar;
  useEffect(() => {
    const previous = document.activeElement;
    const first = box.current?.querySelector('input, button'); first?.focus();
    const gestionarTeclasModal = (event) => {
      if (event.key === 'Escape') close.current();
      if (event.key !== 'Tab') return;
      const items = [...box.current.querySelectorAll('button, input, a[href]')].filter(el => !el.disabled);
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus(); }
    };
    document.addEventListener('keydown', gestionarTeclasModal);
    return () => { document.removeEventListener('keydown', gestionarTeclasModal); previous?.focus(); };
  }, []);
  return <div className="modal-backdrop" onClick={alCerrar}>
    <section ref={box} className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}>
      <div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={alCerrar} aria-label="Cerrar"><X size={21} /></button></div>
      {children}
    </section>
  </div>;
}

export default function App() {
  const scene = useRef(null), installPrompt = useRef(null), toastTimer = useRef(null);
  const [ready, actualizarEscenaLista] = useState(false), [error, actualizarError] = useState('');
  const [selectedId, actualizarIdSeleccionado] = useState(null), [hoverId, actualizarIdApuntado] = useState(null);
  const [filter, actualizarFiltro] = useState('all'), [labels, actualizarEtiquetas] = useState(true), [showConstellations, actualizarConstelacionesVisibles] = useState(true);
  const [modal, actualizarModal] = useState(null), [query, actualizarBusqueda] = useState('');
  const [vr, actualizarModoVR] = useState(false), [sensor, actualizarSensor] = useState(false), [sensorState, actualizarEstadoSensor] = useState('');
  const [fullscreen, actualizarPantallaCompleta] = useState(false), [heading, actualizarRumbo] = useState(0);
  const [toast, actualizarAviso] = useState(''), [installable, actualizarInstalacionDisponible] = useState(false), [offline, actualizarSinConexion] = useState(!navigator.onLine);
  const [vrCard, actualizarFichaVR] = useState(false);
  const selected = buscarObjetoCeleste(selectedId), hovered = buscarObjetoCeleste(hoverId);
  const vrExitTargeted = hoverId === VR_EXIT_TARGET;
  const mostrarAviso = (message) => { clearTimeout(toastTimer.current); actualizarAviso(message); toastTimer.current = setTimeout(() => actualizarAviso(''), 4500); };

  useEffect(() => {
    function prepararInstalacion(event) { event.preventDefault(); installPrompt.current = event; actualizarInstalacionDisponible(true); }
    function confirmarInstalacion() { installPrompt.current = null; actualizarInstalacionDisponible(false); mostrarAviso('Metseri ya está instalada. Nos vemos entre las estrellas.'); }
    function actualizarEstadoConexion() { actualizarSinConexion(!navigator.onLine); }
    function actualizarEstadoPantallaCompleta() { actualizarPantallaCompleta(Boolean(document.fullscreenElement)); if (!document.fullscreenElement) { actualizarModoVR(false); actualizarSensor(false); } }
    function avisarDisponibilidadSinConexion() { mostrarAviso('Tu universo está listo para explorar sin conexión.'); }
    function cerrarInformacionConEscape(event) { if (event.key === 'Escape') { actualizarIdSeleccionado(null); actualizarFichaVR(false); } }
    window.addEventListener('beforeinstallprompt', prepararInstalacion); window.addEventListener('appinstalled', confirmarInstalacion);
    window.addEventListener('online', actualizarEstadoConexion); window.addEventListener('offline', actualizarEstadoConexion);
    window.addEventListener('orbita-offline-ready', avisarDisponibilidadSinConexion); document.addEventListener('fullscreenchange', actualizarEstadoPantallaCompleta); window.addEventListener('keydown', cerrarInformacionConEscape);
    return () => {
      window.removeEventListener('beforeinstallprompt', prepararInstalacion); window.removeEventListener('appinstalled', confirmarInstalacion);
      window.removeEventListener('online', actualizarEstadoConexion); window.removeEventListener('offline', actualizarEstadoConexion);
      window.removeEventListener('orbita-offline-ready', avisarDisponibilidadSinConexion); document.removeEventListener('fullscreenchange', actualizarEstadoPantallaCompleta); window.removeEventListener('keydown', cerrarInformacionConEscape);
      clearTimeout(toastTimer.current);
    };
  }, []);

  function seleccionarCuerpoCeleste(id) {
    const object = buscarObjetoCeleste(id); if (!object) return;
    if (object.kind === 'constellation') { actualizarConstelacionesVisibles(true); if (filter === 'planets') actualizarFiltro('all'); }
    else if (filter === 'constellations') actualizarFiltro('all');
    actualizarIdSeleccionado(id); actualizarModal(null); actualizarFichaVR(true);
    if (!vr) scene.current?.enfocarCuerpoCeleste(id);
  }
  function cerrarInformacionVR() {
    actualizarFichaVR(false); actualizarIdSeleccionado(null);
  }
  function cambiarVista(value) {
    actualizarFiltro(value); actualizarIdSeleccionado(null);
    if (value === 'constellations') { actualizarConstelacionesVisibles(true); scene.current?.enfocarCuerpoCeleste('orion'); }
    else scene.current?.restablecerVista();
  }
  async function alternarPantallaCompleta() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else mostrarAviso('Para una vista a pantalla completa, instala Metseri desde el menú de tu navegador.');
    } catch { mostrarAviso('Tu navegador no permite entrar a pantalla completa en este momento.'); }
  }
  async function activarModoVR() {
    let motionAllowed = false;
    if ('DeviceOrientationEvent' in window && window.isSecureContext) {
      try {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') motionAllowed = await DeviceOrientationEvent.requestPermission() === 'granted';
        else motionAllowed = true;
      } catch { motionAllowed = false; }
    }
    try {
      const native = await scene.current?.iniciarSesionWebXR();
      if (native) { actualizarModal(null); actualizarModoVR(true); actualizarSensor(false); return; }
    } catch { /* The split-screen viewer remains available if a headset cannot start. */ }
    actualizarSensor(motionAllowed); actualizarModoVR(true); actualizarModal(null); actualizarFichaVR(false); actualizarIdSeleccionado(null);
    actualizarEstadoSensor(motionAllowed ? 'Esperando el sensor…' : 'Arrastra para orientar la vista');
    if (document.documentElement.requestFullscreen) {
      try { await document.documentElement.requestFullscreen(); } catch { /* Fullscreen is optional. */ }
    }
    try { await screen.orientation?.lock?.('landscape'); } catch { /* Some browsers only allow manual rotation. */ }
    if (motionAllowed) {
      let received = false;
      const recibirLecturaOrientacion = event => { if (event.alpha != null && event.beta != null && event.gamma != null) { received = true; actualizarEstadoSensor('Seguimiento de cabeza activo'); window.removeEventListener('deviceorientation', recibirLecturaOrientacion); } };
      window.addEventListener('deviceorientation', recibirLecturaOrientacion);
      setTimeout(() => { window.removeEventListener('deviceorientation', recibirLecturaOrientacion); if (!received) { actualizarSensor(false); actualizarEstadoSensor('Sensor no disponible · Arrastra para mirar'); } }, 4000);
    }
  }
  async function salirDeVR() {
    actualizarModoVR(false); actualizarSensor(false); cerrarInformacionVR(); await scene.current?.finalizarSesionWebXR();
    try { screen.orientation?.unlock?.(); if (document.fullscreenElement) await document.exitFullscreen(); } catch { /* The viewer still exits. */ }
  }
  async function instalarAplicacion() {
    if (!installPrompt.current) { actualizarModal('install'); return; }
    await installPrompt.current.prompt(); const choice = await installPrompt.current.userChoice;
    if (choice.outcome === 'accepted') actualizarInstalacionDisponible(false);
    installPrompt.current = null;
  }

  const normalizarBusqueda = value => value.toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const searchResults = allObjects.filter(body => normalizarBusqueda(`${body.name} ${body.category} ${body.subtitle}`).includes(normalizarBusqueda(query)));

  return <main className={`observatory ${vr ? 'vr-active' : ''} ${selected ? 'has-selection' : ''}`}>
    <EscenaEspacial ref={scene} alSeleccionarCuerpoCeleste={seleccionarCuerpoCeleste} alCambiarObjetivoApuntado={actualizarIdApuntado} alPrepararEscena={() => actualizarEscenaLista(true)} alFallarEscena={actualizarError} alCambiarRumbo={actualizarRumbo} alFinalizarSesionWebXR={() => { actualizarModoVR(false); actualizarSensor(false); }} alSolicitarSalidaVR={salirDeVR} filter={filter} labels={labels} showConstellations={showConstellations} vr={vr} sensor={sensor} />
    <div className="scene-vignette" />

    {!vr && <>
      <header className="topbar">
        <button className="brand" onClick={() => { cambiarVista('all'); actualizarModal(null); }} aria-label="Metseri, volver al inicio"><span className="brand-symbol"><Orbit size={33} strokeWidth={1.4} /></span><span>METSERI<span className="brand-caption">TU VENTANA AL UNIVERSO</span></span></button>
        <div className="header-actions">
          <button className="icon-button search-trigger" onClick={() => { actualizarBusqueda(''); actualizarModal('search'); }} aria-label="Buscar un cuerpo celeste" title="Buscar"><Search size={19} /></button>
          <span className="header-separator" />
          <button className="vr-button" onClick={activarModoVR}><Glasses size={20} strokeWidth={1.7} /><span>Entrar en VR</span><ArrowUpRight size={16} /></button>
        </div>
      </header>

      <div className="right-tools" aria-label="Opciones de exploración">
        <button className="icon-button" onClick={alternarPantallaCompleta} title="Pantalla completa" aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}><Maximize size={18} /></button>
        {installable && <button className="icon-button" onClick={instalarAplicacion} title="Instalar Metseri" aria-label="Instalar Metseri"><Download size={19} /></button>}
      </div>

      <div className="compass-widget" title={`Orientación ${Math.round(heading)} grados`}><span className="compass-n">N</span><div className="compass-ring"><Compass size={36} strokeWidth={.9} style={{ transform: `rotate(${-heading}deg)` }} /></div><span className="compass-degrees">{String(Math.round(heading)).padStart(3, '0')}°</span></div>

      <div className="view-controls">
        <div className="layer-controls"><button className={labels ? 'enabled' : ''} onClick={() => actualizarEtiquetas(!labels)} aria-pressed={labels}><span className="label-icon">Aa</span><span>Etiquetas</span><span className="toggle-indicator" /></button><span className="control-separator" /><button className={showConstellations ? 'enabled' : ''} onClick={() => actualizarConstelacionesVisibles(!showConstellations)} aria-pressed={showConstellations}><Sparkles size={15} /><span>Constelaciones</span><span className="toggle-indicator" /></button></div>
        <div className="zoom-controls"><button onClick={() => scene.current?.ajustarAcercamiento(6)} aria-label="Alejar" title="Alejar"><Minus size={17} /></button><span /><button onClick={() => scene.current?.ajustarAcercamiento(-6)} aria-label="Acercar" title="Acercar"><Plus size={17} /></button><span /><button onClick={() => { scene.current?.restablecerVista(); actualizarIdSeleccionado(null); }} aria-label="Restablecer vista" title="Restablecer vista"><RotateCcw size={16} /></button></div>
      </div>

      {hovered && !selected && <div className="hover-prompt"><span className="live-dot" /><strong>{hovered.name}</strong><span>Haz clic para explorar</span><ArrowUpRight size={15} /></div>}

      {selected && <aside className="info-panel" aria-label={`Información de ${selected.name}`}>
        <div className="info-top"><span className="eyebrow">UN POCO MÁS CERCA</span><button className="icon-button" onClick={() => actualizarIdSeleccionado(null)} aria-label="Cerrar información"><X size={19} /></button></div>
        <div className="info-identity"><MiniaturaPlaneta body={selected} className="info-thumb" /><span className="category-label">{selected.category}</span><h2>{selected.name}</h2><p className="info-subtitle">{selected.subtitle}</p></div>
        <p className="info-description">{selected.description}</p>
        <div className="facts-grid">{selected.facts.map(fact => <div className="fact" key={fact.label}><span>{fact.label}</span><strong>{fact.value}</strong><small>{fact.unit}</small></div>)}</div>
        <div className="curiosity"><Sparkles size={17} /><div><strong>¿SABÍAS QUE…?</strong><p>{selected.curiosity}</p></div></div>
        <p className="scale-note">Composición educativa · Tamaños y distancias sin escala.</p>
      </aside>}
    </>}

    {vr && <div className="vr-overlay">
      {selected && vrCard && <button className="vr-dismiss" onClick={cerrarInformacionVR} aria-label="Cerrar información VR" />}
      <button className="vr-exit" onClick={salirDeVR}><X size={18} /> Salir de VR</button><span className="vr-sensor"><span className="live-dot" />{sensorState || 'Visor conectado'}</span>
      <div className={`vr-reticle left ${hoverId ? 'targeted' : ''}`} /><div className={`vr-reticle right ${hoverId ? 'targeted' : ''}`} /><div className="vr-divider" />
      <div className="vr-landscape-hint"><Smartphone size={24} /><span>Gira el móvil en horizontal<br />para usar tu visor.</span></div>
      <button className="vr-select" onClick={() => { if (vrCard) cerrarInformacionVR(); else scene.current?.seleccionarObjetivoCentral(); }}>{vrCard ? 'Cerrar información' : vrExitTargeted ? 'Salir de VR' : hovered ? `Descubrir ${hovered.name}` : 'Apunta al centro y toca para descubrir'}</button>
      {!vrCard && ['left', 'right'].map(eye => <div className={`vr-exit-guide ${eye} ${vrExitTargeted ? 'targeted' : ''}`} key={eye}>{vrExitTargeted ? <><strong>Salir de VR</strong><span>Pulsa el botón del visor</span></> : <span>↓ Mira abajo para salir de VR</span>}</div>)}
      {selected && vrCard && <>{['left', 'right'].map(eye => <div className={`vr-info ${eye}`} key={eye}><span>{selected.category}</span><h2>{selected.name}</h2><p>{selected.description}</p><strong>{selected.facts[0].label}: {selected.facts[0].value} {selected.facts[0].unit}</strong></div>)}</>}
    </div>}

    {!ready && !error && <div className="loading-screen"><Orbit size={46} strokeWidth={1} /><strong>Preparando tu universo</strong><span>Un momento. Hay mucho por descubrir.</span></div>}
    {error && <div className="error-screen"><Orbit size={44} /><h2>Necesitamos otra ventana al universo.</h2><p>{error}</p><button className="primary-button" onClick={() => window.location.reload()}>Volver a intentar</button></div>}
    {offline && <div className="offline-badge">Sin conexión · Sigue explorando</div>}
    {toast && <div className="toast" role="status"><Check size={17} />{toast}<button onClick={() => actualizarAviso('')} aria-label="Cerrar aviso"><X size={15} /></button></div>}

    {modal === 'search' && <VentanaModal title="¿Qué quieres descubrir?" alCerrar={() => actualizarModal(null)} className="search-modal"><div className="search-field"><Search size={20} /><input placeholder="Un planeta, una constelación…" value={query} onChange={event => actualizarBusqueda(event.target.value)} aria-label="Buscar destinos" />{query && <button onClick={() => actualizarBusqueda('')} aria-label="Limpiar búsqueda"><X size={17} /></button>}</div><p className="results-label">{query ? `${searchResults.length} RESULTADOS` : 'ELIGE TU PRÓXIMO DESTINO'}</p><div className="object-results">{searchResults.map(body => <button className="object-result" key={body.id} onClick={() => seleccionarCuerpoCeleste(body.id)}><MiniaturaPlaneta body={body} /><span><strong>{body.name}</strong><small>{body.subtitle}</small></span><ArrowUpRight size={18} /></button>)}{searchResults.length === 0 && <div className="empty-state"><Search size={30} /><h3>No encontramos ese destino.</h3><p>Prueba con «Saturno», «Luna» u «Orión».</p></div>}</div></VentanaModal>}

    {modal === 'install' && <VentanaModal title="Llévate el universo contigo." alCerrar={() => actualizarModal(null)}><div className="empty-state"><span className="empty-icon"><Download size={30} /></span><h3>Metseri, siempre a mano.</h3><p>En Android, abre el menú del navegador y elige<br /><strong>«Instalar aplicación»</strong> o <strong>«Añadir a pantalla de inicio»</strong>.</p><p>En iPhone, abre Metseri en Safari y toca<br /><strong>Compartir → Añadir a pantalla de inicio</strong>.</p></div><p className="help-note">La instalación y el acceso sin conexión están disponibles en la versión compilada, servida mediante HTTPS o localhost.</p></VentanaModal>}
  </main>;
}
