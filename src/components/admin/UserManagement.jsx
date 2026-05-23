import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

const ROLES   = ['TODOS', 'AFICIONADO', 'OPERADOR', 'SOPORTE', 'COMPLIANCE', 'ADMIN'];
const ESTADOS = ['TODOS', 'ACTIVO', 'BLOQUEADO'];
const PAGE_SIZE = 15;

const ROL_COLOR = {
  ADMIN:      '#e17055',
  COMPLIANCE: '#a29bfe',
  SOPORTE:    '#00b894',
  OPERADOR:   '#fdcb6e',
  AFICIONADO: '#636e72',
};

export default function UserManagement() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [rolFilter, setRolFilter] = useState('TODOS');
  const [estadoFilter, setEstadoFilter] = useState('TODOS');
  const [sortBy, setSortBy]       = useState('id');
  const [sortDir, setSortDir]     = useState('desc');
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState(new Set());
  const [actionUser, setActionUser] = useState(null);
  const [action, setAction]       = useState('');
  const [newRole, setNewRole]     = useState('AFICIONADO');
  const [actionLoading, setActionLoading] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [userAudit, setUserAudit] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const { showToast: pushToast }  = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/usuarios');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('No se pudo cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = users;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        (u.nombres || '').toLowerCase().includes(q) ||
        (u.apellidos || '').toLowerCase().includes(q) ||
        (u.correoUsuario || '').toLowerCase().includes(q) ||
        String(u.id || '').includes(q)
      );
    }
    if (rolFilter !== 'TODOS')      list = list.filter(u => u.rol === rolFilter);
    if (estadoFilter === 'ACTIVO')  list = list.filter(u => u.estado === 1);
    if (estadoFilter === 'BLOQUEADO') list = list.filter(u => u.estado === 0);
    return [...list].sort((a, b) => {
      let va = a[sortBy] ?? ''; let vb = b[sortBy] ?? '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [users, search, rolFilter, estadoFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = col => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
    setPage(1);
  };

  const showToast = (msg) => pushToast(msg);

  const openAction = (user, act) => { setActionUser(user); setAction(act); setNewRole(user.rol || 'AFICIONADO'); };
  const closeModal = () => { setActionUser(null); setAction(''); };

  const confirmAction = async () => {
    if (!actionUser) return;
    setActionLoading(true);
    try {
      if (action === 'block')   await api.put(`/admin/usuarios/${actionUser.id}/bloquear`);
      if (action === 'unblock') await api.put(`/admin/usuarios/${actionUser.id}/desbloquear`);
      if (action === 'role')    await api.put(`/admin/usuarios/${actionUser.id}/rol?nuevoRol=${newRole}`);
      if (action === 'delete')  await api.delete(`/admin/usuarios/${actionUser.id}`);
      const msgs = { block: 'Usuario bloqueado', unblock: 'Usuario activado', role: `Rol cambiado a ${newRole}`, delete: 'Usuario eliminado' };
      showToast(msgs[action] || 'Acción ejecutada');
      await load();
      closeModal();
    } catch {
      showToast('Error al ejecutar acción');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetail = async u => {
    setDetailUser(u);
    setAuditLoading(true);
    try {
      const res = await api.get(`/admin/auditoria/usuario/${u.id}`);
      setUserAudit(Array.isArray(res.data) ? res.data : []);
    } catch { setUserAudit([]); }
    finally { setAuditLoading(false); }
  };

  const toggleSelect = id => setSelected(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const toggleAll = () =>
    setSelected(selected.size === pageRows.length ? new Set() : new Set(pageRows.map(u => u.id)));

  const exportCSV = () => {
    const rows = filtered.map(u =>
      [u.id, u.nombres, u.apellidos, u.correoUsuario, u.rol,
       u.estado === 1 ? 'ACTIVO' : 'BLOQUEADO',
       u.correoVerificado ? 'SI' : 'NO',
       u.fechaRegistro || ''].join(',')
    );
    downloadBlob(
      new Blob([['ID,Nombres,Apellidos,Correo,Rol,Estado,Verificado,Registro', ...rows].join('\n')], { type: 'text/csv' }),
      'usuarios.csv'
    );
  };

  const Th = ({ col, label }) => (
    <th style={{ ...s.th, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort(col)}>
      {label}
      <span style={{ marginLeft: 4, fontSize: 10, color: sortBy === col ? 'var(--accent)' : 'var(--line-2)' }}>
        {sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
      </span>
    </th>
  );

  return (
    <div>
      {/* Toolbar */}
      <div style={s.toolbar}>
        <input
          style={s.search}
          placeholder="Buscar por nombre, correo o ID…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select style={s.select} value={rolFilter} onChange={e => { setRolFilter(e.target.value); setPage(1); }}>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <select style={s.select} value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1); }}>
          {ESTADOS.map(e => <option key={e}>{e}</option>)}
        </select>
        <button style={s.btn('#00b894')} onClick={load}>Actualizar</button>
        <button style={s.btn('var(--accent)')} onClick={exportCSV}>Exportar CSV</button>
      </div>

      {/* Bulk */}
      {selected.size > 0 && (
        <div style={s.bulkBar}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.size} seleccionado{selected.size !== 1 ? 's' : ''}</span>
          <button style={s.ghostBtn} onClick={() => setSelected(new Set())}>Deseleccionar</button>
        </div>
      )}

      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 8 }}>
        {filtered.length} usuario{filtered.length !== 1 ? 's' : ''} · Página {page}/{totalPages}
      </div>

      {error && <div style={s.errorBanner}>{error}</div>}

      {loading
        ? <div style={{ color: 'var(--ink-4)', padding: '20px 0' }}>Cargando usuarios…</div>
        : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>
                    <input type="checkbox" checked={selected.size === pageRows.length && pageRows.length > 0} onChange={toggleAll} />
                  </th>
                  <Th col="id"     label="ID" />
                  <Th col="nombres" label="Usuario" />
                  <Th col="rol"    label="Rol" />
                  <Th col="estado" label="Estado" />
                  <Th col="correoVerificado" label="Email" />
                  <Th col="fechaRegistro" label="Registro" />
                  <Th col="intentos" label="Intentos" />
                  <th style={s.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((u, i) => {
                  const rc = ROL_COLOR[u.rol] || '#636e72';
                  return (
                    <tr key={u.id} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-soft)' }}>
                      <td style={s.td}><input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)} /></td>
                      <td style={{ ...s.td, fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{u.id}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                            background: rc + '20', color: rc,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 12,
                          }}>{(u.nombres?.[0] || '?').toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>
                              {u.nombres} {u.apellidos}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{u.correoUsuario}</div>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.04em', color: rc, background: rc + '1a', padding: '2px 8px', borderRadius: 99 }}>
                          {u.rol || '—'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: u.estado === 1 ? '#00b894' : '#e17055', background: u.estado === 1 ? '#00b89418' : '#e1705518', padding: '2px 8px', borderRadius: 99 }}>
                          {u.estado === 1 ? 'ACTIVO' : 'BLOQUEADO'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 13, color: u.correoVerificado ? '#00b894' : 'var(--ink-4)' }}>
                          {u.correoVerificado ? '✓' : '—'}
                        </span>
                      </td>
                      <td style={{ ...s.td, fontSize: 11, color: 'var(--ink-4)' }}>
                        {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString('es-CO') : '—'}
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <span style={{ fontSize: 12, color: u.intentos > 0 ? '#e17055' : 'var(--ink-4)', fontWeight: u.intentos > 0 ? 700 : 400 }}>
                          {u.intentos ?? 0}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
                          <Pill label="Ver"      color="var(--accent)" onClick={() => openDetail(u)} />
                          {u.estado === 1
                            ? <Pill label="Bloquear" color="#e17055" onClick={() => openAction(u, 'block')} />
                            : <Pill label="Activar"  color="#00b894" onClick={() => openAction(u, 'unblock')} />}
                          <Pill label="Rol"      color="#a29bfe" onClick={() => openAction(u, 'role')} />
                          <Pill label="Eliminar" color="#e17055" onClick={() => openAction(u, 'delete')} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={s.pages}>
          <button style={s.pgBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {[...Array(Math.min(totalPages, 7))].map((_, i) => (
            <button key={i} style={{ ...s.pgBtn, ...(page === i + 1 ? s.pgActive : {}) }} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          {totalPages > 7 && page < totalPages && (
            <button style={{ ...s.pgBtn, ...(page === totalPages ? s.pgActive : {}) }} onClick={() => setPage(totalPages)}>{totalPages}</button>
          )}
          <button style={s.pgBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}

      {/* Action modal */}
      {actionUser && (
        <Overlay onClose={closeModal}>
          <div style={s.modalTitle}>
            {{ block: '⊗ Bloquear usuario', unblock: '⊕ Activar usuario', delete: '⊘ Eliminar usuario', role: '⊞ Cambiar rol' }[action]}
          </div>
          <div style={s.modalUserCard}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{actionUser.nombres} {actionUser.apellidos}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{actionUser.correoUsuario}</div>
          </div>
          {action === 'role' && (
            <select style={{ ...s.select, width: '100%', marginBottom: 16 }} value={newRole} onChange={e => setNewRole(e.target.value)}>
              {ROLES.filter(r => r !== 'TODOS').map(r => <option key={r}>{r}</option>)}
            </select>
          )}
          {action === 'delete' && (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: '#e1705514', color: '#e17055', fontSize: 13, marginBottom: 16 }}>
              Esta acción es irreversible. El usuario será eliminado permanentemente del sistema.
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button style={s.cancelBtn} onClick={closeModal}>Cancelar</button>
            <button
              disabled={actionLoading}
              style={{ ...s.confirmBtn, background: ['delete', 'block'].includes(action) ? '#e17055' : 'var(--accent)', opacity: actionLoading ? 0.7 : 1 }}
              onClick={confirmAction}
            >{actionLoading ? 'Procesando…' : 'Confirmar'}</button>
          </div>
        </Overlay>
      )}

      {/* Detail modal */}
      {detailUser && (
        <Overlay onClose={() => { setDetailUser(null); setUserAudit([]); }} wide>
          <div style={s.modalTitle}>Perfil de Usuario</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            {[
              ['ID', detailUser.id],
              ['Rol', detailUser.rol],
              ['Nombre', `${detailUser.nombres || ''} ${detailUser.apellidos || ''}`.trim()],
              ['Correo', detailUser.correoUsuario],
              ['Estado', detailUser.estado === 1 ? 'ACTIVO' : 'BLOQUEADO'],
              ['Verificado', detailUser.correoVerificado ? 'Sí' : 'No'],
              ['Registro', detailUser.fechaRegistro ? new Date(detailUser.fechaRegistro).toLocaleString('es-CO') : '—'],
              ['Intentos fallidos', detailUser.intentos ?? 0],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>Auditoría del usuario</div>
            {auditLoading && <div style={{ color: 'var(--ink-4)', fontSize: 13 }}>Cargando…</div>}
            {!auditLoading && userAudit.length === 0 && <div style={{ color: 'var(--ink-4)', fontSize: 13 }}>Sin eventos registrados.</div>}
            {!auditLoading && userAudit.slice(0, 8).map(e => (
              <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '130px 160px 1fr', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--line)', fontSize: 12 }}>
                <span style={{ color: 'var(--ink-4)', fontSize: 11 }}>
                  {e.timestampEvento ? new Date(e.timestampEvento).toLocaleString('es-CO') : '—'}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: 11 }}>{e.tipoEvento}</span>
                <span style={{ color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.detalle}</span>
              </div>
            ))}
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

function Overlay({ children, onClose, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(3px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-elev)', borderRadius: 'var(--radius)',
        padding: '28px 30px', width: wide ? 680 : 420,
        maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,.22)',
      }}>{children}</div>
    </div>
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const s = {
  toolbar:   { display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
  search:    { flex: 1, minWidth: 220, padding: '9px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--bg-elev)', color: 'var(--ink)', fontSize: 13, outline: 'none' },
  select:    { padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--bg-elev)', color: 'var(--ink)', fontSize: 13, cursor: 'pointer', outline: 'none' },
  btn: c =>  ({ padding: '9px 16px', borderRadius: 'var(--radius-sm)', border: `1px solid ${c}44`, background: c + '14', color: c, fontSize: 13, fontWeight: 600, cursor: 'pointer' }),
  bulkBar:   { display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', marginBottom: 8, background: 'var(--accent-soft)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)33' },
  ghostBtn:  { padding: '5px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--bg-elev)', color: 'var(--ink-3)', fontSize: 12, cursor: 'pointer' },
  errorBanner:{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: '#ffe5e5', color: '#c0392b', fontSize: 13, marginBottom: 10 },
  tableWrap: { background: 'var(--bg-elev)', borderRadius: 'var(--radius)', border: '1px solid var(--line)', overflowX: 'auto' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:        { padding: '11px 13px', textAlign: 'left', fontWeight: 600, color: 'var(--ink-4)', background: 'var(--bg-soft)', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap', fontSize: 11 },
  td:        { padding: '9px 13px', color: 'var(--ink)', borderBottom: '1px solid var(--line)', verticalAlign: 'middle' },
  pages:     { display: 'flex', gap: 4, marginTop: 14, justifyContent: 'center' },
  pgBtn:     { padding: '6px 11px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-elev)', color: 'var(--ink-3)', fontSize: 13, cursor: 'pointer' },
  pgActive:  { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)', fontWeight: 700 },
  modalTitle:    { fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 },
  modalUserCard: { padding: '12px 14px', borderRadius: 10, background: 'var(--bg-soft)', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 2 },
  cancelBtn:  { padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink-3)', fontSize: 13, cursor: 'pointer' },
  confirmBtn: { padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
};
