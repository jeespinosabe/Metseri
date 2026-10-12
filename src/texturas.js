import * as THREE from 'three';

const cache = new Map();
const limitarCanalColor = (v) => Math.max(0, Math.min(255, v));
const mezclarColores = (a, b, t) => a.map((v, i) => v * (1 - t) + b[i] * t);
function calcularRuidoProcedural(x, y, seed = 0) {
  return (Math.sin(x * .017 + Math.sin(y * .031 + seed) * 2) + Math.sin(y * .047 + Math.cos(x * .023) * 3) + Math.sin(x * .079 + y * .067 + seed)) / 3;
}

export function obtenerImagenPlaneta(id) {
  if (cache.has(id)) return cache.get(id);
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(1024, 512);
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const n = calcularRuidoProcedural(x, y, 2);
      const fine = Math.sin(x * 3.1 + y * 4.7) * 2;
      let c;
      if (id === 'saturn') {
        const band = Math.sin(y * .12 + n * .7) * .17 + Math.sin(y * .42) * .06 + n * .05;
        c = mezclarColores([155, 129, 94], [230, 211, 169], Math.max(0, Math.min(1, .63 + band)));
      } else if (id === 'jupiter') {
        const turbulence = Math.sin(x * .027 + y * .025) * 3 + n * 6;
        const band = Math.sin((y + turbulence) * .079) * .4 + Math.sin(y * .24) * .09;
        c = mezclarColores([151, 104, 77], [227, 212, 187], .53 + band);
        const spot = ((x - 710) / 70) ** 2 + ((y - 322) / 25) ** 2;
        if (spot < 1) c = mezclarColores(c, [157, 85, 59], (1 - spot) * .7);
      } else if (id === 'earth') {
        c = mezclarColores([12, 38, 69], [25, 83, 117], .5 + n * .35);
      } else if (id === 'neptune' || id === 'uranus') {
        c = mezclarColores(id === 'neptune' ? [46, 83, 143] : [96, 160, 167], id === 'neptune' ? [112, 159, 205] : [174, 212, 208], .5 + Math.sin(y * .06 + n) * .12 + n * .12);
      } else if (id === 'venus') {
        c = mezclarColores([151, 110, 61], [234, 206, 149], .5 + n * .3);
      } else if (id === 'sun') {
        c = mezclarColores([215, 83, 20], [255, 221, 115], .6 + n * .35);
      } else {
        c = mezclarColores(id === 'mars' ? [117, 57, 38] : [91, 88, 84], id === 'mars' ? [210, 141, 95] : [193, 190, 181], .5 + n * .3);
      }
      const i = (y * 1024 + x) * 4;
      img.data[i] = limitarCanalColor(c[0] + fine); img.data[i + 1] = limitarCanalColor(c[1] + fine); img.data[i + 2] = limitarCanalColor(c[2] + fine); img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  if (id === 'earth') dibujarSuperficieTerrestre(ctx);
  if (['moon', 'mercury', 'mars'].includes(id)) dibujarCrateres(ctx, id);
  const url = canvas.toDataURL('image/jpeg', .9);
  cache.set(id, url);
  return url;
}

function dibujarSuperficieTerrestre(ctx) {
  const continents = [
    [[52, 86], [94, 61], [142, 65], [164, 86], [211, 91], [230, 118], [209, 141], [178, 152], [174, 175], [147, 194], [137, 216], [112, 197], [112, 160], [89, 149], [72, 119]],
    [[175, 223], [203, 210], [239, 231], [268, 249], [269, 280], [251, 312], [237, 337], [220, 373], [207, 391], [198, 350], [190, 318], [182, 292], [166, 263]],
    [[278, 49], [318, 40], [336, 65], [319, 98], [295, 116], [281, 87]],
    [[462, 179], [484, 159], [510, 159], [540, 174], [560, 201], [551, 233], [566, 252], [546, 286], [520, 323], [504, 313], [495, 280], [474, 260], [469, 232], [451, 210]],
    [[461, 144], [474, 117], [494, 112], [493, 88], [516, 76], [540, 90], [562, 71], [604, 78], [643, 60], [694, 69], [719, 57], [768, 76], [813, 94], [847, 106], [868, 132], [841, 151], [806, 154], [794, 177], [765, 180], [745, 214], [717, 231], [703, 257], [682, 235], [670, 204], [646, 193], [623, 210], [608, 192], [574, 173], [549, 147], [526, 153], [510, 136], [487, 149]],
    [[758, 322], [792, 304], [830, 311], [855, 340], [844, 365], [803, 369], [777, 359], [756, 340]],
    [[0, 469], [98, 454], [234, 473], [375, 455], [519, 469], [684, 449], [831, 462], [1024, 458], [1024, 512], [0, 512]]
  ];
  for (const polygon of continents) {
    ctx.beginPath(); polygon.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    ctx.fillStyle = '#607452'; ctx.fill();
    ctx.save(); ctx.clip();
    const desert = ctx.createLinearGradient(0, 160, 0, 330); desert.addColorStop(0, '#9a8e62'); desert.addColorStop(.4, '#899064'); desert.addColorStop(1, '#49694e');
    ctx.fillStyle = desert; ctx.fillRect(0, 130, 1024, 270); ctx.restore();
  }
  // Thin, swirling cloud systems, including a bright polar ice cap.
  for (let i = 0; i < 75; i++) {
    const x = (i * 137.51) % 1024, y = (i * 73.23) % 470;
    ctx.beginPath(); ctx.ellipse(x, y, 14 + i % 51, 3 + i % 9, Math.sin(i) * .7, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(231,242,243,${.12 + (i % 4) * .07})`; ctx.fill();
  }
  const pole = ctx.createLinearGradient(0, 0, 0, 54); pole.addColorStop(0, '#e7edf0'); pole.addColorStop(1, '#e7edf000'); ctx.fillStyle = pole; ctx.fillRect(0, 0, 1024, 54);
}

function dibujarCrateres(ctx, id) {
  for (let i = 0; i < 170; i++) {
    const x = (Math.sin(i * 83.17) * .5 + .5) * 1024;
    const y = (Math.cos(i * 32.43) * .5 + .5) * 512;
    const r = 2 + (i % 14);
    const grad = ctx.createRadialGradient(x - r * .3, y - r * .25, 0, x, y, r);
    grad.addColorStop(0, id === 'mars' ? '#401b1529' : '#19191b55'); grad.addColorStop(.75, '#12121425'); grad.addColorStop(.9, '#eeeecc19'); grad.addColorStop(1, '#ffffff00');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

export function crearTexturaPlaneta(id) {
  const texture = new THREE.TextureLoader().load(obtenerImagenPlaneta(id));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function crearTexturaResplandor() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, '#ffffff'); grad.addColorStop(.08, '#ffffffdd'); grad.addColorStop(.2, '#ffffff55'); grad.addColorStop(.5, '#ffffff11'); grad.addColorStop(1, '#ffffff00');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}
