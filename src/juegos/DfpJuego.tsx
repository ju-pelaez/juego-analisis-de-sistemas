// DfpJuego.tsx · Capítulo 7
// Armar el diagrama de flujo de procesos (DFP) de un pedido en la cafetería, en tres pasos:
//   1. Reconocer los símbolos (óvalo, rectángulo, rombo, paralelogramo, documento y flecha).
//   2. Armar el diagrama: cada hueco tiene su forma; hay que poner el paso que va ahí, en orden.
//   3. Probar el diagrama: una ficha recorre el flujo y en el rombo el jugador decide por dónde sigue.
import React, { useEffect, useMemo, useState } from 'react';
import type { Juego } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Avance, Aviso, type AvisoDato } from '../componentes/Piezas';

type J = Extract<Juego, { tipo: 'dfp' }>;
type Forma = 'terminal' | 'proceso' | 'decision' | 'entrada' | 'documento' | 'flecha';

const NOMBRE: Record<Forma, string> = {
  terminal: 'Inicio o fin', proceso: 'Proceso', decision: 'Decisión', entrada: 'Entrada o salida de datos', documento: 'Documento', flecha: 'Línea de flujo',
};
const FORMA_DE: Record<Forma, string> = {
  terminal: 'un óvalo', proceso: 'un rectángulo', decision: 'un rombo', entrada: 'un paralelogramo', documento: 'un documento', flecha: 'una flecha',
};
const COLOR: Record<Forma, string> = {
  terminal: 'var(--c-efe)', proceso: 'var(--c-pro)', decision: 'var(--c-sis)', entrada: 'var(--c-dat)', documento: 'var(--c-act)', flecha: 'var(--c-con)',
};
// Medio ancho y medio alto de cada forma (para flechas y para la ficha que recorre).
const MEDIDA: Record<Forma, [number, number]> = {
  terminal: [90, 28], proceso: [100, 32], decision: [80, 56], entrada: [110, 32], documento: [110, 32], flecha: [70, 10],
};

// ---------- dibujo de cada símbolo ----------
export const SimboloDfp: React.FC<{ s: Forma; x?: number; y?: number; texto?: string; vacio?: boolean; brilla?: boolean; activo?: boolean }> = ({ s, x = 0, y = 0, texto, vacio, brilla, activo }) => {
  const c = COLOR[s];
  const relleno = vacio ? 'transparent' : `color-mix(in srgb, ${c} ${activo ? 40 : 24}%, var(--panel))`;
  const trazo = brilla ? 'var(--c-sis)' : vacio ? 'var(--linea-fuerte)' : c;
  const p = { fill: relleno, stroke: trazo, strokeWidth: brilla || activo ? 5 : 3, strokeDasharray: vacio && !brilla ? '8 7' : undefined };
  const [w, h] = MEDIDA[s];
  let figura: React.ReactNode;
  if (s === 'terminal') figura = <rect x={x - w} y={y - h} width={w * 2} height={h * 2} rx={h} {...p} />;
  else if (s === 'proceso') figura = <rect x={x - w} y={y - h} width={w * 2} height={h * 2} rx={6} {...p} />;
  else if (s === 'decision') figura = <path d={`M${x} ${y - h} L${x + w} ${y} L${x} ${y + h} L${x - w} ${y} Z`} {...p} />;
  else if (s === 'entrada') figura = <path d={`M${x - w + 24} ${y - h} H${x + w} L${x + w - 24} ${y + h} H${x - w} Z`} {...p} />;
  else if (s === 'documento') figura = <path d={`M${x - w} ${y - h} H${x + w} V${y + h - 6} Q${x + w / 2} ${y + h - 22} ${x} ${y + h - 6} T${x - w} ${y + h - 6} Z`} {...p} />;
  else figura = (
    <g>
      <path d={`M${x} ${y - 46} V${y + 30}`} stroke={c} strokeWidth={6} />
      <path d={`M${x - 14} ${y + 24} L${x} ${y + 48} L${x + 14} ${y + 24} Z`} fill={c} />
    </g>
  );
  return (
    <g>
      {figura}
      {texto && !vacio && (
        <foreignObject x={x - w + (s === 'decision' ? 22 : 8)} y={y - h + 2} width={w * 2 - (s === 'decision' ? 44 : 16)} height={h * 2 - 4}>
          <div className={'bpmn-caja dfp-txt' + (s === 'decision' ? ' dfp-rombo' : '')}>{texto}</div>
        </foreignObject>
      )}
    </g>
  );
};

// ---------- el caso: atender un pedido en la cafetería ----------
type Nodo = { id: string; s: Forma; t: string; x: number; y: number };
const NODOS: Nodo[] = [
  { id: 'ini', s: 'terminal', t: 'Inicio', x: 260, y: 60 },
  { id: 'ped', s: 'entrada', t: 'Recibir el pedido', x: 260, y: 170 },
  { id: 'dec', s: 'decision', t: '¿Hay el producto?', x: 260, y: 310 },
  { id: 'otro', s: 'proceso', t: 'Ofrecer otro producto', x: 480, y: 310 },
  { id: 'cob', s: 'proceso', t: 'Cobrar el pedido', x: 260, y: 450 },
  { id: 'rec', s: 'documento', t: 'Entregar el recibo', x: 260, y: 565 },
  { id: 'ent', s: 'proceso', t: 'Entregar el pedido', x: 260, y: 680 },
  { id: 'fin', s: 'terminal', t: 'Fin', x: 260, y: 790 },
];
// Orden en que se arma el diagrama (el inicio ya viene puesto).
const ORDEN = ['ped', 'dec', 'cob', 'rec', 'ent', 'fin', 'otro'];
const n = (id: string) => NODOS.find((x) => x.id === id)!;

// Flechas: cada una aparece cuando ya están puestos sus dos extremos.
const FLECHAS: { de: string; a: string; d: string; et?: string; ex?: number; ey?: number }[] = [
  { de: 'ini', a: 'ped', d: 'M260 88 V136' },
  { de: 'ped', a: 'dec', d: 'M260 202 V252' },
  { de: 'dec', a: 'cob', d: 'M260 366 V416', et: 'Sí', ex: 276, ey: 398 },
  { de: 'cob', a: 'rec', d: 'M260 482 V531' },
  { de: 'rec', a: 'ent', d: 'M260 591 V646' },
  { de: 'ent', a: 'fin', d: 'M260 712 V760' },
  { de: 'dec', a: 'otro', d: 'M340 310 H376', et: 'No', ex: 342, ey: 298 },
  { de: 'otro', a: 'dec', d: 'M480 278 V230 H268' },
];

const SIMBOLOS: { s: Forma; por: string }[] = [
  { s: 'terminal', por: 'Óvalo: dónde empieza y dónde termina.' },
  { s: 'proceso', por: 'Rectángulo: una acción que se hace.' },
  { s: 'decision', por: 'Rombo: una pregunta con dos salidas, sí o no.' },
  { s: 'entrada', por: 'Paralelogramo: un dato que entra o sale.' },
  { s: 'documento', por: 'Base ondulada: un papel, recibo o reporte.' },
  { s: 'flecha', por: 'Flecha: el orden de los pasos.' },
];

// Paso 3: situaciones para probar el diagrama. Cada una es una decisión en el rombo.
const PRUEBAS: { q: string; ok: 'si' | 'no'; por: string; nueva: boolean }[] = [
  { q: 'Un estudiante pide una empanada y sí hay. ¿Por dónde sigue?', ok: 'si', por: 'Hay el producto: se cobra, se entrega el recibo y el pedido.', nueva: true },
  { q: 'Otra persona pide jugo de mango, pero se acabó. ¿Por dónde sigue?', ok: 'no', por: 'No hay: se ofrece otro producto y se vuelve a preguntar.', nueva: true },
  { q: 'Le ofrecen limonada y sí hay. ¿Por dónde sigue ahora?', ok: 'si', por: 'Ahora sí hay: sigue el camino del Sí hasta el fin.', nueva: false },
];
const CAMINO_SI = ['cob', 'rec', 'ent', 'fin'];
const CAMINO_NO = ['otro', 'dec'];

export const DfpJuego: React.FC<{ juego: J; alTerminar: (a: number, t: number) => void }> = ({ juego, alTerminar }) => {
  const simbolos = useMemo(() => barajar(SIMBOLOS), []);
  const nombres = useMemo(() => barajar(SIMBOLOS.map((s) => s.s)), []);
  const cartas = useMemo(() => barajar(ORDEN), []);
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [i, setI] = useState(0);
  const [fallo, setFallo] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const [tiembla, setTiembla] = useState(0);
  const puestos = paso === 1 ? [] : ['ini', ...ORDEN.slice(0, paso === 2 ? i : ORDEN.length)];

  // Paso 3: dónde está la ficha, qué camino le falta y qué prueba toca.
  const [ficha, setFicha] = useState('ini');
  const [cola, setCola] = useState<string[]>([]);
  const [prueba, setPrueba] = useState(0);
  const [preguntando, setPreguntando] = useState(false);
  const total = SIMBOLOS.length + ORDEN.length + PRUEBAS.length;

  const bien = (texto: string, por: string) => {
    sonar('bien');
    setAciertos((a) => a + (fallo ? 0 : 1));
    setFallo(false);
    setAviso({ ok: true, texto, por });
  };
  const mal = (texto: string, por: string) => {
    sonar('mal'); vibrar(60);
    setFallo(true);
    setTiembla((k) => k + 1);
    setAviso({ ok: false, texto, por });
  };

  const nombrar = (f: Forma) => {
    const s = simbolos[i];
    if (f !== s.s) return mal(`No es «${NOMBRE[f]}».`, 'Mira la forma con calma.');
    bien(`${NOMBRE[s.s]}.`, s.por);
    if (i + 1 >= simbolos.length) { setPaso(2); setI(0); } else setI(i + 1);
  };

  const poner = (id: string) => {
    const quiere = n(ORDEN[i]), carta = n(id);
    if (id !== quiere.id) {
      if (carta.s !== quiere.s) return mal(`«${carta.t}» no va aquí.`, `Este hueco es ${FORMA_DE[quiere.s]} y «${carta.t}» se dibuja con ${FORMA_DE[carta.s]}.`);
      return mal(`«${carta.t}» no va todavía.`, ORDEN.indexOf(id) > i ? 'Ese paso va más adelante. Sigue las flechas.' : 'Piensa qué pasa justo aquí.');
    }
    bien(`«${carta.t}» en ${FORMA_DE[carta.s]}.`, id === 'otro' ? 'Es el camino del No: ofrecer otro y volver a preguntar.' : SIMBOLOS.find((s) => s.s === carta.s)!.por);
    if (i + 1 >= ORDEN.length) {
      setPaso(3);
      setTimeout(() => { setAviso({ ok: true, texto: '¡Diagrama armado!', por: 'Ahora pruébalo: la ficha recorre el flujo y tú decides en el rombo.' }); setCola(['ped', 'dec']); }, 900);
    } else setI(i + 1);
  };

  // La ficha avanza un paso cada medio segundo por la cola de su camino.
  useEffect(() => {
    if (paso !== 3 || !cola.length) return;
    const t = setTimeout(() => {
      const [sig, ...resto] = cola;
      setFicha(sig);
      setCola(resto);
      sonar('tic');
      if (sig === 'dec' && !resto.length) setPreguntando(true);
      if (sig === 'fin' && !resto.length) {
        if (prueba >= PRUEBAS.length) {
          sonar('logro');
          setTimeout(() => alTerminar(aciertos, total), 1200);
        } else if (PRUEBAS[prueba].nueva) {
          // Empieza otra situación: la ficha vuelve al inicio.
          setTimeout(() => { setFicha('ini'); setCola(['ped', 'dec']); }, 900);
        }
      }
    }, 520);
    return () => clearTimeout(t);
  }, [paso, cola]); // eslint-disable-line react-hooks/exhaustive-deps

  const decidir = (r: 'si' | 'no') => {
    const p = PRUEBAS[prueba];
    if (r !== p.ok) return mal(r === 'si' ? 'Por el Sí no.' : 'Por el No no.', 'Lee la situación: ¿hay o no hay el producto?');
    bien(r === 'si' ? 'Camino del Sí.' : 'Camino del No.', p.por);
    setPreguntando(false);
    setPrueba(prueba + 1);
    setCola(r === 'si' ? CAMINO_SI : CAMINO_NO);
  };

  const hecho = paso === 1 ? i : paso === 2 ? SIMBOLOS.length + i : SIMBOLOS.length + ORDEN.length + prueba;
  const restantes = cartas.filter((id) => !puestos.includes(id));
  const fn = n(ficha);
  const [, alto] = MEDIDA[fn.s];

  return (
    <section className="juego" aria-labelledby="t-dfp">
      <h2 id="t-dfp">{juego.titulo}</h2>
      <p className="pista">
        {paso === 1 && <><b>Paso 1 de 3.</b> ¿Cómo se llama este símbolo del diagrama de flujo?</>}
        {paso === 2 && <><b>Paso 2 de 3.</b> El hueco que brilla es {FORMA_DE[n(ORDEN[i]).s]}{ORDEN[i] === 'otro' ? ' del camino del No' : ''}. ¿Qué paso va ahí?</>}
        {paso === 3 && <><b>Paso 3 de 3.</b> Prueba tu diagrama: mira la ficha y decide en el rombo.</>}
      </p>
      <Avance hecho={hecho} total={total} />

      {paso === 1 && (
        <div className="bpmn-simbolo">
          <svg key={i + '-' + tiembla} viewBox="-130 -70 260 140" className={'simbolo-grande' + (tiembla ? ' tiembla' : '')} role="img" aria-label="Símbolo del diagrama de flujo para identificar">
            <SimboloDfp s={simbolos[i].s} />
          </svg>
          <div className="opciones">
            {nombres.map((f) => <button key={f} className="opcion" onClick={() => nombrar(f)}>{NOMBRE[f]}</button>)}
          </div>
        </div>
      )}

      {paso === 3 && preguntando && (
        <div className="prueba-dfp" role="group" aria-label="Decisión en el rombo">
          <p><b>{PRUEBAS[prueba].q}</b></p>
          <div className="fila-btn">
            <button key={'si' + tiembla} className={'btn' + (tiembla ? ' tiembla' : '')} onClick={() => decidir('si')}>Sí: hay el producto</button>
            <button key={'no' + tiembla} className={'btn sec' + (tiembla ? ' tiembla' : '')} onClick={() => decidir('no')}>No: no hay</button>
          </div>
        </div>
      )}

      {paso >= 2 && (
        <div className="armado-dfp">
          <div className="lienzo-bpmn lienzo-dfp">
            <svg viewBox="0 0 600 840" role="img" aria-label={`Diagrama de flujo del pedido: ${puestos.length} de ${NODOS.length} pasos puestos.`}>
              <defs>
                <marker id="punta-dfp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="var(--tinta)" />
                </marker>
              </defs>
              {FLECHAS.filter((f) => puestos.includes(f.de) && puestos.includes(f.a)).map((f) => (
                <g key={f.de + f.a} className="flecha-nueva">
                  <path d={f.d} fill="none" stroke="var(--tinta)" strokeWidth="4" markerEnd="url(#punta-dfp)" />
                  {f.et && <text x={f.ex} y={f.ey} className="bpmn-txt chico etiqueta-flujo">{f.et}</text>}
                </g>
              ))}
              {NODOS.map((x) => (
                <SimboloDfp key={x.id} s={x.s} x={x.x} y={x.y} texto={x.t} vacio={!puestos.includes(x.id)}
                  brilla={paso === 2 && ORDEN[i] === x.id} activo={paso === 3 && ficha === x.id} />
              ))}
              {paso === 3 && (
                <circle r="13" className="ficha-dfp" style={{ transform: `translate(${fn.x}px, ${fn.y - alto - 12}px)` }} />
              )}
            </svg>
          </div>
          {paso === 2 && (
            <div className="cartas-dfp" aria-label="Pasos para poner">
              {restantes.map((id) => (
                <button key={id} className="opcion carta-dfp" onClick={() => poner(id)}>
                  <svg viewBox="-125 -62 250 124" aria-hidden="true"><SimboloDfp s={n(id).s} /></svg>
                  <span>{n(id).t}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <Aviso aviso={aviso} vacio="Empecemos por los símbolos." />
    </section>
  );
};
