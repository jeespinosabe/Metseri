const BOTON_X = 278
const BOTON_Y = 139
const DURACION_CICLO = 4000
const INTERVALO_FOTOGRAMA = 1000 / 30

export function calcularDemostracionTapVr(tiempo) {
  const fase = Math.floor((tiempo % DURACION_CICLO) / INTERVALO_FOTOGRAMA) * INTERVALO_FOTOGRAMA
  const dobleTap = fase >= 1700
  const contacto = dobleTap ? 2100 : 500
  const segundoContacto = contacto + 260
  const desdeContacto = fase - (dobleTap && fase >= segundoContacto - 125 ? segundoContacto : contacto)
  const presion = Math.max(0, Math.min(1, (desdeContacto + 125) / 125, (135 - desdeContacto) / 80))
  const onda = desdeContacto >= 0 && desdeContacto < 135 ? desdeContacto / 135 : null
  return { dobleTap, presion, onda }
}

export function dibujarDemostracionTapVr(contexto, imagen, { presion, onda }) {
  contexto.save()
  contexto.beginPath()
  contexto.roundRect(20, 20, 400, 300, 24)
  contexto.clip()
  // El recorte conserva el botón plateado bajo el punto de contacto del dedo.
  contexto.drawImage(imagen, 67, 21, 296, 222, 20, 20, 400, 300)

  if (onda !== null) {
    contexto.beginPath()
    contexto.ellipse(BOTON_X, BOTON_Y, 25 + 18 * onda, 18 + 18 * onda, -.47, 0, Math.PI * 2)
    contexto.strokeStyle = `rgba(228, 255, 184, ${1 - onda})`
    contexto.lineWidth = 6
    contexto.stroke()
  }
  contexto.beginPath()
  contexto.ellipse(BOTON_X, BOTON_Y, 24, 17, -.47, 0, Math.PI * 2)
  contexto.strokeStyle = '#14212f'
  contexto.lineWidth = 6
  contexto.stroke()
  contexto.strokeStyle = '#d7f6a9'
  contexto.lineWidth = 3
  contexto.stroke()

  const altura = 1 - presion
  contexto.translate(BOTON_X + 20 * altura, BOTON_Y - 24 * altura)
  contexto.beginPath()
  contexto.moveTo(4, -1)
  contexto.bezierCurveTo(-5, 2, -9, -8, -2, -15)
  contexto.lineTo(37, -55)
  contexto.bezierCurveTo(31, -54, 24, -52, 19, -57)
  contexto.bezierCurveTo(15, -62, 19, -68, 25, -71)
  contexto.lineTo(47, -81)
  contexto.bezierCurveTo(56, -85, 65, -84, 74, -88)
  contexto.lineTo(103, -112)
  contexto.lineTo(130, -80)
  contexto.lineTo(105, -57)
  contexto.bezierCurveTo(97, -46, 93, -36, 82, -29)
  contexto.bezierCurveTo(74, -24, 68, -26, 64, -30)
  contexto.bezierCurveTo(59, -25, 50, -26, 47, -32)
  contexto.lineTo(15, -7)
  contexto.bezierCurveTo(10, -3, 8, -2, 4, -1)
  contexto.closePath()
  contexto.fillStyle = '#ffd9b5'
  contexto.fill()
  contexto.lineJoin = 'round'
  contexto.strokeStyle = '#21202a'
  contexto.lineWidth = 4
  contexto.stroke()

  contexto.beginPath()
  contexto.moveTo(47, -32)
  contexto.lineTo(61, -44)
  contexto.moveTo(64, -30)
  contexto.lineTo(74, -39)
  contexto.strokeStyle = '#b46e57'
  contexto.lineWidth = 3
  contexto.stroke()
  contexto.restore()
}
