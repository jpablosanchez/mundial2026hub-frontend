import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { guardarPreferencias, obtenerPreferencias } from '../services/authService';

const seleccionesDisponibles = [
    'COL', 'ARG', 'BRA', 'MEX', 'USA', 'ESP', 'FRA', 'ALE', 'POR', 'ENG'
];

const ciudadesDisponibles = [
    'New York', 'Los Angeles', 'Miami', 'Dallas', 'San Francisco',
    'Toronto', 'Vancouver', 'Ciudad de México', 'Guadalajara', 'Monterrey'
];

const Preferencias = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const [selecciones, setSelecciones] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [notifPush, setNotifPush] = useState(1);
    const [notifEmail, setNotifEmail] = useState(1);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!usuario) { navigate('/login'); return; }
        const cargarPreferencias = async () => {
            try {
                const data = await obtenerPreferencias(usuario.id);
                if (data.seleccionesFavoritas) {
                    setSelecciones(data.seleccionesFavoritas.split(','));
                }
                if (data.ciudadesInteres) {
                    setCiudades(data.ciudadesInteres.split(','));
                }
                setNotifPush(data.notifPush);
                setNotifEmail(data.notifEmail);
            } catch (err) {}
        };
        cargarPreferencias();
    }, []);

    const toggleSeleccion = (item, lista, setLista) => {
        if (lista.includes(item)) {
            setLista(lista.filter(i => i !== item));
        } else {
            setLista([...lista, item]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMensaje('');
        try {
            await guardarPreferencias(usuario.id, {
                seleccionesFavoritas: selecciones.join(','),
                ciudadesInteres: ciudades.join(','),
                notifPush,
                notifEmail
            });
            setMensaje('¡Preferencias guardadas exitosamente!');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError('Error al guardar preferencias.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="card shadow p-4 mx-auto" style={{ maxWidth: '600px' }}>
                <h2 className="text-center fw-bold mb-2" style={{ color: '#8B0000' }}>
                    ⚽ Mundial 2026 Hub
                </h2>
                <h5 className="text-center mb-4">
                    Hola {usuario?.nombres}, configura tus preferencias
                </h5>
                {mensaje && <div className="alert alert-success">{mensaje}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>

                    <h6 className="fw-bold mb-2">🏆 Selecciones favoritas</h6>
                    <div className="d-flex flex-wrap gap-2 mb-4">
                        {seleccionesDisponibles.map(s => (
                            <button
                                key={s}
                                type="button"
                                className={`btn btn-sm ${selecciones.includes(s)
                                    ? 'text-white' : 'btn-outline-secondary'}`}
                                style={selecciones.includes(s)
                                    ? { backgroundColor: '#8B0000' } : {}}
                                onClick={() => toggleSeleccion(s, selecciones, setSelecciones)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <h6 className="fw-bold mb-2">🏙️ Ciudades de interés</h6>
                    <div className="d-flex flex-wrap gap-2 mb-4">
                        {ciudadesDisponibles.map(c => (
                            <button
                                key={c}
                                type="button"
                                className={`btn btn-sm ${ciudades.includes(c)
                                    ? 'text-white' : 'btn-outline-secondary'}`}
                                style={ciudades.includes(c)
                                    ? { backgroundColor: '#8B0000' } : {}}
                                onClick={() => toggleSeleccion(c, ciudades, setCiudades)}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    <h6 className="fw-bold mb-2">🔔 Notificaciones</h6>
                    <div className="form-check form-switch mb-2">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notifPush === 1}
                            onChange={() => setNotifPush(notifPush === 1 ? 0 : 1)}
                        />
                        <label className="form-check-label">Notificaciones Push</label>
                    </div>
                    <div className="form-check form-switch mb-4">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notifEmail === 1}
                            onChange={() => setNotifEmail(notifEmail === 1 ? 0 : 1)}
                        />
                        <label className="form-check-label">Notificaciones Email</label>
                    </div>

                    <button
                        type="submit"
                        className="btn w-100 text-white"
                        style={{ backgroundColor: '#8B0000' }}
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar Preferencias'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Preferencias;