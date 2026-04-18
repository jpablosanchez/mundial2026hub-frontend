import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import {
    getAgendaPorCiudad,
    getAgendaPorEstadio,
    agregarAgenda,
    eliminarAgenda,
} from '../services/partidoService';

const CIUDADES_SUGERIDAS = [
    'New York', 'Los Angeles', 'Dallas', 'San Francisco', 'Miami',
    'Seattle', 'Boston', 'Atlanta', 'Guadalajara', 'Monterrey', 'Ciudad de México',
    'Toronto', 'Vancouver',
];

const formatFecha = (fechaHora) => {
    if (!fechaHora) return 'Fecha por confirmar';
    const d = new Date(fechaHora);
    return d.toLocaleDateString('es-CO', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
};

const formatHora = (fechaHora) => {
    if (!fechaHora) return '';
    const d = new Date(fechaHora);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
};

const AgendaCiudad = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const [tipoBusqueda, setTipoBusqueda] = useState('ciudad'); // 'ciudad' | 'estadio'
    const [query, setQuery] = useState('');
    const [partidos, setPartidos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [buscado, setBuscado] = useState(false);
    // idPartido → idAgenda (para los que ya fueron agendados en esta sesión)
    const [agendados, setAgendados] = useState({});
    const [loadingAgenda, setLoadingAgenda] = useState({});

    const getInitials = () => {
        const n = usuario?.nombres?.[0] || '';
        const a = usuario?.apellidos?.[0] || '';
        return (n + a).toUpperCase();
    };

    const cerrarSesion = () => {
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const buscar = async (valorQuery) => {
        const valor = (valorQuery ?? query).trim();
        if (!valor) return;
        setCargando(true);
        setError('');
        setBuscado(true);
        try {
            const fn = tipoBusqueda === 'ciudad' ? getAgendaPorCiudad : getAgendaPorEstadio;
            const res = await fn(valor);
            setPartidos(res.data);
        } catch {
            setError('No se pudieron cargar los partidos. Verifica tu conexión o intenta más tarde.');
            setPartidos([]);
        } finally {
            setCargando(false);
        }
    };

    const handleAgendar = async (partido) => {
        const idPartido = partido.id;
        const idUsuario = usuario?.id;
        setLoadingAgenda((prev) => ({ ...prev, [idPartido]: true }));
        try {
            if (agendados[idPartido]) {
                // Ya agendado: quitar
                await eliminarAgenda(agendados[idPartido]);
                setAgendados((prev) => {
                    const next = { ...prev };
                    delete next[idPartido];
                    return next;
                });
            } else {
                // Agendar nuevo — requiere idUsuario e idPartido
                const res = await agregarAgenda(idUsuario, idPartido);
                setAgendados((prev) => ({ ...prev, [idPartido]: res.data?.agenda?.id }));
            }
        } catch {
            // Silencia el error de agenda
        } finally {
            setLoadingAgenda((prev) => ({ ...prev, [idPartido]: false }));
        }
    };

    const handleSugerencia = (ciudad) => {
        setQuery(ciudad);
        setTipoBusqueda('ciudad');
        buscar(ciudad);
    };

    return (
        <>
            <div className="mundial-bg"></div>
            <div className="mundial-content">
                {/* Navbar */}
                <nav className="mundial-navbar">
                    <div className="navbar-brand">
                        <span className="navbar-brand-icon">⚽</span>
                        <span className="navbar-brand-text">Mundial 2026 Hub</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="sprint2-tabs">
                            <button
                                className="tab-link"
                                onClick={() => navigate('/calendario')}
                            >
                                📅 Calendario
                            </button>
                            <button
                                className="tab-link"
                                onClick={() => navigate('/resultados')}
                            >
                                📊 Resultados
                            </button>
                            <button
                                className="tab-link active-tab"
                                onClick={() => navigate('/agenda-ciudad')}
                            >
                                🗺️ Por Ciudad
                            </button>
                        </div>
                        <div className="navbar-user">
                            <span className="navbar-user-name">{usuario?.nombres}</span>
                            <div className="navbar-avatar">{getInitials()}</div>
                            <button className="btn-navbar" onClick={() => navigate('/dashboard')}>
                                Dashboard
                            </button>
                            <button className="btn-navbar" onClick={cerrarSesion}>
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Sub-hero */}
                <div className="page-subhero animate-fade">
                    <div className="page-subhero-inner">
                        <div className="page-subhero-text">
                            <h2>🗺️ Agenda por <span>Ciudad</span></h2>
                            <p>Busca partidos por ciudad o estadio y agrégalos a tu agenda personal</p>
                        </div>
                    </div>
                </div>

                {/* Filtro tipo búsqueda */}
                <div className="filter-bar animate-in stagger-1">
                    <span className="filter-label">Buscar por:</span>
                    <button
                        className={`filter-tab ${tipoBusqueda === 'ciudad' ? 'active' : ''}`}
                        onClick={() => { setTipoBusqueda('ciudad'); setPartidos([]); setBuscado(false); }}
                    >
                        📍 Ciudad
                    </button>
                    <button
                        className={`filter-tab ${tipoBusqueda === 'estadio' ? 'active' : ''}`}
                        onClick={() => { setTipoBusqueda('estadio'); setPartidos([]); setBuscado(false); }}
                    >
                        🏟️ Estadio
                    </button>
                </div>

                {/* Input de búsqueda */}
                <div className="filter-input-wrap animate-in stagger-2">
                    <div className="filter-input-group">
                        <label>
                            {tipoBusqueda === 'ciudad' ? 'Ciudad sede' : 'Nombre del estadio'}
                        </label>
                        <input
                            className="input-mundial"
                            type="text"
                            placeholder={
                                tipoBusqueda === 'ciudad'
                                    ? 'Ej: New York, Dallas, Ciudad de México…'
                                    : 'Ej: MetLife Stadium, Azteca…'
                            }
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && buscar()}
                        />
                    </div>
                    <button
                        className="btn-primary-glow"
                        style={{ width: 'auto', padding: '0.85rem 1.75rem' }}
                        onClick={() => buscar()}
                        disabled={!query.trim() || cargando}
                    >
                        {cargando ? 'Buscando…' : 'Buscar'}
                    </button>
                </div>

                {/* Ciudades sugeridas (solo si es búsqueda por ciudad y aún no se buscó) */}
                {tipoBusqueda === 'ciudad' && !buscado && (
                    <div className="filter-bar animate-in stagger-3" style={{ paddingTop: '0.75rem' }}>
                        <span className="filter-label">Sugerencias:</span>
                        {CIUDADES_SUGERIDAS.map((ciudad) => (
                            <button
                                key={ciudad}
                                className="filter-tab"
                                onClick={() => handleSugerencia(ciudad)}
                            >
                                {ciudad}
                            </button>
                        ))}
                    </div>
                )}

                {/* Placeholder mapa (HU-06 pendiente lat/lng) */}
                {!buscado && (
                    <div className="sprint2-page animate-in stagger-4">
                        <div className="mapa-placeholder">
                            <span className="mapa-placeholder-icon">🗺️</span>
                            <div className="mapa-placeholder-text">Vista de mapa — Próximamente</div>
                            <div className="mapa-placeholder-sub">
                                El mapa interactivo de estadios estará disponible cuando se integren las coordenadas geográficas.
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="sprint2-page">
                        <div className="alert-mundial alert-danger animate-in">{error}</div>
                    </div>
                )}

                {/* Cargando */}
                {cargando && (
                    <div className="page-spinner">
                        <div className="spinner-green"></div>
                    </div>
                )}

                {/* Resultados de búsqueda */}
                {!cargando && buscado && !error && partidos.length === 0 && (
                    <div className="empty-state animate-in">
                        <span className="empty-state-icon">🔍</span>
                        <div className="empty-state-title">Sin resultados</div>
                        <div className="empty-state-desc">
                            No se encontraron partidos para "{query}".
                        </div>
                    </div>
                )}

                {!cargando && partidos.length > 0 && (
                    <>
                        <div className="fecha-grupo-header animate-in stagger-1">
                            <div className="fecha-grupo-title">
                                <span>📍</span>
                                {partidos.length} partido{partidos.length !== 1 ? 's' : ''} en "{query}"
                            </div>
                        </div>
                        <div className="partidos-grid">
                            {partidos.map((partido, i) => (
                                <div
                                    key={partido.id}
                                    className={`partido-card animate-in stagger-${Math.min(i + 1, 6)}`}
                                >
                                    {/* Equipos */}
                                    <div className="partido-equipos">
                                        <div className="equipo-bloque">
                                            <span className="equipo-nombre">{partido.equipoLocal}</span>
                                        </div>
                                        <div className="partido-score-center">
                                            {partido.estado === 'FINALIZADO' ? (
                                                <div className="partido-score">
                                                    {partido.golesLocal ?? 0} — {partido.golesVisitante ?? 0}
                                                </div>
                                            ) : (
                                                <div className="partido-vs">VS</div>
                                            )}
                                            {partido.fechaHora && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                                    {formatHora(partido.fechaHora)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="equipo-bloque visitante">
                                            <span className="equipo-nombre">{partido.equipoVisitante}</span>
                                        </div>
                                    </div>

                                    {/* Meta info */}
                                    <div className="partido-meta">
                                        {partido.fechaHora && (
                                            <div className="partido-meta-item">
                                                <span className="partido-meta-icon">📅</span>
                                                {formatFecha(partido.fechaHora)}
                                            </div>
                                        )}
                                        {partido.estadio && (
                                            <div className="partido-meta-item">
                                                <span className="partido-meta-icon">🏟️</span>
                                                {partido.estadio}
                                            </div>
                                        )}
                                        {partido.ciudad && (
                                            <div className="partido-meta-item">
                                                <span className="partido-meta-icon">📍</span>
                                                {partido.ciudad}
                                            </div>
                                        )}
                                    </div>

                                    {/* Badges + botón agendar */}
                                    <div className="partido-badges">
                                        {partido.fase && (
                                            <span className="badge-estado badge-fase">{partido.fase}</span>
                                        )}
                                        <span className={`badge-estado badge-${(partido.estado || 'PROGRAMADO').toLowerCase()}`}>
                                            {partido.estado || 'PROGRAMADO'}
                                        </span>
                                        {partido.datosConfirmados === 0 && (
                                            <span className="badge-estado badge-pendiente">⚠ Actualización pendiente</span>
                                        )}
                                        <button
                                            className={`btn-agenda ${agendados[partido.id] ? 'agendado' : ''}`}
                                            onClick={() => handleAgendar(partido)}
                                            disabled={loadingAgenda[partido.id]}
                                            title={agendados[partido.id] ? 'Quitar de mi agenda' : 'Agregar a mi agenda'}
                                        >
                                            {loadingAgenda[partido.id]
                                                ? '…'
                                                : agendados[partido.id]
                                                    ? '✓ Agendado'
                                                    : '+ Agendar'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="mundial-footer">
                    FIFA World Cup 2026™ — USA · México · Canadá
                </div>
            </div>
        </>
    );
};

export default AgendaCiudad;
