import { useId } from 'react'
import { CUERPOS_CELESTES } from '../datos/cuerposCelestes.js'
import { obtenerCuerposRelacionados } from '../administracion/registrosBibliograficos.js'

const GRUPOS_CUERPOS = [
  { tipo: 'planeta', titulo: 'Planetas' },
  { tipo: 'satelite', titulo: 'Satélites' },
]

export function SelectorCuerposCelestes({ seleccionados, alAlternar }) {
  const id = useId()
  const nombres = obtenerCuerposRelacionados(seleccionados).map((cuerpo) => cuerpo.nombre)
  return (
    <fieldset className="panel-admin__selector" aria-describedby={`${id}-ayuda ${id}-resumen`}>
      <legend>Cuerpos celestes relacionados <span className="panel-admin__marca-campo">Opcional</span></legend>
      <p id={`${id}-ayuda`} className="panel-admin__ayuda">Marca cero, uno o varios cuerpos. Cada cuerpo se puede relacionar una sola vez.</p>
      <div className="panel-admin__grupos-cuerpos">
        {GRUPOS_CUERPOS.map(({ tipo, titulo }) => (
          <fieldset key={tipo} className="panel-admin__grupo-cuerpos">
            <legend>{titulo}</legend>
            <ul>
              {CUERPOS_CELESTES.filter((cuerpo) => cuerpo.tipo === tipo).map((cuerpo) => (
                <li key={cuerpo.id}>
                  <label className="panel-admin__opcion-cuerpo">
                    <input type="checkbox" name="cuerposIds" value={cuerpo.id} checked={seleccionados.includes(cuerpo.id)} onChange={() => alAlternar(cuerpo.id)} />
                    <span>
                      <span className="panel-admin__nombre-cuerpo">{cuerpo.nombre}</span>
                      {tipo === 'satelite' && <span className="panel-admin__detalle-cuerpo">{cuerpo.clasificacion}</span>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
      </div>
      <p id={`${id}-resumen`} className="panel-admin__resumen-seleccion" aria-live="polite">
        {nombres.length > 0 ? `Seleccionados: ${nombres.join(', ')}` : 'Sin asociar'}
      </p>
    </fieldset>
  )
}
