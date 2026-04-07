import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
            setMensaje('El enlace de verificación no es válido.');
            return;
        }

        verificarCorreo(token)
            .then((data) => {
                setEstado('exito');
                setMensaje(data.mensaje);
            })
            .catch((err) => {
                setEstado('error');
                setMensaje(err.response?.data?.mensaje || 'Error al verificar el correo.');
            });
    }, [searchParams]);

    return (
        <>
            <div className="mundial-bg"></div>
            <div className="mundial-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
                <div className="verify-card animate-in">
                    <div className="auth-logo" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <span className="auth-logo-icon">⚽</span>
                        <span className="auth-logo-text">Mundial 2026 Hub</span>
                    </div>

                    {estado === 'cargando' && (
                        <>
                            <div className="spinner-green"></div>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                                Verificando tu correo electrónico...
                            </p>
                        </>
                    )}

                    {estado === 'exito' && (
                        <div className="animate-in">
                            <span className="verify-icon">🎉</span>
                            <div className="verify-title" style={{ color: 'var(--success)' }}>
                                ¡Correo Verificado!
                            </div>
                            <p className="verify-msg">{mensaje}</p>
                            <Link to="/login" className="btn-primary-glow" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                                Iniciar Sesión
                            </Link>
                        </div>
                    )}

                    {estado === 'error' && (
                        <div className="animate-in">
                            <span className="verify-icon">😞</span>
                            <div className="verify-title" style={{ color: 'var(--danger)' }}>
                                Error de Verificación
                            </div>
                            <p className="verify-msg">{mensaje}</p>
                            <Link to="/registro" className="btn-outline-green" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                                Volver al Registro
                            </Link>
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        FIFA World Cup 2026™ — USA · México · Canadá
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerificarCorreo;
