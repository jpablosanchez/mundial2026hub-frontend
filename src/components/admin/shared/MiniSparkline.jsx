import React from 'react';

export default function MiniSparkline({ data = [], color = 'var(--accent)', height = 36, width = 100 }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 4;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y];
  });
  const linePath = 'M ' + pts.map(p => p.join(',')).join(' L ');
  const fillPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  const uid = color.replace(/[^a-z0-9]/gi, '').slice(0, 8) + Math.random().toString(36).slice(2, 5);
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`spk-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#spk-${uid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
