import React, { useState, useEffect, useRef } from 'react';
import { getNotificacionesUsuario } from '../../services/perfilService';
import Icon from '../ui/Icon';

const TIPO_LABEL = {
  INICIO_PARTIDO: 'Inicio de partido', GOL: 'Gol',
  CAMBIO_HORARIO: 'Cambio de horario', MASIVA: 'Comunicado',
};
const fmtNotifDate = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short' });
};

const NAV_LINKS = [
  { href: '/',              label: 'Inicio' },
  { href: '/calendario',   label: 'Calendario' },
  { href: '/selecciones',  label: 'Selecciones' },
  { href: '/posiciones',   label: 'Posiciones' },
  { href: '/sedes',        label: 'Sedes' },
  { href: '/album',        label: 'Álbum' },
  { href: '/pollas',       label: 'Pollas' },
  { href: '/entradas',     label: 'Entradas' },
];

const isActive = (href) => {
  const path = window.location.pathname;
  if (href.includes('#')) return false;
  if (href === '/') return path === '/';
  return path.startsWith(href);
};

const navInitials = (user) => {
  if (user?.initials && user.initials !== '?') return user.initials;
  const n = user?.usuario?.nombres || user?.nombre || '';
  const a = user?.usuario?.apellidos || user?.apellido || '';
  return ((n[0] || '') + (a[0] || '')).toUpperCase() || '?';
};

const Navbar = ({ dark, onToggleDark, loggedIn, user, onLogin, onRegister, onLogout }) => {
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const notifRef = useRef(null);
  const navUserId = user?.usuario?.id || user?.id;

  useEffect(() => {
    if (!loggedIn || !navUserId) return;
    getNotificacionesUsuario(navUserId)
      .then((res) => setNotifs(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setNotifs([]));
  }, [loggedIn, navUserId]);

  useEffect(() => {
    if (!dropOpen) return;
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [dropOpen]);

  useEffect(() => {
    if (!notifOpen) return;
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [notifOpen]);

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="brand" onClick={() => (window.location.href = '/')} style={{ cursor: 'pointer' }}>
          <div className="brand-mark"><span>26</span></div>
          Mundial 2026 Hub
        </div>
        <div className="nav-links">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} className={'nav-link' + (isActive(href) ? ' active' : '')} href={href}>
              {label}
            </a>
          ))}
        </div>
        <div className="nav-right">
          <button className="icon-btn" title={dark ? 'Modo claro' : 'Modo oscuro'} onClick={onToggleDark}>
            <Icon name={dark ? 'sun' : 'moon'} />
          </button>

          {loggedIn && (
            <div className="notif-dropdown" ref={notifRef}>
              <button className="icon-btn" title="Notificaciones" onClick={() => setNotifOpen((o) => !o)}>
                <Icon name="bell" />
                {notifs.length > 0 && <span className="dot" />}
              </button>
              {notifOpen && (
                <div className="notif-panel">
                  <div className="notif-header">
                    <span>Notificaciones</span>
                    {notifs.length > 0 && <span className="notif-badge">{notifs.length}</span>}
                  </div>
                  {notifs.length === 0 ? (
                    <div className="notif-empty">Sin notificaciones nuevas</div>
                  ) : (
                    notifs.slice(0, 10).map((n, i) => (
                      <div className="notif-item" key={n.id || i}>
                        <div className="notif-tipo">{TIPO_LABEL[n.tipo] || n.tipo}</div>
                        <div className="notif-mensaje">{n.mensaje}</div>
                        <div className="notif-fecha">{fmtNotifDate(n.fechaEnvio)}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {loggedIn ? (
            <div className="profile-dropdown" ref={dropRef}>
              <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => setDropOpen((o) => !o)}>
                {navInitials(user)}
              </div>
              {dropOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-header">
                    <div className="avatar pm-avatar">
                      {navInitials(user)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="profile-menu-name">
                        {user?.usuario?.nombres
                          ? `${user.usuario.nombres}${user.usuario.apellidos ? ` ${user.usuario.apellidos}` : ''}`
                          : user?.nombre || 'Usuario'}
                      </div>
                      <div className="profile-menu-email">
                        {user?.usuario?.correoUsuario || user?.correo || ''}
                      </div>
                    </div>
                  </div>
                  <div className="profile-menu-divider" />
                  <a className="profile-menu-item" href="/mi-cuenta">
                    <Icon name="users" size={15} /> Mi cuenta
                  </a>
                  <button
                    className="profile-menu-item danger"
                    onClick={() => { setDropOpen(false); onLogout(); }}
                  >
                    <Icon name="close" size={15} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={onLogin}>Iniciar sesión</button>
              <button className="btn btn-primary" onClick={onRegister}>Crear cuenta</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
