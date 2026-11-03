// Preguntas.tsx
// Las preguntas de control del final de cada capítulo: 4 opciones, retroalimentación con el porqué.
import React, { useMemo, useState } from 'react';
import type { Pregunta } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Avance, Aviso, type AvisoDato } from './Piezas';

export const Preguntas: React.FC<{ preguntas: Pregunta[]; alTerminar: (aciertos: number, total: number) => void }> = ({ preguntas, alTerminar }) => {
  const orden = useMemo(() => preguntas.map((p) => ({ ...p, ops: barajar([p.ok, ...p.mal]) })), [preguntas]);
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const p = orden[i];

  const elegir = (op: string) => {
    if (elegida) return;
    setElegida(op);
    const ok = op === p.ok;
    if (ok) setAciertos((a) => a + 1);
    sonar(ok ? 'bien' : 'mal');
    if (!ok) vibrar(60);
    setAviso({ ok, texto: ok ? 'Correcto.' : `La respuesta es: ${p.ok}.`, por: p.por });
  };
  const siguiente = () => {
    if (i + 1 >= orden.length) return alTerminar(aciertos, orden.length);
    setI(i + 1);
    setElegida(null);
    setAviso(null);
  };

  return (
    <section className="juego" aria-labelledby="titulo-preg">
      <p className="pista">Pregunta {i + 1} de {orden.length}</p>
      <Avance hecho={i + (elegida ? 1 : 0)} total={orden.length} />
      <h2 id="titulo-preg">{p.q}</h2>
      <div className="opciones">
        {p.ops.map((op, k) => (
          <button
            key={op}
            className={'opcion' + (elegida ? (op === p.ok ? ' ok' : op === elegida ? ' no' : '') : '')}
            onClick={() => elegir(op)}
            aria-disabled={!!elegida}
          >
            <span className="letra">{'ABCD'[k]}</span>
            {op}
          </button>
        ))}
      </div>
      <Aviso aviso={aviso} vacio="Elige una respuesta." />
      {elegida && (
        <button className="btn ancho" onClick={siguiente} autoFocus>
          {i + 1 >= orden.length ? 'Ver mi insignia' : 'Siguiente pregunta'}
        </button>
      )}
    </section>
  );
};
