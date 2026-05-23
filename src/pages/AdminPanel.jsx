import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard   from '../components/admin/AdminDashboard';
import UserManagement   from '../components/admin/UserManagement';
import AuditModule      from '../components/admin/AuditModule';
import MonitoringModule from '../components/admin/MonitoringModule';
import ReportsModule    from '../components/admin/ReportsModule';
import RefundsModule    from '../components/admin/RefundsModule';

/* ── Inline SVG icon components ── */
const IcoDashboard = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IcoUsers = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IcoShield = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IcoActivity = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IcoDownload = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IcoRefund = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const MODULES = [
  { id: 'dashboard',  label: 'Dashboard',   desc: 'Analytics & KPIs',     Icon: IcoDashboard },
  { id: 'usuarios',   label: 'Usuarios',    desc: 'Gestión de cuentas',   Icon: IcoUsers },
  { id: 'reembolsos', label: 'Reembolsos',  desc: 'Aprobar solicitudes',  Icon: IcoRefund },
  { id: 'auditoria',  label: 'Auditoría',   desc: 'Trazabilidad',         Icon: IcoShield },
  { id: 'monitoreo',  label: 'Monitoreo',   desc: 'Estado operativo',     Icon: IcoActivity },
  { id: 'reportes',   label: 'Reportes',    desc: 'Exportar datos',       Icon: IcoDownload },
];

export default function AdminPanel() {
  const navigate  = useNavigate();
  const [module, setModule]     = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  let adminUser = null;
  try { adminUser = JSON.parse(localStorage.getItem('user') || 'null'); } catch {}

  const name  = adminUser?.usuario?.nombres || 'Admin';
  const initial = name[0]?.toUpperCase() || 'A';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const current = MODULES.find(m => m.id === module);

  return (
    <div style={s.shell}>
      {/* ── Sidebar ── */}
      <aside style={{ ...s.sidebar, width: collapsed ? 64 : 230 }}>
        {/* Logo */}
        <div style={s.logoRow}>
          <div style={s.logoMark}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={s.logoTitle}>Admin Center</div>
              <div style={s.logoSub}>Mundial 2026 Hub</div>
            </div>
          )}
          <button style={s.collapseBtn} onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expandir' : 'Colapsar'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          {!collapsed && <div style={s.navGroup}>NAVEGACIÓN</div>}
          {MODULES.map(m => {
            const { Icon } = m;
            const active = module === m.id;
            return (
              <button
                key={m.id}
                style={{ ...s.navItem, ...(active ? s.navActive : {}) }}
                onClick={() => setModule(m.id)}
                title={collapsed ? m.label : undefined}
              >
                <div style={{ ...s.navIconWrap, ...(active ? s.navIconActive : {}) }}>
                  <Icon size={16} active={active} />
                </div>
                {!collapsed && (
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? 'var(--accent)' : 'var(--ink-3)', lineHeight: 1.2 }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 1 }}>{m.desc}</div>
                  </div>
                )}
                {active && !collapsed && <div style={s.activeDot} />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={s.sideFooter}>
          {!collapsed && (
            <div style={s.adminCard}>
              <div style={s.adminAvatar}>{initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.07em', marginTop: 2 }}>ADMIN</div>
              </div>
            </div>
          )}
          <button style={{ ...s.logoutBtn, justifyContent: collapsed ? 'center' : 'flex-start' }} onClick={handleLogout} title="Cerrar sesión">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={s.main}>
        {/* Header */}
        <header style={s.header}>
          <div>
            <div style={s.breadcrumb}>
              <span style={s.breadcrumbBase}>Admin</span>
              <span style={s.sep}>/</span>
              <span style={s.breadcrumbCurrent}>{current?.label}</span>
            </div>
            <div style={s.pageSubtitle}>{current?.desc}</div>
          </div>
          <div style={s.headerActions}>
            <div style={s.onlineBadge}>
              <span style={s.onlineDot} />
              Sistema online
            </div>
            <div style={s.adminBadgePill}>{initial}</div>
          </div>
        </header>

        {/* Content */}
        <div style={s.content}>
          {module === 'dashboard'  && <AdminDashboard />}
          {module === 'usuarios'   && <UserManagement />}
          {module === 'reembolsos' && <RefundsModule />}
          {module === 'auditoria'  && <AuditModule />}
          {module === 'monitoreo'  && <MonitoringModule />}
          {module === 'reportes'   && <ReportsModule />}
        </div>
      </main>
    </div>
  );
}

/* ── Styles ── */
const s = {
  shell: {
    display: 'flex', height: '100vh',
    fontFamily: 'var(--font-sans)',
    background: 'var(--bg-soft)',
    overflow: 'hidden',
  },
  sidebar: {
    background: 'var(--bg-elev)',
    borderRight: '1px solid var(--line)',
    display: 'flex', flexDirection: 'column',
    flexShrink: 0, overflow: 'hidden',
    transition: 'width .2s ease',
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '18px 14px 16px', borderBottom: '1px solid var(--line)',
    minHeight: 62, flexShrink: 0,
  },
  logoMark: {
    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
    background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoTitle: { fontSize: 13, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.01em' },
  logoSub:   { fontSize: 10, color: 'var(--ink-4)', marginTop: 1 },
  collapseBtn: {
    marginLeft: 'auto', flexShrink: 0,
    width: 26, height: 26, borderRadius: 8,
    border: 'none', background: 'transparent',
    color: 'var(--ink-4)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  navGroup: {
    fontSize: 9, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '.1em',
    padding: '10px 14px 4px', textTransform: 'uppercase',
  },
  nav: {
    flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column',
    gap: 2, overflowY: 'auto',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 10px', borderRadius: 'var(--radius-sm)',
    border: 'none', background: 'transparent', cursor: 'pointer',
    transition: 'background .12s', width: '100%',
    position: 'relative',
  },
  navActive: { background: 'var(--accent-soft)' },
  navIconWrap: {
    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--ink-4)',
  },
  navIconActive: { color: 'var(--accent)' },
  activeDot: {
    width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0,
  },
  sideFooter: {
    padding: '10px 8px 14px', borderTop: '1px solid var(--line)',
    display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0,
  },
  adminCard: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '8px 10px', borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-soft)',
  },
  adminAvatar: {
    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
    background: 'var(--accent)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 13,
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 10px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--line)', background: 'transparent',
    color: 'var(--ink-4)', fontSize: 12, cursor: 'pointer', width: '100%',
    transition: 'all .12s',
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    overflow: 'hidden', minWidth: 0,
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 28px', background: 'var(--bg-elev)',
    borderBottom: '1px solid var(--line)', flexShrink: 0,
  },
  breadcrumb:     { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 },
  breadcrumbBase: { fontSize: 12, color: 'var(--ink-4)' },
  sep:            { fontSize: 12, color: 'var(--ink-4)' },
  breadcrumbCurrent: { fontSize: 14, fontWeight: 700, color: 'var(--ink)' },
  pageSubtitle:   { fontSize: 12, color: 'var(--ink-4)' },
  headerActions:  { display: 'flex', alignItems: 'center', gap: 12 },
  onlineBadge: {
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#00b894',
    fontWeight: 600, padding: '5px 12px', borderRadius: 99,
    background: '#00b89412', border: '1px solid #00b89430',
  },
  onlineDot: {
    width: 7, height: 7, borderRadius: '50%', background: '#00b894', display: 'inline-block',
  },
  adminBadgePill: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'var(--accent)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 13,
  },
  content: {
    flex: 1, overflow: 'auto', padding: '24px 28px',
  },
};
