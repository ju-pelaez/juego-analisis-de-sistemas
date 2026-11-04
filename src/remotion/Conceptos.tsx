// Conceptos.tsx
// Una animación por capítulo que muestra la idea central (el "concepto") en movimiento.
// Se ve en la cinemática de entrada y otra vez, en bucle, en la primera ficha del capítulo.
// Todas usan un lienzo SVG de 1000 x 700, así sirven igual en vertical y en horizontal.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ArbolArte } from './Arbol';
import { ap, col, resorte } from './comun';
import { Glifo } from '../componentes/Glifo';

const txt = (size: number, peso = 700): React.CSSProperties => ({
  fontFamily: 'var(--f-titulo)', fontSize: size, fontWeight: peso, fill: 'var(--tinta)',
});

const Lienzo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
    <svg viewBox="0 0 1000 700" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
      {children}
    </svg>
  </AbsoluteFill>
);

// 0 · Dos mundos: la lupa del analista se queda en el mundo real.
const Bienvenida: React.FC = () => {
  const f = useCurrentFrame();
  const lupaX = interpolate(f, [0, 30, 60], [500, 700, 290], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const apaga = ap(f, 55, 80);
  return (
    <Lienzo>
      <g style={{ opacity: ap(f, 0, 15) }}>
        <rect x="60" y="120" width="420" height="440" rx="28" style={{ fill: 'var(--panel)', stroke: col('efe'), strokeWidth: 4 }} />
        <text x="270" y="190" textAnchor="middle" style={txt(40)}>MUNDO REAL</text>
        {[0, 1, 2].map((i) => (
          <g key={i} style={{ opacity: ap(f, 10 + i * 6, 25 + i * 6) }}>
            <circle cx={160 + i * 110} cy={290} r={26} style={{ fill: col(['act', 'dat', 'pro'][i]) }} />
            <path d={`M${120 + i * 110} 370 q40 -50 80 0`} style={{ fill: 'none', stroke: col(['act', 'dat', 'pro'][i]), strokeWidth: 14, strokeLinecap: 'round' }} />
          </g>
        ))}
        <text x="270" y="470" textAnchor="middle" style={txt(28, 500)}>Existe hoy · AS-IS</text>
      </g>
      <g style={{ opacity: ap(f, 0, 15) * (1 - 0.6 * apaga) }}>
        <rect x="520" y="120" width="420" height="440" rx="28" style={{ fill: 'var(--panel)', stroke: 'var(--tenue)', strokeWidth: 4, strokeDasharray: '14 10' }} />
        <text x="730" y="178" textAnchor="middle" style={txt(32)}>MUNDO DE</text>
        <text x="730" y="214" textAnchor="middle" style={txt(32)}>LA SOLUCIÓN</text>
        <rect x="610" y="240" width="240" height="160" rx="14" style={{ fill: 'none', stroke: 'var(--tenue)', strokeWidth: 6 }} />
        {[0, 1, 2].map((i) => <rect key={i} x={640} y={270 + i * 36} width={120 + i * 30} height={14} rx={7} style={{ fill: 'var(--tenue)' }} />)}
        <text x="730" y="470" textAnchor="middle" style={txt(28, 500)}>Se construye después</text>
      </g>
      <g style={{ translate: `${lupaX - 500}px 0px` }}>
        <circle cx="500" cy="330" r="120" style={{ fill: 'var(--c-sis)', fillOpacity: 0.12, stroke: col('sis'), strokeWidth: 12 }} />
        <path d="M585 415 L660 490" style={{ stroke: col('sis'), strokeWidth: 26, strokeLinecap: 'round' }} />
      </g>
      <text x="500" y="640" textAnchor="middle" style={{ ...txt(38), opacity: ap(f, 80, 100) }}>Primero, el problema.</text>
    </Lienzo>
  );
};

// 1 · El límite se dibuja: lo de adentro es el sistema; lo de afuera queda fuera.
const Sistema: React.FC = () => {
  const f = useCurrentFrame();
  const dentro = [['act', 420, 300], ['dat', 560, 270], ['pro', 450, 420], ['con', 580, 410]] as const;
  const fuera = [[150, 160], [860, 200], [180, 560], [850, 560]];
  return (
    <Lienzo>
      <circle cx="500" cy="350" r="230" pathLength={1}
        style={{ fill: 'var(--c-sis)', fillOpacity: 0.06 * ap(f, 30, 50), stroke: col('sis'), strokeWidth: 8, strokeDasharray: 1, strokeDashoffset: 1 - ap(f, 0, 40) }} />
      {dentro.map(([c, x, y], i) => {
        const v = resorte(f, 25 + i * 7);
        return <circle key={c} cx={x} cy={y} r={38} style={{ fill: col(c), transformOrigin: `${x}px ${y}px`, scale: String(v) }} />;
      })}
      {fuera.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={26} style={{ fill: 'var(--tenue)', opacity: 0.6 * ap(f, 45 + i * 5, 60 + i * 5) }} />
      ))}
      <text x="500" y="80" textAnchor="middle" style={{ ...txt(40), opacity: ap(f, 20, 40) }}>LÍMITE: dónde empieza y dónde termina</text>
      <g style={{ opacity: ap(f, 70, 90) }}>
        <text x="500" y="660" textAnchor="middle" style={txt(36)}>Elementos · Límites · Objetivo</text>
      </g>
    </Lienzo>
  );
};

// 2 · Entrada → proceso → salida, con el lazo de control que vuelve.
// Punto de una curva cúbica (para que el pulso del control viaje por su camino).
const bezier = (t: number, p: number[]) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p[k] + 3 * u * u * t * p[k + 2] + 3 * u * t * t * p[k + 4] + t * t * t * p[k + 6]);
};
// Engranaje de 10 dientes centrado en (cx, cy).
const engranaje = (cx: number, cy: number, r1: number, r2: number) =>
  Array.from({ length: 40 }, (_, k) => {
    const a = (k / 40) * Math.PI * 2;
    const r = k % 4 < 2 ? r1 : r2;
    return `${k ? 'L' : 'M'}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(' ') + 'Z';

const Modelo: React.FC = () => {
  const f = useCurrentFrame();
  const estaciones = [
    { n: 'ENTRADAS', c: 'dat', x: 180, ej: 'ingredientes · pedidos' },
    { n: 'PROCESOS', c: 'pro', x: 500, ej: 'preparar · cobrar' },
    { n: 'SALIDAS', c: 'efe', x: 820, ej: 'almuerzo · recibo' },
  ] as const;
  // El pulso del control: sale de las salidas, pasa por el control (mide) y vuelve al proceso (corrige).
  const A = [840, 430, 840, 560, 720, 590, 630, 590];
  const B = [370, 590, 250, 590, 250, 470, 440, 425];
  const ciclo = (f - 60) % 60;
  const t = f < 60 ? -1 : ciclo / 60;
  const pulso = t < 0 ? null : t < 0.45 ? bezier(t / 0.45, A) : t < 0.55 ? [500, 590] : bezier((t - 0.55) / 0.45, B);
  const corrige = f >= 60 && ciclo > 52 ? 1 : 0;
  const midiendo = f >= 60 && t >= 0.4 && t < 0.6;
  return (
    <Lienzo>
      <text x="500" y="62" textAnchor="middle" style={{ ...txt(26, 600), fill: 'var(--tenue)', opacity: ap(f, 0, 12) }}>LA MÁQUINA DE LA CAFETERÍA</text>
      {estaciones.map((e, i) => (
        <g key={e.n} style={{ opacity: ap(f, i * 8, i * 8 + 14), translate: `0px ${(1 - ap(f, i * 8, i * 8 + 20)) * 30}px` }}>
          <rect x={e.x - 120} y={100} width={240} height={190} rx={26}
            style={{ fill: 'var(--panel)', stroke: col(e.c), strokeWidth: i === 1 && corrige ? 10 : 6 }} />
          {i === 0 && [0, 1, 2].map((k) => {
            const caida = ((f + k * 14) % 42) / 42;
            return <rect key={k} x={e.x - 14 + (k - 1) * 34} y={130 + caida * 40} width={26} height={26} rx={6} style={{ fill: col('dat'), opacity: 1 - caida * 0.6 }} />;
          })}
          {i === 1 && (
            <path d={engranaje(e.x, 170, 40, 30)} style={{ fill: col('pro'), transformOrigin: `${e.x}px 170px`, rotate: `${f * 4}deg` }} />
          )}
          {i === 1 && <circle cx={e.x} cy={170} r={12} style={{ fill: 'var(--panel)' }} />}
          {i === 2 && (
            <g>
              <ellipse cx={e.x} cy={192} rx={58} ry={12} style={{ fill: col('efe'), opacity: 0.85 }} />
              <path d={`M${e.x - 40} 186 A40 40 0 0 1 ${e.x + 40} 186 Z`} style={{ fill: 'none', stroke: col('efe'), strokeWidth: 6 }} />
              <circle cx={e.x} cy={140} r={6} style={{ fill: col('efe') }} />
            </g>
          )}
          <text x={e.x} y={262} textAnchor="middle" style={txt(30)}>{e.n}</text>
          <text x={e.x} y={330} textAnchor="middle" style={{ ...txt(22, 500), fill: 'var(--tenue)' }}>{e.ej}</text>
        </g>
      ))}
      {/* banda transportadora: lo que entra, se transforma y sale */}
      <g style={{ opacity: ap(f, 14, 28) }}>
        <rect x={70} y={398} width={860} height={34} rx={17} style={{ fill: 'var(--panel2)', stroke: 'var(--linea-fuerte)', strokeWidth: 3 }} />
        <line x1={90} y1={415} x2={910} y2={415} style={{ stroke: 'var(--linea-fuerte)', strokeWidth: 4, strokeDasharray: '14 18', strokeDashoffset: -f * 4 }} />
        <rect x={380} y={392} width={240} height={46} rx={20} style={{ fill: col('pro'), opacity: 0.18 + 0.12 * Math.sin(f / 5) }} />
      </g>
      {Array.from({ length: 7 }, (_, k) => {
        const x = 90 + ((f * 4 + k * 120) % 820);
        const fase = x < 380 ? 0 : x < 620 ? 1 : 2;
        const borde = Math.min(1, (x - 90) / 40, (910 - x) / 40);
        const c = ['dat', 'pro', 'efe'][fase];
        return fase === 2
          ? <circle key={k} cx={x} cy={384} r={15} style={{ fill: col(c), opacity: ap(f, 24, 34) * borde }} />
          : <rect key={k} x={x - 14} y={370} width={28} height={28} rx={fase ? 10 : 5}
              style={{ fill: col(c), opacity: ap(f, 24, 34) * borde, transformOrigin: `${x}px 384px`, rotate: fase ? `${(x - 380) * 0.75}deg` : '0deg' }} />;
      })}
      {/* control: mide la salida y retroalimenta el proceso */}
      <g style={{ opacity: ap(f, 40, 56) }}>
        <path d={`M${A[0]} ${A[1]} C${A[2]} ${A[3]}, ${A[4]} ${A[5]}, ${A[6]} ${A[7]}`} style={{ fill: 'none', stroke: col('con'), strokeWidth: 6, strokeDasharray: '10 10', strokeDashoffset: f * 2 }} />
        <path d={`M${B[0]} ${B[1]} C${B[2]} ${B[3]}, ${B[4]} ${B[5]}, ${B[6]} ${B[7]}`} style={{ fill: 'none', stroke: col('con'), strokeWidth: 6, strokeDasharray: '10 10', strokeDashoffset: f * 2 }} />
        <path d="M424 418 L444 424 L432 442" style={{ fill: 'none', stroke: col('con'), strokeWidth: 6, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
        <rect x={370} y={555} width={260} height={74} rx={37} style={{ fill: col('con') }} />
        <text x={500} y={603} textAnchor="middle" style={{ ...txt(30), fill: 'var(--fondo)' }}>CONTROL</text>
        <text x={790} y={612} textAnchor="middle" style={{ ...txt(22, 600), fill: col('con'), opacity: midiendo ? 1 : 0.7 }}>mide la salida</text>
        <text x={190} y={612} textAnchor="middle" style={{ ...txt(22, 600), fill: col('con'), opacity: corrige ? 1 : 0.7 }}>corrige el proceso</text>
      </g>
      {pulso && <circle cx={pulso[0]} cy={pulso[1]} r={midiendo ? 16 : 11} style={{ fill: col('sis') }} />}
      {corrige > 0 && <text x={500} y={88} textAnchor="middle" style={{ ...txt(24), fill: col('pro') }}>¡ajuste!</text>}
    </Lienzo>
  );
};

// 3 · Los actores aparecen alrededor del sistema y se conectan.
const Actores: React.FC = () => {
  const f = useCurrentFrame();
  const nombres = ['Paciente', 'Recepción', 'Médico', 'Entidad', 'Secretaría'];
  return (
    <Lienzo>
      <circle cx="500" cy="350" r="90" style={{ fill: 'var(--panel)', stroke: col('act'), strokeWidth: 6, opacity: ap(f, 0, 15) }} />
      <text x="500" y="362" textAnchor="middle" style={{ ...txt(30), opacity: ap(f, 5, 20) }}>SISTEMA</text>
      {nombres.map((n, i) => {
        const a = (i / nombres.length) * Math.PI * 2 - Math.PI / 2;
        const x = 500 + Math.cos(a) * 260;
        const y = 350 + Math.sin(a) * 230;
        const v = resorte(f, 15 + i * 9);
        return (
          <g key={n}>
            <line x1={500} y1={350} x2={500 + (x - 500) * ap(f, 15 + i * 9, 35 + i * 9)} y2={350 + (y - 350) * ap(f, 15 + i * 9, 35 + i * 9)}
              style={{ stroke: col('act'), strokeWidth: 4, strokeDasharray: '8 8', opacity: 0.7 }} />
            <g style={{ transformOrigin: `${x}px ${y}px`, scale: String(v) }}>
              <circle cx={x} cy={y - 18} r={22} style={{ fill: col('act') }} />
              <path d={`M${x - 34} ${y + 36} q34 -48 68 0`} style={{ fill: col('act') }} />
              <text x={x} y={y + 76} textAnchor="middle" style={txt(26)}>{n}</text>
            </g>
          </g>
        );
      })}
    </Lienzo>
  );
};

// 4 · Datos sueltos → se ordenan en información → se vuelven conocimiento.
const Datos: React.FC = () => {
  const f = useCurrentFrame();
  const orden = ap(f, 25, 55);
  const junta = ap(f, 65, 90);
  const pts = Array.from({ length: 12 }, (_, i) => {
    const sx = 120 + ((i * 137) % 760), sy = 140 + ((i * 89) % 380);
    const gx = 380 + (i % 4) * 80, gy = 260 + Math.floor(i / 4) * 80;
    return { x: sx + (gx - sx) * orden + (500 - gx) * junta, y: sy + (gy - sy) * orden + (340 - gy) * junta };
  });
  const etapa = f < 50 ? 'DATOS: sueltos' : f < 85 ? 'INFORMACIÓN: con contexto' : 'CONOCIMIENTO: para decidir';
  return (
    <Lienzo>
      {pts.map((p, i) => (
        <rect key={i} x={p.x - 22} y={p.y - 22} width={44} height={44} rx={10}
          style={{ fill: col('dat'), opacity: ap(f, i * 2, 10 + i * 2) * (1 - 0.9 * ap(f, 85, 95)) }} />
      ))}
      <g style={{ transformOrigin: '500px 340px', scale: String(resorte(f, 88, 26)) }}>
        <circle cx="500" cy="340" r="110" style={{ fill: col('sis'), opacity: 0.25 }} />
        <path d="M500 250 l26 56 62 8 -45 43 11 61 -54 -29 -54 29 11 -61 -45 -43 62 -8z" style={{ fill: col('sis') }} />
      </g>
      <text x="500" y="640" textAnchor="middle" style={txt(40)}>{etapa}</text>
    </Lienzo>
  );
};

// 5 · Una línea de pasos: el pulso de luz pasa por cada proceso en orden.
const Procesos: React.FC = () => {
  const f = useCurrentFrame();
  const pulso = interpolate(f, [20, 100], [0, 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <Lienzo>
      <line x1="130" y1="350" x2="870" y2="350" style={{ stroke: 'var(--linea-fuerte)', strokeWidth: 10, strokeLinecap: 'round' }} />
      <line x1="130" y1="350" x2={130 + 740 * (pulso / 4)} y2="350" style={{ stroke: col('pro'), strokeWidth: 10, strokeLinecap: 'round' }} />
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 130 + i * 185;
        const on = pulso >= i - 0.05;
        return (
          <g key={i} style={{ transformOrigin: `${x}px 350px`, scale: String(resorte(f, i * 5, 20)) }}>
            <circle cx={x} cy={350} r={56} style={{ fill: on ? col('pro') : 'var(--panel)', stroke: col('pro'), strokeWidth: 6 }} />
            <text x={x} y={366} textAnchor="middle" style={{ ...txt(44), fill: on ? 'var(--fondo)' : 'var(--tinta)' }}>{i + 1}</text>
          </g>
        );
      })}
      <text x="500" y="200" textAnchor="middle" style={{ ...txt(40), opacity: ap(f, 10, 25) }}>¿Qué se hace? ¿En qué orden?</text>
      <text x="500" y="540" textAnchor="middle" style={{ ...txt(34, 500), opacity: ap(f, 90, 105) }}>Cada paso tiene un responsable</text>
    </Lienzo>
  );
};

// 6 · El lazo de control: medir, evaluar, corregir, y la aguja se acomoda.
const Control: React.FC = () => {
  const f = useCurrentFrame();
  const nodos = ['MEDIR', 'EVALUAR', 'CORREGIR'];
  const giro = (f / 90) * Math.PI * 2;
  const aguja = interpolate(f, [0, 30, 60, 90, 120], [-70, 50, -20, 10, 0], { extrapolateRight: 'clamp' });
  return (
    <Lienzo>
      <circle cx="500" cy="360" r="230" style={{ fill: 'none', stroke: col('con'), strokeWidth: 8, strokeDasharray: '20 14', opacity: ap(f, 0, 20) }} />
      {nodos.map((n, i) => {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const x = 500 + Math.cos(a) * 230, y = 360 + Math.sin(a) * 230;
        return (
          <g key={n} style={{ transformOrigin: `${x}px ${y}px`, scale: String(resorte(f, 8 + i * 8)) }}>
            <rect x={x - 110} y={y - 36} width={220} height={72} rx={36} style={{ fill: col('con') }} />
            <text x={x} y={y + 12} textAnchor="middle" style={{ ...txt(32), fill: 'var(--fondo)' }}>{n}</text>
          </g>
        );
      })}
      <circle cx={500 + Math.cos(giro - Math.PI / 2) * 230} cy={360 + Math.sin(giro - Math.PI / 2) * 230} r={16} style={{ fill: col('sis'), opacity: ap(f, 30, 40) }} />
      <path d="M400 400 A100 100 0 0 1 600 400" style={{ fill: 'none', stroke: 'var(--linea-fuerte)', strokeWidth: 14, strokeLinecap: 'round' }} />
      <line x1="500" y1="400" x2="500" y2="320" style={{ stroke: col('sis'), strokeWidth: 10, strokeLinecap: 'round', transformOrigin: '500px 400px', rotate: `${aguja}deg` }} />
      <circle cx="500" cy="400" r="14" style={{ fill: col('sis') }} />
    </Lienzo>
  );
};

// 7 · El árbol crece de abajo hacia arriba: raíces, tronco y copa.
const Arbol: React.FC = () => {
  const f = useCurrentFrame();
  const aparicion = { suelo: 0, raiz0: 6, raiz1: 12, raiz2: 18, raiz3: 24, tronco: 38, copa0: 66, copa1: 74, copa2: 82, fruto: 100, ent0: 4, ent1: 10 };
  const et = (t: string, y: number, a: number, c: string) => (
    <text x="760" y={y} style={{ ...txt(34), fill: col(c), opacity: ap(f, a, a + 12) }}>{t}</text>
  );
  return (
    <Lienzo>
      <g transform="translate(150 -20) scale(0.92)">
        <foreignObject x="0" y="0" width="600" height="800">
          <div style={{ width: 600, height: 800 }}><ArbolArte f={f} aparicion={aparicion} fantasma={false} /></div>
        </foreignObject>
      </g>
      {et('EFECTOS', 210, 70, 'efe')}
      {et('PROBLEMA', 430, 42, 'sis')}
      {et('CAUSAS', 650, 14, 'pro')}
      <text x="80" y="350" style={{ ...txt(30, 500), opacity: ap(f, 95, 110) }}>Se lee</text>
      <text x="80" y="392" style={{ ...txt(30, 500), opacity: ap(f, 95, 110) }}>de abajo</text>
      <text x="80" y="434" style={{ ...txt(30, 500), opacity: ap(f, 95, 110) }}>hacia arriba ↑</text>
    </Lienzo>
  );
};

// 8 · El entorno empuja desde afuera; el sistema no lo controla.
const Entorno: React.FC = () => {
  const f = useCurrentFrame();
  const empuje = Math.sin(f / 8) * 10;
  const fuerzas = [['Clima', 0], ['Economía', 1], ['Normas', 2], ['Conectividad', 3]] as const;
  return (
    <Lienzo>
      <circle cx="500" cy="350" r="290" style={{ fill: 'var(--c-env)', fillOpacity: 0.1, stroke: col('env'), strokeWidth: 6, strokeDasharray: '16 12', opacity: ap(f, 0, 20) }} />
      <circle cx="500" cy="350" r="140" style={{ fill: 'var(--panel)', stroke: col('sis'), strokeWidth: 8, transformOrigin: '500px 350px', scale: String(resorte(f, 5)) }} />
      <text x="500" y="362" textAnchor="middle" style={txt(34)}>SISTEMA</text>
      {fuerzas.map(([n, i]) => {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 4;
        const d = 250 - empuje;
        const x = 500 + Math.cos(a) * d, y = 350 + Math.sin(a) * d;
        const x2 = 500 + Math.cos(a) * 165, y2 = 350 + Math.sin(a) * 165;
        return (
          <g key={n} style={{ opacity: ap(f, 20 + i * 8, 35 + i * 8) }}>
            <line x1={x} y1={y} x2={x2} y2={y2} style={{ stroke: col('env'), strokeWidth: 8, strokeLinecap: 'round' }} />
            <circle cx={x2} cy={y2} r={9} style={{ fill: col('env') }} />
            <text x={500 + Math.cos(a) * 330} y={350 + Math.sin(a) * 315 + 10} textAnchor="middle" style={txt(30)}>{n}</text>
          </g>
        );
      })}
    </Lienzo>
  );
};

// 9 · Cuatro pilares de factibilidad sostienen la plataforma de la viabilidad.
const Factibilidad: React.FC = () => {
  const f = useCurrentFrame();
  const pilares = [['Técnica', 'dat'], ['Operativa', 'act'], ['Económica', 'pro'], ['Legal', 'con']] as const;
  const cae = ap(f, 60, 80);
  return (
    <Lienzo>
      {pilares.map(([n, c], i) => {
        const alto = 280 * ap(f, i * 10, 30 + i * 10);
        const x = 160 + i * 190;
        return (
          <g key={n}>
            <rect x={x} y={590 - alto} width={110} height={alto} rx={10} style={{ fill: col(c) }} />
            <text x={x + 55} y={640} textAnchor="middle" style={txt(28)}>{n}</text>
          </g>
        );
      })}
      <g style={{ translate: `0px ${(1 - cae) * -300}px`, opacity: cae }}>
        <rect x="130" y="250" width="740" height="60" rx="16" style={{ fill: col('efe') }} />
        <text x="500" y="292" textAnchor="middle" style={{ ...txt(32), fill: 'var(--fondo)' }}>VIABLE: conviene y dura</text>
      </g>
      <text x="500" y="120" textAnchor="middle" style={{ ...txt(40), opacity: ap(f, 0, 15) }}>¿Se puede hacer? ¿Vale la pena?</text>
    </Lienzo>
  );
};

// 10 · Todos los capítulos giran y se juntan en un sello de analista.
const Reto: React.FC = () => {
  const f = useCurrentFrame();
  const ids = ['sistema', 'modelo', 'actores', 'datos', 'procesos', 'bpmn', 'control', 'arbol', 'entorno', 'factibilidad'];
  const junta = ap(f, 60, 95);
  return (
    <Lienzo>
      {ids.map((id, i) => {
        const a = (i / ids.length) * Math.PI * 2 + f / 30;
        const r = 260 * (1 - junta);
        const x = 500 + Math.cos(a) * r, y = 350 + Math.sin(a) * r * 0.85;
        return (
          <foreignObject key={id} x={x - 40} y={y - 40} width={80} height={80} style={{ opacity: ap(f, i * 3, i * 3 + 12) * (1 - ap(f, 90, 100)) }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--panel)', display: 'grid', placeItems: 'center', color: 'var(--c-sis)' }}>
              <Glifo id={id} size={50} />
            </div>
          </foreignObject>
        );
      })}
      <g style={{ transformOrigin: '500px 350px', scale: String(resorte(f, 92, 30)) }}>
        <circle cx="500" cy="350" r="150" style={{ fill: col('sis') }} />
        <circle cx="500" cy="350" r="125" style={{ fill: 'none', stroke: 'var(--fondo)', strokeWidth: 6, strokeDasharray: '6 8' }} />
        <text x="500" y="365" textAnchor="middle" style={{ ...txt(44), fill: 'var(--fondo)' }}>ANALISTA</text>
      </g>
    </Lienzo>
  );
};

// 6 · Un diagrama BPMN que se dibuja solo: inicio, tareas por carril, compuerta y fin.
const Bpmn: React.FC = () => {
  const f = useCurrentFrame();
  const caja = (x: number, y: number, t: string, a: number) => (
    <g style={{ opacity: ap(f, a, a + 10), transformOrigin: `${x}px ${y}px`, scale: String(0.8 + 0.2 * resorte(f, a, 18)) }}>
      <rect x={x - 95} y={y - 32} width={190} height={64} rx={16} style={{ fill: 'var(--panel)', stroke: col('pro'), strokeWidth: 5 }} />
      <text x={x} y={y + 10} textAnchor="middle" style={txt(24)}>{t}</text>
    </g>
  );
  const linea = (d: string, a: number) => (
    <path d={d} pathLength={1} style={{ fill: 'none', stroke: 'var(--tinta)', strokeWidth: 5, strokeDasharray: 1, strokeDashoffset: 1 - ap(f, a, a + 10) }} />
  );
  return (
    <Lienzo>
      <rect x="40" y="90" width="920" height="250" rx="12" style={{ fill: 'none', stroke: 'var(--linea-fuerte)', strokeWidth: 3, opacity: ap(f, 0, 10) }} />
      <rect x="40" y="340" width="920" height="250" rx="12" style={{ fill: 'none', stroke: 'var(--linea-fuerte)', strokeWidth: 3, opacity: ap(f, 0, 10) }} />
      <text x="60" y="125" style={{ ...txt(24), fill: col('dat'), opacity: ap(f, 4, 14) }}>Estudiante</text>
      <text x="60" y="375" style={{ ...txt(24), fill: col('act'), opacity: ap(f, 4, 14) }}>Bibliotecario</text>
      <circle cx="120" cy="215" r="26" style={{ fill: 'var(--panel)', stroke: col('efe'), strokeWidth: 4, opacity: ap(f, 8, 16) }} />
      {linea('M146 215 L235 215', 16)}
      {caja(330, 215, 'Pedir el libro', 22)}
      {linea('M330 247 L330 465 L405 465', 34)}
      {caja(500, 465, 'Buscar el libro', 42)}
      {linea('M595 465 L655 465', 54)}
      <g style={{ opacity: ap(f, 58, 68) }}>
        <path d="M700 420 L745 465 L700 510 L655 465 Z" style={{ fill: 'var(--panel)', stroke: col('sis'), strokeWidth: 5 }} />
        <path d="M686 451 L714 479 M714 451 L686 479" style={{ stroke: 'var(--tinta)', strokeWidth: 5, strokeLinecap: 'round' }} />
      </g>
      {linea('M745 465 L860 465', 70)}
      <circle cx="886" cy="465" r="26" style={{ fill: 'var(--panel)', stroke: col('act'), strokeWidth: 10, opacity: ap(f, 78, 86) }} />
      <text x="790" y="450" style={{ ...txt(22), opacity: ap(f, 72, 80) }}>Sí</text>
      <text x="500" y="650" textAnchor="middle" style={{ ...txt(36), opacity: ap(f, 90, 104) }}>Quién hace qué, en qué orden</text>
    </Lienzo>
  );
};

const MAPA: Record<string, React.FC> = {
  bienvenida: Bienvenida, sistema: Sistema, modelo: Modelo, actores: Actores, datos: Datos,
  procesos: Procesos, bpmn: Bpmn, control: Control, arbol: Arbol, entorno: Entorno, factibilidad: Factibilidad, reto: Reto,
};

export const Concepto: React.FC<{ id: string }> = ({ id }) => {
  const C = MAPA[id] || Reto;
  return <C />;
};
