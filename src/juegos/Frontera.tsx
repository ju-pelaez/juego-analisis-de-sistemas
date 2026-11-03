// Frontera.tsx · Capítulo 1
// El límite del sistema es un círculo punteado. Cada carta se arrastra adentro del círculo
// (dentro del sistema) o al espacio de afuera. Los botones hacen lo mismo.
import React, { useMemo, useState } from 'react';
import type { Juego } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Avance, Aviso, CartaArrastrable, type AvisoDato } from '../componentes/Piezas';

type J = Extract<Juego, { tipo: 'frontera' }>;

export const Frontera: React.FC<{ juego: J; alTerminar: (a: number, t: number) => void }> = ({ juego, alTerminar }) => {
  const cartas = useMemo(() => barajar(juego.items), [juego]);
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [fallo, setFallo] = useState(false);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const [tiembla, setTiembla] = useState(0);
  const c = cartas[i];
  const puestos = cartas.slice(0, i);

  const poner = (zona: string) => {
    if (!c) return;
    const dentro = zona === 'dentro';
    const ok = dentro === c.dentro;
    sonar(ok ? 'bien' : 'mal');
    if (!ok) {
      vibrar(60);
      setFallo(true);
      setTiembla((n) => n + 1);
      setAviso({ ok: false, texto: `«${c.t}» va ${c.dentro ? 'dentro' : 'fuera'} del sistema.`, por: c.por + ' Inténtalo otra vez.' });
      return;
    }
    const nuevos = aciertos + (fallo ? 0 : 1);
    setAciertos(nuevos);
    setFallo(false);
    setAviso({ ok: true, texto: `«${c.t}» queda ${dentro ? 'dentro' : 'fuera'}.`, por: c.por });
    if (i + 1 >= cartas.length) setTimeout(() => alTerminar(nuevos, cartas.length), 700);
    setI(i + 1);
  };

  return (
    <section className="juego" aria-labelledby="t-front">
      <h2 id="t-front">{juego.titulo}</h2>
      <p className="pista">Sistema: <b>{juego.sistema}</b>. Arrastra cada carta adentro o afuera del límite.</p>
      <Avance hecho={i} total={cartas.length} />
      {c ? <CartaArrastrable key={i + '-' + tiembla} className={tiembla ? 'tiembla' : ''} texto={c.t} alSoltar={poner} /> : <div className="carta">¡Frontera trazada!</div>}
      <div className="campo-frontera">
        <div className="afuera zona" data-zona="fuera" onClick={() => poner('fuera')}>
          <span className="rotulo">FUERA DEL SISTEMA</span>
          <div className="pegados">{puestos.filter((p) => !p.dentro).map((p) => <span key={p.t} className="pegado">{p.t}</span>)}</div>
          <div className="adentro zona" data-zona="dentro" onClick={(e) => { e.stopPropagation(); poner('dentro'); }}>
            <span className="rotulo">DENTRO DEL SISTEMA</span>
            <div className="pegados">{puestos.filter((p) => p.dentro).map((p) => <span key={p.t} className="pegado">{p.t}</span>)}</div>
          </div>
        </div>
      </div>
      <div className="fila-btn">
        <button className="btn" onClick={() => poner('dentro')} disabled={!c}>Dentro del sistema</button>
        <button className="btn sec" onClick={() => poner('fuera')} disabled={!c}>Fuera del sistema</button>
      </div>
      <Aviso aviso={aviso} />
    </section>
  );
};
