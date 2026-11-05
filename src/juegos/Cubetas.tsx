// Cubetas.tsx · Capítulo 9
// Cada pregunta sobre la propuesta se arrastra a la cubeta del estudio que la revisa:
// técnica, operativa, económica, legal o viabilidad.
import React, { useMemo, useState } from 'react';
import type { Juego } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Avance, Aviso, CartaArrastrable, type AvisoDato } from '../componentes/Piezas';

type J = Extract<Juego, { tipo: 'cubetas' }>;

export const Cubetas: React.FC<{ juego: J; alTerminar: (a: number, t: number) => void }> = ({ juego, alTerminar }) => {
  const cartas = useMemo(() => barajar(juego.items), [juego]);
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [fallo, setFallo] = useState(false);
  const [cuenta, setCuenta] = useState<Record<string, number>>({});
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const [tiembla, setTiembla] = useState(0);
  const c = cartas[i];
  const nombre = (id: string) => juego.cubetas.find((b) => b.id === id)!.n;

  const poner = (id: string) => {
    if (!c) return;
    const ok = id === c.b;
    sonar(ok ? 'bien' : 'mal');
    if (!ok) {
      vibrar(60);
      setFallo(true);
      setTiembla((n) => n + 1);
      setAviso({ ok: false, texto: `No es ${nombre(id).toLowerCase()}.`, por: 'Recuerda: técnica = datos y tecnología · operativa = la gente · económica = costo · legal = la ley · viabilidad = vale la pena y se sostiene.' });
      return;
    }
    const nuevos = aciertos + (fallo ? 0 : 1);
    setAciertos(nuevos);
    setFallo(false);
    setCuenta((k) => ({ ...k, [id]: (k[id] || 0) + 1 }));
    setAviso({ ok: true, texto: `${nombre(id)}.`, por: c.por });
    if (i + 1 >= cartas.length) setTimeout(() => alTerminar(nuevos, cartas.length), 800);
    setI(i + 1);
  };

  return (
    <section className="juego" aria-labelledby="t-cub">
      <h2 id="t-cub">{juego.titulo}</h2>
      <p className="pista">Propuesta: una agenda compartida para el consultorio. Arrastra cada pregunta a su cubeta.</p>
      <Avance hecho={i} total={cartas.length} />
      {c ? <CartaArrastrable key={i + '-' + tiembla} className={tiembla ? 'tiembla' : ''} texto={c.t} alSoltar={poner} /> : <div className="carta">¡Propuesta evaluada!</div>}
      <div className="cubetas">
        {juego.cubetas.map((b) => (
          <button key={b.id} className="cubeta zona" data-zona={b.id} style={{ ['--c' as string]: `var(--c-${b.c})` }} onClick={() => poner(b.id)} disabled={!c}>
            {b.n}<small>{cuenta[b.id] || 0} preguntas</small>
          </button>
        ))}
      </div>
      <Aviso aviso={aviso} />
    </section>
  );
};
