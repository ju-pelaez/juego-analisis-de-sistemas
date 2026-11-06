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

// ---------- modo Matriz: propuestas para ubicar según si se pueden hacer y si convienen ----------
export const CUADROS = ['Factible y viable', 'Factible, pero NO viable', 'NO factible, pero viable', 'Ni factible ni viable'];
const MATRIZ: { t: string; f: boolean; v: boolean; por: string }[] = [
  { t: 'Vender tinto en la entrada de la universidad cada mañana.', f: true, v: true, por: 'Se puede: hay termo, vasos y tiempo. Conviene y se sostiene: hay clientes todos los días.' },
  { t: 'Vender abrigos de lana en Florencia en pleno verano.', f: true, v: false, por: 'Se puede conseguir los abrigos, pero con este calor casi nadie los compraría: no conviene.' },
  { t: 'Una app de citas para un consultorio que no tiene computador ni internet.', f: false, v: true, por: 'Los pacientes sí la necesitan (viable), pero hoy no hay con qué hacerla funcionar (no factible).' },
  { t: 'Construir un satélite propio para llevar el inventario de una tienda de barrio.', f: false, v: false, por: 'No hay recursos para hacerlo y tampoco conviene: un cuaderno o una hoja de cálculo bastan.' },
  { t: 'Una agenda compartida en hoja de cálculo para el consultorio que pierde citas.', f: true, v: true, por: 'Tienen computador y alguien que la lleve; las citas perdidas cuestan más que la agenda.' },
  { t: 'Volver a turnos en papel en una biblioteca donde los turnos digitales funcionan bien.', f: true, v: false, por: 'Se puede imprimir fichas, pero no aporta nada: lo de hoy ya funciona.' },
  { t: 'Registro digital del ganado en veredas sin señal de celular ni internet.', f: false, v: true, por: 'Los productores lo necesitan, pero sin conectividad hoy no se puede hacer así.' },
  { t: 'Un formulario en línea para las quejas del transporte urbano, que hoy nadie registra.', f: true, v: true, por: 'Es sencillo de hacer y conviene: sin registrar las quejas, el sistema no aprende.' },
  { t: 'Imprimir un manual de 300 páginas para que cada pasajero aprenda las rutas de bus.', f: true, v: false, por: 'Imprimirlo se puede, pero nadie lo leería: no conviene ni se sostiene.' },
  { t: 'Un robot que atienda la cafetería con el presupuesto de un solo semestre.', f: false, v: false, por: 'No alcanza el dinero y tampoco conviene: el problema de la fila se resuelve con procesos.' },
  { t: 'Que la secretaría avise por WhatsApp cuando un trámite está listo.', f: true, v: true, por: 'Ya tienen celular y la gente lo usa; ahorra viajes y filas.' },
  { t: 'Exigir firma en notaría para cada préstamo de un libro.', f: true, v: false, por: 'Se puede hacer, pero cuesta más que el beneficio: nadie pediría libros.' },
];
const matriz = (): PreguntaSala[] => MATRIZ.map((m) => ({
  t: m.t, ops: CUADROS, ok: m.f ? (m.v ? 0 : 1) : (m.v ? 2 : 3), por: m.por, tema: 'Factibilidad y viabilidad', cap: 'factibilidad',
}));

// ---------- modo Relámpago: verdadero o falso armado con los minijuegos ----------
function relampago(): PreguntaSala[] {
  const vf = (t: string, v: boolean, por: string, tema: string, cap: string): PreguntaSala => ({ t, ops: ['Verdadero', 'Falso'], ok: v ? 0 : 1, por, tema, cap });
  const sal: PreguntaSala[] = [];
  for (const c of CAPITULOS) {
    const j = c.juego;
    if (j.tipo === 'relampago') j.items.forEach((it) => sal.push(vf(it.t, it.v, it.por, c.titulo, c.id)));
    if (j.tipo === 'deslizar') j.items.forEach((it, k) => {
      const dice = k % 2 ? j.der : j.izq; // la mitad se pregunta por un lado y la mitad por el otro
      sal.push(vf(`«${it.t}» pertenece al ${dice.toLowerCase()}.`, (it.lado === 'izq' ? j.izq : j.der) === dice, it.por, c.titulo, c.id));
    });
    if (j.tipo === 'frontera') j.items.forEach((it) => sal.push(vf(`«${it.t}» está dentro del sistema «${j.sistema}».`, it.dentro, it.por, c.titulo, c.id)));
    if (j.tipo === 'lupa') j.items.forEach((it) => sal.push(vf(`«${it.t}» es del entorno: el sistema no lo controla.`, it.sel, it.por, c.titulo, c.id)));
  }
  return sal;
}

// Una partida: n preguntas al azar, sin repetir el mismo tema dos veces seguidas cuando se puede.
export function partida(n: number, tema = 'todo', modo = 'clasico'): PreguntaSala[] {
  if (modo === 'matriz') return barajar(matriz()).slice(0, n);
  if (modo === 'relampago') return barajar(relampago()).slice(0, n);
  const caps = TEMAS_SALA.find((t) => t.id === tema)?.caps || [];
  const b = barajar(armarBanco().filter((p) => !caps.length || caps.includes(p.cap)));
  const sal: PreguntaSala[] = [];
  while (sal.length < n && b.length) {
    const k = b.findIndex((p) => p.tema !== sal[sal.length - 1]?.tema);
    sal.push(b.splice(k < 0 ? 0 : k, 1)[0]);
  }
  return sal;
}
