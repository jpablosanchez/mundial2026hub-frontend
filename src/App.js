import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Preferencias from './pages/Preferencias';
import Dashboard from './pages/Dashboard';
import VerificarCorreo from './pages/VerificarCorreo';
import Calendario from './pages/Calendario';
import Resultados from './pages/Resultados';
import AgendaCiudad from './pages/AgendaCiudad';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/verificar" element={<VerificarCorreo />} />
        <Route path="/preferencias" element={<Preferencias />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Sprint 2 */}
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/resultados" element={<Resultados />} />
        <Route path="/agenda-ciudad" element={<AgendaCiudad />} />
      </Routes>
    </Router>
  );
}

export default App;