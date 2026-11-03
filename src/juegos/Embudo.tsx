// Embudo.tsx · Capítulo 4
// El destilador: cada carta se gradúa con una palanca de tres niveles (dato, información,
// conocimiento) y se "destila". La escalera muestra cuántas piezas lleva cada nivel.
import React, { useMemo, useState } from 'react';
import type { Juego } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Avance, Aviso, type AvisoDato } from '../componentes/Piezas';

type J = Extract<Juego, { tipo: 'embudo' }>;
const NIVELES = [
  { n: 'Dato', q: 'variable medible, suelta' },
  { n: 'Información', q: 'datos con contexto' },
  { n: 'Conocimiento', q: 'permite decidir y actuar' },
];

export const Embudo: React.FC<{ juego: J; alTerminar: (a: number, t: number) => void }> = ({ juego, alTerminar }) => {
  const cartas = useMemo(() => barajar(juego.items), [juego]);
  const [i, setI] = useState(0);
  const [nivel, setNivel] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [fallo, setFallo] = useState(false);
  const [cuenta, setCuenta] = useState([0, 0, 0]);
  const [brilla, setBrilla] = useState(-1);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const [tiembla, setTiembla] = useState(0);
  const c = cartas[i];

  const destilar = () => {
    if (!c) return;
    const ok = nivel === c.nivel;
    sonar(ok ? 'bien' : 'mal');
    if (!ok) {
      vibrar(60);
      setFallo(true);
      setTiembla((n) => n + 1);
      setAviso({ ok: false, texto: `No es ${NIVELES[nivel].n.toLowerCase()}.`, por: 'Piensa: ¿es una variable suelta, tiene contexto o permite decidir? Mueve la palanca y prueba otra vez.' });
      return;
    }
    const nuevos = aciertos + (fallo ? 0 : 1);
    setAciertos(nuevos);
    setFallo(false);
    setCuenta((k) => k.map((v, j) => (j === nivel ? v + 1 : v)));
    setBrilla(nivel);
    setTimeout(() => setBrilla(-1), 600);
    setAviso({ ok: true, texto: `${NIVELES[c.nivel].n}.`, por: c.por });
    setNivel(0);
    if (i + 1 >= cartas.length) setTimeout(() => alTerminar(nuevos, cartas.length), 800);
    setI(i + 1);
  };

  return (
    <section className="juego" aria-labelledby="t-emb">
      <h2 id="t-emb">{juego.titulo}</h2>
      <p className="pista">Ejemplo: una tienda en línea. Mueve la palanca al nivel correcto y toca «Destilar».</p>
      <Avance hecho={i} total={cartas.length} />
      <div className="destilador">
        <div className="juego">
          <div key={i + '-' + tiembla} className={'carta' + (tiembla ? ' tiembla' : '')} style={{ cursor: 'default', touchAction: 'auto', ['--c' as string]: 'var(--c-dat)' }}>
            {c ? c.t : '¡Todo destilado!'}
          </div>
          <div className="palanca">
            <label htmlFor="palanca"><b>Palanca:</b> {NIVELES[nivel].n}</label>
            <input id="palanca" type="range" min={0} max={2} step={1} value={nivel}
              onChange={(e) => { setNivel(Number(e.target.value)); sonar('tic'); }} disabled={!c}
              aria-valuetext={NIVELES[nivel].n} />
            <div className="marcas" aria-hidden="true">{NIVELES.map((n) => <span key={n.n}>{n.n}</span>)}</div>
          </div>
          <button className="btn ancho" onClick={destilar} disabled={!c}>Destilar</button>
        </div>
        <div className="escalera" aria-label="Escalera del conocimiento">
          {[2, 1, 0].map((k) => (
            <div key={k} className={'escalon' + (nivel === k ? ' on' : '') + (brilla === k ? ' salta' : '')}>
              <span><b>{NIVELES[k].n}</b><small>{NIVELES[k].q}</small></span>
              <span className="cuenta">{cuenta[k]}</span>
            </div>
          ))}
        </div>
      </div>
      <Aviso aviso={aviso} vacio="Dato → información → conocimiento." />
    </section>
  );
};
