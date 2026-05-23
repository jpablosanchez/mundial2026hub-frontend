import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Inicio from './pages/Inicio';
import VerificarCorreo from './pages/VerificarCorreo';
import Calendario from './pages/Calendario';
import Selecciones from './pages/Selecciones';
import MiCuenta from './pages/MiCuenta';
import Posiciones from './pages/Posiciones';
import Sedes from './pages/Sedes';
import Pollas from './pages/Pollas';
import Album from './pages/Album';
import Entradas from './pages/Entradas';
import AdminPanel from './pages/AdminPanel';
import AdminRoute from './components/auth/AdminRoute';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <Router>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/verificar" element={<VerificarCorreo />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/selecciones" element={<Selecciones />} />
          <Route path="/mi-cuenta" element={<MiCuenta />} />
          <Route path="/posiciones" element={<Posiciones />} />
          <Route path="/sedes" element={<Sedes />} />
          <Route path="/pollas" element={<Pollas />} />
          <Route path="/album" element={<Album />} />
          <Route path="/entradas" element={<Entradas />} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </Router>
  );
}

export default App;
