import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const cerrarSesion = () => {
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    return (
        <div className="container py-5">
            <div className="card shadow p-4 mx-auto" style={{ maxWidth: '600px' }}>
                <h2 className="text-center fw-bold mb-2" style={{ color: '#8B0000' }}>
                    ⚽ Mundial 2026 Hub
                </h2>
                <h5 className="text-center mb-4">
                    Bienvenido, {usuario?.nombres} {usuario?.apellidos}
                </h5>
                <div className="list-group mb-4">
                    <button
                        className="list-group-item list-group-item-action"
                        onClick={() => navigate('/preferencias')}
                    >
                        ⚙️ Editar mis preferencias
                    </button>
                </div>
                <button
                    className="btn w-100 text-white"
                    style={{ backgroundColor: '#8B0000' }}
                    onClick={cerrarSesion}
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default Dashboard;