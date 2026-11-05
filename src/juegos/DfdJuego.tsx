// DfdJuego.tsx · Capítulo 8
// Armar el diagrama de flujo de datos (DFD) del pedido en una tienda en línea, en tres pasos:
//   1. Reconocer los cuatro símbolos (entidad externa, proceso, almacén y flujo de datos).
//   2. Decir qué símbolo es cada elemento del caso.
//   3. Conectar cada flujo de datos: tocar de dónde sale y luego a dónde llega.
//      Si la conexión rompe una regla del DFD (entidad con entidad, almacén con almacén…), se explica cuál.
import React, { useMemo, useState } from 'react';
import type { Juego } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Avance, Aviso, type AvisoDato } from '../componentes/Piezas';

type J = Extract<Juego, { tipo: 'dfd' }>;
type Tipo = 'entidad' | 'proceso' | 'almacen' | 'flujo';

const NOMBRE: Record<Tipo, string> = { entidad: 'Entidad externa', proceso: 'Proceso', almacen: 'Almacén de datos', flujo: 'Flujo de datos' };
const COLOR: Record<Tipo, string> = { entidad: 'var(--c-act)', proceso: 'var(--c-pro)', almacen: 'var(--c-dat)', flujo: 'var(--c-sis)' };

// ---------- dibujo de cada símbolo ----------
export const SimboloDfd: React.FC<{ s: Tipo; x?: number; y?: number; texto?: string; num?: string; sel?: boolean; on?: boolean }> = ({ s, x = 0, y = 0, texto, num, sel, on = true }) => {
  const borde = sel ? 'var(--c-sis)' : COLOR[s];
  const relleno = `color-mix(in srgb, ${COLOR[s]} 24%, var(--panel))`;
  const g = sel ? 6 : 3;
  const op = on ? 1 : 0.3;
  if (s === 'entidad') return (
    <g opacity={op}>
      <rect x={x - 90} y={y - 32} width={180} height={64} rx={4} fill={relleno} stroke={borde} strokeWidth={g} />
      {texto && <text x={x} y={y + 7} textAnchor="middle" className="bpmn-txt chico">{texto}</text>}
    </g>
  );
  if (s === 'proceso') return (
    <g opacity={op}>
      <circle cx={x} cy={y} r={62} fill={relleno} stroke={borde} strokeWidth={g} />
      {num && <text x={x} y={y - 26} textAnchor="middle" className="bpmn-txt chico" style={{ fill: COLOR.proceso }}>{num}</text>}
      {texto && <foreignObject x={x - 54} y={y - 18} width={108} height={52}><div className="bpmn-caja dfd-txt">{texto}</div></foreignObject>}
    </g>
  );
  if (s === 'almacen') return (
    <g opacity={op}>
      <rect x={x - 100} y={y - 28} width={200} height={56} fill={relleno} stroke="none" />
      <path d={`M${x + 100} ${y - 28} H${x - 100} V${y + 28} H${x + 100}`} fill="none" stroke={borde} strokeWidth={g} />
      <line x1={x - 56} y1={y - 28} x2={x - 56} y2={y + 28} stroke={borde} strokeWidth={g} />
      {num && <text x={x - 78} y={y + 7} textAnchor="middle" className="bpmn-txt chico">{num}</text>}
      {texto && <text x={x + 22} y={y + 7} textAnchor="middle" className="bpmn-txt chico">{texto}</text>}
    </g>
  );
  return (
    <g opacity={op}>
      <path d={`M${x - 70} ${y + 10} L${x + 56} ${y + 10}`} stroke={COLOR.flujo} strokeWidth={5} />
      <path d={`M${x + 50} ${y} L${x + 72} ${y + 10} L${x + 50} ${y + 20} Z`} fill={COLOR.flujo} />
      <text x={x - 6} y={y - 6} textAnchor="middle" className="bpmn-txt chico">dato</text>
    </g>
  );
};

// ---------- el caso: pedido en una tienda en línea ----------
const NODOS: { id: string; tipo: Exclude<Tipo, 'flujo'>; t: string; num?: string; x: number; y: number }[] = [
  { id: 'cli', tipo: 'entidad', t: 'Cliente', x: 150, y: 70 },
  { id: 'd1', tipo: 'almacen', t: 'Pedidos', num: 'D1', x: 460, y: 110 },
  { id: 'p1', tipo: 'proceso', t: 'Recibir pedido', num: '1', x: 300, y: 260 },
  { id: 'd2', tipo: 'almacen', t: 'Productos', num: 'D2', x: 110, y: 420 },
  { id: 'p2', tipo: 'proceso', t: 'Verificar pago', num: '2', x: 300, y: 520 },
  { id: 'banco', tipo: 'entidad', t: 'Banco', x: 490, y: 650 },
  { id: 'p3', tipo: 'proceso', t: 'Despachar pedido', num: '3', x: 300, y: 770 },
  { id: 'trans', tipo: 'entidad', t: 'Transportadora', x: 120, y: 880 },
];
const FLUJOS: { de: string; a: string; t: string; por: string }[] = [
  { de: 'cli', a: 'p1', t: 'datos del pedido', por: 'El cliente entrega sus datos al proceso que recibe el pedido.' },
  { de: 'd2', a: 'p1', t: 'precio y existencias', por: 'El proceso lee del almacén de productos si hay y cuánto vale.' },
  { de: 'p1', a: 'd1', t: 'pedido registrado', por: 'El pedido queda guardado en el almacén de pedidos.' },
  { de: 'p1', a: 'p2', t: 'valor a pagar', por: 'Recibido el pedido, pasa a verificar el pago.' },
  { de: 'p2', a: 'banco', t: 'solicitud de cobro', por: 'El proceso le pide al banco que cobre.' },
  { de: 'banco', a: 'p2', t: 'pago confirmado', por: 'El banco devuelve la confirmación al proceso.' },
  { de: 'p2', a: 'p3', t: 'pedido pagado', por: 'Con el pago confirmado, el pedido se puede despachar.' },
  { de: 'p3', a: 'trans', t: 'guía de envío', por: 'El proceso le entrega a la transportadora la guía para llevar el pedido.' },
];
// Elementos del paso 2: los nodos del caso y dos flujos.
const ELEMENTOS: { t: string; tipo: Tipo; por: string }[] = [
  ...NODOS.map((x) => ({
    t: x.t, tipo: x.tipo as Tipo,
    por: x.tipo === 'entidad' ? 'Está afuera del sistema: da o recibe datos.' : x.tipo === 'proceso' ? 'Lleva un verbo: transforma los datos.' : 'Ahí se guardan los datos.',
  })),
  { t: 'datos del pedido', tipo: 'flujo', por: 'Es un dato que viaja: se dibuja como flecha con nombre.' },
  { t: 'pago confirmado', tipo: 'flujo', por: 'Es un dato en movimiento: flecha con nombre.' },
];
const TIPOS: Tipo[] = ['entidad', 'proceso', 'almacen', 'flujo'];
const SIMBOLOS: { s: Tipo; por: string }[] = [
  { s: 'entidad', por: 'Rectángulo: alguien de afuera que da o recibe datos.' },
  { s: 'proceso', por: 'Círculo con número: transforma los datos.' },
  { s: 'almacen', por: 'Rectángulo abierto: donde se guardan los datos.' },
  { s: 'flujo', por: 'Flecha con nombre: el dato que se mueve.' },
];

const n = (id: string) => NODOS.find((x) => x.id === id)!;
// Punto en el borde de la figura, en dirección a otro punto.
function borde(id: string, hx: number, hy: number) {
  const a = n(id);
  const dx = hx - a.x, dy = hy - a.y;
  const d = Math.hypot(dx, dy) || 1;
  if (a.tipo === 'proceso') return { x: a.x + (dx / d) * 66, y: a.y + (dy / d) * 66 };
  const [hw, hh] = a.tipo === 'entidad' ? [94, 36] : [104, 32];
  const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  return { x: a.x + dx * t, y: a.y + dy * t };
}
// Flecha recta entre dos figuras; si hay ida y vuelta, cada una se corre a un lado.
function flecha(de: string, a: string, doble: boolean) {
  const A = n(de), B = n(a);
  const p = borde(de, B.x, B.y), q = borde(a, A.x, A.y);
  let ox = 0, oy = 0;
  if (doble) {
    const d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    ox = (-(q.y - p.y) / d) * 12; oy = ((q.x - p.x) / d) * 12;
  }
  // Con ida y vuelta, cada nombre va más cerca de su origen para que no se monten.
  const t = doble ? 0.32 : 0.5;
  return { d: `M${p.x + ox} ${p.y + oy} L${q.x + ox} ${q.y + oy}`, mx: p.x + (q.x - p.x) * t + ox * 2.6, my: p.y + (q.y - p.y) * t + oy * 2.6 + 5 };
}

// ¿Qué regla rompe esta conexión? (para explicar el error)
function regla(de: string, a: string, esperado: { de: string; a: string; t: string }) {
  const ta = n(de).tipo, tb = n(a).tipo;
  if (ta === 'entidad' && tb === 'entidad') return 'Entidad con entidad: prohibido. Los datos tienen que pasar por un proceso.';
  if (ta === 'almacen' && tb === 'almacen') return 'Almacén con almacén: prohibido. Los datos no saltan solos de un almacén a otro.';
  if ((ta === 'entidad' && tb === 'almacen') || (ta === 'almacen' && tb === 'entidad')) return 'Una entidad no toca un almacén directo: hace falta un proceso en medio.';
  if (de === esperado.a && a === esperado.de) return 'La flecha va al revés: piensa quién da el dato y quién lo recibe.';
  return `Esa conexión se permite en un DFD, pero «${esperado.t}» no viaja por ahí. Piensa quién lo produce y quién lo usa.`;
}

export const DfdJuego: React.FC<{ juego: J; alTerminar: (a: number, t: number) => void }> = ({ juego, alTerminar }) => {
  const simbolos = useMemo(() => barajar(SIMBOLOS), []);
  const elementos = useMemo(() => barajar(ELEMENTOS), []);
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [i, setI] = useState(0);
  const [fallo, setFallo] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const [tiembla, setTiembla] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [hechos, setHechos] = useState(0); // flujos ya conectados (van en orden)
  const total = SIMBOLOS.length + ELEMENTOS.length + FLUJOS.length;

  const bien = (texto: string, por: string, fin?: () => void) => {
    sonar('bien');
    setAciertos((a) => a + (fallo ? 0 : 1));
    setFallo(false);
    setAviso({ ok: true, texto, por });
    fin?.();
  };
  const mal = (texto: string, por: string) => {
    sonar('mal'); vibrar(60);
    setFallo(true);
    setTiembla((k) => k + 1);
    setAviso({ ok: false, texto, por });
  };

  // Paso 1: ¿cómo se llama este símbolo?
  const nombrar = (t: Tipo) => {
    const s = simbolos[i];
    if (t !== s.s) return mal(`No es «${NOMBRE[t]}».`, 'Mira la forma: rectángulo, círculo, rectángulo abierto o flecha.');
    bien(`${NOMBRE[s.s]}.`, s.por, () => (i + 1 >= simbolos.length ? (setPaso(2), setI(0)) : setI(i + 1)));
  };
  // Paso 2: ¿qué símbolo es este elemento del caso?
  const clasificar = (t: Tipo) => {
    const e = elementos[i];
    if (t !== e.tipo) return mal(`«${e.t}» no es ${NOMBRE[t].toLowerCase()}.`, e.por);
    bien(`«${e.t}» → ${NOMBRE[e.tipo]}.`, e.por, () => {
      if (i + 1 >= elementos.length) {
        setPaso(3); setI(0);
        setTimeout(() => setAviso({ ok: true, texto: '¡Elementos listos!', por: 'Ahora conecta cada dato: toca de dónde sale y luego a dónde llega.' }), 700);
      } else setI(i + 1);
    });
  };
  // Paso 3: conectar el flujo que toca.
  const tocar = (id: string) => {
    if (paso !== 3 || hechos >= FLUJOS.length) return;
    if (!sel) { setSel(id); sonar('pop'); return; }
    if (sel === id) { setSel(null); return; }
    const f = FLUJOS[hechos];
    const de = sel;
    setSel(null);
    if (de !== f.de || id !== f.a) return mal(`De «${n(de).t}» a «${n(id).t}» no.`, regla(de, id, f));
    const fueLimpio = !fallo;
    bien(`«${f.t}»: ${n(f.de).t} → ${n(f.a).t}.`, f.por);
    const k = hechos + 1;
    setHechos(k);
    if (k === FLUJOS.length) {
      sonar('logro');
      setTimeout(() => alTerminar(aciertos + (fueLimpio ? 1 : 0), total), 1700);
    }
  };

  const hecho = paso === 1 ? i : paso === 2 ? SIMBOLOS.length + i : SIMBOLOS.length + ELEMENTOS.length + hechos;
  const actual = FLUJOS[hechos];
  const doble = (de: string, a: string) => FLUJOS.some((x) => x.de === a && x.a === de);

  return (
    <section className="juego" aria-labelledby="t-dfd">
      <h2 id="t-dfd">{juego.titulo}</h2>
      <p className="pista">
        {paso === 1 && <><b>Paso 1 de 3.</b> ¿Cómo se llama este símbolo del DFD?</>}
        {paso === 2 && <><b>Paso 2 de 3.</b> ¿Con qué símbolo se dibuja este elemento del caso?</>}
        {paso === 3 && actual && <><b>Paso 3 de 3.</b> Conecta el dato <b className="dato-pedido">«{actual.t}»</b>: toca de dónde sale y luego a dónde llega. ({hechos + 1} de {FLUJOS.length})</>}
        {paso === 3 && !actual && <><b>¡DFD completo!</b> Todos los datos pasan por un proceso.</>}
      </p>
      <Avance hecho={hecho} total={total} />

      {paso === 1 && (
        <div className="bpmn-simbolo">
          <svg key={i + '-' + tiembla} viewBox="-120 -80 240 160" className={'simbolo-grande' + (tiembla ? ' tiembla' : '')} role="img" aria-label="Símbolo de DFD para identificar">
            <SimboloDfd s={simbolos[i].s} num={simbolos[i].s === 'proceso' ? '1' : simbolos[i].s === 'almacen' ? 'D1' : undefined} />
          </svg>
          <div className="opciones">
            {TIPOS.map((t) => <button key={t} className="opcion" onClick={() => nombrar(t)}>{NOMBRE[t]}</button>)}
          </div>
        </div>
      )}

      {paso === 2 && elementos[i] && (
        <div className="clasifica-dfd">
          <div key={i + '-' + tiembla} className={'carta elemento-dfd' + (tiembla ? ' tiembla' : '')}>{elementos[i].t}</div>
          <div className="tipos-dfd">
            {TIPOS.map((t) => (
              <button key={t} className="opcion tipo-dfd" onClick={() => clasificar(t)}>
                <svg viewBox="-110 -70 220 140" aria-hidden="true"><SimboloDfd s={t} /></svg>
                <span>{NOMBRE[t]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {paso === 3 && (
        <div className="lienzo-bpmn lienzo-dfd">
          <svg viewBox="0 0 600 930" role="img" aria-label={`DFD del pedido en línea: ${hechos} de ${FLUJOS.length} flujos conectados.`}>
            <defs>
              <marker id="punta-dfd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="var(--c-sis)" />
              </marker>
            </defs>
            {FLUJOS.slice(0, hechos).map((f) => {
              const fl = flecha(f.de, f.a, doble(f.de, f.a));
              return (
                <g key={f.t} className="flecha-nueva">
                  <path d={fl.d} fill="none" stroke="var(--c-sis)" strokeWidth="4" markerEnd="url(#punta-dfd)" />
                  <text x={fl.mx} y={fl.my} textAnchor="middle" className="bpmn-txt chico etiqueta-dfd">{f.t}</text>
                </g>
              );
            })}
            {NODOS.map((x) => {
              // Después de un error, el punto de salida del dato brilla como pista.
              const pista = !!actual && fallo && !sel && x.id === actual.de;
              return (
                <g key={x.id} className={'nodo-bpmn' + (pista ? ' pista-nodo' : '')} onClick={() => tocar(x.id)} role="button" tabIndex={0}
                  aria-label={`${x.t} (${NOMBRE[x.tipo]})${sel === x.id ? ', elegido' : ''}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tocar(x.id); } }}>
                  <SimboloDfd s={x.tipo} x={x.x} y={x.y} texto={x.t} num={x.num} sel={sel === x.id} />
                </g>
              );
            })}
          </svg>
        </div>
      )}
      <Aviso aviso={aviso} vacio="Empecemos por los símbolos." />
    </section>
  );
};
