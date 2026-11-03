// Arbol.tsx
// El árbol de problemas dibujado en SVG. Cada pieza (suelo, raíces, tronco, copa, frutos) crece
// desde el cuadro en que "aparece". En el minijuego, el estado del juego decide ese cuadro:
// cada acierto le pone al árbol una pieza nueva y el Player la anima en vivo.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ap, col, Fondo, resorte } from './comun';

export type Aparicion = Record<string, number>;

const RAICES = [
  { d: 'M300 606 C 290 660, 170 660, 110 770', c: 'act' },
  { d: 'M300 606 C 295 680, 240 700, 225 790', c: 'dat' },
  { d: 'M300 606 C 305 680, 360 700, 375 790', c: 'pro' },
  { d: 'M300 606 C 310 660, 430 660, 490 770', c: 'con' },
];
const COPA = [
  { cx: 185, cy: 255, r: 108, tono: 'var(--hoja2)' },
  { cx: 415, cy: 255, r: 108, tono: 'var(--hoja3)' },
  { cx: 300, cy: 172, r: 132, tono: 'var(--hoja1)' },
];
const FRUTOS = [[230, 200], [360, 140], [420, 280], [170, 300], [300, 250]];

// Dibuja el árbol en el cuadro f. Las piezas que no tienen cuadro de aparición salen "fantasma"
// (punteadas): así el jugador ve qué le falta por completar.
export const ArbolArte: React.FC<{ f: number; aparicion: Aparicion; fantasma?: boolean }> = ({ f, aparicion, fantasma = true }) => {
  const p = (id: string, dur = 26) => (id in aparicion ? ap(f, aparicion[id], aparicion[id] + dur) : 0);
  const r = (id: string) => (id in aparicion ? resorte(f, aparicion[id], 28) : 0);
  const vaiven = Math.sin(f / 28) * 4;
  const tronco = p('tronco', 32);
  const fantasmaSt = { fill: 'none', stroke: 'var(--tenue)', strokeWidth: 3, strokeDasharray: '10 10', opacity: 0.5 };
  return (
    <svg viewBox="0 0 600 800" style={{ width: '100%', height: '100%' }}>
      {/* suelo: el entorno, siempre punteado */}
      <rect
        x="40" y="560" width="520" height="46" rx="14"
        style={{ fill: col('env'), fillOpacity: 0.12 + 0.2 * p('suelo'), stroke: col('env'), strokeWidth: 3, strokeDasharray: '12 9', opacity: 0.45 + 0.55 * p('suelo') }}
      />
      {[0, 1].map((i) => {
        const v = r('ent' + i);
        return (
          <g key={i} style={{ opacity: v, transformOrigin: `${150 + i * 300}px 583px`, scale: String(v) }}>
            <circle cx={150 + i * 300} cy={583} r={14} style={{ fill: col('env') }} />
            <circle cx={136 + i * 300} cy={588} r={10} style={{ fill: col('env') }} />
            <circle cx={165 + i * 300} cy={588} r={10} style={{ fill: col('env') }} />
          </g>
        );
      })}
      {/* raíces: las causas, una por componente A-D-P-C */}
      {RAICES.map((raiz, i) => (
        <g key={i}>
          {fantasma && !('raiz' + i in aparicion) && <path d={raiz.d} style={fantasmaSt} />}
          <path
            d={raiz.d} pathLength={1}
            style={{ fill: 'none', stroke: col(raiz.c), strokeWidth: 16, strokeLinecap: 'round', strokeDasharray: 1, strokeDashoffset: 1 - p('raiz' + i, 30) }}
          />
        </g>
      ))}
      {/* tronco: el problema central */}
      {fantasma && !('tronco' in aparicion) && <path d="M262 606 L276 340 L324 340 L338 606 Z" style={fantasmaSt} />}
      <g style={{ transformOrigin: '300px 606px', scale: `1 ${tronco}` }}>
        <path d="M262 606 L276 340 L324 340 L338 606 Z" style={{ fill: 'var(--tronco)' }} />
        <path d="M300 420 L215 320 M300 400 L385 320" style={{ stroke: 'var(--tronco)', strokeWidth: 18, strokeLinecap: 'round' }} />
        <path d="M290 590 L296 380" style={{ stroke: 'var(--tronco-luz)', strokeWidth: 6, strokeLinecap: 'round', opacity: 0.6 }} />
      </g>
      {/* copa: los efectos */}
      <g style={{ translate: `${vaiven}px 0px` }}>
        {COPA.map((c, i) => {
          const v = r('copa' + i);
          return (
            <g key={i}>
              {fantasma && !('copa' + i in aparicion) && <circle cx={c.cx} cy={c.cy} r={c.r} style={fantasmaSt} />}
              <circle cx={c.cx} cy={c.cy} r={c.r} style={{ fill: c.tono, opacity: v, transformOrigin: `${c.cx}px ${c.cy}px`, scale: String(v) }} />
            </g>
          );
        })}
        {FRUTOS.map(([x, y], i) => {
          const v = 'fruto' in aparicion ? resorte(f, aparicion.fruto + i * 5, 20) : 0;
          return <circle key={i} cx={x} cy={y} r={15} style={{ fill: col('sis'), opacity: v, transformOrigin: `${x}px ${y}px`, scale: String(v) }} />;
        })}
      </g>
    </svg>
  );
};

// Composición del minijuego: fondo + árbol. "aparicion" llega desde el estado del juego.
export type ArbolProps = { aparicion: Aparicion };
export const ArbolCrece: React.FC<ArbolProps> = ({ aparicion }) => {
  const f = useCurrentFrame();
  return (
    <Fondo color="var(--c-efe)">
      <AbsoluteFill style={{ padding: '2%' }}>
        <ArbolArte f={f} aparicion={aparicion} />
      </AbsoluteFill>
    </Fondo>
  );
};
