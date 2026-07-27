import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AdminRoutes from './AdminRoutes.jsx';
import './styles/tailwind.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/admin">
      <AdminRoutes />
    </BrowserRouter>
  </StrictMode>,
);
