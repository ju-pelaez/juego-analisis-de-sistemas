// Qr.tsx
// Código QR dibujado como SVG (cada cuadrito negro es un trazo del mismo camino).
import React, { useMemo } from 'react';
import qrcode from 'qrcode-generator';

export const Qr: React.FC<{ texto: string; size?: number }> = ({ texto, size = 280 }) => {
  const { d, n } = useMemo(() => {
    const q = qrcode(0, 'M');
    q.addData(texto);
    q.make();
    const n = q.getModuleCount();
    let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + 2} ${r + 2}h1v1h-1z`;
    return { d, n };
  }, [texto]);
  return (
    <svg viewBox={`0 0 ${n + 4} ${n + 4}`} width={size} height={size} role="img" aria-label={`Código QR para entrar: ${texto}`} shapeRendering="crispEdges">
      <rect width={n + 4} height={n + 4} fill="#fff" rx="1.5" />
      <path d={d} fill="#0B1226" />
    </svg>
  );
};
