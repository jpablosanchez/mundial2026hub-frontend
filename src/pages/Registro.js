import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../services/authService';
import '../App.css';

const Registro = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        correoUsuario: '',
        claveUsuario: ''
    });
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setExito('');
        try {
            await registrarUsuario(formData);
            setExito('¡Registro exitoso! Te enviamos un correo de verificación a ' + formData.correoUsuario + '. Revisa tu bandeja de entrada para activar tu cuenta.');
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al registrarse.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mundial-bg"></div>
            <div className="mundial-content">
                <div className="auth-page">
                    {/* Left — Form */}
                    <div className="auth-left">
                        <div className="auth-form-container animate-in">
                            <div className="auth-logo">
                                <span className="auth-logo-icon">⚽</span>
                                <span className="auth-logo-text">Mundial 2026 Hub</span>
                            </div>

                            <h2 className="auth-title">Crea tu cuenta</h2>
                            <p className="auth-subtitle">Únete a la comunidad del Mundial 2026</p>

                            {error && <div className="alert-mundial alert-danger">{error}</div>}
                            {exito && <div className="alert-mundial alert-success">{exito}</div>}

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="input-group-mundial">
                                        <label>Nombres</label>
                                        <input
                                            type="text"
                                            className="input-mundial"
                                            name="nombres"
                                            value={formData.nombres}
                                            onChange={handleChange}
                                            placeholder="Tu nombre"
                                            required
                                        />
                                    </div>
                                    <div className="input-group-mundial">
                                        <label>Apellidos</label>
                                        <input
                                            type="text"
                                            className="input-mundial"
                                            name="apellidos"
                                            value={formData.apellidos}
                                            onChange={handleChange}
                                            placeholder="Tus apellidos"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="input-group-mundial">
                                    <label>Correo electrónico</label>
                                    <input
                                        type="email"
                                        className="input-mundial"
                                        name="correoUsuario"
                                        value={formData.correoUsuario}
                                        onChange={handleChange}
                                        placeholder="tu@correo.com"
                                        required
                                    />
                                </div>
                                <div className="input-group-mundial">
                                    <label>Contraseña</label>
                                    <input
                                        type="password"
                                        className="input-mundial"
                                        name="claveUsuario"
                                        value={formData.claveUsuario}
                                        onChange={handleChange}
                                        placeholder="Mínimo 8 caracteres"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-gold"
                                    disabled={loading}
                                    style={{ marginTop: '0.5rem' }}
                                >
                                    {loading ? 'Registrando...' : 'Crear Cuenta'}
                                </button>
                            </form>

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.5rem', textAlign: 'center' }}>
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/login" className="auth-link">Inicia sesión</Link>
                            </p>
                        </div>
                    </div>

                    {/* Right — Branding with Cristiano background */}
                                        <div className="auth-right" style={{
                        backgroundImage: 'url(/images/cristiano.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}>
                        <div className="auth-right-overlay"></div>
                        <div className="auth-right-content animate-fade">
                            <span className="auth-right-icon">🌎</span>
                            <h2>3 Países, 1 Pasión</h2>
                            <p>Estados Unidos, México y Canadá se unen para la Copa del Mundo más grande jamás organizada.</p>
                            <ul className="feature-list">
                                <li><span className="feature-dot"></span>48 selecciones nacionales</li>
                                <li><span className="feature-dot"></span>16 ciudades sede</li>
                                <li><span className="feature-dot"></span>104 partidos en total</li>
                                <li><span className="feature-dot"></span>Tu experiencia personalizada</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Registro;
