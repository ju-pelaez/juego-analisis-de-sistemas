// Estudiante.tsx
// Alex, el estudiante que guía el juego. Es un dibujo SVG con gestos (normal, piensa, celebra).
// Si recibe el cuadro "f" de Remotion parpadea, respira y saluda; si no, queda quieto.
import React from 'react';

export type Gesto = 'normal' | 'piensa' | 'celebra' | 'sorpresa';

export const Estudiante: React.FC<{ f?: number; gesto?: Gesto; size?: number | string; titulo?: string }> = ({
  f = 0, gesto = 'normal', size = 120, titulo,
}) => {
  const parpado = f % 96 > 90 ? 0.15 : 1;              // parpadea cada ~3 segundos
  const respira = Math.sin(f / 18) * 1.2;
  const brazo = gesto === 'celebra' ? -40 + Math.sin(f / 4) * 12 : gesto === 'normal' ? Math.sin(f / 6) * 10 - 10 : 0;
  const boca =
    gesto === 'sorpresa' ? <ellipse cx="60" cy="63" rx="4.5" ry="5.5" fill="var(--tinta-oscura)" />
      : gesto === 'piensa' ? <path d="M54 64 q6 -3 12 0" stroke="var(--tinta-oscura)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        : <path d="M52 61 q8 8 16 0" stroke="var(--tinta-oscura)" strokeWidth="2.8" fill="none" strokeLinecap="round" />;
  return (
    <svg viewBox="0 0 120 150" width={size} height={typeof size === 'number' ? size * 1.25 : undefined}
      role={titulo ? 'img' : undefined} aria-label={titulo} aria-hidden={titulo ? undefined : true} style={{ overflow: 'visible' }}>
      <g style={{ translate: `0px ${respira}px` }}>
        {/* morral */}
        <rect x="26" y="84" width="68" height="52" rx="16" fill="var(--c-pro)" />
        {/* cuerpo: buzo de la universidad */}
        <path d="M30 140 q0 -46 30 -50 q30 4 30 50 z" fill="var(--c-dat)" />
        <path d="M50 92 l10 12 l10 -12" fill="none" stroke="var(--piel-sombra)" strokeWidth="3" />
        {/* brazo que saluda o celebra */}
        <g style={{ transformOrigin: '88px 104px', rotate: `${brazo}deg` }}>
          <path d="M86 102 q16 -6 20 -26" stroke="var(--c-dat)" strokeWidth="11" fill="none" strokeLinecap="round" />
          <circle cx="106" cy="73" r="7" fill="var(--piel)" />
        </g>
        {/* brazo con el cuaderno de analista */}
        {gesto === 'piensa' ? (
          <path d="M34 104 q4 -22 20 -36" stroke="var(--c-dat)" strokeWidth="11" fill="none" strokeLinecap="round" />
        ) : (
          <>
            <path d="M34 104 q-8 14 2 26" stroke="var(--c-dat)" strokeWidth="11" fill="none" strokeLinecap="round" />
            <rect x="18" y="112" width="26" height="30" rx="3" fill="var(--papel)" stroke="var(--tinta-oscura)" strokeWidth="2" />
            <path d="M23 121h16M23 127h12M23 133h14" stroke="var(--c-act)" strokeWidth="2" />
          </>
        )}
        {/* cabeza */}
        <circle cx="60" cy="52" r="30" fill="var(--piel)" />
        <path d="M30 48 q2 -32 32 -30 q28 2 28 28 q-12 -10 -30 -12 q-14 6 -30 14z" fill="var(--pelo)" />
        {/* gafas */}
        <circle cx="48" cy="52" r="8.5" fill="none" stroke="var(--tinta-oscura)" strokeWidth="2.6" />
        <circle cx="72" cy="52" r="8.5" fill="none" stroke="var(--tinta-oscura)" strokeWidth="2.6" />
        <path d="M56.5 52h7" stroke="var(--tinta-oscura)" strokeWidth="2.6" />
        <g style={{ transformOrigin: '60px 52px', scale: `1 ${parpado}` }}>
          <circle cx="48" cy="52" r="3" fill="var(--tinta-oscura)" />
          <circle cx="72" cy="52" r="3" fill="var(--tinta-oscura)" />
        </g>
        {boca}
        <circle cx="40" cy="62" r="4" fill="var(--c-act)" opacity="0.35" />
        <circle cx="80" cy="62" r="4" fill="var(--c-act)" opacity="0.35" />
        {gesto === 'piensa' && <text x="96" y="30" style={{ fontFamily: 'var(--f-titulo)', fontWeight: 800, fontSize: 22, fill: 'var(--c-sis)' }}>?</text>}
      </g>
    </svg>
  );
};
