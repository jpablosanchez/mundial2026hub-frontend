import React, { useState, useEffect } from 'react';
import api from '../../services/apiClient';

const SERVICES = [
  { name: 'API Backend',       key: 'api',      check: true  },
  { name: 'PostgreSQL DB',     key: 'db',       check: true  },
  { name: 'Football-Data.org', key: 'football', check: false },
  { name: 'SendGrid (Email)',  key: 'sendgrid', check: false },
  { name: 'Firebase FCM',      key: 'firebase', check: false },
  { name: 'Stripe Payments',   key: 'stripe',   check: false },
];

export default function MonitoringModule() {
  const [metrics, setMetrics]           = useState(null);
  const [discrepancias, setDiscrepancias] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [resolving, setResolving]       = useState(null);
  const [toast, setToast]               = useState('');
  const [apiOnline, setApiOnline]       = useState(false);
  const [refreshed, setRefreshed]       = useState(null);

  const load = async () => {
    setLoading(true);
    const [m, d] = await Promise.allSettled([
      api.get('/backoffice/metricas'),
      api.get('/backoffice/discrepancias'),
    ]);
    if (m.status === 'fulfilled') { setMetrics(m.value.data); setApiOnline(true); }
    else setApiOnline(false);
    if (d.status === 'fulfilled') setDiscrepancias(Array.isArray(d.value.data) ? d.value.data : []);
    setRefreshed(new Date());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg, err = false) => {
    setToast((err ? '✕ ' : '✓ ') + msg);
    setTimeout(() => setToast(''), 3000);
  };

  const resolver = async id => {
    setResolving(id);
    try {
      await api.put(`/backoffice/discrepancia/resolver/${id}`);
      showToast('Discrepancia resuelta');
      await load();
    } catch { showToast('Error al resolver', true); }
    finally { setResolving(null); }
  };

  const pendientes = discrepancias.filter(d => d.resuelto === 0 || d.resuelto === false);
  const resueltas  = discrepancias.filter(d => d.resuelto === 1 || d.resuelto === true);

  const entryStats = [
    { label: 'Disponibles',  value: metrics?.entradasDisponibles,  color: '#00b894' },
    { label: 'Reservadas',   value: metrics?.entradasReservadas,   color: '#fdcb6e' },
    { label: 'Pagadas',      value: metrics?.entradasPagadas,      color: 'var(--accent)' },
    { label: 'Expiradas',    value: metrics?.entradasExpiradas,    color: '#636e72' },
    { label: 'Reembolsadas', value: metrics?.entradasReembolsadas, color: '#e17055' },
  ];
  const totalEntradas = entryStats.reduce((s, e) => s + (e.value ?? 0), 0) || 1;

  return (
    <div>
      {/* Refresh bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>
          Última actualización: {refreshed ? refreshed.toLocaleTimeString('es-CO') : '—'}
        </div>
        <button style={s.refreshBtn} onClick={load} disabled={loading}>
          {loading ? '…' : '↻ Actualizar'}
        </button>
      </div>

      {/* Service status */}
      <Section title="Estado de Servicios">
        <div style={s.servicesGrid}>
          {SERVICES.map(svc => {
            const online = svc.check ? apiOnline : null;
            return (
              <div key={svc.key} style={s.serviceCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: online === true ? '#00b894' : online === false ? '#e17055' : '#fdcb6e',
                  }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{svc.name}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: online === true ? '#00b894' : online === false ? '#e17055' : '#e67e22' }}>
                  {online === true ? '● Online' : online === false ? '✕ Offline' : '◌ Sin verificar'}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Operational metrics */}
      <Section title="Métricas Operativas">
        <div style={s.metricsGrid}>
          {[
            { label: 'Total Usuarios',    value: metrics?.totalUsuarios,           color: 'var(--accent)' },
            { label: 'Total Entradas',    value: metrics?.totalEntradas,           color: 'var(--ink)' },
            { label: 'Notificaciones',    value: metrics?.totalNotificaciones,     color: '#a29bfe' },
            { label: 'Eventos Auditoría', value: metrics?.totalEventosAuditoria,   color: '#636e72' },
            { label: 'Reembolsos pend.',  value: metrics?.reembolsosPendientes,    color: metrics?.reembolsosPendientes > 0 ? '#e17055' : '#00b894' },
            { label: 'Discrepancias',     value: metrics?.discrepanciasSinResolver, color: metrics?.discrepanciasSinResolver > 0 ? '#e17055' : '#00b894' },
          ].map(m => (
            <div key={m.label} style={s.metricBlock}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: m.color }}>{m.value ?? '—'}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Entry breakdown with visual bars */}
      <Section title="Entradas por Estado">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 500 }}>
          {entryStats.map(e => {
            const pct = Math.round(((e.value ?? 0) / totalEntradas) * 100);
            return (
              <div key={e.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--ink-3)' }}>{e.label}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{e.value ?? 0} <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>({pct}%)</span></span>
                </div>
                <div style={{ height: 7, borderRadius: 99, background: 'var(--line)' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: e.color, transition: 'width .5s' }} />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Discrepancies */}
      <Section title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Discrepancias de Datos
          {pendientes.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#e17055', background: '#e1705518', padding: '2px 8px', borderRadius: 99 }}>
              {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
            </span>
          )}
          {resueltas.length > 0 && (
            <span style={{ fontSize: 11, color: '#00b894', background: '#00b89412', padding: '2px 8px', borderRadius: 99 }}>
              {resueltas.length} resueltas
            </span>
          )}
        </span>
      }>
        {discrepancias.length === 0
          ? <div style={{ color: 'var(--ink-4)', fontSize: 14 }}>No hay discrepancias registradas.</div>
          : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['ID', 'Campo', 'Tabla', 'Descripción', 'Detectado', 'Estado', 'Acción'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {discrepancias.map((d, i) => {
                    const pending = d.resuelto === 0 || d.resuelto === false;
                    return (
                      <tr key={d.id} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-soft)' }}>
                        <td style={{ ...s.td, fontSize: 11, color: 'var(--ink-4)' }}>{d.id}</td>
                        <td style={{ ...s.td, fontWeight: 600 }}>{d.campoDiscrepancia || '—'}</td>
                        <td style={{ ...s.td, fontSize: 12 }}>{d.tablaAfectada || '—'}</td>
                        <td style={{ ...s.td, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.descripcion || '—'}
                        </td>
                        <td style={{ ...s.td, fontSize: 11, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>
                          {d.fechaDeteccion ? new Date(d.fechaDeteccion).toLocaleDateString('es-CO') : '—'}
                        </td>
                        <td style={s.td}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, color: pending ? '#e17055' : '#00b894', background: pending ? '#e1705512' : '#00b89412' }}>
                            {pending ? 'PENDIENTE' : 'RESUELTO'}
                          </span>
                        </td>
                        <td style={s.td}>
                          {pending && (
                            <button
                              onClick={() => resolver(d.id)}
                              disabled={resolving === d.id}
                              style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid #00b89444', background: '#00b89412', color: '#00b894', borderRadius: 6, opacity: resolving === d.id ? 0.6 : 1 }}
                            >{resolving === d.id ? '…' : 'Resolver'}</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </Section>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, padding: '10px 18px', borderRadius: 10, background: toast.startsWith('✓') ? '#00b894' : '#e17055', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,.18)' }}>{toast}</div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

const s = {
  refreshBtn:   { padding: '7px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 },
  serviceCard:  { background: 'var(--bg-elev)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', border: '1px solid var(--line)' },
  metricsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 },
  metricBlock:  { background: 'var(--bg-elev)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', border: '1px solid var(--line)' },
  tableWrap:    { background: 'var(--bg-elev)', borderRadius: 'var(--radius)', border: '1px solid var(--line)', overflowX: 'auto' },
  table:        { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:           { padding: '11px 13px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-4)', background: 'var(--bg-soft)', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap', fontSize: 11 },
  td:           { padding: '9px 13px', color: 'var(--ink)', borderBottom: '1px solid var(--line)' },
};
