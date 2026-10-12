import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { celestialBodies, constellations, esObjetoVisible } from './catalogoCeleste.js';
import { crearTexturaPlaneta, crearTexturaResplandor } from './texturas.js';

export const VR_EXIT_TARGET = 'vr-exit';
const VR_EXIT_LOOK_DOWN = -Math.sin(Math.PI / 3); // 60° por debajo del horizonte.

const EscenaEspacial = forwardRef(function EscenaEspacial({ alSeleccionarCuerpoCeleste, alCambiarObjetivoApuntado, alPrepararEscena, alFallarEscena, alCambiarRumbo, alFinalizarSesionWebXR, alSolicitarSalidaVR, filter, labels, showConstellations, vr, sensor }, ref) {
  const mount = useRef(null);
  const engine = useRef(null);
  const handlers = useRef({});
  handlers.current = { alSeleccionarCuerpoCeleste, alCambiarObjetivoApuntado, alPrepararEscena, alFallarEscena, alCambiarRumbo, alFinalizarSesionWebXR, alSolicitarSalidaVR };
  const settings = useRef({});
  settings.current = { filter, labels, showConstellations, vr, sensor };

  useImperativeHandle(ref, () => ({
    enfocarCuerpoCeleste(id) { engine.current?.enfocarCuerpoCeleste(id); },
    ajustarAcercamiento(delta) { engine.current?.ajustarAcercamiento(delta); },
    restablecerVista() { engine.current?.restablecerVista(); },
    seleccionarObjetivoCentral() { engine.current?.seleccionarObjetivoCentral(); },
    async iniciarSesionWebXR() {
      if (!navigator.xr || !await navigator.xr.isSessionSupported('immersive-vr')) return false;
      const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] });
      await engine.current.renderer.xr.setSession(session);
      session.addEventListener('end', () => handlers.current.alFinalizarSesionWebXR?.());
      return true;
    },
    async finalizarSesionWebXR() { await engine.current?.renderer.xr.getSession()?.end(); }
  }), []);

  useEffect(() => {
    const host = mount.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch {
      handlers.current.alFallarEscena?.('No se pudo iniciar la vista 3D. Activa la aceleración gráfica o prueba otro navegador.');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x070b12);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');
    host.appendChild(renderer.domElement);
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute('aria-label', 'Universo 360. Arrastra para mirar; usa las flechas y pulsa Enter para seleccionar.');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(61, 1, .1, 900);
    camera.rotation.order = 'YXZ';
    const stereo = new THREE.StereoCamera(); stereo.eyeSep = .064;
    const ambient = new THREE.AmbientLight(0xb0bed6, 1.05);
    scene.add(ambient);
    const sunlight = new THREE.DirectionalLight(0xffe9c9, 3.1); sunlight.position.set(-30, 24, 24); scene.add(sunlight);
    const fill = new THREE.DirectionalLight(0x527da5, .24); fill.position.set(30, -10, -40); scene.add(fill);
    const starTexture = crearTexturaResplandor();
    agregarCampoEstelar(scene, starTexture);
    agregarNebulosa(scene);
    const hitTargets = [], records = [], labelsDOM = [];
    const labelLayer = document.createElement('div'); labelLayer.className = 'scene-labels'; host.appendChild(labelLayer);
    let labelHover = null;

    function agregarEtiquetaCeleste(body) {
      const button = document.createElement('button');
      button.className = `celestial-label ${body.id === 'saturn' ? 'featured-label' : ''} ${body.kind === 'constellation' ? 'constellation-label' : ''}`;
      const dot = document.createElement('span'); dot.className = 'label-dot';
      const name = document.createElement('span'); name.textContent = body.name;
      button.append(dot, name);
      if (body.id === 'saturn') { const sub = document.createElement('small'); sub.textContent = 'GIGANTE GASEOSO'; button.append(sub); }
      button.addEventListener('click', () => handlers.current.alSeleccionarCuerpoCeleste?.(body.id));
      button.addEventListener('pointerenter', () => { labelHover = body.id; });
      button.addEventListener('pointerleave', () => { labelHover = null; });
      labelLayer.appendChild(button);
      labelsDOM.push({ button, body });
    }

    for (const body of celestialBodies) {
      const group = new THREE.Group(); group.position.fromArray(body.position);
      const material = new THREE.MeshStandardMaterial({
        map: crearTexturaPlaneta(body.id), roughness: .96, metalness: 0,
        ...(body.id === 'sun' ? { emissive: 0xffb34d, emissiveIntensity: 1.6 } : {})
      });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(body.radius, 64, 40), material);
      sphere.rotation.z = body.id === 'earth' ? -.23 : -.1;
      sphere.userData.id = body.id; group.add(sphere); hitTargets.push(sphere);
      if (body.id === 'saturn' || body.id === 'uranus') agregarAnillosPlanetarios(group, body, hitTargets);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(body.radius * 1.055, 48, 32), new THREE.ShaderMaterial({
        uniforms: { glowColor: { value: new THREE.Color(body.id === 'earth' ? '#72b9dc' : body.color) }, strength: { value: body.id === 'earth' ? .32 : .07 } },
        vertexShader: 'varying vec3 vNormal; varying vec3 vView; void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal); vView=normalize(-p.xyz); gl_Position=projectionMatrix*p; }',
        fragmentShader: 'uniform vec3 glowColor; uniform float strength; varying vec3 vNormal; varying vec3 vView; void main(){float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),3.0); gl_FragColor=vec4(glowColor,rim*strength);}',
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide
      }));
      group.add(halo);
      if (body.id === 'sun') {
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTexture, color: 0xffbe59, blending: THREE.AdditiveBlending, transparent: true, opacity: .45, depthWrite: false }));
        glow.scale.setScalar(body.radius * 5); group.add(glow);
      }
      scene.add(group); records.push({ body, group, sphere, halo }); agregarEtiquetaCeleste(body);
    }

    for (const body of constellations) {
      const group = new THREE.Group(); group.position.fromArray(body.position);
      group.lookAt(0, 0, 0);
      const positions = [];
      for (const [a, b] of body.connections) positions.push(...body.points[a], ...body.points[b]);
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const lines = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x7b9cad, transparent: true, opacity: .28 })); group.add(lines);
      for (const point of body.points) {
        const star = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTexture, color: 0xb3d0df, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        star.position.fromArray(point); star.scale.setScalar(1.25); group.add(star);
      }
      const hit = new THREE.Mesh(new THREE.SphereGeometry(body.radius, 12, 8), new THREE.MeshBasicMaterial({ visible: false })); hit.userData.id = body.id; group.add(hit); hitTargets.push(hit);
      scene.add(group); records.push({ body, group, lines }); agregarEtiquetaCeleste(body);
    }

    const mobileView = host.clientWidth < 761;
    let yaw = mobileView ? -.19 : 0, pitch = mobileView ? -.03 : 0;
    let targetYaw = yaw, targetPitch = pitch, targetFov = mobileView ? 69 : 61;
    let dragging = false, moved = false, previousX = 0, previousY = 0, startX = 0, startY = 0, pointerInside = false;
    let hoverId = null, lastHeading = 0, previousTime = 0, width = 1, height = 1, sensorActive = false;
    const pointer = new THREE.Vector2(10, 10), ray = new THREE.Raycaster(), projected = new THREE.Vector3(), gazeDirection = new THREE.Vector3();
    const orientEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    const orientQ = new THREE.Quaternion(), calibrationQ = new THREE.Quaternion(), screenQ = new THREE.Quaternion();
    const worldZ = new THREE.Vector3(0, 0, 1), yAxis = new THREE.Vector3(0, 1, 0);
    const correctionQ = new THREE.Quaternion(-Math.sqrt(.5), 0, 0, Math.sqrt(.5));
    let sensorBaseline = null;

    function enfocarCuerpoCeleste(id) {
      const body = [...celestialBodies, ...constellations].find(item => item.id === id);
      if (!body) return;
      const p = new THREE.Vector3().fromArray(body.position).normalize();
      targetYaw = Math.atan2(-p.x, -p.z); targetPitch = Math.asin(p.y); targetFov = body.kind === 'constellation' ? 58 : 48;
      // Recalibrate motion on the next valid reading so focusing also works in a mobile viewer.
      sensorBaseline = null;
    }
    function ajustarAcercamiento(delta) { targetFov = THREE.MathUtils.clamp(targetFov + delta, 35, 85); }
    function restablecerVista() { targetYaw = width < 761 ? -.19 : 0; targetPitch = width < 761 ? -.03 : 0; targetFov = width < 761 ? 69 : 61; sensorBaseline = null; }
    function obtenerObjetivoApuntado(center = false) {
      if (center && settings.current.vr && !renderer.xr.isPresenting) {
        camera.getWorldDirection(gazeDirection);
        if (gazeDirection.y <= VR_EXIT_LOOK_DOWN) return VR_EXIT_TARGET;
      }
      if (renderer.xr.isPresenting) {
        const xrCamera = renderer.xr.getCamera();
        ray.ray.origin.setFromMatrixPosition(xrCamera.matrixWorld); ray.ray.direction.set(0, 0, -1).transformDirection(xrCamera.matrixWorld);
      } else ray.setFromCamera(center ? new THREE.Vector2(0, 0) : pointer, camera);
      const hits = ray.intersectObjects(hitTargets.filter(mesh => mesh.parent.visible), false);
      return hits[0]?.object.userData.id || null;
    }
    function seleccionarObjetivoCentral() {
      const id = obtenerObjetivoApuntado(true);
      if (id === VR_EXIT_TARGET) handlers.current.alSolicitarSalidaVR?.();
      else if (id) handlers.current.alSeleccionarCuerpoCeleste?.(id);
    }
    function actualizarPosicionPuntero(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    }
    function iniciarInteraccionPuntero(event) {
      if (event.button !== 0) return;
      dragging = true; moved = false; previousX = startX = event.clientX; previousY = startY = event.clientY;
      actualizarPosicionPuntero(event); renderer.domElement.setPointerCapture(event.pointerId); host.classList.add('is-dragging');
    }
    function moverPuntero(event) {
      pointerInside = true; actualizarPosicionPuntero(event);
      if (!dragging || settings.current.sensor) return;
      const dx = event.clientX - previousX, dy = event.clientY - previousY;
      if (Math.hypot(event.clientX - startX, event.clientY - startY) > 5) moved = true;
      targetYaw += dx * .0035; targetPitch = THREE.MathUtils.clamp(targetPitch + dy * .0035, -1.4, 1.4);
      previousX = event.clientX; previousY = event.clientY;
    }
    function finalizarInteraccionPuntero(event) {
      if (!dragging) return;
      dragging = false; host.classList.remove('is-dragging');
      if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
      if (!moved) {
        if (settings.current.vr) seleccionarObjetivoCentral();
        else { const id = obtenerObjetivoApuntado(); if (id) handlers.current.alSeleccionarCuerpoCeleste?.(id); }
      }
    }
    function cancelarInteraccionPuntero() { dragging = false; host.classList.remove('is-dragging'); }
    function retirarPunteroEscena() { pointerInside = false; pointer.set(10, 10); }
    function ajustarAcercamientoConRueda(event) { event.preventDefault(); ajustarAcercamiento(event.deltaY * .025); }
    function gestionarTeclasEscena(event) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' ', '+', '-'].includes(event.key)) event.preventDefault();
      if (event.key === 'ArrowLeft') targetYaw += .13;
      if (event.key === 'ArrowRight') targetYaw -= .13;
      if (event.key === 'ArrowUp') targetPitch = Math.min(1.4, targetPitch + .13);
      if (event.key === 'ArrowDown') targetPitch = Math.max(-1.4, targetPitch - .13);
      if (event.key === 'Enter' || event.key === ' ') seleccionarObjetivoCentral();
      if (event.key === '+') ajustarAcercamiento(-5);
      if (event.key === '-') ajustarAcercamiento(5);
    }
    function actualizarOrientacionDispositivo(event) {
      if (!settings.current.sensor || event.alpha == null || event.beta == null || event.gamma == null) return;
      orientEuler.set(THREE.MathUtils.degToRad(event.beta), THREE.MathUtils.degToRad(event.alpha), -THREE.MathUtils.degToRad(event.gamma), 'YXZ');
      orientQ.setFromEuler(orientEuler).multiply(correctionQ);
      screenQ.setFromAxisAngle(worldZ, -THREE.MathUtils.degToRad(window.screen.orientation?.angle ?? window.orientation ?? 0)); orientQ.multiply(screenQ);
      if (sensorBaseline === null) {
        sensorBaseline = orientQ.clone();
        const heading = new THREE.Euler().setFromQuaternion(orientQ, 'YXZ').y;
        calibrationQ.setFromAxisAngle(yAxis, targetYaw - heading);
      }
      camera.quaternion.copy(calibrationQ).multiply(orientQ); sensorActive = true;
    }
    function ajustarTamanoEscena() {
      width = host.clientWidth; height = host.clientHeight;
      renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
    }
    const observer = new ResizeObserver(ajustarTamanoEscena); observer.observe(host); ajustarTamanoEscena();
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', iniciarInteraccionPuntero); canvas.addEventListener('pointermove', moverPuntero);
    canvas.addEventListener('pointerup', finalizarInteraccionPuntero); canvas.addEventListener('pointerleave', retirarPunteroEscena); canvas.addEventListener('pointercancel', cancelarInteraccionPuntero);
    canvas.addEventListener('wheel', ajustarAcercamientoConRueda, { passive: false }); canvas.addEventListener('keydown', gestionarTeclasEscena);
    window.addEventListener('deviceorientation', actualizarOrientacionDispositivo);
    const controllers = [renderer.xr.getController(0), renderer.xr.getController(1)];
    controllers.forEach(controller => {
      controller.addEventListener('select', seleccionarObjetivoCentral); scene.add(controller);
    });
    let xrCard = null;
    function mostrarFichaWebXR(id) {
      if (xrCard) { camera.remove(xrCard); xrCard.material.map.dispose(); xrCard.material.dispose(); }
      const body = [...celestialBodies, ...constellations].find(item => item.id === id);
      if (!body) return;
      const card = document.createElement('canvas'); card.width = 1024; card.height = 512;
      const ctx = card.getContext('2d');
      ctx.fillStyle = '#0c1525ee'; ctx.fillRect(0, 0, 1024, 512);
      ctx.strokeStyle = '#c7e999'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, 1020, 508);
      ctx.fillStyle = '#c7e999'; ctx.font = '24px sans-serif'; ctx.fillText(body.category.toUpperCase(), 45, 54);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 58px sans-serif'; ctx.fillText(body.name, 45, 131);
      ctx.fillStyle = '#bac6d7'; ctx.font = '28px sans-serif';
      let line = '', y = 198;
      for (const word of body.description.split(' ')) {
        if (ctx.measureText(line + word).width > 930) { ctx.fillText(line, 45, y); y += 41; line = ''; }
        line += word + ' ';
      }
      ctx.fillText(line, 45, y);
      ctx.fillStyle = '#c7e999'; ctx.font = '22px sans-serif'; ctx.fillText('Pulsa el gatillo de nuevo para cerrar', 45, 465);
      const texture = new THREE.CanvasTexture(card); texture.colorSpace = THREE.SRGBColorSpace;
      xrCard = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }));
      xrCard.scale.set(1.4, .7, 1); xrCard.position.set(0, -.12, -1.5); camera.add(xrCard);
    }
    // Native headsets render information in the scene because DOM overlays are not universal.
    controllers.forEach(controller => {
      controller.removeEventListener('select', seleccionarObjetivoCentral);
      controller.addEventListener('select', () => {
        if (xrCard) { camera.remove(xrCard); xrCard.material.map.dispose(); xrCard.material.dispose(); xrCard = null; return; }
        const id = obtenerObjetivoApuntado(true); if (id) { mostrarFichaWebXR(id); handlers.current.alSeleccionarCuerpoCeleste?.(id); }
      });
    });
    scene.add(camera);
    engine.current = { renderer, enfocarCuerpoCeleste, ajustarAcercamiento, restablecerVista, seleccionarObjetivoCentral };
    const centerReticle = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTexture, color: 0xd8efb3, depthTest: false, transparent: true, opacity: .7 }));
    centerReticle.position.set(0, 0, -1); centerReticle.scale.setScalar(.014); centerReticle.visible = false; camera.add(centerReticle);

    renderer.setAnimationLoop((time) => {
      const dt = Math.min((time - previousTime) / 1000 || .016, .05); previousTime = time;
      const s = settings.current;
      if (!s.sensor) { sensorActive = false; sensorBaseline = null; }
      if (!renderer.xr.isPresenting && !sensorActive) {
        yaw = THREE.MathUtils.damp(yaw, targetYaw, 9, dt); pitch = THREE.MathUtils.damp(pitch, targetPitch, 9, dt);
        camera.rotation.set(pitch, yaw, 0, 'YXZ');
      }
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 7, dt);
      camera.aspect = s.vr ? width / height / 2 : width / height; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
      for (const record of records) {
        const visible = esObjetoVisible(record.body, s.filter, s.showConstellations);
        record.group.visible = visible;
        if (record.sphere) record.sphere.rotation.y += dt * .012;
      }
      const id = labelHover || ((s.vr || renderer.xr.isPresenting) ? obtenerObjetivoApuntado(true) : pointerInside && !dragging ? obtenerObjetivoApuntado() : null);
      if (id !== hoverId) { hoverId = id; handlers.current.alCambiarObjetivoApuntado?.(id); canvas.style.cursor = id ? 'pointer' : 'grab'; }
      for (const record of records) {
        if (record.halo) record.halo.material.uniforms.strength.value = THREE.MathUtils.damp(record.halo.material.uniforms.strength.value, hoverId === record.body.id ? 1.7 : record.body.id === 'earth' ? .32 : .07, 8, dt);
        if (record.lines) record.lines.material.opacity = hoverId === record.body.id ? .85 : .28;
      }
      for (const { button, body } of labelsDOM) {
        if (!s.labels || s.vr || renderer.xr.isPresenting || !esObjetoVisible(body, s.filter, s.showConstellations)) { button.hidden = true; continue; }
        projected.fromArray(body.position);
        if (body.kind === 'constellation') projected.y -= body.radius + 1.4;
        else { projected.y -= body.radius + .8; projected.x += body.id === 'saturn' ? 5.7 : .4; }
        projected.project(camera);
        button.hidden = projected.z > 1 || projected.z < -1 || Math.abs(projected.x) > .96 || Math.abs(projected.y) > .9;
        if (!button.hidden) {
          const labelX = Math.min((projected.x * .5 + .5) * width, width - button.offsetWidth - 15);
          button.style.transform = `translate(${Math.max(15, labelX)}px,${(-projected.y * .5 + .5) * height}px)`;
        }
        button.classList.toggle('hovered', hoverId === body.id);
      }
      centerReticle.visible = renderer.xr.isPresenting;
      if (time - lastHeading > 150) { handlers.current.alCambiarRumbo?.(((THREE.MathUtils.radToDeg(-camera.rotation.y) % 360) + 360) % 360); lastHeading = time; }
      if (s.vr && !renderer.xr.isPresenting) {
        stereo.update(camera); renderer.setScissorTest(true);
        renderer.setViewport(0, 0, width / 2, height); renderer.setScissor(0, 0, width / 2, height); renderer.render(scene, stereo.cameraL);
        renderer.setViewport(width / 2, 0, width / 2, height); renderer.setScissor(width / 2, 0, width / 2, height); renderer.render(scene, stereo.cameraR);
        renderer.setScissorTest(false);
      } else { renderer.setViewport(0, 0, width, height); renderer.render(scene, camera); }
    });
    handlers.current.alPrepararEscena?.();

    return () => {
      renderer.setAnimationLoop(null); observer.disconnect(); window.removeEventListener('deviceorientation', actualizarOrientacionDispositivo);
      canvas.removeEventListener('pointerdown', iniciarInteraccionPuntero); canvas.removeEventListener('pointermove', moverPuntero); canvas.removeEventListener('pointerup', finalizarInteraccionPuntero);
      canvas.removeEventListener('pointerleave', retirarPunteroEscena); canvas.removeEventListener('pointercancel', cancelarInteraccionPuntero); canvas.removeEventListener('wheel', ajustarAcercamientoConRueda); canvas.removeEventListener('keydown', gestionarTeclasEscena);
      const geometries = new Set(), materials = new Set(), textures = new Set([starTexture]);
      scene.traverse(obj => { if (obj.geometry) geometries.add(obj.geometry); if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => { materials.add(m); if (m.map) textures.add(m.map); }); });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); scene.background?.dispose?.(); renderer.dispose();
      host.replaceChildren(); engine.current = null;
    };
  }, []);

  return <div className="space-scene" ref={mount} />;
});

function agregarCampoEstelar(scene, texture) {
  let seed = 1987;
  const generarNumeroAleatorio = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const positions = [], colors = [];
  for (let i = 0; i < 6100; i++) {
    const theta = generarNumeroAleatorio() * Math.PI * 2, z = generarNumeroAleatorio() * 2 - 1, radius = 260 + generarNumeroAleatorio() * 180, r = Math.sqrt(1 - z * z);
    positions.push(radius * r * Math.cos(theta), radius * z, radius * r * Math.sin(theta));
    const b = .26 + generarNumeroAleatorio() * .67;
    colors.push(b * (.87 + generarNumeroAleatorio() * .13), b * (.91 + generarNumeroAleatorio() * .09), b);
  }
  // A denser, tilted star belt makes the panoramic sky feel deep and continuous.
  for (let i = 0; i < 3000; i++) {
    const a = generarNumeroAleatorio() * Math.PI * 2, offset = (generarNumeroAleatorio() + generarNumeroAleatorio() + generarNumeroAleatorio() - 1.5) * 48;
    positions.push(Math.cos(a) * 340, Math.sin(a) * 112 + offset, Math.sin(a) * 325);
    const b = .08 + generarNumeroAleatorio() * .24; colors.push(b * .7, b * .8, b);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 1.1, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(stars);
  for (let i = 0; i < 26; i++) {
    const a = generarNumeroAleatorio() * Math.PI * 2, y = (generarNumeroAleatorio() - .5) * 240;
    const star = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, color: i % 4 === 0 ? 0xf6dab5 : 0xc1d6e8, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .85 }));
    star.position.set(Math.cos(a) * 230, y, Math.sin(a) * 230); star.scale.setScalar(2.5 + generarNumeroAleatorio() * 3); scene.add(star);
  }
}

function agregarNebulosa(scene) {
  scene.background = new THREE.Color('#070b12');
  const nebula = new THREE.Mesh(new THREE.SphereGeometry(490, 48, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 direction; void main(){ direction=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `
      varying vec3 direction;
      float calcularPseudoaleatorio(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float calcularRuido(vec3 p){vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(mix(calcularPseudoaleatorio(i),calcularPseudoaleatorio(i+vec3(1,0,0)),f.x),mix(calcularPseudoaleatorio(i+vec3(0,1,0)),calcularPseudoaleatorio(i+vec3(1,1,0)),f.x),f.y),mix(mix(calcularPseudoaleatorio(i+vec3(0,0,1)),calcularPseudoaleatorio(i+vec3(1,0,1)),f.x),mix(calcularPseudoaleatorio(i+vec3(0,1,1)),calcularPseudoaleatorio(i+vec3(1,1,1)),f.x),f.y),f.z);}
      void main(){
        vec3 d=normalize(direction);
        float clouds=calcularRuido(d*5.0)*0.5+calcularRuido(d*11.0)*0.25+calcularRuido(d*23.0)*0.125;
        float belt=exp(-pow((d.y-d.x*0.2-d.z*0.3)*3.2,2.0));
        vec3 base=vec3(0.0021,0.0033,0.0058);
        gl_FragColor=vec4(base+vec3(0.0045,0.005,0.008)*clouds*belt,1.0);
        #include <colorspace_fragment>
      }
    `
  }));
  scene.add(nebula);
}

function agregarAnillosPlanetarios(group, body, targets) {
  const inner = body.radius * 1.27, outer = body.radius * (body.id === 'saturn' ? 2.35 : 1.55);
  const geometry = new THREE.RingGeometry(inner, outer, 160, 12);
  const uv = geometry.attributes.uv, pos = geometry.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (Math.hypot(pos.getX(i), pos.getY(i)) - inner) / (outer - inner), 0);
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 8; const ctx = canvas.getContext('2d');
  for (let x = 0; x < 1024; x++) {
    const t = x / 1024;
    const gap = t > .62 && t < .665;
    const b = 147 + Math.sin(x * .15) * 18 + Math.sin(x * 1.3) * 9 + Math.sin(x * .034) * 16;
    ctx.fillStyle = `rgba(${b + 23},${b + 10},${b - 12},${gap ? .035 : t < .12 ? .25 : t > .96 ? .25 : .83})`; ctx.fillRect(x, 0, 1, 8);
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const rings = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide, transparent: true, roughness: 1, metalness: 0, depthWrite: false }));
  rings.rotation.x = -Math.PI * .36; rings.rotation.y = -.26; rings.rotation.z = -.24;
  rings.userData.id = body.id; group.add(rings); targets.push(rings);
}

export default EscenaEspacial;
