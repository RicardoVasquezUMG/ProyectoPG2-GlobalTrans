import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Estilos de PrimeReact
import 'primereact/resources/themes/lara-dark-blue/theme.css'; // Tema base
import 'primereact/resources/primereact.min.css';             // Componentes base
import 'primeicons/primeicons.css';                           // Iconos
import 'primeflex/primeflex.css';                             // Utility classes

// Estilos globales de la aplicación
import './assets/styles/global.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
