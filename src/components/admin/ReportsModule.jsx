import React, { useState } from 'react';
import api from '../../services/apiClient';
import Icon from '../ui/Icon';

const REPORTS = [
  {
    id: 'usuarios',
    label: 'Usuarios',
    desc: 'Lista completa de usuarios: nombre, correo, rol, estado, verificación y fecha de registro.',
    endpoint: '/admin/usuarios',
    iconName: 'users',
  },
  {
    id: 'auditoria',
    label: 'Auditoría',
    desc: 'Todos los eventos de auditoría del sistema con timestamps, módulo, estado y usuario.',
    endpoint: '/admin/auditoria',
    iconName: 'shield',
  },
  {
    id: 'metricas-admin',
    label: 'Métricas Admin',
    desc: 'Totales generales: usuarios, entradas, pollas, láminas, notificaciones y eventos.',
    endpoint: '/admin/metricas',
    iconName: 'grid',
  },
  {
    id: 'metricas-backoffice',
    label: 'Métricas Backoffice',
    desc: 'Métricas operativas: entradas por estado, reembolsos pendientes, discrepancias sin resolver.',
    endpoint: '/backoffice/metricas',
    iconName: 'settings',
  },
  {
    id: 'discrepancias',
    label: 'Discrepancias',
    desc: 'Registro de discrepancias de datos detectadas: campo, tabla, descripción y estado de resolución.',
    endpoint: '/backoffice/discrepancias',
    iconName: 'info',
  },
  {
    id: 'logins-fallidos',
    label: 'Logins Fallidos',
    desc: 'Intentos de autenticación fallidos para análisis de compliance y seguridad.',
    endpoint: '/backoffice/compliance/logins-fallidos',
    iconName: 'x-circle',
    transform: data => data?.loginsFallidos ?? data,
  },
  {
    id: 'resumen-usuarios',
    label: 'Resumen de Usuarios',
    desc: 'Conteos por rol, estado y verificación de la base de usuarios.',
    endpoint: '/admin/usuarios/resumen',
    iconName: 'list',
  },
];

export default function ReportsModule() {
  const [selected, setSelected] = useState(null);
  const [format, setFormat]     = useState('csv');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const generate = async () => {
    if (!selected) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res  = await api.get(selected.endpoint);
      const raw  = selected.transform ? selected.transform(res.data) : res.data;
      const name = `mundialHub_${selected.id}_${new Date().toISOString().slice(0, 10)}`;

      if (format === 'json') {
        downloadBlob(new Blob([JSON.stringify(raw, null, 2)], { type: 'application/json' }), `${name}.json`);
      } else {
        downloadBlob(new Blob([toCSV(raw)], { type: 'text/csv;charset=utf-8;' }), `${name}.csv`);
      }
      setSuccess(`Reporte "${selected.label}" descargado en formato ${format.toUpperCase()}.`);
      setTimeout(() => setSuccess(''), 6000);
    } catch {
      setError('No se pudo generar el reporte. Verifica que el backend esté activo y vuelve a intentarlo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={s.intro}>
        Genera y descarga reportes del sistema en CSV o JSON. Los datos se obtienen en tiempo real del backend.
      </div>

      <div style={s.layout}>
        {/* Left: report list */}
        <div>
          <div style={s.sectionLabel}>Tipo de reporte</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {REPORTS.map(r => (
              <button key={r.id} style={{ ...s.reportBtn, ...(selected?.id === r.id ? s.reportBtnActive : {}) }} onClick={() => setSelected(r)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: selected?.id === r.id ? 'var(--accent)' : 'var(--ink-3)', flexShrink: 0, display: 'flex', marginTop: 2 }}>
                    <Icon name={r.iconName} size={16} />
                  </span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: selected?.id === r.id ? 'var(--accent)' : 'var(--ink)', marginBottom: 2 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: config */}
        <div style={s.configPanel}>
          {!selected ? (
            <div style={s.emptyConfig}>
              <span style={{ color: 'var(--ink-4)', display: 'flex', marginBottom: 12 }}><Icon name="arrow-left" size={32} /></span>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>Selecciona un reporte</div>
              <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>Elige un tipo de reporte de la lista para configurar y descargar.</div>
            </div>
          ) : (
            <>
              <div style={s.previewCard}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent)', display: 'flex', flexShrink: 0, marginTop: 2 }}>
                    <Icon name={selected.iconName} size={22} />
                  </span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{selected.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 8 }}>{selected.desc}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
                      GET {selected.endpoint}
                    </div>
                  </div>
                </div>
              </div>

              <div style={s.formatSection}>
                <div style={s.sectionLabel}>Formato de exportación</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['csv', 'json'].map(f => (
                    <button key={f} style={{ ...s.formatBtn, ...(format === f ? s.formatBtnActive : {}) }} onClick={() => setFormat(f)}>
                      {f === 'csv' ? '📄 CSV' : '{ } JSON'}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 8 }}>
                  {format === 'csv' ? 'Compatible con Excel, Google Sheets y herramientas de análisis.' : 'Ideal para integración con otras aplicaciones o procesamiento programático.'}
                </div>
              </div>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#ffe5e5', color: '#c0392b', fontSize: 13, marginBottom: 14 }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#00b89414', color: '#00b894', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                  ✓ {success}
                </div>
              )}

              <button style={{ ...s.generateBtn, opacity: loading ? 0.7 : 1 }} onClick={generate} disabled={loading}>
                {loading ? 'Generando reporte…' : `Descargar ${selected.label} (.${format})`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function toCSV(data) {
  if (!data) return 'Sin datos';
  if (Array.isArray(data)) {
    if (data.length === 0) return 'Sin registros';
    const keys = Object.keys(data[0]);
    const escape = v => {
      if (v === null || v === undefined) return '';
      const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [keys.join(','), ...data.map(row => keys.map(k => escape(row[k])).join(','))].join('\n');
  }
  return Object.entries(data).map(([k, v]) => `${k},${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const s = {
  intro:         { fontSize: 14, color: 'var(--ink-3)', marginBottom: 22, lineHeight: 1.5 },
  layout:        { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' },
  sectionLabel:  { fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 },
  reportBtn:     { padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--bg-elev)', cursor: 'pointer', transition: 'all .15s', width: '100%' },
  reportBtnActive:{ border: '1px solid var(--accent)', background: 'var(--accent-soft)' },
  configPanel:   { background: 'var(--bg-elev)', borderRadius: 'var(--radius)', padding: '24px', border: '1px solid var(--line)', minHeight: 300 },
  emptyConfig:   { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 260, textAlign: 'center' },
  previewCard:   { padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-soft)', border: '1px solid var(--line)', marginBottom: 20 },
  formatSection: { marginBottom: 18 },
  formatBtn:     { padding: '8px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--bg-soft)', color: 'var(--ink-3)', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  formatBtnActive:{ background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' },
  generateBtn:   { width: '100%', padding: '13px 0', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
};
