import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUsuario } from '../services/authService';

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
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow p-4" style={{ width: '400px' }}>
                <h2 className="text-center mb-4 fw-bold" style={{ color: '#8B0000' }}>
                    ⚽ Mundial 2026 Hub
                </h2>
                <h5 className="text-center mb-4">Iniciar Sesión</h5>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Correo electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            placeholder="tu@correo.com"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            name="clave"
                            value={formData.clave}
                            onChange={handleChange}
                            placeholder="Tu contraseña"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn w-100 text-white"
                        style={{ backgroundColor: '#8B0000' }}
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>
                <p className="text-center mt-3">
                    ¿No tienes cuenta?{' '}
                    <Link to="/registro" style={{ color: '#8B0000' }}>Regístrate</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;