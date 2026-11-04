// Glifo.tsx
// Un dibujo sencillo (SVG) para cada capítulo. Se usa en el mapa, en las insignias y en las animaciones.
import React from 'react';

const T: Record<string, React.ReactNode> = {
  bienvenida: (
    <>
      <circle cx="21" cy="21" r="12" fill="none" strokeWidth="4" />
      <path d="M30 30l11 11" strokeWidth="5" strokeLinecap="round" />
      <circle cx="21" cy="21" r="4" stroke="none" fill="currentColor" />
    </>
  ),
  sistema: (
    <>
      <circle cx="24" cy="24" r="17" fill="none" strokeWidth="3.5" strokeDasharray="5 4" />
      <circle cx="18" cy="20" r="3.5" stroke="none" fill="currentColor" />
      <circle cx="29" cy="19" r="3.5" stroke="none" fill="currentColor" />
      <circle cx="24" cy="30" r="3.5" stroke="none" fill="currentColor" />
    </>
  ),
  modelo: (
    <>
      <rect x="3" y="18" width="10" height="12" rx="2" fill="none" strokeWidth="3" />
      <rect x="19" y="15" width="11" height="18" rx="3" fill="none" strokeWidth="3" />
      <rect x="36" y="18" width="9" height="12" rx="2" fill="none" strokeWidth="3" />
      <path d="M13 24h6M30 24h6" strokeWidth="3" />
      <path d="M40 31c0 9-16 9-16 3" fill="none" strokeWidth="2.5" />
    </>
  ),
  actores: (
    <>
      <circle cx="17" cy="15" r="6" fill="none" strokeWidth="3.5" />
      <path d="M6 38c0-8 5-13 11-13s11 5 11 13" fill="none" strokeWidth="3.5" />
      <circle cx="33" cy="18" r="5" fill="none" strokeWidth="3" />
      <path d="M30 27c6 0 12 4 12 11" fill="none" strokeWidth="3" />
    </>
  ),
  datos: (
    <>
      <circle cx="8" cy="38" r="3" stroke="none" fill="currentColor" />
      <circle cx="15" cy="33" r="3" stroke="none" fill="currentColor" />
      <rect x="21" y="22" width="9" height="18" rx="2" fill="none" strokeWidth="3" />
      <path d="M38 8l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="none" strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
  procesos: (
    <>
      <circle cx="8" cy="24" r="5" fill="none" strokeWidth="3" />
      <circle cx="24" cy="24" r="5" fill="none" strokeWidth="3" />
      <circle cx="40" cy="24" r="5" fill="none" strokeWidth="3" />
      <path d="M13 24h6M29 24h6" strokeWidth="3" />
    </>
  ),
  bpmn: (
    <>
      <circle cx="8" cy="10" r="5" fill="none" strokeWidth="3" />
      <rect x="18" y="4" width="20" height="12" rx="3" fill="none" strokeWidth="3" />
      <path d="M28 26l8 8-8 8-8-8z" fill="none" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="8" cy="38" r="5" fill="none" strokeWidth="5" />
      <path d="M13 10h5M28 16v10M20 34H13" fill="none" strokeWidth="2.5" />
    </>
  ),
  control: (
    <>
      <path d="M38 17A16 16 0 1 0 40 28" fill="none" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M40 9v9h-9" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="4" stroke="none" fill="currentColor" />
    </>
  ),
  arbol: (
    <>
      <circle cx="24" cy="15" r="11" fill="none" strokeWidth="3.5" />
      <path d="M24 26v12M24 38l-7 6M24 38l7 6M24 38v6" fill="none" strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  entorno: (
    <>
      <circle cx="24" cy="24" r="8" fill="none" strokeWidth="3.5" />
      <circle cx="24" cy="24" r="18" fill="none" strokeWidth="2.5" strokeDasharray="3 4" />
      <path d="M6 8l5 5M42 8l-5 5M6 40l5-5M42 40l-5-5" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  factibilidad: (
    <>
      <path d="M24 6v34M12 40h24M8 14h32" fill="none" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M8 14l-6 12h12zM40 14l-6 12h12z" fill="none" strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
  reto: (
    <>
      <circle cx="24" cy="19" r="13" fill="none" strokeWidth="3.5" />
      <path d="M24 12l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z" stroke="none" fill="currentColor" />
      <path d="M16 30l-4 14 7-4 5 5M32 30l4 14-7-4-5 5" fill="none" strokeWidth="3" strokeLinejoin="round" />
    </>
  ),
};

export const Glifo: React.FC<{ id: string; size?: number | string; color?: string; title?: string }> = ({ id, size = 32, color = 'currentColor', title }) => (
  <svg
    viewBox="0 0 48 48" width={size} height={size} stroke={color} style={{ color }}
    role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}
  >
    {T[id] || T.reto}
  </svg>
);
