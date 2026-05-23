import React, { useState } from 'react';
import Icon from '../ui/Icon';
import { registrarUsuario } from '../../services/authService';

const RegisterModal = ({ onClose, onRegisterSuccess, onSwitchToLogin }) => {
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', contrasena: '', confirmar: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const soloLetras = (v) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(v.trim());

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const { nombre, apellido, correo, contrasena, confirmar } = form;
    if (!soloLetras(nombre)) { setError('El nombre solo puede contener letras.'); return; }
    if (!soloLetras(apellido)) { setError('El apellido solo puede contener letras.'); return; }
    if (contrasena.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (contrasena !== confirmar) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      await registrarUsuario({
        nombre: nombre.trim().toLowerCase(),
        apellido: apellido.trim().toLowerCase(),
        correo: correo.trim(),
        contrasena,
      });
      onRegisterSuccess();
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message || err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Error al registrarse. Intenta de nuevo.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><Icon name="close" size={16} /></button>
        <h2>Crear cuenta</h2>
        <p className="modal-desc">Únete al hub de aficionados del Mundial 2026.</p>
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <div className="input-group">
              <label className="input-label">Nombre</label>
              <input className="input" type="text" placeholder="Juan" value={form.nombre}
                onChange={set('nombre')} required autoFocus />
            </div>
            <div className="input-group">
              <label className="input-label">Apellido</label>
              <input className="input" type="text" placeholder="García" value={form.apellido}
                onChange={set('apellido')} required />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Correo electrónico</label>
            <input className="input" type="email" placeholder="correo@ejemplo.com" value={form.correo}
              onChange={set('correo')} required />
          </div>
          <div className="input-group" style={{ position: 'relative' }}>
            <label className="input-label">Contraseña</label>
            <input className="input" type={showPass ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
              value={form.contrasena} onChange={set('contrasena')} required
              style={{ paddingRight: 48 }} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 14, bottom: 14, color: 'var(--ink-3)' }}>
              <Icon name={showPass ? 'eye-off' : 'eye'} size={16} />
            </button>
          </div>
          <div className="input-group">
            <label className="input-label">Confirmar contraseña</label>
            <input type="password" placeholder="Repite tu contraseña"
              value={form.confirmar} onChange={set('confirmar')} required
              className={'input' + (form.confirmar && form.confirmar !== form.contrasena ? ' error' : '')} />
          </div>
          <button className="modal-btn" type="submit" disabled={loading}>
            {loading ? 'Registrando…' : 'Crear cuenta'}
          </button>
        </form>
        <div className="modal-foot">
          ¿Ya tienes cuenta? <button type="button" onClick={onSwitchToLogin}>Inicia sesión</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
