// El presupuesto acota el coste en pantallas densas y monitores grandes.
// La interfaz HTML conserva siempre la resolución nativa del dispositivo.
export function calcularDensidadRenderizado({ ancho, alto, densidad = 1, modo = 'normal', tactil = false }) {
  const limite = tactil || modo === 'vr' ? 1.25 : 1.5
  const presupuesto = modo === 'vr' ? 1_500_000 : 2_073_600
  return Math.min(densidad || 1, limite, Math.sqrt(presupuesto / (Math.max(1, ancho) * Math.max(1, alto))))
}
