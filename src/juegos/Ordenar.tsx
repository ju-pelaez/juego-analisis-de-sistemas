// Ordenar.tsx · Capítulo 5
// Los pasos del proceso están revueltos: se tocan en el orden en que ocurren. Cada paso
// correcto baja a su lugar en la línea y muestra quién es su responsable.
import React, { useMemo, useState } from 'react';
import type { Juego } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Avance, Aviso, type AvisoDato } from '../componentes/Piezas';

type J = Extract<Juego, { tipo: 'ordenar' }>;

export const Ordenar: React.FC<{ juego: J; alTerminar: (a: number, t: number) => void }> = ({ juego, alTerminar }) => {
  const mazo = useMemo(() => barajar(juego.pasos.map((p, k) => ({ ...p, k }))), [juego]);
  const [hechos, setHechos] = useState(0);
  const [errores, setErrores] = useState<Set<number>>(new Set());
  const [tiembla, setTiembla] = useState<number | null>(null);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const total = juego.pasos.length;

  const tocar = (k: number) => {
    if (k === hechos) {
      sonar('bien');
      const n = hechos + 1;
      setHechos(n);
      setAviso({ ok: true, texto: `Paso ${n}: ${juego.pasos[k].t}.`, por: `Responsable: ${juego.pasos[k].quien}.` });
      if (n === total) setTimeout(() => alTerminar(total - errores.size, total), 900);
    } else {
      sonar('mal');
      vibrar(60);
      setErrores((e) => new Set(e).add(hechos));
      setTiembla(k);
      setTimeout(() => setTiembla(null), 400);
      setAviso({ ok: false, texto: k > hechos ? 'Ese paso va más adelante.' : 'Ese paso ya pasó.', por: `Pregúntate: ¿qué tiene que pasar justo después de «${hechos ? juego.pasos[hechos - 1].t.toLowerCase() : 'empezar'}»?` });
    }
  };

  return (
    <section className="juego" aria-labelledby="t-ord">
      <h2 id="t-ord">{juego.titulo}</h2>
      <p className="pista">Toca el paso que sigue. Llevas {hechos} de {total}.</p>
      <Avance hecho={hechos} total={total} />
      <ol className="linea-orden" aria-label="Línea del proceso">
        {juego.pasos.map((p, k) => (
          <li key={k} className={'hueco' + (k < hechos ? ' lleno' : '')}>
            <span className="n">{k + 1}</span>
            <span>{k < hechos ? <><b>{p.t}</b><small>{p.quien}</small></> : <small>…</small>}</span>
          </li>
        ))}
      </ol>
      <div className="mazo">
        {mazo.filter((p) => p.k >= hechos).map((p) => (
          <button key={p.k} className={tiembla === p.k ? 'tiembla' : ''} onClick={() => tocar(p.k)}>{p.t}</button>
        ))}
      </div>
      <Aviso aviso={aviso} vacio="¿Cuál es el primer paso?" />
    </section>
  );
};
