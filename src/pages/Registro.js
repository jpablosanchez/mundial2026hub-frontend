import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../services/authService';

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
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow p-4" style={{ width: '450px' }}>
                <h2 className="text-center mb-4 fw-bold" style={{ color: '#8B0000' }}>
                    ⚽ Mundial 2026 Hub
                </h2>
                <h5 className="text-center mb-4">Crear Cuenta</h5>
                {error && <div className="alert alert-danger">{error}</div>}
                {exito && <div className="alert alert-success">{exito}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Nombres</label>
                        <input
                            type="text"
                            className="form-control"
                            name="nombres"
                            value={formData.nombres}
                            onChange={handleChange}
                            placeholder="Tu nombre"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Apellidos</label>
                        <input
                            type="text"
                            className="form-control"
                            name="apellidos"
                            value={formData.apellidos}
                            onChange={handleChange}
                            placeholder="Tus apellidos"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Correo electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            name="correoUsuario"
                            value={formData.correoUsuario}
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
                            name="claveUsuario"
                            value={formData.claveUsuario}
                            onChange={handleChange}
                            placeholder="Mínimo 8 caracteres"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn w-100 text-white"
                        style={{ backgroundColor: '#8B0000' }}
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>
                <p className="text-center mt-3">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" style={{ color: '#8B0000' }}>Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
};

export default Registro;