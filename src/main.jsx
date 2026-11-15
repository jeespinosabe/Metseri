import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { admiteDescargaSinConexion, registrarArchivosSinConexion } from './servicios/archivosSinConexion.js'

if (admiteDescargaSinConexion()) {
  void registrarArchivosSinConexion().catch(() => {})
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
