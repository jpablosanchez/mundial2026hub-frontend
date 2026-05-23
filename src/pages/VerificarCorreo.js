import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verificarCorreo } from '../services/authService';
import '../App.css';

const VerificarCorreo = () => {
  const [searchParams] = useSearchParams();
  const [estado, setEstado] = useState('cargando');
  const [mensaje, setMensaje] = useState('');
  const yaVerificado = useRef(false);

  useEffect(() => {
    if (yaVerificado.current) return;
    yaVerificado.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setEstado('error');
      setMensaje('El enlace de verificación no es válido o está incompleto.');
      return;
    }

    verificarCorreo(token)
      .then((data) => {
        setEstado('exito');
        setMensaje(data.mensaje || '¡Tu correo ha sido verificado correctamente!');
      })
      .catch((err) => {
        setEstado('error');
        setMensaje(err.response?.data?.mensaje || 'Error al verificar el correo. El enlace puede haber expirado.');
      });
  }, [searchParams]);

  return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="verify-logo">
          <div style={{ width: 28, height: 28, borderRadius: 4, background: 'var(--accent)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 900, fontSize: 11, fontFamily: 'monospace' }}>
            26
          </div>
          Mundial 2026 Hub
        </div>

        {estado === 'cargando' && (
          <>
            <div className="verify-icon-circle loading">
              <div className="spinner"></div>
            </div>
            <div className="verify-title">Verificando</div>
            <p className="verify-msg">Verificando tu correo electrónico…</p>
          </>
        )}

        {estado === 'exito' && (
          <>
            <div className="verify-icon-circle success">🎉</div>
            <div className="verify-title" style={{ color: 'var(--accent-ink)' }}>¡Correo Verificado!</div>
            <p className="verify-msg">{mensaje}</p>
            <a href="/" className="verify-btn">Ir al inicio</a>
          </>
        )}

        {estado === 'error' && (
          <>
            <div className="verify-icon-circle error">😞</div>
            <div className="verify-title" style={{ color: 'var(--live)' }}>Error de Verificación</div>
            <p className="verify-msg">{mensaje}</p>
            <a href="/" className="verify-btn outline">Volver al inicio</a>
          </>
        )}

        <div style={{ marginTop: '2rem', color: 'var(--ink-4)', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          FIFA World Cup 2026™ — USA · México · Canadá
        </div>
      </div>
    </div>
  );
};

export default VerificarCorreo;
