// Relampago.tsx · Capítulo 6
// Ronda relámpago de verdadero o falso contra el reloj. Si el reloj estorba, se puede quitar
// (accesibilidad): entonces se avanza con el botón «Siguiente».
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Juego } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Avance, Aviso, type AvisoDato } from '../componentes/Piezas';

type J = Extract<Juego, { tipo: 'relampago' }>;

export const Relampago: React.FC<{ juego: J; alTerminar: (a: number, t: number) => void }> = ({ juego, alTerminar }) => {
  const items = useMemo(() => barajar(juego.items), [juego]);
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [resp, setResp] = useState<boolean | null | 'tiempo'>(null);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const [conReloj, setConReloj] = useState(true);
  const [quedan, setQuedan] = useState(juego.segundos);
  const fin = useRef(0);
  const it = items[i];

  const avanzar = (nuevos: number) => {
    if (i + 1 >= items.length) return alTerminar(nuevos, items.length);
    setI(i + 1);
    setResp(null);
    setAviso(null);
  };

  const responder = (v: boolean | 'tiempo') => {
    if (resp !== null || !it) return;
    const ok = v === it.v;
    sonar(ok ? 'bien' : 'mal');
    if (!ok) vibrar(60);
    const nuevos = aciertos + (ok ? 1 : 0);
    setAciertos(nuevos);
    setResp(v);
    setAviso({ ok, texto: v === 'tiempo' ? `¡Se acabó el tiempo! Era ${it.v ? 'verdadero' : 'falso'}.` : ok ? `Es ${it.v ? 'verdadero' : 'falso'}.` : `Era ${it.v ? 'verdadero' : 'falso'}.`, por: it.por });
    if (conReloj) setTimeout(() => avanzar(nuevos), 2400);
  };

  // Reloj: cuenta hacia atrás mientras no se haya respondido.
  useEffect(() => {
    if (!conReloj || resp !== null) return;
    fin.current = performance.now() + juego.segundos * 1000;
    setQuedan(juego.segundos);
    const t = setInterval(() => {
      const q = Math.max(0, (fin.current - performance.now()) / 1000);
      setQuedan(q);
      if (q <= 0) { clearInterval(t); responder('tiempo'); }
    }, 100);
    return () => clearInterval(t);
  }, [i, conReloj, resp]); // eslint-disable-line react-hooks/exhaustive-deps

  const frac = quedan / juego.segundos;
  return (
    <section className="juego relampago" aria-labelledby="t-rel">
      <h2 id="t-rel">{juego.titulo}</h2>
      <Avance hecho={i + (resp !== null ? 1 : 0)} total={items.length} />
      {conReloj && (
        <svg className="reloj" viewBox="0 0 100 100" role="timer" aria-label={`Quedan ${Math.ceil(quedan)} segundos`}>
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--linea-fuerte)" strokeWidth="10" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={frac < 0.3 ? 'var(--mal)' : 'var(--c-con)'} strokeWidth="10" strokeLinecap="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - frac} transform="rotate(-90 50 50)" />
          <text x="50" y="60" textAnchor="middle" style={{ fontFamily: 'var(--f-titulo)', fontWeight: 800, fontSize: 30, fill: 'var(--tinta)' }}>{Math.ceil(quedan)}</text>
        </svg>
      )}
      <p className="afirmacion">{it?.t}</p>
      <div className="vf">
        <button className="btn v" onClick={() => responder(true)} disabled={resp !== null}>Verdadero</button>
        <button className="btn f" onClick={() => responder(false)} disabled={resp !== null}>Falso</button>
      </div>
      <div style={{ width: '100%' }}><Aviso aviso={aviso} vacio="¿Verdadero o falso?" /></div>
      {!conReloj && resp !== null && <button className="btn ancho" onClick={() => avanzar(aciertos)} autoFocus>Siguiente</button>}
      <button className="btn fantasma" onClick={() => setConReloj((v) => !v)}>{conReloj ? 'Quitar el reloj' : 'Volver a poner el reloj'}</button>
    </section>
  );
};
