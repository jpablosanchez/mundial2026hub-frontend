import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getReembolsosPendientes,
  getAllReembolsos,
  aprobarReembolso,
  rechazarReembolso,
} from '../../services/entradaService';
import { useToast } from '../../context/ToastContext';

const ESTADO_COLOR = {
  PENDIENTE: '#fdcb6e',
  APROBADO:  '#00b894',
  RECHAZADO: '#e17055',
};

const FILTROS = ['PENDIENTES', 'TODOS', 'APROBADO', 'RECHAZADO'];

export default function RefundsModule() {
  const { showToast } = useToast();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filtro, setFiltro]     = useState('PENDIENTES');
  const [actionItem, setActionItem] = useState(null);
  const [action, setAction]     = useState('');
  const [txn, setTxn]           = useState('');
  const [motivo, setMotivo]     = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = filtro === 'PENDIENTES'
        ? await getReembolsosPendientes()
        : await getAllReembolsos();
      const arr = Array.isArray(res.data) ? res.data : [];
      setItems(arr);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (filtro === 'PENDIENTES' || filtro === 'TODOS') return items;
    return items.filter(r => r.estado === filtro);
  }, [items, filtro]);

  const openAction = (item, act) => {
    setActionItem(item);
    setAction(act);
    setTxn(`RFN-${Date.now()}`);
    setMotivo('');
  };
  const closeModal = () => { setActionItem(null); setAction(''); };

  const confirmAction = async () => {
    if (!actionItem) return;
    setActionLoading(true);
    try {
      if (action === 'aprobar') {
        if (!txn.trim()) { showToast('Indica la referencia de transacción.'); setActionLoading(false); return; }
        await aprobarReembolso(actionItem.id, txn.trim());
        showToast('Reembolso aprobado — correo enviado al usuario.');
      } else {
        await rechazarReembolso(actionItem.id, motivo.trim() || null);
        showToast('Reembolso rechazado — correo enviado al usuario.');
      }
      closeModal();
      await load();
    } catch (e) {
      showToast(e?.response?.data?.mensaje || 'Error al procesar el reembolso.');
    } finally {
      setActionLoading(false);
    }
  };

  const countPendientes = items.filter(r => r.estado === 'PENDIENTE').length;

  return (
    <div>
      {/* Tabs */}
      <div style={s.tabs}>
        {FILTROS.map(f => (
          <button
            key={f}
            style={{ ...s.tab, ...(filtro === f ? s.tabActive : {}) }}
            onClick={() => setFiltro(f)}
          >
            {f === 'PENDIENTES' ? 'Pendientes' : f === 'TODOS' ? 'Todos' : f === 'APROBADO' ? 'Aprobados' : 'Rechazados'}
            {f === 'PENDIENTES' && countPendientes > 0 && filtro !== 'PENDIENTES' && (
              <span style={s.badge}>{countPendientes}</span>
            )}
          </button>
        ))}
        <button style={s.refresh} onClick={load}>Actualizar</button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--ink-4)', padding: '20px 0' }}>Cargando reembolsos…</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Sin reembolsos {filtro === 'PENDIENTES' ? 'pendientes' : ''}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>
            Las solicitudes nuevas aparecerán aquí.
          </div>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>ID</th>
                <th style={s.th}>Entrada</th>
                <th style={s.th}>Usuario</th>
                <th style={s.th}>Motivo</th>
                <th style={s.th}>Solicitud</th>
                <th style={s.th}>Estado</th>
                <th style={s.th}>Resolución</th>
                <th style={s.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const color = ESTADO_COLOR[r.estado] || '#636e72';
                return (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-soft)' }}>
                    <td style={{ ...s.td, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
                      {r.id}
                    </td>
                    <td style={s.td}>#{r.idEntrada}</td>
                    <td style={s.td}>#{r.idUsuario}</td>
                    <td style={{ ...s.td, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.motivo || '—'}
                    </td>
                    <td style={{ ...s.td, fontSize: 11, color: 'var(--ink-4)' }}>
                      {r.fechaSolicitud ? new Date(r.fechaSolicitud).toLocaleString('es-CO') : '—'}
                    </td>
                    <td style={s.td}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '.04em',
                        color, background: color + '1a',
                        padding: '3px 10px', borderRadius: 999,
                      }}>{r.estado}</span>
                    </td>
                    <td style={{ ...s.td, fontSize: 11, color: 'var(--ink-4)' }}>
                      {r.fechaResolucion ? new Date(r.fechaResolucion).toLocaleString('es-CO') : '—'}
                    </td>
                    <td style={s.td}>
                      {r.estado === 'PENDIENTE' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Pill label="Aprobar" color="#00b894" onClick={() => openAction(r, 'aprobar')} />
                          <Pill label="Rechazar" color="#e17055" onClick={() => openAction(r, 'rechazar')} />
                        </div>
                      ) : r.idTransaccionReembolso ? (
                        <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
                          {r.idTransaccionReembolso}
                        </span>
                      ) : <span style={{ color: 'var(--ink-4)' }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {actionItem && (
        <Overlay onClose={closeModal}>
          <div style={s.modalTitle}>
            {action === 'aprobar' ? 'Aprobar reembolso' : 'Rechazar reembolso'}
          </div>
          <div style={s.modalCard}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Reembolso #{actionItem.id}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 3 }}>
              Entrada #{actionItem.idEntrada} · Usuario #{actionItem.idUsuario}
            </div>
            {actionItem.motivo && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-3)' }}>
                <strong>Motivo del usuario:</strong> {actionItem.motivo}
              </div>
            )}
          </div>

          {action === 'aprobar' ? (
            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Referencia de transacción de reembolso</label>
              <input
                style={s.input}
                value={txn}
                onChange={e => setTxn(e.target.value)}
                placeholder="RFN-12345"
              />
              <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 8 }}>
                Se notificará al usuario por correo y se devolverá la entrada al pool.
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Motivo de rechazo (opcional)</label>
              <textarea
                style={{ ...s.input, minHeight: 80, resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder="Ej: La política de reembolso aplica solo hasta 48h antes del partido."
              />
              <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 8 }}>
                El usuario recibirá un correo con el motivo de rechazo.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button style={s.cancelBtn} onClick={closeModal} disabled={actionLoading}>Cancelar</button>
            <button
              style={{
                ...s.confirmBtn,
                background: action === 'aprobar' ? '#00b894' : '#e17055',
                opacity: actionLoading ? 0.7 : 1,
              }}
              onClick={confirmAction}
              disabled={actionLoading}
            >
              {actionLoading ? 'Procesando…' : (action === 'aprobar' ? 'Aprobar y notificar' : 'Rechazar y notificar')}
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function Pill({ label, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
      border: `1px solid ${color}44`, background: color + '14', color,
      borderRadius: 999, whiteSpace: 'nowrap', transition: 'background .12s',
      fontFamily: 'var(--font-sans)',
    }}>{label}</button>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(3px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-elev)', borderRadius: 'var(--radius)',
        padding: '28px 30px', width: 460,
        maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,.22)',
      }}>{children}</div>
    </div>
  );
}

const s = {
  tabs:       { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' },
  tab:        { padding: '7px 16px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--bg-elev)', color: 'var(--ink-3)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' },
  tabActive:  { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' },
  badge:      { marginLeft: 6, background: 'rgba(255,255,255,.25)', padding: '1px 6px', borderRadius: 999, fontSize: 10 },
  refresh:    { marginLeft: 'auto', padding: '7px 16px', borderRadius: 999, border: '1px solid var(--accent)44', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' },
  empty:      { textAlign: 'center', padding: '50px 0', color: 'var(--ink-3)' },
  tableWrap:  { background: 'var(--bg-elev)', borderRadius: 'var(--radius)', border: '1px solid var(--line)', overflowX: 'auto' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:         { padding: '11px 13px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-4)', background: 'var(--bg-soft)', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap', fontSize: 11 },
  td:         { padding: '10px 13px', color: 'var(--ink)', borderBottom: '1px solid var(--line)', verticalAlign: 'middle' },
  modalTitle: { fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 },
  modalCard:  { padding: '12px 14px', borderRadius: 10, background: 'var(--bg-soft)', marginBottom: 16 },
  label:      { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 },
  input:      { width: '100%', padding: '9px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--bg-elev)', color: 'var(--ink)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-sans)' },
  cancelBtn:  { padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink-3)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)' },
  confirmBtn: { padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' },
};
