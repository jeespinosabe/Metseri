import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

function calcularCrc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  return (crc ^ 0xffffffff) >>> 0;
}
function crearBloquePng(type, content) {
  const name = Buffer.from(type); const length = Buffer.alloc(4); length.writeUInt32BE(content.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(calcularCrc32(Buffer.concat([name, content])));
  return Buffer.concat([length, name, content, crc]);
}
for (const size of [192, 512]) {
  const pixels = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = (x / size - .5) * 512, py = (y / size - .5) * 512;
      const rx = px * .883 - py * .469, ry = px * .469 + py * .883;
      const circle = px * px + py * py < 86 * 86;
      const ellipse = Math.sqrt(rx * rx / (168 * 168) + ry * ry / (56 * 56));
      const ring = ellipse > .91 && ellipse < 1.06;
      const star = (px - 117) ** 2 + (py + 130) ** 2 < 100;
      const lime = circle || ring || star;
      const at = y * (size * 4 + 1) + 1 + x * 4;
      pixels[at] = lime ? 208 : 8; pixels[at + 1] = lime ? 237 : 12; pixels[at + 2] = lime ? 170 : 18; pixels[at + 3] = 255;
    }
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 6;
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), crearBloquePng('IHDR', header), crearBloquePng('IDAT', deflateSync(pixels)), crearBloquePng('IEND', Buffer.alloc(0))]);
  writeFileSync(new URL(`../public/icono-${size}.png`, import.meta.url), png);
}
console.log('Iconos PWA de 192 y 512 px generados.');
