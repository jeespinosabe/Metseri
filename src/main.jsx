import React from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './estilos.css';

registerSW({
  onOfflineReady() { window.dispatchEvent(new Event('orbita-offline-ready')); }
});

createRoot(document.getElementById('root')).render(<App />);
