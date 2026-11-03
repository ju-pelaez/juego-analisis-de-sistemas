// Hilos.tsx · Capítulo 3
// Unir con hilos: se toca un actor y luego su función. Si es la pareja correcta, queda un hilo
// de color entre los dos. Se puede empezar por cualquiera de las dos columnas.
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Juego } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Avance, Aviso, type AvisoDato } from '../componentes/Piezas';

type J = Extract<Juego, { tipo: 'hilos' }>;
const COLORES = ['var(--c-act)', 'var(--c-dat)', 'var(--c-pro)', 'var(--c-con)', 'var(--c-efe)', 'var(--c-sis)'];

export const Hilos: React.FC<{ juego: J; alTerminar: (a: number, t: number) => void }> = ({ juego, alTerminar }) => {
  const izq = useMemo(() => barajar(juego.pares.map((p, k) => ({ ...p, k }))), [juego]);
  const der = useMemo(() => barajar(juego.pares.map((p, k) => ({ ...p, k }))), [juego]);
  const [sel, setSel] = useState<{ lado: 'a' | 'b'; k: number } | null>(null);
  const [unidos, setUnidos] = useState<number[]>([]);
  const [errores, setErrores] = useState<Set<number>>(new Set());
  const [rojo, setRojo] = useState<{ a: number; b: number } | null>(null);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const caja = useRef<HTMLDivElement>(null);
  const [lineas, setLineas] = useState<{ k: number; d: string }[]>([]);

  // Mide dónde quedó cada botón para dibujar los hilos encima.
  const medir = () => {
    const c = caja.current;
    if (!c) return;
    const base = c.getBoundingClientRect();
    const pos = (lado: string, k: number) => c.querySelector(`[data-nudo="${lado}${k}"]`)?.getBoundingClientRect();
    const camino = (k: number) => {
      const a = pos('a', k), b = pos('b', k);
      if (!a || !b) return '';
      const x1 = a.right - base.left, y1 = a.top + a.height / 2 - base.top;
      const x2 = b.left - base.left, y2 = b.top + b.height / 2 - base.top;
      const m = (x1 + x2) / 2;
      return `M${x1} ${y1} C${m} ${y1}, ${m} ${y2}, ${x2} ${y2}`;
    };
    setLineas([...unidos.map((k) => ({ k, d: camino(k) })), ...(rojo ? [{ k: -1, d: (() => {
      const a = pos('a', rojo.a), b = pos('b', rojo.b);
      if (!a || !b) return '';
      return `M${a.right - base.left} ${a.top + a.height / 2 - base.top} L${b.left - base.left} ${b.top + b.height / 2 - base.top}`;
    })() }] : [])]);
  };
  useLayoutEffect(medir, [unidos, rojo]);
  // Si cambia el tamaño de la pantalla (girar el celular), se vuelven a medir los hilos.
  const medirRef = useRef(medir);
  medirRef.current = medir;
  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => medirRef.current());
    if (caja.current) ro.observe(caja.current);
    return () => ro.disconnect();
  }, []);

  const tocar = (lado: 'a' | 'b', k: number) => {
    if (unidos.includes(k) && sel === null) return;
    if (!sel || sel.lado === lado) { setSel({ lado, k }); sonar('pop'); return; }
    const a = lado === 'a' ? k : sel.k;
    const b = lado === 'b' ? k : sel.k;
    setSel(null);
    if (a === b) {
      sonar('bien');
      const n = [...unidos, a];
      setUnidos(n);
      setAviso({ ok: true, texto: `${juego.pares[a].a} → ${juego.pares[a].b}.`, por: juego.pares[a].por });
      if (n.length === juego.pares.length) {
        const aciertos = juego.pares.length - errores.size;
        setTimeout(() => alTerminar(aciertos, juego.pares.length), 900);
      }
    } else {
      sonar('mal');
      vibrar(60);
      setErrores((e) => new Set(e).add(a));
      setRojo({ a, b });
      setTimeout(() => setRojo(null), 900);
      setAviso({ ok: false, texto: `${juego.pares[a].a} no «${juego.pares[b].b.toLowerCase()}».`, por: `Su función es: ${juego.pares[a].b.toLowerCase()}.` });
    }
  };

  return (
    <section className="juego" aria-labelledby="t-hilos">
      <h2 id="t-hilos">{juego.titulo}</h2>
      <p className="pista">Toca un actor y después su función. Cada pareja correcta queda unida con un hilo.</p>
      <Avance hecho={unidos.length} total={juego.pares.length} />
      <div className="telar" ref={caja}>
        <svg className="hilos" aria-hidden="true">
          {lineas.map((l) => (
            <path key={l.k} d={l.d} fill="none" stroke={l.k < 0 ? 'var(--mal)' : COLORES[l.k % COLORES.length]} strokeWidth={4} strokeLinecap="round" strokeDasharray={l.k < 0 ? '6 6' : undefined} />
          ))}
        </svg>
        <div className="columna">
          {izq.map((p) => (
            <button key={p.k} data-nudo={'a' + p.k} style={{ ['--c' as string]: COLORES[p.k % COLORES.length] }}
              className={'nudo izq' + (sel?.lado === 'a' && sel.k === p.k ? ' sel' : '') + (unidos.includes(p.k) ? ' unido' : '') + (rojo?.a === p.k ? ' error' : '')}
              onClick={() => tocar('a', p.k)} aria-pressed={sel?.lado === 'a' && sel.k === p.k} disabled={unidos.includes(p.k)}>
              {p.a}
            </button>
          ))}
        </div>
        <div className="columna">
          {der.map((p) => (
            <button key={p.k} data-nudo={'b' + p.k}
              className={'nudo' + (sel?.lado === 'b' && sel.k === p.k ? ' sel' : '') + (unidos.includes(p.k) ? ' unido' : '') + (rojo?.b === p.k ? ' error' : '')}
              onClick={() => tocar('b', p.k)} aria-pressed={sel?.lado === 'b' && sel.k === p.k} disabled={unidos.includes(p.k)}>
              {p.b}
            </button>
          ))}
        </div>
      </div>
      <Aviso aviso={aviso} vacio="Elige un actor o una función para empezar." />
    </section>
  );
};
