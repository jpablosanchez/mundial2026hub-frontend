import React from 'react';

export default function StatCard({ label, value, sub, color = 'var(--accent)', icon, trend, alert }) {
  const trendUp = trend >= 0;
  return (
    <div style={{
      background: 'var(--bg-elev)',
      borderRadius: 'var(--radius)',
      padding: '18px 20px 16px',
      border: '1px solid var(--line)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', lineHeight: 1.3 }}>
          {label}
        </div>
        {icon && (
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: color + '1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, flexShrink: 0,
          }}>{icon}</div>
        )}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: alert ? '#e17055' : 'var(--ink)', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sub && <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{sub}</div>}
        {trend !== undefined && (
          <div style={{ fontSize: 12, fontWeight: 600, color: trendUp ? '#00b894' : '#e17055' }}>
            {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: color, opacity: 0.5 }} />
    </div>
  );
}
