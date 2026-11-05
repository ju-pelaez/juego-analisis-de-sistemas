// Paseo.tsx
// El mundo del analista visto de lado, como un juego de plataformas: el jugador camina de izquierda a derecha
// por cinco mundos (plaza, barrio A-D-P-C, islas de los diagramas, bosque del problema y cumbre de la propuesta).
// Cada capítulo es una casa con su letrero; al pararse frente a la puerta se ve qué se aprende y se puede entrar.
// Ganchos para explorar:
//   · Datos (cubitos que flotan): cada uno vale 1 punto y quedan guardados.
//   · Bloques ? : se golpean saltando desde abajo; traen una pregunta del capítulo (+10).
//   · Un bloque secreto invisible en cada mundo: aparece al golpearlo; trae una pregunta de oro (+25).
//   · Bugs (los problemas del sistema) que caminan: se eliminan saltándoles encima.
// Controles: A/D o ←/→ caminar · W, ↑ o espacio saltar · S, ↓, E o Enter entrar. En celular, botones en pantalla.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Capitulo } from '../datos/capitulos';
import type { Progreso } from '../estado';
import { sonar, vibrar } from '../estado';
import { Estudiante } from '../componentes/Estudiante';
import { Glifo } from '../componentes/Glifo';
import { fotoProfe, NOMBRE_PROFE } from '../componentes/Profe';
import { Bono } from './Bono';
import { ZONAS, type Zona } from './zonas';

// ---------------------------------------------------------------- medidas del mundo
const ALTO = 400;          // alto del escenario
const SUELO = 64;          // grosor del suelo
const PISO = ALTO - SUELO; // altura en pantalla de la superficie
const SEP = 760;           // distancia entre casas
const HUECO = 560;         // espacio extra al cambiar de mundo
const INICIO = 760;
const ANCHO_J = 34, ALTO_J = 58;
const VEL = 300, SALTO = 640, GRAVEDAD = 1750;
const BLOQUE = 46, ALTURA_BLOQUE = 128; // los bloques flotan a esta altura sobre el suelo

type Casa = { cap: Capitulo; x: number; zona: number };
type Bloque = { id: string; x: number; y: number; secreto: boolean; caps: Capitulo[]; titulo: string };
type Dato = { id: string; x: number; y: number };
type Bug = { id: string; x0: number; x1: number };
type Puerta = { zona: number; x: number };

function armarMundo(caps: Capitulo[]) {
  const casas: Casa[] = [], bloques: Bloque[] = [], datos: Dato[] = [], bugs: Bug[] = [], puertas: Puerta[] = [];
  const inicioZona: number[] = [];
  let x = INICIO;
  ZONAS.forEach((z, zi) => {
    inicioZona.push(x - 640);
    puertas.push({ zona: zi, x: x - 560 });
    const delMundo = z.caps.map((id) => caps.find((c) => c.id === id)).filter((c): c is Capitulo => !!c);
    delMundo.forEach((cap, k) => {
      casas.push({ cap, x, zona: zi });
      const medio = x + SEP / 2;
      const ultimo = k === delMundo.length - 1;
      if (!ultimo || zi < ZONAS.length - 1) {
        // Entre casa y casa: un bloque ?, un arco de datos y, a veces, un bug.
        bloques.push({ id: `q-${cap.id}`, x: medio - BLOQUE / 2, y: ALTURA_BLOQUE, secreto: false, caps: [cap], titulo: cap.titulo });
        [-3, -2, -1, 1, 2, 3].forEach((d) => datos.push({ id: `d-${cap.id}-${d}`, x: medio + d * 52, y: 40 + (3 - Math.abs(d)) * 26 }));
        if ((casas.length + zi) % 2 === 0) bugs.push({ id: `b-${cap.id}`, x0: medio - 190, x1: medio + 190 });
      }
      if (k === 0) {
        // Bloque secreto del mundo: invisible, entre la primera y la segunda casa, más alto que el ?.
        bloques.push({ id: `s-${z.id}`, x: x + SEP * 0.25 - BLOQUE / 2, y: ALTURA_BLOQUE + 40, secreto: true, caps: delMundo, titulo: z.nombre });
      }
      x += SEP;
    });
    x += HUECO;
  });
  const ancho = x - SEP - HUECO + 700;
  return { casas, bloques, datos, bugs, puertas, inicioZona, ancho };
}

// ---------------------------------------------------------------- dibujos
const CasaArte: React.FC<{ casa: Casa; zona: Zona; hecho: boolean; cerca: boolean }> = ({ casa, zona, hecho, cerca }) => {
  const { cap } = casa;
  const c = `var(--c-${cap.color})`;
  const luz = hecho ? '#FFD23F' : '#26314F';
  if (cap.id === 'reto') return (
    <svg className={'casa-arte' + (cerca ? ' cerca' : '')} width={300} height={260} viewBox="0 0 300 260" aria-hidden="true">
      <rect x={20} y={60} width={70} height={200} fill="#5A4A86" stroke="#1E1636" strokeWidth={4} />
      <rect x={210} y={60} width={70} height={200} fill="#5A4A86" stroke="#1E1636" strokeWidth={4} />
      {[0, 1, 2, 3].map((k) => <rect key={'a' + k} x={20 + k * 18} y={44} width={12} height={18} fill="#5A4A86" stroke="#1E1636" strokeWidth={3} />)}
      {[0, 1, 2, 3].map((k) => <rect key={'b' + k} x={210 + k * 18} y={44} width={12} height={18} fill="#5A4A86" stroke="#1E1636" strokeWidth={3} />)}
      <rect x={86} y={110} width={128} height={150} fill="#6B5A9E" stroke="#1E1636" strokeWidth={4} />
      {[0, 1, 2, 3, 4, 5].map((k) => <rect key={'c' + k} x={88 + k * 21} y={94} width={13} height={18} fill="#6B5A9E" stroke="#1E1636" strokeWidth={3} />)}
      <path d="M118 260 V204 a32 32 0 0 1 64 0 V260Z" fill="#1E1636" />
      <rect x={44} y={110} width={22} height={34} rx={11} fill={luz} /><rect x={234} y={110} width={22} height={34} rx={11} fill={luz} />
      <path d="M55 44 V4 l30 9 -30 9 M245 44 V4 l30 9 -30 9" fill="#FFD23F" stroke="#1E1636" strokeWidth={3} className="bandera-casa" />
      <circle cx={150} cy={150} r={24} fill="#fff" stroke="#1E1636" strokeWidth={3} />
      <g transform="translate(131 131)" style={{ color: 'var(--c-sis)' }}><Glifo id="reto" size={38} color="#B88A00" /></g>
    </svg>
  );
  const nieve = zona.deco === 'nieve';
  const plano = zona.deco === 'desierto';
  return (
    <svg className={'casa-arte' + (cerca ? ' cerca' : '')} width={220} height={200} viewBox="0 0 220 200" aria-hidden="true">
      {zona.deco === 'mar' && <>{[40, 100, 160].map((px) => <rect key={px} x={px} y={170} width={10} height={30} fill="#6B4226" />)}</>}
      <rect x={150} y={plano ? 40 : 34} width={20} height={36} fill="#7A4E2D" stroke="#2A1A10" strokeWidth={3} />
      <rect x={28} y={84} width={164} height={zona.deco === 'mar' ? 88 : 116} rx={6} fill="#F7F1E3" stroke="#2A1A10" strokeWidth={4} />
      {plano
        ? <rect x={18} y={66} width={184} height={22} rx={4} fill={c} stroke="#2A1A10" strokeWidth={4} />
        : <path d="M10 90 L110 22 L210 90Z" fill={c} stroke="#2A1A10" strokeWidth={4} strokeLinejoin="round" />}
      {nieve && <path d="M22 84 L110 26 L198 84 L180 84 L166 74 L150 86 L130 72 L110 86 L92 72 L72 86 L54 74 L40 86Z" fill="#fff" />}
      <circle cx={110} cy={plano ? 77 : 64} r={22} fill="#fff" stroke="#2A1A10" strokeWidth={3} />
      <g transform={`translate(${110 - 17} ${(plano ? 77 : 64) - 17})`}><Glifo id={cap.id} size={34} color={c} /></g>
      <rect x={44} y={110} width={34} height={30} rx={4} fill={luz} stroke="#2A1A10" strokeWidth={3} className={hecho ? 'ventana-luz' : ''} />
      <rect x={142} y={110} width={34} height={30} rx={4} fill={luz} stroke="#2A1A10" strokeWidth={3} className={hecho ? 'ventana-luz' : ''} />
      <path d={`M88 ${zona.deco === 'mar' ? 172 : 200} V136 a22 22 0 0 1 44 0 V${zona.deco === 'mar' ? 172 : 200}Z`} fill={`color-mix(in srgb, ${c} 70%, #2A1A10)`} stroke="#2A1A10" strokeWidth={3} />
      <circle cx={124} cy={160} r={3} fill="#FFD23F" />
      {hecho && <path d="M170 34 V6 l26 8 -26 8" fill="#2FB344" stroke="#2A1A10" strokeWidth={2.5} className="bandera-casa" />}
    </svg>
  );
};

// Letrero de madera con el capítulo (como un cartel de camino).
const Letrero: React.FC<{ cap: Capitulo; hecho: boolean; estrellas: number }> = ({ cap, hecho, estrellas }) => (
  <div className="letrero" style={{ ['--c' as string]: `var(--c-${cap.color})` }}>
    <div className="letrero-tabla">
      <span className="letrero-ico"><Glifo id={cap.id} size={24} /></span>
      <span>
        <small>CAPÍTULO {cap.n}</small>
        <b>{cap.titulo}</b>
      </span>
    </div>
    {hecho && <span className="letrero-estrellas" aria-hidden="true">{'★'.repeat(estrellas)}{'☆'.repeat(3 - estrellas)}</span>}
    <i className="letrero-palo" />
  </div>
);

// Paisaje lejano y del medio de cada mundo (se mueven más lento que el jugador: efecto de profundidad).
function paisaje(z: Zona, desde: number, hasta: number, capa: 'lejos' | 'medio') {
  const cosas: React.ReactNode[] = [];
  const paso = capa === 'lejos' ? 260 : 170;
  for (let x = desde, k = 0; x < hasta; x += paso, k++) {
    const h = 60 + ((k * 37) % 70);
    if (capa === 'lejos') {
      if (z.deco === 'ciudad') cosas.push(<rect key={x} x={x} y={PISO - 40 - h} width={70 + (k % 3) * 20} height={h + 40} rx={4} fill={z.lejos} />);
      else if (z.deco === 'desierto') cosas.push(<path key={x} d={`M${x} ${PISO} L${x + 110} ${PISO - h - 50} L${x + 220} ${PISO}Z`} fill={z.lejos} />);
      else if (z.deco === 'mar') cosas.push(<path key={x} d={`M${x} ${PISO - 30} q60 -${h / 2} 130 0Z`} fill="#3E9B4A" opacity={k % 3 ? 0 : 0.9} />);
      else if (z.deco === 'bosque') cosas.push(<g key={x}><rect x={x + 40} y={PISO - h - 110} width={12} height={h + 110} fill={z.lejos} /><circle cx={x + 46} cy={PISO - h - 120} r={50} fill={z.lejos} /></g>);
      else cosas.push(<g key={x}><path d={`M${x} ${PISO} L${x + 130} ${PISO - h - 120} L${x + 260} ${PISO}Z`} fill="#9AA9D6" /><path d={`M${x + 96} ${PISO - h - 82} L${x + 130} ${PISO - h - 120} L${x + 164} ${PISO - h - 82}Z`} fill={z.lejos} /></g>);
    } else {
      const xx = x + ((k * 53) % 60);
      if (z.deco === 'desierto') cosas.push(<g key={x} opacity={k % 2 ? 1 : 0}><rect x={xx} y={PISO - 70} width={14} height={70} rx={7} fill={z.medio} /><path d={`M${xx} ${PISO - 40} h-12 v-16 M${xx + 14} ${PISO - 50} h12 v-14`} stroke={z.medio} strokeWidth={10} strokeLinecap="round" fill="none" /></g>);
      else if (z.deco === 'nieve') cosas.push(<g key={x}><path d={`M${xx} ${PISO - 110} l34 90 h-68Z`} fill={z.medio} /><path d={`M${xx} ${PISO - 110} l12 32 h-24Z`} fill="#fff" /><rect x={xx - 5} y={PISO - 20} width={10} height={20} fill="#5A3A24" /></g>);
      else if (z.deco === 'mar') cosas.push(<g key={x} opacity={k % 3 === 1 ? 1 : 0}><path d={`M${xx} ${PISO} q6 -60 -6 -120`} stroke="#8A5A3B" strokeWidth={9} fill="none" /><path d={`M${xx - 6} ${PISO - 120} q-40 -10 -60 20 M${xx - 6} ${PISO - 120} q40 -14 62 14 M${xx - 6} ${PISO - 120} q-10 -40 -40 -46 M${xx - 6} ${PISO - 120} q20 -36 46 -38`} stroke={z.medio} strokeWidth={10} strokeLinecap="round" fill="none" /></g>);
      else cosas.push(<g key={x}><rect x={xx - 6} y={PISO - 90} width={12} height={90} fill={z.deco === 'bosque' ? '#24170E' : '#7A4E2D'} /><circle cx={xx} cy={PISO - 110} r={z.deco === 'bosque' ? 46 : 38} fill={z.medio} /><circle cx={xx - 22} cy={PISO - 88} r={26} fill={z.medio} /><circle cx={xx + 24} cy={PISO - 90} r={28} fill={z.medio} /></g>);
    }
  }
  return cosas;
}

// ---------------------------------------------------------------- el paseo
export const Paseo: React.FC<{
  caps: Capitulo[]; prog: Progreso; puntos: number;
  alEntrar: (id: string) => void; alMover: (pos: string) => void; alBono: (id: string, puntos: number) => void;
}> = ({ caps, prog, puntos, alEntrar, alMover, alBono }) => {
  const mundo = useMemo(() => armarMundo(caps), [caps]);
  const escenario = useRef<HTMLDivElement>(null);
  const capaLejos = useRef<HTMLDivElement>(null);
  const capaMedio = useRef<HTMLDivElement>(null);
  const capaMundo = useRef<HTMLDivElement>(null);
  const jugadorEl = useRef<HTMLDivElement>(null);
  const bugEls = useRef<Record<string, HTMLDivElement | null>>({});
  const teclas = useRef<Record<string, boolean>>({});
  const bonos = prog.bonus || {};
  // Copias al día para el ciclo del juego (que no se vuelve a crear en cada cuadro).
  const bonosRef = useRef(bonos);
  bonosRef.current = bonos;

  // Estado del juego en referencias (se mueve 60 veces por segundo sin redibujar React).
  const guardado = Number(prog.pos);
  const j = useRef({ x: Number.isFinite(guardado) && guardado > 0 && guardado < mundo.ancho ? guardado : 160, y: 0, vy: 0, mira: 1 as 1 | -1, enSuelo: true, sobre: '', cam: 0, golpe: 0 });
  const bugs = useRef(Object.fromEntries(mundo.bugs.map((b) => [b.id, { x: b.x0, dir: 1, vivo: true }])));
  const [, setCuadro] = useState(0);
  const [cerca, setCerca] = useState<string | null>(null);
  const [zona, setZona] = useState(0);
  const [aviso, setAviso] = useState<{ t: string; k: number } | null>(null);
  const [bono, setBono] = useState<Bloque | null>(null);
  const [descubiertos, setDescubiertos] = useState<Set<string>>(new Set());
  const [recogidos, setRecogidos] = useState<Set<string>>(() => new Set(Object.keys(bonos).filter((k) => k.startsWith('d-'))));
  const recogidosRef = useRef(recogidos);
  recogidosRef.current = recogidos;
  const [caminando, setCaminando] = useState(false);
  // Escala del escenario: en pantallas angostas todo se achica para que se vea completo.
  const [escala, setEscala] = useState(1);
  const escalaRef = useRef(1);
  useEffect(() => {
    const el = escenario.current;
    if (!el) return;
    const medir = () => { const e = Math.max(0.6, Math.min(1, el.clientWidth / 760)); escalaRef.current = e; setEscala(e); };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pausa = useRef(false);
  pausa.current = !!bono;

  const avisar = (t: string) => setAviso({ t, k: Date.now() });
  const hecho = (id: string) => !!prog.caps[id];

  // Entrar a la casa más cercana.
  const entrar = () => {
    if (!cerca || pausa.current) return;
    sonar('entra');
    alMover(String(Math.round(j.current.x)));
    alEntrar(cerca);
  };
  const entrarRef = useRef(entrar);
  entrarRef.current = entrar;

  // Teclado: WASD y flechas.
  useEffect(() => {
    const MAPA: Record<string, string> = { a: 'izq', arrowleft: 'izq', d: 'der', arrowright: 'der', w: 'salto', arrowup: 'salto', ' ': 'salto' };
    const abajo = (e: KeyboardEvent) => {
      if (pausa.current || (e.target as HTMLElement)?.closest?.('input, textarea, select, .bono')) return;
      const k = e.key.toLowerCase();
      if (MAPA[k]) { teclas.current[MAPA[k]] = true; e.preventDefault(); }
      else if (['s', 'arrowdown', 'e', 'enter'].includes(k) && (e.target as HTMLElement)?.tagName !== 'BUTTON') { e.preventDefault(); entrarRef.current(); }
    };
    const arriba = (e: KeyboardEvent) => { const k = MAPA[e.key.toLowerCase()]; if (k) teclas.current[k] = false; };
    window.addEventListener('keydown', abajo);
    window.addEventListener('keyup', arriba);
    return () => { window.removeEventListener('keydown', abajo); window.removeEventListener('keyup', arriba); };
  }, []);

  // El ciclo del juego.
  useEffect(() => {
    let antes = performance.now();
    let raf = 0;
    let ultimoCerca: string | null = null, ultimaZona = -1, ultimoCamina = false;
    const solidos = () => mundo.bloques.filter((b) => !b.secreto || descubiertos.has(b.id) || bonosRef.current[b.id] != null);
    const paso = (ahora: number) => {
      const dt = Math.min(0.033, (ahora - antes) / 1000);
      antes = ahora;
      const p = j.current;
      const vw = (escenario.current?.clientWidth || 800) / escalaRef.current;
      if (!pausa.current) {
        // Caminar
        const dir = (teclas.current.der ? 1 : 0) - (teclas.current.izq ? 1 : 0);
        if (dir) p.mira = dir as 1 | -1;
        const antesX = p.x;
        p.x = Math.max(40, Math.min(mundo.ancho - 60, p.x + dir * VEL * dt));
        // Saltar
        if (teclas.current.salto && p.enSuelo) { p.vy = SALTO; p.enSuelo = false; sonar('pop'); }
        if (!teclas.current.salto && p.vy > 200) p.vy = 200; // salto corto si se suelta
        const antesY = p.y;
        p.vy -= GRAVEDAD * dt;
        p.y += p.vy * dt;
        p.enSuelo = false;
        if (p.y <= 0) { p.y = 0; p.vy = 0; p.enSuelo = true; }
        // Bloques: golpear desde abajo o pararse encima
        const visibles = solidos();
        for (const b of mundo.bloques) {
          const solapaX = p.x + ANCHO_J / 2 > b.x && p.x - ANCHO_J / 2 < b.x + BLOQUE;
          if (!solapaX) continue;
          const abajoB = b.y, arribaB = b.y + BLOQUE;
          const esVisible = visibles.includes(b);
          if (p.vy > 0 && antesY + ALTO_J <= abajoB + 2 && p.y + ALTO_J >= abajoB) {
            // Golpe con la cabeza
            p.y = abajoB - ALTO_J; p.vy = -60;
            if (b.secreto && !esVisible) { setDescubiertos((s) => new Set(s).add(b.id)); sonar('logro'); avisar('¡Encontraste un bloque secreto!'); }
            else sonar('tic');
            teclas.current = {};
            setTimeout(() => setBono(b), 180);
          } else if (esVisible && p.vy <= 0 && antesY >= arribaB - 2 && p.y <= arribaB) {
            p.y = arribaB; p.vy = 0; p.enSuelo = true;
          }
        }
        // Datos
        for (const d of mundo.datos) {
          if (Math.abs(p.x - d.x) < 26 && p.y < d.y + 18 && p.y + ALTO_J > d.y - 6) {
            if (!recogidosRef.current.has(d.id)) {
              recogidosRef.current = new Set(recogidosRef.current).add(d.id);
              setRecogidos(recogidosRef.current);
              sonar('tic'); alBono(d.id, 1);
            }
          }
        }
        // Bugs
        for (const b of mundo.bugs) {
          const e = bugs.current[b.id];
          if (!e.vivo) continue;
          e.x += e.dir * 70 * dt;
          if (e.x > b.x1) e.dir = -1; if (e.x < b.x0) e.dir = 1;
          if (Math.abs(p.x - e.x) < 30 && p.y < 30) {
            if (p.vy < 0 && antesY > 14) { e.vivo = false; p.vy = 420; sonar('entra'); avisar('¡Bug eliminado! Un buen analista detecta los problemas a tiempo.'); }
            else if (ahora - p.golpe > 900) { p.golpe = ahora; p.x = antesX - Math.sign(e.x - p.x || 1) * 60; p.vy = 300; sonar('mal'); vibrar(60); avisar('¡Un bug! Sáltale encima para eliminarlo.'); }
          }
        }
      }
      // Cámara y capas (profundidad)
      p.cam += (Math.max(0, Math.min(mundo.ancho - vw, p.x - vw * 0.42)) - p.cam) * Math.min(1, dt * 8);
      if (capaMundo.current) capaMundo.current.style.transform = `translate3d(${-p.cam}px,0,0)`;
      if (capaMedio.current) capaMedio.current.style.transform = `translate3d(${-p.cam * 0.55}px,0,0)`;
      if (capaLejos.current) capaLejos.current.style.transform = `translate3d(${-p.cam * 0.22}px,0,0)`;
      if (jugadorEl.current) {
        jugadorEl.current.style.transform = `translate3d(${p.x - 30}px, ${PISO - p.y - 72}px, 0)`;
        jugadorEl.current.dataset.mira = String(p.mira);
      }
      for (const b of mundo.bugs) {
        const el = bugEls.current[b.id], e = bugs.current[b.id];
        if (el) { el.style.transform = `translate3d(${e.x - 22}px, ${PISO - 34}px, 0) scaleX(${e.dir})`; el.classList.toggle('aplastado', !e.vivo); }
      }
      // Casa cercana, mundo actual y si camina
      const casa = mundo.casas.find((c) => Math.abs(c.x - p.x) < 90);
      const id = casa && p.y < 10 ? casa.cap.id : null;
      if (id !== ultimoCerca) { ultimoCerca = id; setCerca(id); if (id) sonar('tic'); }
      let zi = 0;
      mundo.inicioZona.forEach((x0, k) => { if (p.x >= x0) zi = k; });
      if (zi !== ultimaZona) { if (ultimaZona >= 0) avisar(`Mundo ${zi + 1}: ${ZONAS[zi].nombre}`); ultimaZona = zi; setZona(zi); }
      const camina = !!(teclas.current.der || teclas.current.izq) && !pausa.current;
      if (camina !== ultimoCamina) { ultimoCamina = camina; setCaminando(camina); }
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => { cancelAnimationFrame(raf); alMover(String(Math.round(j.current.x))); };
  }, [mundo, descubiertos]); // eslint-disable-line react-hooks/exhaustive-deps

  // Viajar rápido a un capítulo (los puntos de arriba).
  const viajar = (x: number) => { j.current.x = x; j.current.y = 0; j.current.vy = 0; sonar('entra'); setCuadro((n) => n + 1); };

  // Botones táctiles: mientras se mantienen presionados.
  const boton = (k: string) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); teclas.current[k] = true; },
    onPointerUp: () => { teclas.current[k] = false; },
    onPointerCancel: () => { teclas.current[k] = false; },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  const z = ZONAS[zona];
  const casaCerca = mundo.casas.find((c) => c.cap.id === cerca);
  const totalDatos = mundo.datos.length;
  const estrellas = Object.values(prog.caps).reduce((s, r) => s + r.estrellas, 0);
  const totalBloques = mundo.bloques.length;
  const bloquesGanados = mundo.bloques.filter((b) => bonos[b.id] != null).length;

  return (
    <div className="paseo">
      <div className="paseo-hud">
        <span className="ph-chip" title="Datos recogidos">🧊 {recogidos.size}/{totalDatos}</span>
        <span className="ph-chip" title="Bloques de reto resueltos">❓ {bloquesGanados}/{totalBloques}</span>
        <span className="ph-chip" title="Estrellas">★ {estrellas}</span>
        <span className="ph-chip ph-pts">{puntos} pts</span>
        <nav className="ph-ruta" aria-label="Viajar a un capítulo">
          {mundo.casas.map((c) => (
            <button key={c.cap.id} className={'ph-punto' + (hecho(c.cap.id) ? ' hecho' : '') + (c.cap.id === cerca ? ' aqui' : '')}
              style={{ ['--c' as string]: `var(--c-${c.cap.color})` }} onClick={() => viajar(c.x)}
              title={`Capítulo ${c.cap.n}: ${c.cap.titulo}`} aria-label={`Ir al capítulo ${c.cap.n}: ${c.cap.titulo}`} />
          ))}
        </nav>
      </div>

      <div ref={escenario} className={'escenario deco-' + z.deco} style={{ height: ALTO * escala, background: `linear-gradient(${z.cielo[0]}, ${z.cielo[1]})` }}
        aria-label={`Mundo ${zona + 1}: ${z.nombre}. Camina con A y D o con las flechas, salta con W o espacio y entra con S o Enter.`} role="application">
        {/* astro del cielo */}
        <div className={'astro ' + z.astro} aria-hidden="true" />
        {z.astro === 'luna' && <div className="estrellas-cielo" aria-hidden="true" />}
        <div className="lienzo" style={{ width: `${100 / escala}%`, height: ALTO, transform: `scale(${escala})` }}>
        {/* capa lejana */}
        <div ref={capaLejos} className="capa" aria-hidden="true">
          <svg key={'l' + zona} className="paisaje" width={mundo.ancho * 0.22 + 1800} height={ALTO} style={{ overflow: 'visible' }}>
            {paisaje(z, 0, mundo.ancho * 0.22 + 1800, 'lejos')}
          </svg>
        </div>
        {/* capa del medio */}
        <div ref={capaMedio} className="capa" aria-hidden="true">
          <svg key={'m' + zona} className="paisaje" width={mundo.ancho * 0.55 + 1800} height={ALTO} style={{ overflow: 'visible' }}>
            {paisaje(z, 0, mundo.ancho * 0.55 + 1800, 'medio')}
          </svg>
        </div>
        {/* el mundo donde se juega */}
        <div ref={capaMundo} className="capa capa-mundo" style={{ width: mundo.ancho }}>
          {/* suelo de cada mundo */}
          {ZONAS.map((zz, k) => {
            const x0 = mundo.inicioZona[k], x1 = mundo.inicioZona[k + 1] ?? mundo.ancho;
            return (
              <div key={zz.id} className={'suelo suelo-' + zz.deco} style={{ left: x0, width: x1 - x0, top: PISO, height: SUELO, ['--pasto' as string]: zz.pasto, ['--tierra' as string]: zz.tierra }}>
                {zz.deco === 'mar' && <div className="mar" />}
              </div>
            );
          })}
          {/* arcos de entrada a cada mundo, con la profe */}
          {mundo.puertas.map((pt) => (
            <div key={pt.zona} className="arco-mundo" style={{ left: pt.x, top: PISO - 190 }}>
              <div className="arco-cartel"><small>MUNDO {pt.zona + 1}</small><b>{ZONAS[pt.zona].nombre}</b></div>
              <img src={fotoProfe('explica')} alt="" className="profe-arco" width={70} height={92} />
              <p className="burbuja-arco">{ZONAS[pt.zona].pista}</p>
            </div>
          ))}
          {/* casas y letreros */}
          {mundo.casas.map((c) => {
            const r = prog.caps[c.cap.id];
            const reto = c.cap.id === 'reto';
            return (
              <React.Fragment key={c.cap.id}>
                <div className="casa" style={{ left: c.x - (reto ? 150 : 110), top: PISO - (reto ? 260 : 200) }}
                  onClick={() => { if (cerca === c.cap.id) entrar(); else viajar(c.x); }}>
                  <CasaArte casa={c} zona={ZONAS[c.zona]} hecho={!!r} cerca={cerca === c.cap.id} />
                </div>
                <div className="letrero-pos" style={{ left: c.x - (reto ? 300 : 260), top: PISO - 150 }}>
                  <Letrero cap={c.cap} hecho={!!r} estrellas={r?.estrellas || 0} />
                </div>
              </React.Fragment>
            );
          })}
          {/* datos */}
          {mundo.datos.map((d) => !recogidos.has(d.id) && (
            <i key={d.id} className="dato" style={{ left: d.x - 11, top: PISO - d.y - 22 }} aria-hidden="true" />
          ))}
          {/* bloques ? y secretos */}
          {mundo.bloques.map((b) => {
            const visible = !b.secreto || descubiertos.has(b.id) || bonos[b.id] != null;
            const usado = bonos[b.id] != null;
            return (
              <div key={b.id} className={'bloque' + (b.secreto ? ' secreto' : '') + (visible ? '' : ' oculto') + (usado ? ' usado' : '')}
                style={{ left: b.x, top: PISO - b.y - BLOQUE, width: BLOQUE, height: BLOQUE }} aria-hidden="true">
                {visible ? (usado ? '' : b.secreto ? '★' : '?') : ''}
              </div>
            );
          })}
          {/* bugs */}
          {mundo.bugs.map((b) => (
            <div key={b.id} ref={(el) => { bugEls.current[b.id] = el; }} className="bug" aria-hidden="true">
              <svg width={44} height={34} viewBox="0 0 44 34"><ellipse cx={22} cy={20} rx={18} ry={13} fill="#E5484D" stroke="#2A1A10" strokeWidth={3} /><path d="M22 8 V32" stroke="#2A1A10" strokeWidth={2} /><circle cx={30} cy={14} r={4} fill="#fff" /><circle cx={31} cy={14} r={2} fill="#000" /><path d="M8 26 l-5 6 M14 30 l-2 4 M30 30 l2 4 M36 26 l5 6" stroke="#2A1A10" strokeWidth={2.5} strokeLinecap="round" /><path d="M34 9 l6 -6 M30 7 l2 -7" stroke="#2A1A10" strokeWidth={2} strokeLinecap="round" /></svg>
            </div>
          ))}
          {/* el jugador */}
          <div ref={jugadorEl} className={'jugador' + (caminando ? ' camina' : '')} aria-hidden="true">
            <Estudiante size={60} gesto={cerca && hecho(cerca) ? 'celebra' : 'normal'} />
          </div>
        </div>

        </div>

        {/* cartel de la casa cercana: qué se aprende y entrar */}
        {casaCerca && !bono && (
          <div className="cartel-capitulo" style={{ ['--c' as string]: `var(--c-${casaCerca.cap.color})` }} role="status">
            <div className="cc-cabeza">
              <span className="cc-ico"><Glifo id={casaCerca.cap.id} size={26} /></span>
              <div><small>CAPÍTULO {casaCerca.cap.n} · {ZONAS[casaCerca.zona].nombre}</small><b>{casaCerca.cap.titulo}</b></div>
            </div>
            <p className="cc-sub">{casaCerca.cap.sub}</p>
            <ul className="cc-temas">
              {casaCerca.cap.fichas.slice(0, 4).map((f) => <li key={f.titulo}>{f.titulo}</li>)}
            </ul>
            <button className="btn cc-entrar" onClick={entrar}>{prog.caps[casaCerca.cap.id] ? 'Volver a jugar' : 'Entrar'} <kbd>S</kbd></button>
          </div>
        )}
        {aviso && <p key={aviso.k} className="aviso-paseo" role="status">{aviso.t}</p>}
        {bono && <Bono tipo={bono.secreto ? 'secreto' : 'bloque'} caps={bono.caps} titulo={bono.titulo} yaGanado={bonos[bono.id]}
          alCerrar={() => setBono(null)} alGanar={(n) => alBono(bono.id, n)} />}
      </div>

      {/* controles táctiles */}
      <div className="controles-paseo">
        <div className="cp-flechas">
          <button className="cp-btn" aria-label="Caminar a la izquierda" {...boton('izq')}>◀</button>
          <button className="cp-btn" aria-label="Caminar a la derecha" {...boton('der')}>▶</button>
        </div>
        <p className="cp-ayuda"><kbd>A</kbd><kbd>D</kbd> caminar · <kbd>W</kbd> saltar · <kbd>S</kbd> entrar · Golpea los bloques <b>?</b> desde abajo · Hay un bloque secreto en cada mundo.</p>
        <div className="cp-flechas">
          <button className="cp-btn salto" aria-label="Saltar" {...boton('salto')}>⤒</button>
          <button className="cp-btn entrar" aria-label="Entrar a la casa" onClick={entrar} disabled={!cerca}>Entrar</button>
        </div>
      </div>
      <p className="oculto" aria-live="polite">{cerca ? `Estás frente a la casa del capítulo ${casaCerca?.cap.n}: ${casaCerca?.cap.titulo}.` : ''} {NOMBRE_PROFE} te acompaña.</p>
    </div>
  );
};
