// MiniReto.tsx
// Cada ficha termina con un reto corto que se arma solo con su contenido, para que leer sea jugar:
//   · filas  → «¿Qué es…?»: elegir la palabra que corresponde a una descripción.
//   · dos    → «¿A cuál pertenece…?»: clasificar entre los dos lados.
//   · flujo  → «¿Qué va después de…?»: el paso siguiente.
//   · texto  → «Completa la frase»: la palabra que falta.
// Hasta responder no se pasa a la siguiente ficha.
import React, { useMemo, useState } from 'react';
import type { Ficha } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Aviso, type AvisoDato } from './Piezas';

type Reto = { tipo: string; q: React.ReactNode; ops: string[]; ok: string; por: string };

const palabras = (t: string) => (t.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{6,}/g) || []).map((p) => p.toLowerCase());
const COMUNES = new Set(['porque', 'cuando', 'después', 'primero', 'siempre', 'también', 'ejemplo', 'nosotros', 'quieres', 'entonces']);

function armar(f: Ficha, otras: Ficha[]): Reto | null {
  if (f.filas && f.filas.length >= 2) {
    const r = f.filas[Math.floor(Math.random() * f.filas.length)];
    const ops = barajar([r[0], ...barajar(f.filas.filter((x) => x[0] !== r[0]).map((x) => x[0])).slice(0, 3)]);
    return { tipo: '¿Qué es?', q: <>¿Qué corresponde a: «{r[1]}»?</>, ops, ok: r[0], por: `${r[0]}: ${r[1]}` };
  }
  if (f.dos) {
    const [lado, otro] = Math.random() < 0.5 ? [f.dos.si, f.dos.no] : [f.dos.no, f.dos.si];
    return { tipo: 'Clasifica', q: <>¿A cuál pertenece: «{lado[1]}»?</>, ops: barajar([lado[0], otro[0]]), ok: lado[0], por: `Es «${lado[0]}».` };
  }
  if (f.flujo && f.flujo.length >= 3) {
    const i = Math.floor(Math.random() * (f.flujo.length - 1));
    const ops = barajar(f.flujo.filter((_, k) => k !== i)).slice(0, 4);
    if (!ops.includes(f.flujo[i + 1])) ops[0] = f.flujo[i + 1];
    return { tipo: '¿Qué sigue?', q: <>¿Qué va justo después de «{f.flujo[i]}»?</>, ops: barajar(ops), ok: f.flujo[i + 1], por: f.flujo.join(' → ') };
  }
  const frase = f.frase || f.texto?.split(/(?<=\.)\s/)[0];
  if (!frase) return null;
  const candidatas = palabras(frase).filter((p) => !COMUNES.has(p));
  if (!candidatas.length) return null;
  const clave = candidatas.sort((a, b) => b.length - a.length)[0];
  const ajenas = [...new Set(otras.flatMap((o) => palabras(`${o.frase || ''} ${o.texto || ''} ${o.titulo}`)))].filter((p) => p !== clave && !COMUNES.has(p));
  const ops = barajar([clave, ...barajar(ajenas).slice(0, 2)]);
  const i = frase.toLowerCase().indexOf(clave);
  return {
    tipo: 'Completa la frase',
    q: <>«{frase.slice(0, i)}<span className="hueco-frase">_____</span>{frase.slice(i + clave.length)}»</>,
    ops, ok: clave, por: `«${frase}»`,
  };
}

// ¿Esta ficha tiene con qué armar un reto?
export const tieneReto = (f: Ficha) => armar(f, []) !== null;

export const MiniReto: React.FC<{ ficha: Ficha; otras: Ficha[]; alResponder: (ok: boolean) => void }> = ({ ficha, otras, alResponder }) => {
  const reto = useMemo(() => armar(ficha, otras), [ficha, otras]);
  const [elegida, setElegida] = useState<string | null>(null);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  if (!reto) return null;

  const elegir = (op: string) => {
    if (elegida) return;
    setElegida(op);
    const ok = op === reto.ok;
    sonar(ok ? 'bien' : 'mal');
    if (!ok) vibrar(60);
    setAviso({ ok, texto: ok ? '+5 puntos.' : `Era «${reto.ok}».`, por: reto.por });
    alResponder(ok);
  };

  return (
    <section className={'mini-reto' + (elegida ? (elegida === reto.ok ? ' gano' : ' perdio') : '')} aria-labelledby="t-mini">
      <p className="mini-etiqueta"><span aria-hidden="true">⚡</span> Mini reto · {reto.tipo}</p>
      <h3 id="t-mini">{reto.q}</h3>
      <div className="mini-ops">
        {reto.ops.map((op) => (
          <button key={op} className={'mini-op' + (elegida ? (op === reto.ok ? ' ok' : op === elegida ? ' no' : '') : '')}
            onClick={() => elegir(op)} aria-disabled={!!elegida}>
            {op}
          </button>
        ))}
      </div>
      {elegida && <Aviso aviso={aviso} />}
    </section>
  );
};
