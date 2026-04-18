import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { getProximosPartidos } from '../services/partidoService';

// Mapeo EXACTO label → valor de la API (football-data.org)
// .includes() rompía el filtro porque "quarter_finals" contiene "final"
const FASES = [
    { label: 'Todas',    api: null           },
    { label: 'Grupos',   api: 'GROUP_STAGE'  },
    { label: '16avos',   api: 'LAST_32'      },
    { label: 'Octavos',  api: 'LAST_16'      },
    { label: 'Cuartos',  api: 'QUARTER_FINALS' },
    { label: 'Semifinal',api: 'SEMI_FINALS'  },
    { label: 'Final',    api: 'FINAL'        },
];

// Traduce los valores de la API a español legible para el badge
const FASE_LABEL = {
    GROUP_STAGE:    'Fase de Grupos',
    LAST_32:        '16avos de Final',
    LAST_16:        'Octavos de Final',
    QUARTER_FINALS: 'Cuartos de Final',
    SEMI_FINALS:    'Semifinales',
    THIRD_PLACE:    'Tercer Puesto',
    FINAL:          'Final',
};

const formatFecha = (fechaHora) => {
    if (!fechaHora) return 'Fecha por confirmar';
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

const agruparPorFecha = (partidos) => {
    const grupos = {};
    partidos.forEach((p) => {
        const clave = p.fechaHora
            ? new Date(p.fechaHora).toISOString().split('T')[0]
            : 'sin-fecha';
        if (!grupos[clave]) grupos[clave] = [];
        grupos[clave].push(p);
    });
    return Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b));
};

const Calendario = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const [partidos, setPartidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [faseActiva, setFaseActiva] = useState(FASES[0]);

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
        getProximosPartidos()
            .then((res) => setPartidos(res.data))
            .catch(() => setError('No se pudieron cargar los partidos. Intenta de nuevo más tarde.'))
            .finally(() => setCargando(false));
    }, []);

    // Filtrado exacto por valor de la API (no .includes para evitar falsos positivos)
    const partidosFiltrados = faseActiva.api === null
        ? partidos
        : partidos.filter((p) => p.fase === faseActiva.api);

    const grupos = agruparPorFecha(partidosFiltrados);

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
                                className="tab-link active-tab"
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
                            <h2>📅 Próximos <span>Partidos</span></h2>
                            <p>Calendario completo del Mundial 2026 — USA, México y Canadá</p>
                        </div>
                        {!cargando && (
                            <div className="page-subhero-badge">
                                <div className="page-subhero-badge-number">{partidos.length}</div>
                                <div className="page-subhero-badge-label">Partidos</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filtros por fase */}
                <div className="filter-bar animate-in stagger-1">
                    <span className="filter-label">Fase:</span>
                    {FASES.map((fase) => (
                        <button
                            key={fase.label}
                            className={`filter-tab ${faseActiva.label === fase.label ? 'active' : ''}`}
                            onClick={() => setFaseActiva(fase)}
                        >
                            {fase.label}
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

                {/* Lista agrupada por fecha */}
                {!cargando && !error && grupos.length === 0 && (
                    <div className="empty-state animate-in">
                        <span className="empty-state-icon">📅</span>
                        <div className="empty-state-title">Sin partidos programados</div>
                        <div className="empty-state-desc">
                            {faseActiva.api !== null
                                ? `No hay partidos en ${faseActiva.label} por el momento.`
                                : 'No hay próximos partidos disponibles.'}
                        </div>
                    </div>
                )}

                {!cargando && !error && grupos.map(([fecha, partidosDelDia], gi) => (
                    <div key={fecha} className={`animate-in stagger-${Math.min(gi + 1, 6)}`}>
                        <div className="fecha-grupo-header">
                            <div className="fecha-grupo-title">
                                <span>📆</span>
                                {fecha === 'sin-fecha'
                                    ? 'Fecha por confirmar'
                                    : formatFecha(fecha + 'T00:00:00')}
                            </div>
                        </div>
                        <div className="partidos-grid" style={{ paddingTop: '0.75rem' }}>
                            {partidosDelDia.map((partido) => (
                                <PartidoCard key={partido.id} partido={partido} />
                            ))}
                        </div>
                    </div>
                ))}

                <div className="mundial-footer">
                    FIFA World Cup 2026™ — USA · México · Canadá
                </div>
            </div>
        </>
    );
};

const PartidoCard = ({ partido }) => (
    <div className="partido-card">
        {/* Equipos */}
        <div className="partido-equipos">
            <div className="equipo-bloque">
                <span className="equipo-nombre">{partido.equipoLocal}</span>
            </div>
            <div className="partido-score-center">
                <div className="partido-vs">VS</div>
                {partido.fechaHora && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
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

        {/* Badges */}
        <div className="partido-badges">
            {partido.fase && (
                <span className="badge-estado badge-fase">
                    {FASE_LABEL[partido.fase] || partido.fase}
                </span>
            )}
            <span className={`badge-estado badge-${(partido.estado || 'PROGRAMADO').toLowerCase()}`}>
                {partido.estado || 'PROGRAMADO'}
            </span>
            {partido.datosConfirmados === 0 && (
                <span className="badge-estado badge-pendiente">⚠ Actualización pendiente</span>
            )}
        </div>
    </div>
);

export default Calendario;
