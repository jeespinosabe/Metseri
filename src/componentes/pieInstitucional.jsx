import logoBiblioteca from '../assets/instituciones/logoBiblioteca.png'
import logoCecan from '../assets/instituciones/logoCecan.png'

export function PieInstitucional() {
  return (
    <footer className="pie-institucional" aria-label="Información institucional">
      <div className="pie-institucional__logos" role="group" aria-label="Instituciones">
        <img className="pie-institucional__biblioteca" src={logoBiblioteca} alt="Biblioteca Pública Central Estatal Solón Argüello" />
        <div className="pie-institucional__cecan">
          <img src={logoCecan} alt="Nayarit y Consejo Estatal para la Cultura y las Artes de Nayarit" />
        </div>
      </div>
      <address className="pie-institucional__contacto">
        <span>Av. Allende y Oaxaca, Parque Alameda</span>
        <span>C.P. 63000, Tepic, Nayarit</span>
        <a href="tel:+523112128989">Tel. (311) 212 8989</a>
      </address>
    </footer>
  )
}
