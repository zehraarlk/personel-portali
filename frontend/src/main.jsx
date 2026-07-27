import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import AuthBootstrap from './auth/AuthBootstrap.jsx';
import './styles/global.css';
import './styles/tailwind.css';
/* media.css Tailwind'den sonra: img height:auto ezilsin */
import './styles/media.css';
import './styles/youtube-thumb.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthBootstrap>
        <App />
      </AuthBootstrap>
    </BrowserRouter>
  </StrictMode>,
);
