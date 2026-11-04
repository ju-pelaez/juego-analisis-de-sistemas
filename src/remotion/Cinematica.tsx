// Cinematica.tsx
// La cinemática de entrada de cada capítulo, en tres escenas unidas con transiciones:
//   1. Número y título del capítulo, con la profe Ruth Dary diciendo de qué se trata.
//   2. La animación del concepto.
//   3. La frase clave (lema), palabra por palabra.
import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';
import { linearTiming, springTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { ap, col, Fondo, resorte, useMedida } from './comun';
import { Concepto } from './Conceptos';
import { fotoProfe, NOMBRE_PROFE } from '../componentes/Profe';

export type CinematicaProps = {
  id: string; n: number; titulo: string; sub: string; lema: string; dice: string; color: string;
};

const ESCENA1 = 80, ESCENA2 = 130, ESCENA3 = 75, T1 = 18, T2 = 15;
export const DURACION_CINE = ESCENA1 + ESCENA2 + ESCENA3 - T1 - T2;

const Portadilla: React.FC<CinematicaProps> = ({ n, titulo, sub, dice, color }) => {
  const f = useCurrentFrame();
  const { u, vertical } = useMedida();
  return (
    <Fondo color={col(color)}>
      <AbsoluteFill style={{ flexDirection: vertical ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: u(4), padding: u(7) }}>
        <div style={{ flex: vertical ? '0 0 auto' : '1 1 60%', textAlign: vertical ? 'center' : 'left' }}>
          <div style={{
            fontFamily: 'var(--f-titulo)', fontWeight: 800, fontSize: u(5), letterSpacing: u(0.6), color: col(color),
            opacity: ap(f, 0, 12), translate: `${(1 - ap(f, 0, 18)) * -u(6)}px 0px`,
          }}>
            CAPÍTULO {String(n).padStart(2, '0')}
          </div>
          <div style={{
            fontFamily: 'var(--f-titulo)', fontWeight: 800, fontSize: u(vertical ? 10 : 10.5), lineHeight: 1.02, color: 'var(--tinta)',
            marginTop: u(1.5), opacity: ap(f, 6, 22), translate: `0px ${(1 - ap(f, 6, 26)) * u(5)}px`,
          }}>
            {titulo}
          </div>
          <div style={{ height: u(1.1), width: `${ap(f, 18, 40) * (vertical ? 60 : 45)}%`, background: col(color), borderRadius: u(1), margin: vertical ? `${u(3)}px auto` : `${u(3)}px 0` }} />
          <div style={{ fontFamily: 'var(--f-texto)', fontSize: u(4.4), color: 'var(--tenue)', opacity: ap(f, 22, 38) }}>{sub}</div>
        </div>
        <div style={{ flex: vertical ? '0 0 auto' : '1 1 40%', display: 'flex', flexDirection: vertical ? 'row' : 'column', alignItems: 'center', gap: u(2) }}>
          <div style={{
            background: 'var(--panel)', color: 'var(--tinta)', border: `${u(0.4)}px solid ${col(color)}`, borderRadius: u(3),
            padding: `${u(2.2)}px ${u(3)}px`, fontFamily: 'var(--f-texto)', fontSize: u(3.6), lineHeight: 1.3, maxWidth: u(vertical ? 58 : 46),
            opacity: ap(f, 34, 46), scale: String(0.85 + 0.15 * resorte(f, 34)),
          }}>
            {dice}
          </div>
          <div style={{ translate: `0px ${(1 - resorte(f, 16, 30)) * u(40)}px`, flexShrink: 0, textAlign: 'center' }}>
            <Img src={fotoProfe('explica')} style={{
              height: u(vertical ? 40 : 52), display: 'block', margin: '0 auto',
              translate: `0px ${Math.sin(f / 14) * u(0.5)}px`, rotate: `${Math.sin(f / 22) * 1.2}deg`,
              filter: `drop-shadow(0 ${u(1)}px ${u(2)}px rgba(0,0,0,.45))`,
            }} />
            <div style={{
              fontFamily: 'var(--f-titulo)', fontWeight: 800, fontSize: u(3), color: 'var(--fondo)', background: col(color),
              borderRadius: u(2), padding: `${u(0.6)}px ${u(2)}px`, marginTop: -u(2), position: 'relative', display: 'inline-block',
              opacity: ap(f, 30, 40),
            }}>{NOMBRE_PROFE}</div>
          </div>
        </div>
      </AbsoluteFill>
    </Fondo>
  );
};

const EscenaConcepto: React.FC<CinematicaProps> = ({ id, color }) => (
  <Fondo color={col(color)}>
    <AbsoluteFill style={{ padding: '3%' }}>
      <Concepto id={id} />
    </AbsoluteFill>
  </Fondo>
);

const Lema: React.FC<CinematicaProps> = ({ lema, color }) => {
  const f = useCurrentFrame();
  const { u } = useMedida();
  const palabras = lema.split(' ');
  return (
    <Fondo color={col(color)}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: u(8) }}>
        <div style={{ fontFamily: 'var(--f-titulo)', fontWeight: 800, fontSize: u(8), lineHeight: 1.12, textAlign: 'center', color: 'var(--tinta)', maxWidth: '92%' }}>
          {palabras.map((p, i) => (
            <span key={i} style={{
              display: 'inline-block', marginRight: '0.28em',
              opacity: ap(f, 4 + i * 3, 12 + i * 3),
              translate: `0px ${interpolate(ap(f, 4 + i * 3, 16 + i * 3), [0, 1], [u(4), 0])}px`,
            }}>{p}</span>
          ))}
        </div>
        <div style={{ marginTop: u(4), height: u(1), borderRadius: u(1), background: col(color), width: `${ap(f, 20 + palabras.length * 3, 45 + palabras.length * 3) * 40}%` }} />
      </AbsoluteFill>
    </Fondo>
  );
};

export const Cinematica: React.FC<CinematicaProps> = (props) => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={ESCENA1}>
      <Portadilla {...props} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T1 })} />
    <TransitionSeries.Sequence durationInFrames={ESCENA2}>
      <EscenaConcepto {...props} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T2 })} />
    <TransitionSeries.Sequence durationInFrames={ESCENA3}>
      <Lema {...props} />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);

// La misma animación del concepto, sola y en bucle, para la primera ficha del capítulo.
export type ConceptoProps = { id: string; color: string };
export const ConceptoBucle: React.FC<ConceptoProps> = (props) => <EscenaConcepto {...props} titulo="" n={0} sub="" lema="" dice="" />;
