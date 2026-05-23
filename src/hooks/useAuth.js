import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const useAuth = () => {
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });
  const [modal, setModal] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const openLogin = () => setModal('login');
  const openRegister = () => setModal('register');
  const closeModal = () => setModal(null);

  const handleLoginSuccess = (data) => {
    const nombres = data.usuario?.nombres || data.nombre || '';
    const apellidos = data.usuario?.apellidos || data.apellido || '';
    const initials = ((nombres[0] || '') + (apellidos[0] || '')).toUpperCase() || '?';
    const userData = { ...data, initials };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setLoggedIn(true);
    setModal(null);
    if (data.usuario?.rol === 'ADMIN') {
      navigate('/admin');
    } else {
      showToast(`¡Bienvenido, ${nombres}!`);
    }
  };

  const handleRegisterSuccess = () => {
    setModal(null);
    showToast('¡Registro exitoso! Revisa tu correo para verificar tu cuenta.');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setLoggedIn(false);
    showToast('Sesión cerrada');
  };

  return {
    loggedIn, user, modal,
    // Legacy compatibility: toast is now global; these aliases keep existing
    // page code working without rendering duplicate <Toast> components.
    toast: null,
    setToast: showToast,
    showToast,
    openLogin, openRegister, closeModal,
    handleLoginSuccess, handleRegisterSuccess, handleLogout,
  };
};

export default useAuth;
