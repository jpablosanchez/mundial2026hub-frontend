import React, { useState, useEffect } from 'react';
import api from '../../services/apiClient';
import StatCard from './shared/StatCard';
import DonutChart from './shared/DonutChart';
import Icon from '../ui/Icon';

const EVENT_META = {
  LOGIN:                       { color: '#00b894', iconName: 'arrow-r',    label: 'Login' },
  LOGOUT:                      { color: '#636e72', iconName: 'arrow-left', label: 'Logout' },
  BLOQUEO_CUENTA:              { color: '#e17055', iconName: 'x-circle',   label: 'Bloqueo' },
  DESBLOQUEO_CUENTA:           { color: '#00b894', iconName: 'check',      label: 'Desbloqueo' },
  CAMBIO_ROL:                  { color: '#a29bfe', iconName: 'users',      label: 'Cambio rol' },
  ELIMINACION_USUARIO:         { color: '#e17055', iconName: 'close',      label: 'Eliminación' },
  DISCREPANCIA_DATOS:          { color: '#fdcb6e', iconName: 'info',       label: 'Discrepancia' },
  ENTRADA_RESERVADA:           { color: '#304ffe', iconName: 'ticket',     label: 'Reserva' },
  ENTRADA_TRANSFERIDA_ORIGEN:  { color: '#8b5cf6', iconName: 'arrow-r',    label: 'Transf. enviada' },
  ENTRADA_TRANSFERIDA_DESTINO: { color: '#8b5cf6', iconName: 'arrow-left', label: 'Transf. recibida' },
  REEMBOLSO_SOLICITADO:        { color: '#fdcb6e', iconName: 'refresh',    label: 'Reembolso pedido' },
  REEMBOLSO_APROBADO:          { color: '#00b894', iconName: 'check',      label: 'Reembolso ok' },
  REEMBOLSO_RECHAZADO:         { color: '#e17055', iconName: 'close',      label: 'Reembolso no' },
};

// Convierte el tipoEvento crudo en algo legible si no tiene meta personalizada.
const prettifyType = (t) =>
  String(t || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());

export default function AdminDashboard() {
  const [metrics, setMetrics]       = useState(null);
  const [bMetrics, setBMetrics]     = useState(null);
  const [resumen, setResumen]       = useState(null);
  const [auditoria, setAuditoria]   = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [m, bm, r, a] = await Promise.allSettled([
        api.get('/admin/metricas'),
        api.get('/backoffice/metricas'),
        api.get('/admin/usuarios/resumen'),
        api.get('/admin/auditoria'),
      ]);
      if (m.status  === 'fulfilled') setMetrics(m.value.data);
      if (bm.status === 'fulfilled') setBMetrics(bm.value.data);
      if (r.status  === 'fulfilled') setResumen(r.value.data);
      if (a.status  === 'fulfilled') setAuditoria(Array.isArray(a.value.data) ? a.value.data : []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Skeleton />;

  const entryData = [
    { label: 'Disponibles',  value: bMetrics?.entradasDisponibles  ?? 0, color: '#00b894' },
    { label: 'Reservadas',   value: bMetrics?.entradasReservadas   ?? 0, color: '#fdcb6e' },
    { label: 'Pagadas',      value: bMetrics?.entradasPagadas      ?? 0, color: 'var(--accent)' },
    { label: 'Expiradas',    value: bMetrics?.entradasExpiradas    ?? 0, color: '#636e72' },
    { label: 'Reembolsadas', value: bMetrics?.entradasReembolsadas ?? 0, color: '#e17055' },
  ].filter(d => d.value > 0);

  const roleColors = ['var(--accent)', '#00b894', '#fdcb6e', '#e17055', '#a29bfe'];
  const roleData = resumen?.porRol
    ? Object.entries(resumen.porRol).filter(([, v]) => v > 0)
        .map(([k, v], i) => ({ label: k, value: v, color: roleColors[i % roleColors.length] }))
    : [];

  const recentAudit = [...auditoria]
    .sort((a, b) => new Date(b.timestampEvento) - new Date(a.timestampEvento))
    .slice(0, 10);

  const disc = bMetrics?.discrepanciasSinResolver ?? 0;
  const reem = bMetrics?.reembolsosPendientes ?? 0;

  return (
    <div>
      {/* KPI row */}
      <div style={s.kpiGrid}>
        <StatCard label="Total Usuarios"       value={metrics?.totalUsuarios}           sub={`${resumen?.activos ?? 0} activos`}       color="var(--accent)"  icon={<Icon name="users"   size={16} />} />
        <StatCard label="Usuarios Bloqueados"  value={resumen?.bloqueados ?? 0}          sub={`${resumen?.verificados ?? 0} verificados`} color="#e17055"        icon={<Icon name="shield"  size={16} />} alert={(resumen?.bloqueados ?? 0) > 0} />
        <StatCard label="Total Entradas"       value={metrics?.totalEntradas}            sub={`${metrics?.entradasPagadas ?? 0} pagadas`}  color="#00b894"        icon={<Icon name="ticket"  size={16} />} />
        <StatCard label="Pollas Activas"       value={metrics?.totalPollas}              sub="en sistema"                                color="#a29bfe"        icon={<Icon name="trophy"  size={16} />} />
        <StatCard label="Láminas Álbum"        value={metrics?.totalLaminas}             sub="total generadas"                           color="#fdcb6e"        icon={<Icon name="cards"   size={16} />} />
        <StatCard label="Eventos Auditoría"    value={metrics?.totalEventosAuditoria}    sub={`${disc} discrepancias`}                   color={disc > 0 ? '#e17055' : '#636e72'} icon={<Icon name="search" size={16} />} alert={disc > 0} />
      </div>

      {/* Alerts */}
      {(disc > 0 || reem > 0) && (
        <div style={s.alertsRow}>
          {disc > 0 && (
            <div style={{ ...s.alertChip, borderColor: '#e17055', color: '#e17055', background: '#e1705510' }}>
              ⚠ {disc} discrepancia{disc !== 1 ? 's' : ''} sin resolver — ir a Monitoreo
            </div>
          )}
          {reem > 0 && (
            <div style={{ ...s.alertChip, borderColor: '#fdcb6e', color: '#e67e22', background: '#fdcb6e10' }}>
              ↩ {reem} reembolso{reem !== 1 ? 's' : ''} pendiente{reem !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Charts row */}
      <div style={s.chartsRow}>
        {/* Entry distribution */}
        <div style={s.chartCard}>
          <div style={s.cardTitle}>Distribución de Entradas</div>
          {entryData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <DonutChart data={entryData} size={130} thickness={24} />
              <div style={s.legend}>
                {entryData.map(d => (
                  <div key={d.label} style={s.legendRow}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={s.legendLabel}>{d.label}</span>
                    <span style={s.legendVal}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyChart label="Sin datos de entradas" />}
        </div>

        {/* Role distribution */}
        <div style={s.chartCard}>
          <div style={s.cardTitle}>Usuarios por Rol</div>
          {roleData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <DonutChart data={roleData} size={130} thickness={24} />
              <div style={s.legend}>
                {roleData.map(d => (
                  <div key={d.label} style={s.legendRow}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={s.legendLabel}>{d.label}</span>
                    <span style={s.legendVal}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyChart label="Sin datos de roles" />}
        </div>

        {/* Health bars */}
        <div style={s.chartCard}>
          <div style={s.cardTitle}>Salud del Sistema</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <HealthBar label="Usuarios activos"     value={resumen?.activos}           total={metrics?.totalUsuarios}  color="var(--accent)" />
            <HealthBar label="Correos verificados"  value={resumen?.verificados}        total={metrics?.totalUsuarios}  color="#00b894" />
            <HealthBar label="Entradas pagadas"     value={metrics?.entradasPagadas}    total={metrics?.totalEntradas}  color="#a29bfe" />
            <HealthBar label="Reembolsos pend."     value={reem}                        total={Math.max(reem, 5)}       color="#fdcb6e" warn />
            <HealthBar label="Discrepancias"        value={disc}                        total={Math.max(disc, 5)}       color="#e17055" warn />
          </div>
        </div>
      </div>

      {/* Recent audit */}
      <div style={s.auditCard}>
        <div style={s.cardTitle}>Actividad Reciente</div>
        {recentAudit.length === 0
          ? <p style={{ color: 'var(--ink-4)', fontSize: 14 }}>Sin eventos recientes.</p>
          : recentAudit.map((e, i) => <AuditRow key={e.id} event={e} last={i === recentAudit.length - 1} />)
        }
      </div>
    </div>
  );
}

function HealthBar({ label, value, total, color, warn }) {
  const v = value ?? 0;
  const t = total ?? 0;
  const pct = t > 0 ? Math.min(100, Math.round((v / t) * 100)) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: 'var(--ink-3)' }}>{label}</span>
        <span style={{ color: warn && v > 0 ? '#e17055' : 'var(--ink)', fontWeight: 600 }}>{v}</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: 'var(--line)' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: color, transition: 'width .5s' }} />
      </div>
    </div>
  );
}

function AuditRow({ event, last }) {
  const meta = EVENT_META[event.tipoEvento]
    || { color: 'var(--ink-4)', iconName: 'info', label: prettifyType(event.tipoEvento) };
  const ts = event.timestampEvento
    ? new Date(event.timestampEvento).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
    : '—';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '28px 160px minmax(0, 1fr) 110px 70px',
      alignItems: 'center', gap: 14,
      padding: '10px 0',
      borderBottom: last ? 'none' : '1px solid var(--line)',
      fontSize: 13,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: meta.color + '1a', color: meta.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}><Icon name={meta.iconName || 'info'} size={13} /></div>

      <span
        title={event.tipoEvento}
        style={{
          fontSize: 10, fontWeight: 700, color: meta.color,
          textTransform: 'uppercase', letterSpacing: '.06em',
          background: meta.color + '14',
          padding: '4px 10px', borderRadius: 999,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          justifySelf: 'start', maxWidth: '100%',
        }}
      >
        {meta.label}
      </span>

      <div
        title={event.detalle || ''}
        style={{
          color: 'var(--ink-2)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {event.detalle || '—'}
      </div>

      <div style={{ fontSize: 11, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>{ts}</div>

      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textAlign: 'center',
        color: event.estadoResultado === 'OK' ? '#00b894' : '#e17055',
        background: event.estadoResultado === 'OK' ? '#00b89412' : '#e1705512',
        padding: '3px 9px', borderRadius: 99,
        justifySelf: 'end',
      }}>{event.estadoResultado || '—'}</div>
    </div>
  );
}

function EmptyChart({ label }) {
  return <div style={{ color: 'var(--ink-4)', fontSize: 13, padding: '10px 0' }}>{label}</div>;
}

function Skeleton() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ height: 110, borderRadius: 'var(--radius)', background: 'var(--bg-elev)', border: '1px solid var(--line)', opacity: 0.6 }} />
        ))}
      </div>
    </div>
  );
}

const s = {
  kpiGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 16,
  },
  alertsRow: {
    display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16,
  },
  alertChip: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 13, fontWeight: 600, padding: '7px 14px',
    borderRadius: 99, border: '1px solid', cursor: 'default',
  },
  chartsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 16,
  },
  chartCard: {
    background: 'var(--bg-elev)', borderRadius: 'var(--radius)',
    padding: '18px 20px', border: '1px solid var(--line)',
  },
  cardTitle: {
    fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 14, letterSpacing: '.01em',
  },
  legend: { display: 'flex', flexDirection: 'column', gap: 7, flex: 1, minWidth: 0 },
  legendRow: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 },
  legendLabel: { color: 'var(--ink-3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  legendVal: { color: 'var(--ink)', fontWeight: 700, fontSize: 12 },
  auditCard: {
    background: 'var(--bg-elev)', borderRadius: 'var(--radius)',
    padding: '18px 20px', border: '1px solid var(--line)',
  },
};
