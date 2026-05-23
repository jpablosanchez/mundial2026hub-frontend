import React from 'react';

export default function DonutChart({ data = [], size = 140, thickness = 28 }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const slices = data.map(d => {
    const pct = d.value / total;
    const dash = pct * circ;
    const slice = { ...d, dasharray: `${dash} ${circ - dash}`, dashoffset: -offset };
    offset += dash;
    return slice;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-soft)" strokeWidth={thickness} />
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={thickness}
          strokeDasharray={s.dasharray}
          strokeDashoffset={s.dashoffset}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  );
}
