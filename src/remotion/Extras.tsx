// Extras.tsx
// Otras composiciones de Remotion: la portada, la máquina del capítulo 2 (que se llena con los
// aciertos), la insignia que se gana al terminar un capítulo y el certificado final.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ap, col, Fondo, resorte, useMedida } from './comun';
import { Estudiante } from '../componentes/Estudiante';
import { Glifo } from '../componentes/Glifo';

// ---------------------------------------------------------------- portada (en bucle)
const PALABRAS = [['Actores', 'act'], ['Datos', 'dat'], ['Procesos', 'pro'], ['Control', 'con']] as const;
export const DURACION_PORTADA = 240;
export const Portada: React.FC = () => {
  const f = useCurrentFrame();
  const { u, vertical } = useMedida();
  const i = Math.floor(f / 60) % 4;
  const local = f % 60;
  const [palabra, c] = PALABRAS[i];
  return (
    <Fondo color={col(c)}>
      <AbsoluteFill style={{ flexDirection: vertical ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: u(5), padding: u(6) }}>
        <div style={{ textAlign: vertical ? 'center' : 'left' }}>
          <div style={{ fontFamily: 'var(--f-texto)', fontSize: u(4.2), color: 'var(--tenue)', letterSpacing: u(0.3) }}>ANÁLISIS DE SISTEMAS</div>
          <div style={{ fontFamily: 'var(--f-titulo)', fontWeight: 800, fontSize: u(14), lineHeight: 0.95, color: 'var(--tinta)', marginTop: u(1) }}>
            Modo<br />Analista
          </div>
          <div style={{ fontFamily: 'var(--f-titulo)', fontWeight: 700, fontSize: u(5.6), color: 'var(--tinta)', marginTop: u(3), height: u(7), overflow: 'hidden' }}>
            Mira todo por sus{' '}
            <span style={{
              display: 'inline-block', color: col(c),
              translate: `0px ${interpolate(local, [0, 10, 50, 60], [u(7), 0, 0, -u(7)], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px`,
            }}>{palabra}</span>
          </div>
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: -u(4), borderRadius: '50%', border: `${u(0.5)}px dashed ${col(c)}`, rotate: `${f * 0.8}deg` }} />
          <Estudiante f={f} gesto={i === 3 ? 'celebra' : 'normal'} size={u(vertical ? 30 : 34)} />
        </div>
      </AbsoluteFill>
    </Fondo>
  );
};

// ---------------------------------------------------------------- la máquina del capítulo 2
export type Zona = 'e' | 'p' | 's' | 'c';
export type MaquinaProps = { llenos: Record<Zona, number>; totales: Record<Zona, number>; ultimo: Zona | ''; cuadroUltimo: number };
const ESTACIONES: { z: Zona; n: string; c: string; x: number }[] = [
  { z: 'e', n: 'ENTRADAS', c: 'dat', x: 40 },
  { z: 'p', n: 'PROCESOS', c: 'pro', x: 370 },
  { z: 's', n: 'SALIDAS', c: 'efe', x: 700 },
];
export const Maquina: React.FC<MaquinaProps> = ({ llenos, totales, ultimo, cuadroUltimo }) => {
  const f = useCurrentFrame();
  const completo = (z: Zona) => totales[z] > 0 && llenos[z] >= totales[z];
  const corre = completo('e') && completo('p');
  const golpe = (z: Zona) => (ultimo === z ? 1 - ap(f, cuadroUltimo, cuadroUltimo + 18) : 0);
  const txt = (s: number): React.CSSProperties => ({ fontFamily: 'var(--f-titulo)', fontWeight: 800, fontSize: s, fill: 'var(--tinta)' });
  return (
    <Fondo color="var(--c-pro)">
      <svg viewBox="0 0 1000 480" style={{ width: '100%', height: '100%' }}>
        {ESTACIONES.map((e) => {
          const lleno = totales[e.z] ? llenos[e.z] / totales[e.z] : 0;
          return (
            <g key={e.z} style={{ transformOrigin: `${e.x + 130}px 170px`, scale: String(1 + 0.08 * golpe(e.z)) }}>
              <rect x={e.x} y={70} width={260} height={200} rx={26} style={{ fill: 'var(--panel)', stroke: col(e.c), strokeWidth: 6 }} />
              <rect x={e.x + 6} y={264 - 188 * lleno} width={248} height={188 * lleno + 0.01} rx={20} style={{ fill: col(e.c), opacity: 0.35 }} />
              <text x={e.x + 130} y={160} textAnchor="middle" style={txt(36)}>{e.n}</text>
              <text x={e.x + 130} y={215} textAnchor="middle" style={{ ...txt(34), fill: col(e.c) }}>{llenos[e.z]}/{totales[e.z]}</text>
            </g>
          );
        })}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const x = ((f * 7 + i * 140) % 920) + 40;
          return <circle key={i} cx={x} cy={300} r={11} style={{ fill: x < 370 ? col('dat') : x < 700 ? col('pro') : col('efe'), opacity: corre ? 0.95 : 0.15 }} />;
        })}
        <path d="M830 280 C 830 430, 500 450, 500 290" style={{ fill: 'none', stroke: col('con'), strokeWidth: 10, strokeLinecap: 'round', strokeDasharray: '18 12', strokeDashoffset: -f * 2, opacity: 0.35 + 0.65 * (totales.c ? llenos.c / totales.c : 0) }} />
        <g style={{ transformOrigin: '660px 425px', scale: String(1 + 0.12 * golpe('c')) }}>
          <rect x={540} y={392} width={240} height={64} rx={32} style={{ fill: col('con') }} />
          <text x={660} y={436} textAnchor="middle" style={{ ...txt(30), fill: 'var(--fondo)' }}>CONTROL {llenos.c}/{totales.c}</text>
        </g>
      </svg>
    </Fondo>
  );
};

// ---------------------------------------------------------------- insignia del capítulo
export type InsigniaProps = { id: string; nombre: string; estrellas: number; puntos: number; color: string };
export const DURACION_INSIGNIA = 110;
export const Insignia: React.FC<InsigniaProps> = ({ id, nombre, estrellas, puntos, color }) => {
  const f = useCurrentFrame();
  const { u } = useMedida();
  const sello = resorte(f, 4, 30);
  const cuenta = Math.round(puntos * ap(f, 30, 70));
  return (
    <Fondo color={col(color)}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', width: u(1.4), height: u(50), borderRadius: u(1), background: col(color),
            opacity: 0.18 * ap(f, 10, 30), rotate: `${i * 30 + f * 0.4}deg`,
          }} />
        ))}
        <div style={{
          width: u(42), height: u(42), borderRadius: '50%', background: col(color), display: 'grid', placeItems: 'center',
          boxShadow: `0 0 0 ${u(1.6)}px var(--fondo), 0 0 0 ${u(2.4)}px ${col(color)}`,
          scale: String(sello), rotate: `${(1 - sello) * -40}deg`,
        }}>
          <Glifo id={id} size={u(24)} color="var(--fondo)" />
        </div>
        <div style={{ marginTop: u(6), display: 'flex', gap: u(2) }}>
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 24 24" width={u(9)} height={u(9)} style={{ scale: String(resorte(f, 40 + i * 10, 20)) }}>
              <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7-6.2-3.6-6.2 3.6 1.4-7L2 9.3l7-.8z"
                style={{ fill: i < estrellas ? 'var(--c-sis)' : 'transparent', stroke: 'var(--c-sis)', strokeWidth: 1.6 }} />
            </svg>
          ))}
        </div>
        <div style={{ fontFamily: 'var(--f-titulo)', fontWeight: 800, fontSize: u(7), color: 'var(--tinta)', marginTop: u(3), opacity: ap(f, 25, 40), textAlign: 'center' }}>{nombre}</div>
        <div style={{ fontFamily: 'var(--f-texto)', fontWeight: 700, fontSize: u(5), color: col(color), marginTop: u(1), opacity: ap(f, 30, 40) }}>+{cuenta} puntos</div>
      </AbsoluteFill>
    </Fondo>
  );
};

// ---------------------------------------------------------------- certificado final
export type CertificadoProps = { nombre: string; fecha: string; puntos: number; caso: string };
export const DURACION_CERT = 150;
export const Certificado: React.FC<CertificadoProps> = ({ nombre, fecha, puntos, caso }) => {
  const f = useCurrentFrame();
  const { u } = useMedida();
  const letras = Math.floor(interpolate(f, [30, 70], [0, nombre.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (
    <Fondo color="var(--c-sis)">
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: u(4) }}>
        <div style={{
          width: '100%', height: '100%', background: 'var(--papel)', borderRadius: u(2.5), position: 'relative', overflow: 'hidden',
          opacity: ap(f, 0, 15), scale: String(0.94 + 0.06 * ap(f, 0, 25)),
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: u(5), color: 'var(--tinta-oscura)',
        }}>
          <div style={{ position: 'absolute', inset: u(2), border: `${u(0.5)}px solid var(--c-sis-oscuro)`, borderRadius: u(1.6), clipPath: `inset(0 ${100 - ap(f, 5, 40) * 100}% 0 0)` }} />
          <div style={{ fontFamily: 'var(--f-texto)', fontWeight: 700, letterSpacing: u(0.4), fontSize: u(3.4), color: 'var(--c-sis-oscuro)' }}>CERTIFICADO</div>
          <div style={{ fontFamily: 'var(--f-titulo)', fontWeight: 800, fontSize: u(7.5), lineHeight: 1, marginTop: u(1) }}>Analista de Sistemas</div>
          <div style={{ fontFamily: 'var(--f-texto)', fontSize: u(3.4), marginTop: u(3) }}>Se otorga a</div>
          <div style={{ fontFamily: 'var(--f-titulo)', fontWeight: 800, fontSize: u(8.5), marginTop: u(0.6), minHeight: u(10), borderBottom: `${u(0.4)}px solid var(--c-sis-oscuro)`, padding: `0 ${u(3)}px` }}>
            {nombre.slice(0, letras)}
          </div>
          <div style={{ fontFamily: 'var(--f-texto)', fontSize: u(3.2), marginTop: u(3), maxWidth: '86%', opacity: ap(f, 70, 85) }}>
            por superar el reto final de Análisis de Sistemas con el caso «{caso}» y reunir {puntos} puntos en el juego.
          </div>
          <div style={{ fontFamily: 'var(--f-texto)', fontSize: u(2.6), marginTop: u(3), opacity: ap(f, 85, 100), lineHeight: 1.4 }}>
            La lógica y la enseñanza: maestra Ruth Dary Escobar Sarria<br />
            Desarrollo: Juan Pablo Peláez Pino · {fecha}
          </div>
          <div style={{
            position: 'absolute', right: u(6), bottom: u(6), width: u(16), height: u(16), borderRadius: '50%', background: 'var(--c-sis)',
            display: 'grid', placeItems: 'center', scale: String(resorte(f, 95, 30)), rotate: `${(1 - resorte(f, 95, 30)) * 90 - 12}deg`,
          }}>
            <Glifo id="reto" size={u(10)} color="var(--tinta-oscura)" />
          </div>
        </div>
      </AbsoluteFill>
    </Fondo>
  );
};
