// banco.ts
// Preguntas de la sala en vivo. Salen del mismo contenido del juego: las preguntas de control de
// cada capítulo, la ronda de verdadero o falso y los problemas centrales de los casos finales.
import { CAPITULOS } from '../datos/capitulos';
import { CASOS } from '../datos/casos';
import { barajar } from '../estado';

export type PreguntaSala = { t: string; ops: string[]; ok: number; por: string; tema: string; cap: string };

// Temas para elegir según lo que se está viendo en clase.
export const TEMAS_SALA = [
  { id: 'todo', n: 'Toda la clase', caps: [] as string[] },
  { id: 'fundamentos', n: 'El analista y el sistema', caps: ['bienvenida', 'sistema', 'modelo'] },
  { id: 'componentes', n: 'Actores, datos, procesos y control', caps: ['actores', 'datos', 'procesos', 'control'] },
  { id: 'diagramas', n: 'Diagramas: BPMN, DFP y DFD', caps: ['bpmn', 'dfp', 'dfd'] },
  { id: 'arbol', n: 'Árbol de problemas, entorno y factibilidad', caps: ['arbol', 'entorno', 'factibilidad'] },
];

export function armarBanco(): PreguntaSala[] {
  const todas: PreguntaSala[] = [];
  for (const c of CAPITULOS) {
    for (const p of c.preguntas) {
      const ops = barajar([p.ok, ...p.mal]).slice(0, 4);
      if (!ops.includes(p.ok)) ops[0] = p.ok;
      todas.push({ t: p.q, ops, ok: ops.indexOf(p.ok), por: p.por, tema: c.titulo, cap: c.id });
    }
    if (c.juego.tipo === 'relampago') {
      for (const it of c.juego.items) todas.push({ t: it.t, ops: ['Verdadero', 'Falso'], ok: it.v ? 0 : 1, por: it.por, tema: 'Verdadero o falso', cap: c.id });
    }
  }
  for (const caso of CASOS) {
    const ops = barajar(caso.troncos);
    todas.push({
      t: `${caso.nombre}: ¿cuál es el problema central bien formulado?`, ops: ops.map((o) => o.t),
      ok: ops.findIndex((o) => o.ok), por: 'El tronco es una sola situación negativa; no es una solución, ni una causa, ni un efecto.', tema: 'Árbol de problemas', cap: 'arbol',
    });
  }
  return todas;
}

// Una partida: n preguntas al azar, sin repetir el mismo tema dos veces seguidas cuando se puede.
export function partida(n: number, tema = 'todo'): PreguntaSala[] {
  const caps = TEMAS_SALA.find((t) => t.id === tema)?.caps || [];
  const b = barajar(armarBanco().filter((p) => !caps.length || caps.includes(p.cap)));
  const sal: PreguntaSala[] = [];
  while (sal.length < n && b.length) {
    const k = b.findIndex((p) => p.tema !== sal[sal.length - 1]?.tema);
    sal.push(b.splice(k < 0 ? 0 : k, 1)[0]);
  }
  return sal;
}
