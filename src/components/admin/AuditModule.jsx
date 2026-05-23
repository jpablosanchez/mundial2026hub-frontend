import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/apiClient';
import Icon from '../ui/Icon';

const EVENT_TYPES = [
  'TODOS',
  'LOGIN', 'LOGOUT',
  'BLOQUEO_CUENTA', 'DESBLOQUEO_CUENTA', 'CAMBIO_ROL', 'ELIMINACION_USUARIO',
  'DISCREPANCIA_DATOS',
  'ENTRADA_RESERVADA',
  'ENTRADA_TRANSFERIDA_ORIGEN', 'ENTRADA_TRANSFERIDA_DESTINO',
  'REEMBOLSO_SOLICITADO', 'REEMBOLSO_APROBADO', 'REEMBOLSO_RECHAZADO',
];
const ESTADOS     = ['TODOS', 'OK', 'ERROR'];
const PAGE_SIZE   = 20;

const TYPE_META = {
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

const prettifyType = (t) =>
  String(t || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());

const getMeta = (tipo) =>
  TYPE_META[tipo] || { color: 'var(--ink-4)', iconName: 'info', label: prettifyType(tipo) };

export default function AuditModule() {
  const [events, setEvents]               = useState([]);
  const [loginsFallidos, setLoginsFallidos] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [tab, setTab]                     = useState('all');
  const [view, setView]                   = useState('table');
  const [search, setSearch]               = useState('');
  const [typeFilter, setTypeFilter]       = useState('TODOS');
  const [estadoFilter, setEstadoFilter]   = useState('TODOS');
  const [page, setPage]                   = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [a, lf] = await Promise.allSettled([
        api.get('/admin/auditoria'),
        api.get('/backoffice/compliance/logins-fallidos'),
      ]);
      if (a.status  === 'fulfilled') setEvents(Array.isArray(a.value.data) ? a.value.data : []);
      if (lf.status === 'fulfilled') setLoginsFallidos(lf.value.data?.loginsFallidos || []);
      setLoading(false);
    })();
  }, []);

  const source = tab === 'all' ? events : loginsFallidos;

  const filtered = useMemo(() => {
    let list = [...source].sort((a, b) => new Date(b.timestampEvento) - new Date(a.timestampEvento));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        (e.detalle || '').toLowerCase().includes(q) ||
        (e.tipoEvento || '').toLowerCase().includes(q) ||
        (e.moduloOrigen || '').toLowerCase().includes(q) ||
        String(e.idUsuario || '').includes(q) ||
        (e.idCorrelacion || '').toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'TODOS')   list = list.filter(e => e.tipoEvento === typeFilter);
    if (estadoFilter !== 'TODOS') list = list.filter(e => e.estadoResultado === estadoFilter);
    return list;
  }, [source, search, typeFilter, estadoFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const rows = filtered.map(e =>
      [e.id, e.tipoEvento, e.moduloOrigen, `"${(e.detalle || '').replace(/"/g, '""')}"`,
       e.estadoResultado, e.idUsuario, e.ipOrigen, e.timestampEvento].join(',')
    );
    const blob = new Blob([['ID,Tipo,Modulo,Detalle,Estado,UsuarioID,IP,Timestamp', ...rows].join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'auditoria.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Source tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        <SourceTab label={`Todos los eventos (${events.length})`}       active={tab === 'all'}    color="var(--accent)" onClick={() => { setTab('all');    setPage(1); }} />
        <SourceTab label={`Logins fallidos (${loginsFallidos.length})`} active={tab === 'logins'} color="#e17055"       onClick={() => { setTab('logins'); setPage(1); }} />
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <input
          style={s.searchInput}
          placeholder="Buscar en auditoría (evento, detalle, usuario, correlación)…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select style={s.select} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
          {EVENT_TYPES.map(t => (
            <option key={t} value={t}>
              {t === 'TODOS' ? 'Todos los tipos' : (TYPE_META[t]?.label || prettifyType(t))}
            </option>
          ))}
        </select>
        <select style={s.select} value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1); }}>
          {ESTADOS.map(e => <option key={e}>{e}</option>)}
        </select>
        <button style={s.viewToggle(view === 'table')}    onClick={() => setView('table')}>Tabla</button>
        <button style={s.viewToggle(view === 'timeline')} onClick={() => setView('timeline')}>Timeline</button>
        <button style={s.exportBtn} onClick={exportCSV}>Exportar CSV</button>
      </div>

      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 10 }}>
        {filtered.length} evento{filtered.length !== 1 ? 's' : ''} · Página {page}/{totalPages}
      </div>

      {loading && <div style={{ color: 'var(--ink-4)', padding: '20px 0' }}>Cargando auditoría…</div>}

      {!loading && view === 'table' && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['#', 'Tipo', 'Módulo', 'Detalle', 'Usuario', 'Estado', 'IP', 'Timestamp'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((e, i) => {
                const meta = getMeta(e.tipoEvento);
                return (
                  <tr key={e.id} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-soft)' }}>
                    <td style={{ ...s.td, fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{e.id}</td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                          background: meta.color + '1a', color: meta.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}><Icon name={meta.iconName} size={12} /></div>
                        <span title={e.tipoEvento} style={{
                          fontSize: 10, fontWeight: 700, color: meta.color,
                          textTransform: 'uppercase', letterSpacing: '.06em',
                          background: meta.color + '14',
                          padding: '4px 10px', borderRadius: 999,
                          whiteSpace: 'nowrap',
                        }}>{meta.label}</span>
                      </div>
                    </td>
                    <td style={{ ...s.td, fontSize: 11, color: 'var(--ink-4)' }}>{e.moduloOrigen || '—'}</td>
                    <td
                      title={e.detalle || ''}
                      style={{ ...s.td, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >{e.detalle || '—'}</td>
                    <td style={{ ...s.td, fontSize: 11, textAlign: 'center' }}>{e.idUsuario ?? '—'}</td>
                    <td style={s.td}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '.04em',
                        padding: '3px 9px', borderRadius: 99,
                        color: e.estadoResultado === 'OK' ? '#00b894' : '#e17055',
                        background: e.estadoResultado === 'OK' ? '#00b89412' : '#e1705512',
                      }}>{e.estadoResultado || '—'}</span>
                    </td>
                    <td style={{ ...s.td, fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{e.ipOrigen || '—'}</td>
                    <td style={{ ...s.td, fontSize: 11, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>
                      {e.timestampEvento ? new Date(e.timestampEvento).toLocaleString('es-CO') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && view === 'timeline' && (
        <div style={{ paddingLeft: 6 }}>
          {pageRows.map((e, i) => {
            const meta = getMeta(e.tipoEvento);
            const last = i === pageRows.length - 1;
            return (
              <div key={e.id} style={{ display: 'flex', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: meta.color + '1a', color: meta.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Icon name={meta.iconName} size={14} /></div>
                  {!last && <div style={{ width: 2, flex: 1, minHeight: 14, background: 'var(--line)', margin: '2px 0' }} />}
                </div>
                <div style={{ paddingBottom: 14, flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span title={e.tipoEvento} style={{
                      fontSize: 10, fontWeight: 700, color: meta.color,
                      textTransform: 'uppercase', letterSpacing: '.06em',
                      background: meta.color + '14',
                      padding: '4px 10px', borderRadius: 999,
                      whiteSpace: 'nowrap',
                    }}>{meta.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                      {e.timestampEvento ? new Date(e.timestampEvento).toLocaleString('es-CO') : '—'}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '.04em',
                      padding: '3px 9px', borderRadius: 99,
                      color: e.estadoResultado === 'OK' ? '#00b894' : '#e17055',
                      background: e.estadoResultado === 'OK' ? '#00b89412' : '#e1705512',
                    }}>
                      {e.estadoResultado}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 3 }}>{e.detalle}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    {e.moduloOrigen && <span>Módulo: {e.moduloOrigen}</span>}
                    {e.idUsuario    && <span>Usuario: #{e.idUsuario}</span>}
                    {e.ipOrigen     && <span>IP: {e.ipOrigen}</span>}
                    {e.idCorrelacion && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>#{e.idCorrelacion.slice(0, 12)}…</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={s.pages}>
          <button style={s.pgBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Anterior</button>
          {[...Array(Math.min(totalPages, 9))].map((_, i) => (
            <button key={i} style={{ ...s.pgBtn, ...(page === i + 1 ? s.pgActive : {}) }} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          {totalPages > 9 && page < totalPages && (
            <button style={{ ...s.pgBtn, ...(page === totalPages ? s.pgActive : {}) }} onClick={() => setPage(totalPages)}>{totalPages}</button>
          )}
          <button style={s.pgBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente ›</button>
        </div>
      )}
    </div>
  );
}

function SourceTab({ label, active, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: 'var(--radius-sm)',
      border: active ? `1px solid ${color}` : '1px solid var(--line)',
      background: active ? color : 'var(--bg-elev)',
      color: active ? '#fff' : 'var(--ink-3)',
      fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer',
    }}>{label}</button>
  );
}

const s = {
  toolbar:     { display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: 220, padding: '9px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--bg-elev)', color: 'var(--ink)', fontSize: 13, outline: 'none' },
  select:      { padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--bg-elev)', color: 'var(--ink)', fontSize: 13, cursor: 'pointer', outline: 'none' },
  viewToggle:  active => ({
    padding: '9px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13, cursor: 'pointer',
    border: '1px solid var(--line)',
    background: active ? 'var(--accent)' : 'var(--bg-elev)',
    color: active ? '#fff' : 'var(--ink-3)', fontWeight: active ? 700 : 500,
  }),
  exportBtn:  { padding: '9px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  tableWrap:  { background: 'var(--bg-elev)', borderRadius: 'var(--radius)', border: '1px solid var(--line)', overflowX: 'auto' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:         { padding: '11px 13px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-4)', background: 'var(--bg-soft)', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap', fontSize: 11 },
  td:         { padding: '9px 13px', color: 'var(--ink)', borderBottom: '1px solid var(--line)', verticalAlign: 'middle' },
  pages:      { display: 'flex', gap: 4, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' },
  pgBtn:      { padding: '6px 11px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-elev)', color: 'var(--ink-3)', fontSize: 13, cursor: 'pointer' },
  pgActive:   { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)', fontWeight: 700 },
};
