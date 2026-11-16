export function obtenerConfiguracionPrivada(entorno) {
  try {
    const url = new URL(entorno.SUPABASE_URL)
    const clave = entorno.SUPABASE_SECRET_KEY
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash
      || url.pathname !== '/' || !/^sb_secret_[A-Za-z0-9_-]+$/.test(clave ?? '')) return null
    return { url, clave }
  } catch {
    return null
  }
}

export function solicitarRpcPrivada({ url, clave }, funcion, parametros, solicitar) {
  return solicitar(new URL(`/rest/v1/rpc/${funcion}`, url), {
    method: 'POST', headers: { apikey: clave, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(parametros), signal: AbortSignal.timeout(5000), redirect: 'error',
  })
}
