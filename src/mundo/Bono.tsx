// Bono.tsx
// Los retos escondidos del mundo: preguntas rápidas que dan puntos extra la primera vez.
//   · Bloque ? : una pregunta del capítulo más cercano (+10).
//   · Bloque secreto: una «pregunta de oro» armada con las fichas del mundo (+25).
import React, { useMemo, useState } from 'react';
import type { Capitulo } from '../datos/capitulos';
import { barajar, conNombre, sonar, vibrar } from '../estado';
import { CaraProfe } from '../componentes/Profe';

type PreguntaBono = { q: string; ok: string; ops: string[]; por: string };

function deCapitulos(caps: Capitulo[], n: number): PreguntaBono[] {
  return barajar(caps.flatMap((c) => c.preguntas)).slice(0, n)
    .map((p) => ({ q: p.q, ok: p.ok, ops: barajar([p.ok, ...barajar(p.mal).slice(0, 2)]), por: p.por }));
}
// Pregunta de oro: una fila de las fichas («¿Qué corresponde a…?»).
function deOro(caps: Capitulo[]): PreguntaBono[] {
  const grupos = caps.flatMap((c) => c.fichas.flatMap((f) => (f.filas && f.filas.length >= 3 ? [f.filas] : [])));
  const grupo = barajar(grupos)[0];
  if (!grupo) return deCapitulos(caps, 1);
  const f = barajar(grupo)[0];
  return [{
    q: `¿Qué corresponde a: «${f[1].replace(/\.$/, '')}»?`, ok: f[0],
    ops: barajar([f[0], ...barajar(grupo.filter((x) => x[0] !== f[0]).map((x) => x[0])).slice(0, 3)]), por: `${f[0]}: ${f[1]}`,
  }];
}

export const Bono: React.FC<{
  tipo: 'bloque' | 'secreto'; caps: Capitulo[]; titulo: string; yaGanado?: number;
  alCerrar: () => void; alGanar: (puntos: number) => void;
}> = ({ tipo, caps, titulo, yaGanado: ganadoAntes, alCerrar, alGanar }) => {
  // Lo ganado antes de abrir: si ya se cobró, este intento es de práctica.
  const [yaGanado] = useState(ganadoAntes);
  const preguntas = useMemo(() => (tipo === 'bloque' ? deCapitulos(caps, 1) : deOro(caps)), [tipo, caps]);
  const [elegida, setElegida] = useState<string | null>(null);
  const [fin, setFin] = useState(false);
  const valor = tipo === 'bloque' ? 10 : 25;
  const p = preguntas[0];
  if (!p) return null;
  const acerto = elegida === p.ok;

  const elegir = (op: string) => {
    if (elegida) return;
    setElegida(op);
    const ok = op === p.ok;
    sonar(ok ? 'bien' : 'mal');
    if (!ok) vibrar(50);
  };
  const cerrar = () => {
    // Solo se guarda si acertó: si falla, el bloque sigue ahí para intentarlo otra vez.
    if (!fin && acerto && yaGanado == null) { alGanar(valor); sonar('logro'); }
    setFin(true);
    alCerrar();
  };

  return (
    <div className="bono" role="dialog" aria-modal="true" aria-labelledby="t-bono">
      <div className="bono-caja">
        <div className="bono-cabeza">
          <CaraProfe pose={elegida && acerto ? 'celebra' : 'explica'} size={44} />
          <div>
            <p className="bono-tipo">{tipo === 'bloque' ? '❓ Bloque de reto' : '✨ ¡Bloque secreto!'} · {titulo}{yaGanado != null ? ' · práctica' : ` · +${valor}`}</p>
            <h3 id="t-bono">{elegida ? (acerto ? conNombre('¡Bien hecho!') : 'Casi. Mira por qué.') : tipo === 'bloque' ? 'Responde y gana puntos' : 'Pregunta de oro'}</h3>
          </div>
          <button className="icono cerrar-bono" onClick={cerrar} aria-label="Cerrar">✕</button>
        </div>
        <p className="bono-q">{p.q}</p>
        <div className="bono-ops">
          {p.ops.map((op) => (
            <button key={op} className={'mini-op' + (elegida ? (op === p.ok ? ' ok' : op === elegida ? ' no' : '') : '')} onClick={() => elegir(op)} aria-disabled={!!elegida}>{op}</button>
          ))}
        </div>
        {elegida && <p className="bono-por"><b>{acerto ? `✓ ${yaGanado != null ? 'Correcto.' : `+${valor} puntos.`}` : `✗ Era «${p.ok}». Vuelve a golpear el bloque para intentarlo otra vez.`}</b> {p.por}</p>}
        {elegida && <button className="btn" onClick={cerrar} autoFocus>Seguir jugando →</button>}
      </div>
    </div>
  );
};
