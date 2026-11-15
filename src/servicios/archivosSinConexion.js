let registroEnCurso

export function admiteDescargaSinConexion() {
  return Boolean(import.meta.env.PROD && navigator.serviceWorker && globalThis.indexedDB)
}

export function registrarArchivosSinConexion() {
  if (!registroEnCurso) {
    registroEnCurso = navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      registroEnCurso = undefined
      throw error
    })
  }
  return registroEnCurso
}

export async function esperarArchivosSinConexion() {
  const registro = await registrarArchivosSinConexion().catch(() => {
    throw new Error('No se pudieron preparar los archivos de Metseri.')
  })
  if (registro.active) return

  let temporizador
  const plazo = new Promise((_, rechazar) => {
    temporizador = setTimeout(() => rechazar(new Error('El navegador aún no preparó los archivos de Metseri.')), 15000)
  })
  try {
    await Promise.race([navigator.serviceWorker.ready, plazo])
  } finally {
    clearTimeout(temporizador)
  }
}
