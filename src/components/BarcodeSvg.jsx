import React from 'react';
import { encodeCode128Rects } from '../utils/format.js';

export default function BarcodeSvg({ value, height = 42, className = '' }) {
  const { rects, totalModules } = encodeCode128Rects(String(value || '1500'));
  return (
    <svg
      viewBox={`0 0 ${totalModules} 100`}
      preserveAspectRatio="none"
      style={{ height: `${height}px`, width: '100%' }}
      className={`block bg-white ${className}`}
      aria-label={`بارکد ${value}`}
    >
      <rect x="0" y="0" width={totalModules} height="100" fill="#ffffff" />
      {rects.map((r, idx) => (
        <rect key={idx} x={r.x} y="0" width={r.width} height="100" fill="#000000" />
      ))}
    </svg>
  );
}
