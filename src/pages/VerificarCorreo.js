import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verificarCorreo } from '../services/authService';

const VerificarCorreo = () => {
    const [searchParams] = useSearchParams();
    const [estado, setEstado] = useState('cargando'); // 'cargando' | 'exito' | 'error'
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
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow p-5 text-center" style={{ width: '480px' }}>
                <h2 className="fw-bold mb-4" style={{ color: '#8B0000' }}>
                    ⚽ Mundial 2026 Hub
                </h2>

                {estado === 'cargando' && (
                    <>
                        <div className="spinner-border mb-3" style={{ color: '#8B0000' }} role="status">
                            <span className="visually-hidden">Verificando...</span>
                        </div>
                        <p className="text-muted">Verificando tu correo electrónico...</p>
                    </>
                )}

                {estado === 'exito' && (
                    <>
                        <div style={{ fontSize: '60px', marginBottom: '16px' }}>✅</div>
                        <h4 className="text-success mb-3">¡Correo verificado!</h4>
                        <p className="text-muted mb-4">{mensaje}</p>
                        <Link
                            to="/login"
                            className="btn w-100 text-white"
                            style={{ backgroundColor: '#8B0000' }}
                        >
                            Iniciar sesión
                        </Link>
                    </>
                )}

                {estado === 'error' && (
                    <>
                        <div style={{ fontSize: '60px', marginBottom: '16px' }}>❌</div>
                        <h4 className="text-danger mb-3">Error de verificación</h4>
                        <p className="text-muted mb-4">{mensaje}</p>
                        <Link
                            to="/registro"
                            className="btn w-100 text-white"
                            style={{ backgroundColor: '#8B0000' }}
                        >
                            Volver al registro
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerificarCorreo;
