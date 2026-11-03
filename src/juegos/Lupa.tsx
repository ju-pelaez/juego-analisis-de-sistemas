// Lupa.tsx · Capítulo 8
// Con la lupa: se marcan TODAS las cartas que son del entorno y luego se revisa. Cada carta
// muestra si estaba bien marcada y por qué.
import React, { useMemo, useState } from 'react';
import type { Juego } from '../datos/capitulos';
import { barajar, sonar } from '../estado';
import { Aviso, type AvisoDato } from '../componentes/Piezas';

type J = Extract<Juego, { tipo: 'lupa' }>;

export const Lupa: React.FC<{ juego: J; alTerminar: (a: number, t: number) => void }> = ({ juego, alTerminar }) => {
  const items = useMemo(() => barajar(juego.items), [juego]);
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [revisado, setRevisado] = useState(false);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const bien = items.filter((it) => marcadas.has(it.t) === it.sel).length;

  const alternar = (t: string) => {
    if (revisado) return;
    sonar('pop');
    setMarcadas((m) => {
      const n = new Set(m);
      if (n.has(t)) n.delete(t); else n.add(t);
      return n;
    });
  };
  const revisar = () => {
    setRevisado(true);
    const ok = bien === items.length;
    sonar(ok ? 'logro' : bien >= items.length * 0.7 ? 'bien' : 'mal');
    setAviso({ ok, texto: `Acertaste ${bien} de ${items.length}.`, por: 'Lee debajo de cada carta por qué es del entorno o del sistema.' });
  };

  return (
    <section className="juego" aria-labelledby="t-lupa">
      <h2 id="t-lupa">{juego.titulo}</h2>
      <p className="pista">{juego.pista} Pregunta clave: ¿el sistema lo puede cambiar?</p>
      <div className="rejilla-lupa">
        {items.map((it) => {
          const marcada = marcadas.has(it.t);
          const estado = revisado ? (marcada === it.sel ? ' ok' : ' no') : '';
          return (
            <button key={it.t} className={'lupa-carta' + estado} aria-pressed={marcada} onClick={() => alternar(it.t)}>
              {it.t}
              {revisado && <small>{it.sel ? 'Entorno. ' : 'Dentro del sistema. '}{it.por}</small>}
            </button>
          );
        })}
      </div>
      <Aviso aviso={aviso} vacio={`Marcadas: ${marcadas.size}. Cuando termines, toca «Revisar».`} />
      {!revisado
        ? <button className="btn ancho" onClick={revisar}>Revisar</button>
        : <button className="btn ancho" onClick={() => alTerminar(bien, items.length)} autoFocus>Continuar</button>}
    </section>
  );
};
