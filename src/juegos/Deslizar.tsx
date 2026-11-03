// Deslizar.tsx · Capítulo 0
// Una pila de cartas: se desliza a la izquierda (mundo real) o a la derecha (mundo de la solución).
// También se puede responder con los botones o con las flechas del teclado.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Juego } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Avance, Aviso, type AvisoDato } from '../componentes/Piezas';

type J = Extract<Juego, { tipo: 'deslizar' }>;

export const Deslizar: React.FC<{ juego: J; alTerminar: (a: number, t: number) => void }> = ({ juego, alTerminar }) => {
  const cartas = useMemo(() => barajar(juego.items), [juego]);
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const [dx, setDx] = useState(0);
  const [sale, setSale] = useState<'izq' | 'der' | null>(null);
  const inicio = useRef<number | null>(null);
  const c = cartas[i];

  const decidir = (lado: 'izq' | 'der') => {
    if (!c || sale) return;
    const ok = c.lado === lado;
    sonar(ok ? 'bien' : 'mal');
    if (!ok) vibrar(60);
    const nombre = c.lado === 'izq' ? juego.izq : juego.der;
    setAviso({ ok, texto: ok ? `«${c.t}» es del ${nombre.toLowerCase()}.` : `«${c.t}» va en el ${nombre.toLowerCase()}.`, por: c.por });
    const nuevos = aciertos + (ok ? 1 : 0);
    setAciertos(nuevos);
    setSale(lado);
    setTimeout(() => {
      setSale(null);
      setDx(0);
      if (i + 1 >= cartas.length) alTerminar(nuevos, cartas.length);
      else setI(i + 1);
    }, 280);
  };

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') decidir('izq');
      if (e.key === 'ArrowRight') decidir('der');
    };
    addEventListener('keydown', tecla);
    return () => removeEventListener('keydown', tecla);
  });

  const mover = sale ? (sale === 'izq' ? -600 : 600) : dx;
  return (
    <section className="juego" aria-labelledby="t-desl">
      <h2 id="t-desl">{juego.titulo}</h2>
      <p className="pista">Desliza la carta hacia su mundo, o usa los botones. Carta {Math.min(i + 1, cartas.length)} de {cartas.length}.</p>
      <Avance hecho={i} total={cartas.length} />
      <div className="mesa-deslizar">
        {i + 1 < cartas.length && <div className="detras" aria-hidden="true" />}
        {c && (
          <div
            className="carta"
            style={{
              translate: `${mover}px 0`, rotate: `${mover / 18}deg`, transition: inicio.current === null ? 'translate .28s, rotate .28s' : 'none',
              ['--c' as string]: dx < -30 ? 'var(--c-efe)' : dx > 30 ? 'var(--tenue)' : 'var(--c-sis)',
            }}
            onPointerDown={(e) => { inicio.current = e.clientX; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
            onPointerMove={(e) => { if (inicio.current !== null) setDx(e.clientX - inicio.current); }}
            onPointerUp={() => {
              const d = dx; inicio.current = null;
              if (d < -90) decidir('izq'); else if (d > 90) decidir('der'); else setDx(0);
            }}
            onPointerCancel={() => { inicio.current = null; setDx(0); }}
          >
            {c.t}
          </div>
        )}
      </div>
      <div className="lados">
        <button className="lado izq" onClick={() => decidir('izq')}>← {juego.izq}<small>existe hoy</small></button>
        <button className="lado der" onClick={() => decidir('der')}>{juego.der} →<small>se construye después</small></button>
      </div>
      <Aviso aviso={aviso} vacio="¿A qué mundo pertenece esta carta?" />
    </section>
  );
};
