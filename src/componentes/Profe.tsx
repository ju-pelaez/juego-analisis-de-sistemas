// Profe.tsx
// La maestra Ruth Dary como personaje del juego: es quien explica cada capítulo.
// Dos poses: "explica" (mano abierta) y "celebra" (pulgar arriba). Las imágenes viven en /public/profe.
import React from 'react';

export type PoseProfe = 'explica' | 'celebra';
export const fotoProfe = (pose: PoseProfe) => `/profe/${pose}.webp`;
export const NOMBRE_PROFE = 'Profe Ruth Dary';

// Retrato recortado (para la burbuja de las fichas y los avisos).
export const CaraProfe: React.FC<{ pose?: PoseProfe; size?: number; className?: string }> = ({ pose = 'explica', size = 64, className = '' }) => (
  <span className={'cara-profe ' + className} style={{ width: size, height: size }}>
    <img src={fotoProfe(pose)} alt="" width={size} height={size} decoding="async" />
  </span>
);
