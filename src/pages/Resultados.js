import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { getResultados } from '../services/partidoService';

const FASES = ['Todas', 'Grupos', 'Octavos', 'Cuartos', 'Semifinal', 'Final'];

const formatFecha = (fechaHora) => {
    if (!fechaHora) return '—';
    const d = new Date(fechaHora);
    return d.toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
};

const formatHora = (fechaHora) => {
    if (!fechaHora) return '';
    const d = new Date(fechaHora);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
};

const Resultados = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const [partidos, setPartidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [faseActiva, setFaseActiva] = useState('Todas');

    const getInitials = () => {
        const n = usuario?.nombres?.[0] || '';
        const a = usuario?.apellidos?.[0] || '';
        return (n + a).toUpperCase();
    };

    const cerrarSesion = () => {
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    useEffect(() => {
        getResultados()
            .then((res) => setPartidos(res.data))
            .catch(() => setError('No se pudieron cargar los resultados. Intenta de nuevo más tarde.'))
            .finally(() => setCargando(false));
    }, []);

    const partidosFiltrados = faseActiva === 'Todas'
        ? partidos
        : partidos.filter((p) =>
            p.fase?.toLowerCase().includes(faseActiva.toLowerCase())
        );

    const totalGoles = partidosFiltrados.reduce(
        (acc, p) => acc + (p.golesLocal || 0) + (p.golesVisitante || 0), 0
    );

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
                                className="tab-link active-tab"
                                onClick={() => navigate('/resultados')}
                            >
                                📊 Resultados
                            </button>
                            <button
                                className="tab-link"
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
                            <h2>📊 <span>Resultados</span> del Torneo</h2>
                            <p>Marcadores finales, estadísticas y resumen de cada encuentro</p>
                        </div>
                        {!cargando && (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="page-subhero-badge">
                                    <div className="page-subhero-badge-number">{partidosFiltrados.length}</div>
                                    <div className="page-subhero-badge-label">Partidos</div>
                                </div>
                                <div className="page-subhero-badge">
                                    <div className="page-subhero-badge-number">{totalGoles}</div>
                                    <div className="page-subhero-badge-label">Goles</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filtros por fase */}
                <div className="filter-bar animate-in stagger-1">
                    <span className="filter-label">Fase:</span>
                    {FASES.map((fase) => (
                        <button
                            key={fase}
                            className={`filter-tab ${faseActiva === fase ? 'active' : ''}`}
                            onClick={() => setFaseActiva(fase)}
                        >
                            {fase}
                        </button>
                    ))}
                </div>

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

                {/* Lista de resultados */}
                {!cargando && !error && partidosFiltrados.length === 0 && (
                    <div className="empty-state animate-in">
                        <span className="empty-state-icon">📊</span>
                        <div className="empty-state-title">Sin resultados disponibles</div>
                        <div className="empty-state-desc">
                            {faseActiva !== 'Todas'
                                ? `No hay partidos finalizados en fase ${faseActiva}.`
                                : 'Aún no hay partidos finalizados.'}
                        </div>
                    </div>
                )}

                {!cargando && !error && (
                    <div className="partidos-grid">
                        {partidosFiltrados.map((partido, i) => (
                            <div
                                key={partido.id}
                                className={`animate-in stagger-${Math.min(i + 1, 6)}`}
                            >
                                <ResultadoCard partido={partido} />
                            </div>
                        ))}
                    </div>
                )}

                <div className="mundial-footer">
                    FIFA World Cup 2026™ — USA · México · Canadá
                </div>
            </div>
        </>
    );
};

const ResultadoCard = ({ partido }) => {
    const localGana = partido.golesLocal > partido.golesVisitante;
    const visitanteGana = partido.golesVisitante > partido.golesLocal;
    const empate = partido.golesLocal === partido.golesVisitante;

    const estiloGanador = {
        color: 'var(--text-primary)',
        fontWeight: '700',
    };

    const estiloPerdedor = {
        color: 'var(--text-muted)',
        fontWeight: '500',
    };

    return (
        <div className="partido-card">
            {/* Equipos con marcador */}
            <div className="partido-equipos">
                <div className="equipo-bloque">
                    <span
                        className="equipo-nombre"
                        style={!empate ? (localGana ? estiloGanador : estiloPerdedor) : {}}
                    >
                        {partido.equipoLocal}
                    </span>
                </div>

                <div className="partido-score-center">
                    <div className="partido-score">
                        {partido.golesLocal ?? '—'} — {partido.golesVisitante ?? '—'}
                    </div>
                    {partido.fechaHora && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {formatFecha(partido.fechaHora)}
                        </div>
                    )}
                </div>

                <div className="equipo-bloque visitante">
                    <span
                        className="equipo-nombre"
                        style={!empate ? (visitanteGana ? estiloGanador : estiloPerdedor) : {}}
                    >
                        {partido.equipoVisitante}
                    </span>
                </div>
            </div>

            {/* Meta info */}
            <div className="partido-meta">
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
                {partido.fechaHora && (
                    <div className="partido-meta-item">
                        <span className="partido-meta-icon">🕐</span>
                        {formatHora(partido.fechaHora)}
                    </div>
                )}
            </div>

            {/* Badges */}
            <div className="partido-badges">
                {partido.fase && (
                    <span className="badge-estado badge-fase">{partido.fase}</span>
                )}
                <span className="badge-estado badge-finalizado">
                    {empate ? 'Empate' : `Gana ${localGana ? partido.equipoLocal : partido.equipoVisitante}`}
                </span>
                {partido.datosConfirmados === 0 && (
                    <span className="badge-estado badge-pendiente">⚠ Actualización pendiente</span>
                )}
            </div>
        </div>
    );
};

export default Resultados;
