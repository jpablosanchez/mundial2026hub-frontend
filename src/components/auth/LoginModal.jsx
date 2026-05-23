import React, { useState } from 'react';
import Icon from '../ui/Icon';
import { loginUsuario } from '../../services/authService';

const LoginModal = ({ onClose, onLoginSuccess, onSwitchToRegister }) => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo.trim() || !contrasena) { setError('Por favor ingresa tu correo y contraseña.'); return; }
    setLoading(true); setError('');
    try {
      const data = await loginUsuario({ correo: correo.trim(), contrasena });
      onLoginSuccess(data);
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message || err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Correo o contraseña incorrectos.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><Icon name="close" size={16} /></button>
        <h2>Bienvenido de vuelta</h2>
        <p className="modal-desc">Sigue tus partidos, colecciona cromos y compite en pollas.</p>
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Correo electrónico</label>
            <input className="input" type="email" placeholder="correo@ejemplo.com" value={correo}
              onChange={(e) => setCorreo(e.target.value)} autoFocus required />
          </div>
          <div className="input-group" style={{ position: 'relative' }}>
            <label className="input-label">Contraseña</label>
            <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••"
              value={contrasena} onChange={(e) => setContrasena(e.target.value)} required
              style={{ paddingRight: 48 }} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 14, bottom: 14, color: 'var(--ink-3)' }}>
              <Icon name={showPass ? 'eye-off' : 'eye'} size={16} />
            </button>
          </div>
          <button className="modal-btn" type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
        <div className="modal-foot">
          ¿Primera vez? <button type="button" onClick={onSwitchToRegister}>Crea una cuenta</button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
