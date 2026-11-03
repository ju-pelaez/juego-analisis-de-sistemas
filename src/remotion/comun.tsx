// comun.tsx
// Piezas que comparten todas las animaciones de Remotion: el fondo de plano (cuadrícula),
// funciones de tiempo y el color de cada componente. Los colores salen de variables CSS,
// así las animaciones cambian solas entre el tema oscuro y el modo proyector (claro).
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Comp } from '../datos/capitulos';

export const col = (c: Comp | string) => `var(--c-${c})`;

const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);
// Avance de 0 a 1 entre dos cuadros, con frenado suave al final.
export const ap = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SUAVE });
// Avance con resorte (pasa un poquito y vuelve).
export const resorte = (f: number, a: number, dur = 24) =>
  interpolate(f, [a, a + dur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.spring({ damping: 12, stiffness: 120 }),
  });

// Fondo: plano azul de analista con cuadrícula que se desliza y dos luces que flotan.
export const Fondo: React.FC<{ color?: string; children?: React.ReactNode }> = ({ color = 'var(--c-sis)', children }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const paso = Math.round(Math.min(width, height) / 12);
  return (
    <AbsoluteFill style={{ background: 'var(--fondo)', overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(var(--rejilla) 1px, transparent 1px), linear-gradient(90deg, var(--rejilla) 1px, transparent 1px)`,
          backgroundSize: `${paso}px ${paso}px`,
          backgroundPosition: `${(f * 0.6) % paso}px ${(f * 0.35) % paso}px`,
        }}
      />
      <div
        style={{
          position: 'absolute', width: width * 0.7, height: width * 0.7, borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, transparent 65%)`, opacity: 0.22,
          left: width * 0.55 + Math.sin(f / 40) * width * 0.06, top: -width * 0.2 + Math.cos(f / 50) * height * 0.05,
        }}
      />
      <div
        style={{
          position: 'absolute', width: width * 0.6, height: width * 0.6, borderRadius: '50%',
          background: 'radial-gradient(circle, var(--c-efe) 0%, transparent 65%)', opacity: 0.12,
          left: -width * 0.2 + Math.cos(f / 45) * width * 0.05, top: height * 0.5 + Math.sin(f / 38) * height * 0.05,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// Escala para textos: todo se mide contra el lado corto, así sirve en vertical y horizontal.
export const useMedida = () => {
  const { width, height } = useVideoConfig();
  const lado = Math.min(width, height);
  return { width, height, lado, vertical: height > width, u: (n: number) => (lado * n) / 100 };
};
