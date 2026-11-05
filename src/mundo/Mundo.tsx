// Mundo.tsx
// La ruta por la clase convertida en un mundo para caminar: la Ciudad del Analista.
// Cada capítulo es un edificio junto al camino. El jugador (Alex) camina hasta el edificio que toque
// y entra al capítulo. Los barrios agrupan los temas: plaza, barrio A-D-P-C, taller de diagramas,
// bosque del problema y la cumbre de la propuesta. La profe espera en el próximo capítulo.
// Se juega con el dedo (tocar un edificio), con el mouse o con el teclado (flechas y Enter).
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Capitulo } from '../datos/capitulos';
import type { Progreso } from '../estado';
import { sonar, useMenosMovimiento } from '../estado';
import { Glifo } from '../componentes/Glifo';
import { Estrellas } from '../componentes/Piezas';
import { Estudiante } from '../componentes/Estudiante';
import { fotoProfe, NOMBRE_PROFE } from '../componentes/Profe';

const ANCHO = 640;
const PASO_Y = 182;
const VELOCIDAD = 420; // unidades del mapa por segundo

// Nombre corto en el letrero de cada edificio.
const CORTO: Record<string, string> = {
  bienvenida: 'El analista', sistema: 'El sistema', modelo: 'E · P · S · C', actores: 'Actores', datos: 'Datos',
  procesos: 'Procesos', bpmn: 'BPMN', dfp: 'DFP', dfd: 'DFD', control: 'Control', arbol: 'Árbol',
  entorno: 'Entorno', factibilidad: 'Factibilidad', reto: 'Reto final',
};
// Forma de cada edificio.
type Forma = 'casa' | 'taller' | 'faro' | 'arbol' | 'domo' | 'torre' | 'castillo';
const FORMA: Record<string, Forma> = {
  bpmn: 'taller', dfp: 'taller', dfd: 'taller', control: 'faro', arbol: 'arbol', entorno: 'domo', factibilidad: 'torre', reto: 'castillo',
};
// Barrios del mundo.
const BARRIOS = [
  { n: 'PLAZA DEL ANALISTA', ids: ['bienvenida', 'sistema', 'modelo'], c: 'sis' },
  { n: 'BARRIO A-D-P-C', ids: ['actores', 'datos', 'procesos'], c: 'act' },
  { n: 'TALLER DE DIAGRAMAS', ids: ['bpmn', 'dfp', 'dfd'], c: 'efe' },
  { n: 'BOSQUE DEL PROBLEMA', ids: ['control', 'arbol', 'entorno'], c: 'env' },
  { n: 'CUMBRE DE LA PROPUESTA', ids: ['factibilidad', 'reto'], c: 'con' },
];

type Punto = { x: number; y: number };
// Posición de la parada de cada capítulo: el camino serpentea de lado a lado.
const parada = (k: number, total: number): Punto => ({
  x: k === 0 || k === total - 1 ? 320 : k % 2 ? 168 : 472,
  y: 250 + k * PASO_Y + (k === total - 1 ? 130 : 0), // el castillo final necesita más espacio
});
// Tramos del camino (curvas suaves Catmull-Rom que pasan por cada parada).
function tramos(p: Punto[]) {
  const s: string[] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], d = p[i + 2] || c;
    const c1 = { x: b.x + (c.x - a.x) / 6, y: b.y + (c.y - a.y) / 6 };
    const c2 = { x: c.x - (d.x - b.x) / 6, y: c.y - (d.y - b.y) / 6 };
    s.push(`C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${c.x} ${c.y}`);
  }
  return s;
}

// ---------------------------------------------------------------- edificios
const Edificio: React.FC<{
  cap: Capitulo; p: Punto; estado: 'hecho' | 'abierto' | 'cerrado'; aqui: boolean; estrellas: number;
}> = ({ cap, p, estado, aqui, estrellas }) => {
  const { x } = p;
  const y = p.y - 20; // la base del edificio queda un poco arriba del camino
  const c = `var(--c-${cap.color})`;
  const muro = 'var(--panel2)';
  const luz = estado === 'hecho' ? 'var(--c-sis)' : 'color-mix(in srgb, var(--fondo) 70%, var(--panel))';
  const forma = FORMA[cap.id] || 'casa';
  const ventanas = (yy: number, sep = 46) => (
    <>
      <rect x={x - sep - 11} y={yy} width={22} height={22} rx={4} fill={luz} className={estado === 'hecho' ? 'ventana-luz' : ''} />
      <rect x={x + sep - 11} y={yy} width={22} height={22} rx={4} fill={luz} className={estado === 'hecho' ? 'ventana-luz' : ''} />
    </>
  );
  const puerta = <path d={`M${x - 17} ${y} V${y - 34} a17 17 0 0 1 34 0 V${y}Z`} fill={`color-mix(in srgb, ${c} 55%, var(--fondo))`} />;
  let cuerpo: React.ReactNode;
  let alto = 150; // hasta dónde llega el techo (para poner el glifo)
  if (forma === 'taller') {
    cuerpo = (
      <>
        <rect x={x - 74} y={y - 96} width={148} height={96} fill={muro} stroke={c} strokeWidth={3} />
        <path d={`M${x - 74} ${y - 96} V${y - 128} L${x - 25} ${y - 96} V${y - 128} L${x + 25} ${y - 96} V${y - 128} L${x + 74} ${y - 96} Z`} fill={c} />
        {ventanas(y - 74, 50)}{puerta}
      </>
    );
    alto = 152;
  } else if (forma === 'faro') {
    cuerpo = (
      <>
        <path d={`M${x - 34} ${y} L${x - 22} ${y - 150} H${x + 22} L${x + 34} ${y}Z`} fill={muro} stroke={c} strokeWidth={3} />
        <path d={`M${x - 30} ${y - 50} H${x + 30} L${x + 29} ${y - 66} H${x - 29}Z M${x - 26} ${y - 100} H${x + 26} L${x + 25} ${y - 116} H${x - 25}Z`} fill={c} />
        <rect x={x - 26} y={y - 178} width={52} height={28} rx={6} fill="var(--c-sis)" />
        <path d={`M${x - 32} ${y - 178} L${x} ${y - 200} L${x + 32} ${y - 178}Z`} fill={c} />
        <g className="haz-faro" style={{ transformOrigin: `${x}px ${y - 164}px` }}>
          <path d={`M${x} ${y - 164} L${x + 80} ${y - 182} L${x + 80} ${y - 146}Z`} fill="var(--c-sis)" opacity={0.18} />
        </g>
        <path d={`M${x - 14} ${y} V${y - 26} a14 14 0 0 1 28 0 V${y}Z`} fill={`color-mix(in srgb, ${c} 55%, var(--fondo))`} />
      </>
    );
    alto = 84;
  } else if (forma === 'arbol') {
    cuerpo = (
      <>
        <path d={`M${x - 22} ${y} Q${x - 14} ${y - 50} ${x - 16} ${y - 80} H${x + 16} Q${x + 14} ${y - 50} ${x + 22} ${y}Z`} fill="var(--tronco)" />
        <path d={`M${x - 22} ${y} q-18 4 -30 10 M${x + 22} ${y} q18 4 30 10`} stroke="var(--tronco)" strokeWidth={8} strokeLinecap="round" fill="none" />
        <g className="copa-mece" style={{ transformOrigin: `${x}px ${y - 80}px` }}>
          <circle cx={x - 42} cy={y - 110} r={42} fill="var(--hoja2)" />
          <circle cx={x + 42} cy={y - 112} r={44} fill="var(--hoja2)" />
          <circle cx={x} cy={y - 140} r={54} fill="var(--hoja1)" />
          <circle cx={x - 20} cy={y - 150} r={8} fill="var(--c-act)" /><circle cx={x + 30} cy={y - 124} r={8} fill="var(--c-act)" /><circle cx={x - 46} cy={y - 104} r={7} fill="var(--c-act)" />
        </g>
        <path d={`M${x - 11} ${y} V${y - 20} a11 11 0 0 1 22 0 V${y}Z`} fill="var(--fondo)" />
      </>
    );
    alto = 140;
  } else if (forma === 'domo') {
    cuerpo = (
      <>
        <ellipse cx={x} cy={y - 60} rx={104} ry={58} fill="none" stroke="var(--c-env)" strokeWidth={3} strokeDasharray="10 9" className="orbita" style={{ transformOrigin: `${x}px ${y - 60}px` }} />
        <rect x={x - 66} y={y - 70} width={132} height={70} fill={muro} stroke={c} strokeWidth={3} />
        <path d={`M${x - 66} ${y - 70} a66 62 0 0 1 132 0Z`} fill={c} />
        <rect x={x + 6} y={y - 124} width={12} height={54} fill="var(--fondo)" opacity={0.5} />
        {ventanas(y - 56, 42)}{puerta}
      </>
    );
    alto = 98;
  } else if (forma === 'torre') {
    cuerpo = (
      <>
        <rect x={x - 48} y={y - 150} width={96} height={150} fill={muro} stroke={c} strokeWidth={3} />
        <path d={`M${x - 56} ${y - 150} H${x + 56} V${y - 164} H${x - 56}Z`} fill={c} />
        <path d={`M${x} ${y - 164} V${y - 210}`} stroke="var(--tinta)" strokeWidth={3} />
        <path d={`M${x} ${y - 210} L${x + 34} ${y - 200} L${x} ${y - 190}Z`} fill={c} className="bandera" />
        {ventanas(y - 70, 24)}{puerta}
      </>
    );
    alto = 120;
  } else if (forma === 'castillo') {
    const almenas = (x0: number, ancho: number, yy: number) =>
      Array.from({ length: Math.floor(ancho / 18) }, (_, k) => <rect key={k} x={x0 + k * 18} y={yy - 14} width={11} height={14} fill={muro} stroke={c} strokeWidth={2} />);
    cuerpo = (
      <>
        <rect x={x - 100} y={y - 160} width={52} height={160} fill={muro} stroke={c} strokeWidth={3} />
        <rect x={x + 48} y={y - 160} width={52} height={160} fill={muro} stroke={c} strokeWidth={3} />
        {almenas(x - 100, 56, y - 160)}{almenas(x + 48, 56, y - 160)}
        <rect x={x - 48} y={y - 112} width={96} height={112} fill={muro} stroke={c} strokeWidth={3} />
        {almenas(x - 48, 100, y - 112)}
        <path d={`M${x - 26} ${y} V${y - 46} a26 26 0 0 1 52 0 V${y}Z`} fill={`color-mix(in srgb, ${c} 55%, var(--fondo))`} />
        <path d={`M${x - 74} ${y - 174} V${y - 222} M${x + 74} ${y - 174} V${y - 222}`} stroke="var(--tinta)" strokeWidth={3} />
        <path d={`M${x - 74} ${y - 222} l36 10 -36 10Z M${x + 74} ${y - 222} l36 10 -36 10Z`} fill="var(--c-sis)" className="bandera" />
        <rect x={x - 86} y={y - 120} width={24} height={30} rx={12} fill={luz} /><rect x={x + 62} y={y - 120} width={24} height={30} rx={12} fill={luz} />
      </>
    );
    alto = 92;
  } else {
    cuerpo = (
      <>
        <rect x={x - 64} y={y - 100} width={128} height={100} rx={4} fill={muro} stroke={c} strokeWidth={3} />
        <path d={`M${x - 78} ${y - 98} L${x} ${y - 154} L${x + 78} ${y - 98}Z`} fill={c} />
        {ventanas(y - 76)}{puerta}
      </>
    );
    alto = 132;
  }
  return (
    <g className={'edificio ' + estado + (aqui ? ' aqui' : '')}>
      <ellipse cx={x} cy={y + 4} rx={forma === 'castillo' ? 118 : 86} ry={14} fill="var(--fondo)" opacity={0.45} />
      {cuerpo}
      {/* glifo del capítulo en el techo o colgado al frente */}
      <g transform={`translate(${x - 17} ${y - alto - 17})`} className="glifo-edificio">
        <circle cx={17} cy={17} r={21} fill="var(--panel)" stroke={c} strokeWidth={3} />
        <Glifo id={cap.id} size={34} color={c} />
      </g>
      {estado === 'cerrado' && (
        <g transform={`translate(${x - 13} ${y - 30})`} aria-hidden="true">
          <rect x={0} y={10} width={26} height={20} rx={4} fill="var(--tenue)" />
          <path d="M6 10 V5 a7 7 0 0 1 14 0 V10" fill="none" stroke="var(--tenue)" strokeWidth={4} />
        </g>
      )}
      {/* letrero con el número y el nombre */}
      <g transform={`translate(${x} ${p.y + 34})`}>
        <rect x={-78} y={-18} width={156} height={36} rx={18} fill="var(--panel)" stroke={estado === 'cerrado' ? 'var(--linea-fuerte)' : c} strokeWidth={2.5} />
        <circle cx={-60} cy={0} r={13} fill={estado === 'cerrado' ? 'var(--linea-fuerte)' : c} />
        <text x={-60} y={6} textAnchor="middle" className="mundo-num">{cap.n}</text>
        <text x={10} y={7} textAnchor="middle" className="mundo-letrero">{CORTO[cap.id] || cap.titulo}</text>
      </g>
      {estado === 'hecho' && (
        <g transform={`translate(${x - 36} ${p.y + 56})`}>
          {[0, 1, 2].map((k) => (
            <path key={k} transform={`translate(${k * 26} 0) scale(0.9)`} d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7-6.2-3.6-6.2 3.6 1.4-7L2 9.3l7-.8z"
              fill={k < estrellas ? 'var(--c-sis)' : 'none'} stroke="var(--c-sis)" strokeWidth={1.8} />
          ))}
        </g>
      )}
    </g>
  );
};

// Árboles, faroles y nubes que decoran el mundo (siempre en el mismo lugar).
function decorado(alto: number) {
  const cosas: { t: 'arbol' | 'farol' | 'roca'; x: number; y: number; s: number }[] = [];
  for (let y = 120, k = 0; y < alto - 80; y += 96, k++) {
    const lado = k % 2;
    cosas.push({ t: k % 5 === 2 ? 'farol' : k % 7 === 3 ? 'roca' : 'arbol', x: lado ? 600 - (k * 37) % 30 : 36 + (k * 53) % 34, y: y + (k * 29) % 40, s: 0.8 + ((k * 17) % 10) / 20 });
  }
  return cosas;
}

// ---------------------------------------------------------------- el mundo
export const Mundo: React.FC<{
  caps: Capitulo[]; prog: Progreso; abierto: (k: number) => boolean;
  alEntrar: (id: string) => void; alMover: (id: string) => void;
}> = ({ caps, prog, abierto, alEntrar, alMover }) => {
  const menos = useMenosMovimiento();
  const total = caps.length;
  const puntos = useMemo(() => caps.map((_, k) => parada(k, total)), [caps, total]);
  const alto = puntos[total - 1].y + 120;
  const segs = useMemo(() => tramos(puntos), [puntos]);
  const dCamino = `M${puntos[0].x} ${puntos[0].y} ${segs.join(' ')}`;
  const deco = useMemo(() => decorado(alto), [alto]);

  // Hasta dónde se puede caminar: el último capítulo abierto.
  let tope = 0;
  caps.forEach((_, k) => { if (abierto(k)) tope = k; });
  const proximo = caps.findIndex((c, k) => abierto(k) && !prog.caps[c.id]);

  const svg = useRef<SVGSVGElement>(null);
  const camino = useRef<SVGPathElement>(null);
  const avatar = useRef<SVGGElement>(null);
  const [largos, setLargos] = useState<number[]>([]);
  // Empieza donde quedó la última vez (o en el próximo capítulo por jugar).
  const guardado = caps.findIndex((c) => c.id === prog.donde);
  const inicial = guardado >= 0 ? Math.min(guardado, tope) : Math.max(0, proximo);
  const [estacion, setEstacion] = useState(inicial);
  const [pos, setPos] = useState<{ x: number; y: number; mira: 1 | -1; paso: number }>({ ...puntos[inicial], mira: 1, paso: 0 });
  const [caminando, setCaminando] = useState(false);
  const [nota, setNota] = useState('');
  const s = useRef(0);
  const anim = useRef(0);
  const respaldo = useRef(0);

  // Largo del camino hasta cada parada (para caminar sobre la curva).
  useLayoutEffect(() => {
    const el = svg.current;
    if (!el) return;
    const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tmp.setAttribute('visibility', 'hidden');
    el.appendChild(tmp);
    const l = puntos.map((_, k) => {
      if (!k) return 0;
      tmp.setAttribute('d', `M${puntos[0].x} ${puntos[0].y} ${segs.slice(0, k).join(' ')}`);
      return tmp.getTotalLength();
    });
    el.removeChild(tmp);
    setLargos(l);
    s.current = l[estacion] || 0;
  }, [puntos, segs]); // eslint-disable-line react-hooks/exhaustive-deps

  // La cámara sigue al jugador: si se sale de la franja visible, la página se desliza.
  const seguir = useCallback((suave: boolean) => {
    const a = avatar.current;
    if (!a) return;
    const r = a.getBoundingClientRect();
    const abajo = window.innerWidth < 900 ? 210 : 40;
    const arriba = 90;
    if (r.top < arriba || r.bottom > window.innerHeight - abajo) {
      const meta = r.top + r.height / 2 - (window.innerHeight - abajo + arriba) / 2;
      window.scrollBy({ top: meta, behavior: suave ? 'smooth' : 'auto' });
    }
  }, []);

  // Al llegar al mapa, la cámara busca al jugador si quedó lejos.
  useEffect(() => {
    if (estacion > 1) { const t = setTimeout(() => seguir(true), 350); return () => clearTimeout(t); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { cancelAnimationFrame(anim.current); clearTimeout(respaldo.current); }, []);

  const caminar = useCallback((k: number) => {
    if (!largos.length) return;
    let meta = k;
    if (k > tope) {
      meta = tope;
      setNota(`Para abrir «${caps[k].titulo}» primero termina «${caps[tope].titulo}».`);
      sonar('mal');
    } else setNota('');
    meta = Math.max(0, Math.min(meta, total - 1));
    setEstacion(meta);
    alMover(caps[meta].id);
    const camEl = camino.current;
    const destino = largos[meta];
    cancelAnimationFrame(anim.current);
    clearTimeout(respaldo.current);
    // Llegar de una vez (sin animación), y acomodar la cámara.
    const llegar = () => {
      cancelAnimationFrame(anim.current);
      clearTimeout(respaldo.current);
      s.current = destino;
      setPos((p) => ({ ...puntos[meta], mira: p.mira, paso: 0 }));
      setCaminando(false);
      setTimeout(() => seguir(false), 30);
    };
    if (menos || !camEl) {
      llegar();
      return;
    }
    setCaminando(true);
    // Respaldo: si el navegador pausa la animación (pestaña oculta), igual llega a tiempo.
    respaldo.current = window.setTimeout(llegar, (Math.abs(destino - s.current) / VELOCIDAD) * 1000 + 600);
    let antes = performance.now();
    let ultimoTic = 0;
    const cuadro = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - antes) / 1000);
      antes = ahora;
      const falta = destino - s.current;
      const avance = Math.sign(falta) * Math.min(Math.abs(falta), VELOCIDAD * dt);
      s.current += avance;
      const q = camEl.getPointAtLength(s.current);
      setPos((p) => ({ x: q.x, y: q.y, mira: Math.abs(q.x - p.x) > 0.2 ? (q.x > p.x ? 1 : -1) : p.mira, paso: p.paso + dt * 9 }));
      if (ahora - ultimoTic > 260) { ultimoTic = ahora; sonar('tic'); }
      seguir(false);
      if (Math.abs(destino - s.current) > 0.5) anim.current = requestAnimationFrame(cuadro);
      else { llegar(); sonar('pop'); }
    };
    anim.current = requestAnimationFrame(cuadro);
  }, [largos, tope, caps, total, menos, puntos, seguir, alMover]);

  const tocar = (k: number) => {
    if (k === estacion && !caminando && k <= tope) { sonar('entra'); alEntrar(caps[k].id); return; }
    caminar(k);
  };

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); caminar(Math.min(total - 1, estacion + 1)); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); caminar(Math.max(0, estacion - 1)); }
    else if (e.key === 'Enter' && (e.target as HTMLElement).dataset.mapa) { e.preventDefault(); tocar(estacion); }
  };

  const cap = caps[estacion];
  const r = prog.caps[cap.id];
  // Recorte del camino: hasta el tope se ve firme; lo demás, con niebla.
  const largoTope = largos[tope] ?? 0;
  const largoTotal = largos[total - 1] ?? 1;
  const bob = caminando ? Math.abs(Math.sin(pos.paso)) * -6 : 0;

  return (
    <div className="mundo-zona">
      <div className="mundo-mapa" tabIndex={0} data-mapa="1" onKeyDown={teclas}
        aria-label="Mapa de la clase. Usa las flechas para caminar entre capítulos y Enter para entrar.">
        <svg ref={svg} viewBox={`0 0 ${ANCHO} ${alto}`} className="mundo-svg" role="group" aria-label="Ciudad del Analista">
          {/* decorado */}
          {deco.map((d, i) => (
            <g key={i} transform={`translate(${d.x} ${d.y}) scale(${d.s})`} className={d.t === 'arbol' ? 'arbolito' : ''} style={{ transformOrigin: `${d.x}px ${d.y}px` }}>
              {d.t === 'arbol' && <><rect x={-4} y={-6} width={8} height={18} fill="var(--tronco)" /><circle cx={0} cy={-18} r={18} fill="var(--hoja2)" /><circle cx={-6} cy={-24} r={9} fill="var(--hoja3)" opacity={0.7} /></>}
              {d.t === 'farol' && <><rect x={-2} y={-34} width={4} height={46} fill="var(--tenue)" /><circle cx={0} cy={-38} r={8} fill="var(--c-sis)" className="farol" /></>}
              {d.t === 'roca' && <path d="M-16 8 Q-14 -10 0 -12 Q16 -10 16 8Z" fill="var(--panel2)" stroke="var(--linea-fuerte)" />}
            </g>
          ))}
          {/* barrios */}
          {BARRIOS.map((b, i) => {
            const ks = b.ids.map((id) => caps.findIndex((c) => c.id === id)).filter((k) => k >= 0);
            if (!ks.length) return null;
            const y0 = Math.min(...ks.map((k) => puntos[k].y)) - (i === 0 ? 190 : 120);
            const y1 = Math.max(...ks.map((k) => puntos[k].y)) + 62;
            const izq = puntos[ks[0]].x > 320;
            return (
              <g key={b.n}>
                <rect x={8} y={y0} width={ANCHO - 16} height={y1 - y0} rx={34} fill={`color-mix(in srgb, var(--c-${b.c}) 7%, transparent)`} stroke={`color-mix(in srgb, var(--c-${b.c}) 30%, transparent)`} strokeWidth={2} strokeDasharray="4 10" />
                <g transform={`translate(${izq ? 26 : ANCHO - 26} ${y0 + 34})`}>
                  <rect x={izq ? 0 : -250} y={-17} width={250} height={34} rx={17} fill={`var(--c-${b.c})`} />
                  <text x={izq ? 125 : -125} y={6} textAnchor="middle" className="mundo-barrio">{b.n}</text>
                </g>
              </g>
            );
          })}
          {/* el camino */}
          <path d={dCamino} fill="none" stroke="var(--linea-fuerte)" strokeWidth={46} strokeLinecap="round" />
          <path ref={camino} d={dCamino} fill="none" stroke="var(--panel2)" strokeWidth={38} strokeLinecap="round" />
          <path d={dCamino} fill="none" stroke="var(--c-sis)" strokeWidth={4} strokeDasharray="16 18" opacity={0.55} />
          {largos.length > 0 && largoTope < largoTotal && (
            <path d={dCamino} fill="none" stroke="var(--fondo)" strokeWidth={50} strokeLinecap="butt" opacity={0.6}
              strokeDasharray={`0 ${largoTope + 30} ${largoTotal}`} className="niebla" />
          )}
          {/* entrada del mundo */}
          <g transform={`translate(${puntos[0].x} ${puntos[0].y - 196})`} aria-hidden="true">
            <text x={0} y={-6} textAnchor="middle" className="mundo-titulo">CIUDAD DEL ANALISTA</text>
          </g>
          {/* edificios */}
          {caps.map((c, k) => {
            const est = prog.caps[c.id] ? 'hecho' : abierto(k) ? 'abierto' : 'cerrado';
            const rr = prog.caps[c.id];
            return (
              <g key={c.id} role="button" tabIndex={0} className="parada" onClick={() => tocar(k)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); tocar(k); } }}
                aria-label={`Capítulo ${c.n}: ${c.titulo}. ${rr ? `Completado con ${rr.estrellas} estrellas` : est === 'abierto' ? 'Disponible' : 'Bloqueado'}${k === estacion ? '. Estás aquí' : ''}`}>
                {k === proximo && <ellipse cx={puntos[k].x} cy={puntos[k].y} rx={60} ry={20} className="aro-proximo" />}
                <Edificio cap={c} p={puntos[k]} estado={est} aqui={k === estacion} estrellas={rr?.estrellas || 0} />
              </g>
            );
          })}
          {/* la profe espera en el próximo capítulo */}
          {proximo >= 0 && (() => {
            const p = puntos[proximo];
            const lado = p.x > 320 ? -1 : 1;
            const px = p.x + lado * 128;
            return (
              <g className="profe-mundo" aria-hidden="true">
                <image href={fotoProfe('explica')} x={px - 34} y={p.y - 108} width={68} height={90} />
                <g transform={`translate(${px} ${p.y - 128})`}>
                  <rect x={-62} y={-22} width={124} height={34} rx={12} fill="var(--papel)" />
                  <text x={0} y={1} textAnchor="middle" className="mundo-burbuja">¡Sigue aquí!</text>
                </g>
              </g>
            );
          })()}
          {/* el jugador */}
          <g ref={avatar} transform={`translate(${pos.x} ${pos.y + 16 + bob})`} className="jugador" aria-hidden="true">
            <ellipse cx={0} cy={10 - bob} rx={22} ry={7} fill="var(--fondo)" opacity={0.5} />
            <g transform={`translate(${-32 * pos.mira} -76) scale(${pos.mira} 1)`}>
              <Estudiante size={64} f={Math.round(pos.paso * 4)} gesto={prog.caps[cap.id] && !caminando ? 'celebra' : 'normal'} />
            </g>
          </g>
        </svg>
      </div>

      {/* panel de la parada: qué capítulo es y botón para entrar */}
      <aside className="panel-parada" style={{ ['--c' as string]: `var(--c-${cap.color})` }} aria-live="polite">
        <div className="pp-cabeza">
          <span className="pp-ico"><Glifo id={cap.id} size={28} /></span>
          <div>
            <p className="pp-num">CAPÍTULO {String(cap.n).padStart(2, '0')}{caminando ? ' · caminando…' : ''}</p>
            <h2>{cap.titulo}</h2>
          </div>
        </div>
        <p className="pp-sub">{cap.sub}</p>
        <p className="pp-profe"><img src={fotoProfe('explica')} alt="" width={34} height={34} /><span><b>{NOMBRE_PROFE}:</b> {cap.dice}</span></p>
        {r && <p className="pp-logro"><Estrellas n={r.estrellas} /> <b>{r.puntos}</b> pts</p>}
        {nota && <p className="pp-nota" role="alert">{nota}</p>}
        <div className="pp-botones">
          <button className="btn sec" onClick={() => caminar(estacion - 1)} disabled={estacion === 0 || caminando} aria-label="Caminar al capítulo anterior">◀</button>
          <button className="btn" onClick={() => { sonar('entra'); alEntrar(cap.id); }} disabled={caminando || estacion > tope}>
            {r ? 'Volver a jugar' : 'Entrar'} →
          </button>
          <button className="btn sec" onClick={() => caminar(estacion + 1)} disabled={estacion >= total - 1 || caminando} aria-label="Caminar al capítulo siguiente">▶</button>
        </div>
        <p className="pp-ayuda">Toca un edificio para caminar hasta él. Con teclado: flechas y Enter.</p>
      </aside>
    </div>
  );
};
