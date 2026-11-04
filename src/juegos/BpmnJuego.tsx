// BpmnJuego.tsx · Capítulo 6
// Modelar un proceso con BPMN, como en Bizagi, en tres pasos:
//   1. Reconocer los símbolos (inicio, tarea, compuerta, fin, flujo).
//   2. Poner cada tarea en el carril del actor que la hace.
//   3. Conectar el flujo: tocar un elemento y luego el siguiente para dibujar la flecha.
// El diagrama es vertical (carriles en columnas) para que se lea bien en el celular.
import React, { useMemo, useState } from 'react';
import type { Juego } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Avance, Aviso, CartaArrastrable, type AvisoDato } from '../componentes/Piezas';

type J = Extract<Juego, { tipo: 'bpmn' }>;
type Tipo = 'inicio' | 'tarea' | 'compuerta' | 'fin';

// ---------- dibujo de cada símbolo ----------
export const Simbolo: React.FC<{ s: Tipo | 'flujo'; x?: number; y?: number; texto?: string; on?: boolean; sel?: boolean }> = ({ s, x = 0, y = 0, texto, on = true, sel }) => {
  const trazo = sel ? 'var(--c-sis)' : 'var(--tinta)';
  const op = on ? 1 : 0.28;
  if (s === 'inicio') return <g opacity={op}><circle cx={x} cy={y} r={24} fill="color-mix(in srgb, var(--c-efe) 30%, var(--panel))" stroke={sel ? trazo : 'var(--c-efe)'} strokeWidth={sel ? 6 : 3} /></g>;
  if (s === 'fin') return <g opacity={op}><circle cx={x} cy={y} r={24} fill="color-mix(in srgb, var(--c-act) 30%, var(--panel))" stroke={sel ? trazo : 'var(--c-act)'} strokeWidth={sel ? 10 : 8} />{texto && <text x={x} y={y + 46} textAnchor="middle" className="bpmn-txt chico">{texto}</text>}</g>;
  if (s === 'compuerta') return (
    <g opacity={op}>
      <path d={`M${x} ${y - 36} L${x + 36} ${y} L${x} ${y + 36} L${x - 36} ${y} Z`} fill="color-mix(in srgb, var(--c-sis) 30%, var(--panel))" stroke={sel ? trazo : 'var(--c-sis)'} strokeWidth={sel ? 6 : 3} />
      <path d={`M${x - 12} ${y - 12} L${x + 12} ${y + 12} M${x + 12} ${y - 12} L${x - 12} ${y + 12}`} stroke="var(--tinta)" strokeWidth={4} strokeLinecap="round" />
      {texto && <text x={x + 46} y={y + 6} className="bpmn-txt chico">{texto}</text>}
    </g>
  );
  if (s === 'flujo') return <g opacity={op}><path d={`M${x - 34} ${y} L${x + 26} ${y}`} stroke="var(--tinta)" strokeWidth={4} /><path d={`M${x + 18} ${y - 9} L${x + 34} ${y} L${x + 18} ${y + 9} Z`} fill="var(--tinta)" /></g>;
  return (
    <g opacity={op}>
      <rect x={x - 100} y={y - 34} width={200} height={68} rx={16} fill="color-mix(in srgb, var(--c-pro) 26%, var(--panel))" stroke={sel ? trazo : 'var(--c-pro)'} strokeWidth={sel ? 6 : 3} />
      {texto && <foreignObject x={x - 96} y={y - 32} width={192} height={64}><div className="bpmn-caja">{texto}</div></foreignObject>}
    </g>
  );
};

// ---------- el proceso: préstamo de un libro ----------
const CARRILES = ['Estudiante', 'Bibliotecario'];
const NODOS: { id: string; tipo: Tipo; t: string; carril: 0 | 1; x: number; y: number }[] = [
  { id: 'ini', tipo: 'inicio', t: 'Inicio', carril: 0, x: 150, y: 110 },
  { id: 'pedir', tipo: 'tarea', t: 'Pedir el libro', carril: 0, x: 150, y: 220 },
  { id: 'buscar', tipo: 'tarea', t: 'Buscar el libro', carril: 1, x: 450, y: 330 },
  { id: 'comp', tipo: 'compuerta', t: '¿Está disponible?', carril: 1, x: 450, y: 460 },
  { id: 'prestar', tipo: 'tarea', t: 'Prestar el libro', carril: 1, x: 450, y: 600 },
  { id: 'reservar', tipo: 'tarea', t: 'Hacer una reserva', carril: 0, x: 150, y: 600 },
  { id: 'fin1', tipo: 'fin', t: 'Libro prestado', carril: 1, x: 450, y: 740 },
  { id: 'fin2', tipo: 'fin', t: 'Reserva hecha', carril: 0, x: 150, y: 740 },
];
const FLUJOS: { de: string; a: string; et?: string; ex?: number; ey?: number; por: string }[] = [
  { de: 'ini', a: 'pedir', por: 'Todo proceso arranca en su evento de inicio.' },
  { de: 'pedir', a: 'buscar', por: 'Cuando el estudiante pide, el bibliotecario busca: el flujo cruza de carril.' },
  { de: 'buscar', a: 'comp', por: 'Después de buscar hay que decidir: ¿está disponible?' },
  { de: 'comp', a: 'prestar', et: 'Sí', ex: 462, ey: 525, por: 'Si está disponible, se presta.' },
  { de: 'comp', a: 'reservar', et: 'No', ex: 360, ey: 448, por: 'Si no está, el estudiante hace una reserva.' },
  { de: 'prestar', a: 'fin1', por: 'Prestado el libro, el proceso termina.' },
  { de: 'reservar', a: 'fin2', por: 'Con la reserva hecha, también termina: un proceso puede tener varios fines.' },
];
const SIMBOLOS: { s: Tipo | 'flujo'; n: string; por: string }[] = [
  { s: 'inicio', n: 'Evento de inicio', por: 'Círculo de borde delgado: dónde empieza.' },
  { s: 'tarea', n: 'Tarea', por: 'Rectángulo redondeado: una actividad.' },
  { s: 'compuerta', n: 'Compuerta exclusiva', por: 'Rombo con X: una decisión.' },
  { s: 'fin', n: 'Evento de fin', por: 'Círculo de borde grueso: dónde termina.' },
  { s: 'flujo', n: 'Flujo de secuencia', por: 'Flecha: el orden.' },
];
const n = (id: string) => NODOS.find((x) => x.id === id)!;

// Punto de salida o llegada de la flecha en el borde de cada figura.
function borde(id: string, hacia: { x: number; y: number }) {
  const a = n(id);
  const dx = hacia.x - a.x, dy = hacia.y - a.y;
  const r = a.tipo === 'tarea' ? 0 : a.tipo === 'compuerta' ? 36 : 24;
  if (a.tipo === 'tarea') {
    if (Math.abs(dy) * 200 > Math.abs(dx) * 68) return { x: a.x, y: a.y + Math.sign(dy) * 34 };
    return { x: a.x + Math.sign(dx) * 100, y: a.y };
  }
  if (a.tipo === 'compuerta' && Math.abs(dx) > Math.abs(dy)) return { x: a.x + Math.sign(dx) * r, y: a.y };
  const d = Math.hypot(dx, dy) || 1;
  return a.tipo === 'compuerta' ? { x: a.x, y: a.y + Math.sign(dy) * r } : { x: a.x + (dx / d) * r, y: a.y + (dy / d) * r };
}
function flecha(de: string, a: string) {
  const A = n(de), B = n(a);
  const p = borde(de, B), q = borde(a, A);
  // Si cambia de columna, la flecha va en escuadra (como en Bizagi).
  if (Math.abs(p.x - q.x) > 4 && Math.abs(p.y - q.y) > 4) {
    return Math.abs(p.y - A.y) < 2 ? `M${p.x} ${p.y} L${q.x} ${p.y} L${q.x} ${q.y}` : `M${p.x} ${p.y} L${p.x} ${(p.y + q.y) / 2} L${q.x} ${(p.y + q.y) / 2} L${q.x} ${q.y}`;
  }
  return `M${p.x} ${p.y} L${q.x} ${q.y}`;
}

export const BpmnJuego: React.FC<{ juego: J; alTerminar: (a: number, t: number) => void }> = ({ juego, alTerminar }) => {
  const simbolos = useMemo(() => barajar(SIMBOLOS), []);
  const nombres = useMemo(() => barajar(SIMBOLOS.map((s) => s.n)), []);
  const tareas = useMemo(() => barajar(NODOS.filter((x) => x.tipo === 'tarea')), []);
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [i, setI] = useState(0);
  const [fallo, setFallo] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const [tiembla, setTiembla] = useState(0);
  const [ubicadas, setUbicadas] = useState<string[]>([]);
  const [hechos, setHechos] = useState<string[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [errFlujo, setErrFlujo] = useState<Set<string>>(new Set());
  const total = SIMBOLOS.length + tareas.length + FLUJOS.length;

  const acierto = (texto: string, por: string) => {
    sonar('bien');
    const a = aciertos + (fallo ? 0 : 1);
    setAciertos(a);
    setFallo(false);
    setAviso({ ok: true, texto, por });
    return a;
  };
  const error = (texto: string, por: string) => {
    sonar('mal'); vibrar(60);
    setFallo(true);
    setTiembla((k) => k + 1);
    setAviso({ ok: false, texto, por });
  };

  // Paso 1: ¿cómo se llama este símbolo?
  const nombrar = (nom: string) => {
    const s = simbolos[i];
    if (nom !== s.n) return error(`No es «${nom}».`, 'Mira la forma: círculo delgado, rectángulo, rombo, círculo grueso o flecha.');
    acierto(`${s.n}.`, s.por);
    if (i + 1 >= simbolos.length) { setPaso(2); setI(0); } else setI(i + 1);
  };
  // Paso 2: ¿en qué carril va la tarea?
  const ubicar = (carril: string) => {
    const t = tareas[i];
    if (!t) return;
    if (Number(carril) !== t.carril) return error(`«${t.t}» no va en el carril ${CARRILES[Number(carril)]}.`, 'La tarea va en el carril de quien la hace.');
    acierto(`«${t.t}» → ${CARRILES[t.carril]}.`, 'Cada tarea va en el carril de su actor.');
    setUbicadas((u) => [...u, t.id]);
    if (i + 1 >= tareas.length) { setPaso(3); setI(0); setAviso({ ok: true, texto: '¡Carriles listos!', por: 'Ahora conecta el flujo: toca un elemento y luego el que sigue.' }); } else setI(i + 1);
  };
  // Paso 3: conectar el flujo.
  const tocarNodo = (id: string) => {
    if (paso !== 3) return;
    if (!sel) { setSel(id); sonar('pop'); return; }
    if (sel === id) { setSel(null); return; }
    const f = FLUJOS.find((x) => x.de === sel && x.a === id);
    const clave = sel + '>' + id;
    setSel(null);
    if (!f) {
      const alReves = FLUJOS.find((x) => x.de === id && x.a === sel);
      setErrFlujo((e) => new Set(e).add(sel));
      return error(alReves ? 'La flecha va al revés.' : `De «${n(sel).t}» no se pasa a «${n(id).t}».`, alReves ? 'El flujo sigue el orden del proceso: de arriba hacia abajo.' : 'Piensa qué tiene que pasar justo después.');
    }
    if (hechos.includes(clave)) return;
    sonar('bien');
    const nuevos = [...hechos, clave];
    setHechos(nuevos);
    setAviso({ ok: true, texto: `${n(f.de).t} → ${n(f.a).t}${f.et ? ` (${f.et})` : ''}.`, por: f.por });
    if (nuevos.length === FLUJOS.length) {
      const a = aciertos + FLUJOS.length - errFlujo.size;
      setAciertos(a);
      sonar('logro');
      setTimeout(() => alTerminar(Math.max(0, a), total), 1600);
    }
  };

  const hecho = paso === 1 ? i : paso === 2 ? SIMBOLOS.length + i : SIMBOLOS.length + tareas.length + hechos.length;
  const visible = (id: string) => n(id).tipo !== 'tarea' || ubicadas.includes(id);

  return (
    <section className="juego" aria-labelledby="t-bpmn">
      <h2 id="t-bpmn">{juego.titulo}</h2>
      <p className="pista">
        {paso === 1 && <><b>Paso 1 de 3.</b> ¿Cómo se llama este símbolo de BPMN?</>}
        {paso === 2 && <><b>Paso 2 de 3.</b> Arrastra cada tarea al carril de quien la hace.</>}
        {paso === 3 && <><b>Paso 3 de 3.</b> Conecta el flujo: toca un elemento y después el que sigue. Llevas {hechos.length} de {FLUJOS.length} flechas.</>}
      </p>
      <Avance hecho={hecho} total={total} />

      {paso === 1 && (
        <div className="bpmn-simbolo">
          <svg key={i + '-' + tiembla} viewBox="-120 -60 240 120" className={'simbolo-grande' + (tiembla ? ' tiembla' : '')} role="img" aria-label="Símbolo de BPMN para identificar">
            <Simbolo s={simbolos[i].s} />
          </svg>
          <div className="opciones">
            {nombres.map((nom) => <button key={nom} className="opcion" onClick={() => nombrar(nom)}>{nom}</button>)}
          </div>
        </div>
      )}

      {paso === 2 && tareas[i] && <CartaArrastrable key={i + '-' + tiembla} className={tiembla ? 'tiembla' : ''} texto={tareas[i].t} alSoltar={ubicar} color="var(--c-pro)" />}

      {paso >= 2 && (
        <div className="lienzo-bpmn">
          <svg viewBox="0 0 600 820" role="img" aria-label={`Diagrama del préstamo de un libro: ${hechos.length} flechas conectadas.`}>
            <defs>
              <marker id="punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="var(--tinta)" />
              </marker>
            </defs>
            <rect x="4" y="4" width="592" height="812" rx="14" fill="none" stroke="var(--linea-fuerte)" strokeWidth="3" />
            {CARRILES.map((c, k) => (
              <g key={c}>
                <rect x={6 + k * 296} y={6} width={292} height={808} fill={k ? 'color-mix(in srgb, var(--c-act) 6%, transparent)' : 'color-mix(in srgb, var(--c-dat) 6%, transparent)'} />
                <rect x={6 + k * 296} y={6} width={292} height={46} fill="var(--panel2)" />
                <text x={150 + k * 300} y={38} textAnchor="middle" className="bpmn-txt">{c}</text>
              </g>
            ))}
            <line x1="300" y1="6" x2="300" y2="814" stroke="var(--linea-fuerte)" strokeWidth="3" />
            {hechos.map((h) => {
              const [de, a] = h.split('>');
              const f = FLUJOS.find((x) => x.de === de && x.a === a)!;
              return (
                <g key={h} className="flecha-nueva">
                  <path d={flecha(de, a)} fill="none" stroke="var(--tinta)" strokeWidth="4" markerEnd="url(#punta)" />
                  {f.et && <text x={f.ex} y={f.ey} className="bpmn-txt chico etiqueta-flujo">{f.et}</text>}
                </g>
              );
            })}
            {NODOS.map((x) => (
              <g key={x.id} className={paso === 3 && visible(x.id) ? 'nodo-bpmn' : ''} onClick={() => visible(x.id) && tocarNodo(x.id)}
                role={paso === 3 ? 'button' : undefined} tabIndex={paso === 3 && visible(x.id) ? 0 : undefined} aria-label={paso === 3 ? `${x.t} (${x.tipo})` : undefined}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tocarNodo(x.id); } }}>
                <Simbolo s={x.tipo} x={x.x} y={x.y} texto={x.tipo === 'inicio' ? undefined : x.t} on={visible(x.id)} sel={sel === x.id} />
              </g>
            ))}
            {paso === 2 && CARRILES.map((c, k) => (
              <rect key={c} className="zona carril-zona" data-zona={String(k)} x={6 + k * 296} y={52} width={292} height={762} fill="transparent" onClick={() => ubicar(String(k))} />
            ))}
          </svg>
        </div>
      )}
      {paso === 2 && (
        <div className="fila-btn">
          {CARRILES.map((c, k) => <button key={c} className="btn sec zona" data-zona={String(k)} onClick={() => ubicar(String(k))}>Carril {c}</button>)}
        </div>
      )}
      <Aviso aviso={aviso} vacio="Empecemos por los símbolos." />
    </section>
  );
};
