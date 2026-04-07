import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUsuario } from '../services/authService';
import '../App.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        correo: '',
        clave: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await loginUsuario(formData);
            localStorage.setItem('usuario', JSON.stringify(response.usuario));
            navigate('/preferencias');
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al iniciar sesión.');
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

                            <h2 className="auth-title">Bienvenido de vuelta</h2>
                            <p className="auth-subtitle">Inicia sesión para vivir la pasión del fútbol</p>

                            {error && <div className="alert-mundial alert-danger">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="input-group-mundial">
                                    <label>Correo electrónico</label>
                                    <input
                                        type="email"
                                        className="input-mundial"
                                        name="correo"
                                        value={formData.correo}
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
                                        name="clave"
                                        value={formData.clave}
                                        onChange={handleChange}
                                        placeholder="Tu contraseña"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary-glow"
                                    disabled={loading}
                                    style={{ marginTop: '0.5rem' }}
                                >
                                    {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                                </button>
                            </form>

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.5rem', textAlign: 'center' }}>
                                ¿No tienes cuenta?{' '}
                                <Link to="/registro" className="auth-link">Regístrate aquí</Link>
                            </p>
                        </div>
                    </div>

                    {/* Right — Branding with Haaland background */}
                                        <div className="auth-right" style={{
                        backgroundImage: 'url(/images/haaland.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                    }}>
                        <div className="auth-right-overlay"></div>
                        <div className="auth-right-content animate-fade">
                            <span className="auth-right-icon">🏆</span>
                            <h2>Mundial 2026</h2>
                            <p>La Copa del Mundo más grande de la historia. 48 selecciones, 3 países, 1 pasión.</p>
                            <ul className="feature-list">
                                <li><span className="feature-dot"></span>Sigue a tus selecciones favoritas</li>
                                <li><span className="feature-dot"></span>Resultados y estadísticas en tiempo real</li>
                                <li><span className="feature-dot"></span>Calendario de partidos personalizado</li>
                                <li><span className="feature-dot"></span>Notificaciones de goles al instante</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
