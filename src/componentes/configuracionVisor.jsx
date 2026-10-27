import { useEffect, useRef, useState } from 'react'
import { esDiagonalValida } from '../escena/perfilVisor.js'

export function ConfiguracionVisor({ diagonal, alGuardar, alCerrar }) {
  const dialogoRef = useRef(null)
  const [valor, setValor] = useState(String(diagonal))
  const numero = Number(valor.replace(',', '.'))
  const valido = esDiagonalValida(numero)

  useEffect(() => {
    const dialogo = dialogoRef.current
    dialogo.showModal()
    return () => dialogo.close()
  }, [])

  function guardar(evento) {
    evento.preventDefault()
    if (valido) alGuardar(numero)
  }

  return (
    <dialog ref={dialogoRef} className="configuracion-visor" aria-labelledby="titulo-visor" onCancel={alCerrar}>
      <form onSubmit={guardar}>
        <h2 id="titulo-visor">HOMIDO GRAB</h2>
        <p>La vista está ajustada a las lentes de tu visor. Indica el tamaño de la pantalla de tu celular para alinear las dos imágenes.</p>
        <label htmlFor="diagonal-pantalla">Diagonal de la pantalla (pulgadas)</label>
        <input id="diagonal-pantalla" type="text" inputMode="decimal" value={valor} onChange={(evento) => setValor(evento.target.value)} aria-describedby="ayuda-diagonal" aria-invalid={!valido} required />
        <p id="ayuda-diagonal">Usa el tamaño de pantalla que indica el fabricante de tu celular, entre 4 y 8 pulgadas. El valor inicial de 6 pulgadas es una estimación; este ajuste se guarda en este navegador.</p>
        <p>Coloca el teléfono centrado y en horizontal dentro del visor. Usa pantalla completa cuando tu navegador lo permita.</p>
        <div className="configuracion-visor__acciones">
          <button type="button" onClick={alCerrar}>Cancelar</button>
          <button type="submit" disabled={!valido}>Guardar</button>
        </div>
      </form>
    </dialog>
  )
}
