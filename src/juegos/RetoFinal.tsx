// RetoFinal.tsx · Capítulo 10
// Un caso nuevo al azar y cuatro rondas que juntan toda la clase:
//   1. El problema central (tronco).
//   2. ¿Causa, efecto o entorno?
//   3. ¿A qué componente (A-D-P-C) pertenece cada causa?
//   4. ¿Qué estudio de factibilidad revisa cada pregunta?
import React, { useMemo, useState } from 'react';
import { CASOS, ESTUDIOS, type CasoFinal } from '../datos/casos';
import { COMPONENTES } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Avance, Aviso, type AvisoDato } from '../componentes/Piezas';

type Paso = { ronda: number; titulo: string; texto: string; ops: { id: string; n: string }[]; ok: string; por: string };

function armar(caso: CasoFinal): Paso[] {
  const pasos: Paso[] = [];
  const tr = barajar(caso.troncos);
  pasos.push({
    ronda: 1, titulo: 'Ronda 1 · El tronco', texto: '¿Cuál es el problema central bien formulado?',
    ops: tr.map((t, k) => ({ id: String(k), n: t.t })), ok: String(tr.findIndex((t) => t.ok)), por: tr.find((t) => t.ok)!.por,
  });
  const ZONAS = [{ id: 'causa', n: 'Causa (raíz)' }, { id: 'efecto', n: 'Efecto (copa)' }, { id: 'entorno', n: 'Entorno (suelo)' }];
  const POR = { causa: 'Explica por qué ocurre el problema.', efecto: 'Es algo que el problema produce.', entorno: 'Condiciona al sistema, pero no se controla desde él.' };
  barajar(caso.piezas).forEach((p) => pasos.push({ ronda: 2, titulo: 'Ronda 2 · Causa, efecto o entorno', texto: p.t, ops: ZONAS, ok: p.zona, por: POR[p.zona] }));
  const COMP = (Object.keys(COMPONENTES) as (keyof typeof COMPONENTES)[]).map((k) => ({ id: k, n: COMPONENTES[k].n }));
  barajar(caso.causas).forEach((c) => pasos.push({ ronda: 3, titulo: 'Ronda 3 · ¿Qué componente falla?', texto: c.t, ops: COMP, ok: c.comp, por: `${COMPONENTES[c.comp].n}: ${COMPONENTES[c.comp].q}` }));
  caso.estudios.forEach((e) => pasos.push({ ronda: 4, titulo: 'Ronda 4 · Factibilidad', texto: e.t, ops: ESTUDIOS.map((x) => ({ id: x.id, n: x.n })), ok: e.b, por: 'Técnica = datos y tecnología · Operativa = la gente · Económica = costo · Legal = la ley · Viabilidad = vale la pena y se sostiene.' }));
  return pasos;
}

export const RetoFinal: React.FC<{ alTerminar: (a: number, t: number, caso: string) => void }> = ({ alTerminar }) => {
  const [caso, setCaso] = useState(() => CASOS[Math.floor(Math.random() * CASOS.length)]);
  const pasos = useMemo(() => armar(caso), [caso]);
  const [i, setI] = useState(-1); // -1 = presentación del caso
  const [elegida, setElegida] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const p = pasos[i];

  const otroCaso = () => {
    const resto = CASOS.filter((c) => c.id !== caso.id);
    setCaso(resto[Math.floor(Math.random() * resto.length)]);
    setI(-1); setAciertos(0); setElegida(null); setAviso(null);
  };

  if (i < 0) {
    return (
      <section className="juego" aria-labelledby="t-caso">
        <p className="pista">Tu caso nuevo</p>
        <h2 id="t-caso">{caso.nombre}</h2>
        <div className="ficha"><p className="texto">{caso.descripcion}</p>
          <p className="frase">{pasos.length} retos en 4 rondas. Necesitas el 60 % para tu certificado.</p></div>
        <div className="fila-btn">
          <button className="btn" onClick={() => { sonar('entra'); setI(0); }}>Empezar el reto</button>
          <button className="btn sec" onClick={otroCaso}>Cambiar de caso</button>
        </div>
      </section>
    );
  }

  const elegir = (id: string) => {
    if (elegida) return;
    setElegida(id);
    const ok = id === p.ok;
    if (ok) setAciertos((a) => a + 1);
    sonar(ok ? 'bien' : 'mal');
    if (!ok) vibrar(60);
    setAviso({ ok, texto: ok ? 'Correcto.' : `Era: ${p.ops.find((o) => o.id === p.ok)!.n}.`, por: p.por });
  };
  const siguiente = () => {
    if (i + 1 >= pasos.length) return alTerminar(aciertos, pasos.length, caso.nombre);
    setI(i + 1); setElegida(null); setAviso(null);
  };

  return (
    <section className="juego" aria-labelledby="t-reto">
      <p className="pista">{caso.nombre} · {p.titulo} · reto {i + 1} de {pasos.length}</p>
      <Avance hecho={i + (elegida ? 1 : 0)} total={pasos.length} />
      <h2 id="t-reto">{p.ronda === 1 ? p.texto : `«${p.texto}»`}</h2>
      <div className={p.ronda === 1 ? 'opciones' : 'cubetas'}>
        {p.ops.map((o) => (
          <button key={o.id}
            className={(p.ronda === 1 ? 'opcion' : 'cubeta') + (elegida ? (o.id === p.ok ? ' ok' : o.id === elegida ? ' no' : '') : '')}
            style={p.ronda === 1 ? undefined : {
              ['--c' as string]: elegida && o.id === p.ok ? 'var(--bien)' : elegida === o.id ? 'var(--mal)' : 'var(--c-sis)',
            }}
            onClick={() => elegir(o.id)} aria-disabled={!!elegida}>
            {o.n}
          </button>
        ))}
      </div>
      <Aviso aviso={aviso} vacio="Elige una respuesta." />
      {elegida && <button className="btn ancho" onClick={siguiente} autoFocus>{i + 1 >= pasos.length ? 'Ver mi resultado' : 'Siguiente'}</button>}
    </section>
  );
};
