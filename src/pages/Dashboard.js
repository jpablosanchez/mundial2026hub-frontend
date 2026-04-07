import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const getInitials = () => {
        const n = usuario?.nombres?.[0] || '';
        const a = usuario?.apellidos?.[0] || '';
        return (n + a).toUpperCase();
    };

    const cerrarSesion = () => {
        localStorage.removeItem('usuario');
        navigate('/login');
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
                    <div className="navbar-user">
                        <span className="navbar-user-name">{usuario?.nombres} {usuario?.apellidos}</span>
                        <div className="navbar-avatar">{getInitials()}</div>
                        <button className="btn-navbar" onClick={cerrarSesion}>
                            Cerrar Sesión
                        </button>
                    </div>
                </nav>

                {/* Hero Banner */}
                <div className="hero-banner animate-fade">
                    <div className="hero-inner">
                        <div className="hero-text">
                            <h1>
                                Bienvenido, <span>{usuario?.nombres}</span>
                            </h1>
                            <p>Tu centro de comando para seguir cada gol, cada jugada y cada emoción del Mundial 2026.</p>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <div className="hero-stat-number">48</div>
                                <div className="hero-stat-label">Selecciones</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-number">16</div>
                                <div className="hero-stat-label">Ciudades</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-number">104</div>
                                <div className="hero-stat-label">Partidos</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Header */}
                <div className="section-header">
                    <span className="section-title">Panel de Control</span>
                    <div className="section-line"></div>
                </div>

                {/* Dashboard Grid */}
                <div className="dashboard-grid">
                    {/* Preferencias */}
                    <div
                        className="dash-card animate-in stagger-1"
                        onClick={() => navigate('/preferencias')}
                    >
                        <span className="dash-card-icon">⚙️</span>
                        <div className="dash-card-title">Mis Preferencias</div>
                        <div className="dash-card-desc">
                            Personaliza tus selecciones favoritas, ciudades de interés y notificaciones.
                        </div>
                        <span className="dash-card-badge badge-active">Disponible</span>
                    </div>

                    {/* Calendario */}
                    <div className="dash-card disabled animate-in stagger-2">
                        <span className="dash-card-icon">📅</span>
                        <div className="dash-card-title">Calendario</div>
                        <div className="dash-card-desc">
                            Consulta el calendario completo de partidos con fechas, horarios y sedes.
                        </div>
                        <span className="dash-card-badge badge-soon">Próximamente</span>
                    </div>

                    {/* Resultados */}
                    <div className="dash-card disabled animate-in stagger-3">
                        <span className="dash-card-icon">📊</span>
                        <div className="dash-card-title">Resultados en Vivo</div>
                        <div className="dash-card-desc">
                            Marcadores en tiempo real, estadísticas de cada partido y resúmenes.
                        </div>
                        <span className="dash-card-badge badge-soon">Próximamente</span>
                    </div>

                    {/* Selecciones — wide */}
                    <div className="dash-card dash-card-wide disabled animate-in stagger-4">
                        <span className="dash-card-icon">🏆</span>
                        <div className="dash-card-title">Tabla de Posiciones</div>
                        <div className="dash-card-desc">
                            Sigue el avance de cada grupo, puntos, goles a favor y en contra. Compara el rendimiento de las 48 selecciones en tiempo real.
                        </div>
                        <span className="dash-card-badge badge-soon">Próximamente</span>
                    </div>

                    {/* Noticias */}
                    <div className="dash-card disabled animate-in stagger-5">
                        <span className="dash-card-icon">📰</span>
                        <div className="dash-card-title">Noticias</div>
                        <div className="dash-card-desc">
                            Las últimas noticias del mundial, transferencias y convocatorias.
                        </div>
                        <span className="dash-card-badge badge-soon">Próximamente</span>
                    </div>

                    {/* Estadios — wide */}
                    <div className="dash-card dash-card-wide disabled animate-in stagger-6">
                        <span className="dash-card-icon">🏟️</span>
                        <div className="dash-card-title">Sedes y Estadios</div>
                        <div className="dash-card-desc">
                            Explora las 16 ciudades sede, capacidad de los estadios, clima y transporte. Planifica tu viaje al mundial con información detallada.
                        </div>
                        <span className="dash-card-badge badge-soon">Próximamente</span>
                    </div>

                    {/* Predicciones */}
                    <div className="dash-card disabled animate-in stagger-6">
                        <span className="dash-card-icon">🎯</span>
                        <div className="dash-card-title">Predicciones</div>
                        <div className="dash-card-desc">
                            Haz tus predicciones y compite con otros aficionados.
                        </div>
                        <span className="dash-card-badge badge-soon">Próximamente</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mundial-footer">
                    FIFA World Cup 2026™ — USA · México · Canadá
                </div>
            </div>
        </>
    );
};

export default Dashboard;
