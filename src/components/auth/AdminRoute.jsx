import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  let user = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch {}

  if (!user || user.usuario?.rol !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AdminRoute;
