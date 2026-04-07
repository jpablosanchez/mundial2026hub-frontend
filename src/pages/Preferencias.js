import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { guardarPreferencias, obtenerPreferencias } from '../services/authService';
import '../App.css';

const seleccionesDisponibles = [
    'COL', 'ARG', 'BRA', 'MEX', 'USA', 'ESP', 'FRA', 'ALE', 'POR', 'ENG'
];

const ciudadesDisponibles = [
    'New York', 'Los Angeles', 'Miami', 'Dallas', 'San Francisco',
    'Toronto', 'Vancouver', 'Ciudad de México', 'Guadalajara', 'Monterrey'
];

const banderasMap = {
    COL: '🇨🇴', ARG: '🇦🇷', BRA: '🇧🇷', MEX: '🇲🇽', USA: '🇺🇸',
    ESP: '🇪🇸', FRA: '🇫🇷', ALE: '🇩🇪', POR: '🇵🇹', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
};

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

    const toggleItem = (item, lista, setLista) => {
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

    const getInitials = () => {
        const n = usuario?.nombres?.[0] || '';
        const a = usuario?.apellidos?.[0] || '';
        return (n + a).toUpperCase();
    };

    return (
        <>
            <div className="mundial-bg"></div>
            <div className="mundial-content">
                {/* Navbar */}
                <nav className="mundial-navbar">
                    <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <span className="navbar-brand-icon">⚽</span>
                        <span className="navbar-brand-text">Mundial 2026 Hub</span>
                    </div>
                    <div className="navbar-user">
                        <span className="navbar-user-name">{usuario?.nombres} {usuario?.apellidos}</span>
                        <div className="navbar-avatar">{getInitials()}</div>
                    </div>
                </nav>

                {/* Preferences content */}
                <div className="pref-page animate-in">
                    <div className="pref-header">
                        <h1>Mis <span>Preferencias</span></h1>
                        <p>Personaliza tu experiencia en el Mundial 2026, {usuario?.nombres}</p>
                    </div>

                    {mensaje && <div className="alert-mundial alert-success">{mensaje}</div>}
                    {error && <div className="alert-mundial alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Selecciones */}
                        <div className="pref-section">
                            <div className="pref-section-title">
                                <span>🏆</span> Selecciones Favoritas
                            </div>
                            <div className="chip-grid">
                                {seleccionesDisponibles.map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        className={`chip ${selecciones.includes(s) ? 'selected' : ''}`}
                                        onClick={() => toggleItem(s, selecciones, setSelecciones)}
                                    >
                                        {banderasMap[s]} {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Ciudades */}
                        <div className="pref-section">
                            <div className="pref-section-title">
                                <span>🏟️</span> Ciudades de Interés
                            </div>
                            <div className="chip-grid">
                                {ciudadesDisponibles.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`chip ${ciudades.includes(c) ? 'selected' : ''}`}
                                        onClick={() => toggleItem(c, ciudades, setCiudades)}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notificaciones */}
                        <div className="pref-section">
                            <div className="pref-section-title">
                                <span>🔔</span> Notificaciones
                            </div>
                            <div className="switch-row">
                                <span className="switch-label">Notificaciones Push</span>
                                <div
                                    className={`switch-toggle ${notifPush === 1 ? 'active' : ''}`}
                                    onClick={() => setNotifPush(notifPush === 1 ? 0 : 1)}
                                ></div>
                            </div>
                            <div className="switch-row">
                                <span className="switch-label">Notificaciones Email</span>
                                <div
                                    className={`switch-toggle ${notifEmail === 1 ? 'active' : ''}`}
                                    onClick={() => setNotifEmail(notifEmail === 1 ? 0 : 1)}
                                ></div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pref-actions">
                            <button
                                type="button"
                                className="btn-outline-green"
                                onClick={() => navigate('/dashboard')}
                            >
                                Volver al Dashboard
                            </button>
                            <button
                                type="submit"
                                className="btn-primary-glow"
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Guardar Preferencias'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mundial-footer">
                    FIFA World Cup 2026™ — USA · México · Canadá
                </div>
            </div>
        </>
    );
};

export default Preferencias;
