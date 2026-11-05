// Mundo.tsx
// La Ciudad del Analista: cinco mundos vistos desde arriba, por cuadros, como un mapa de videojuego.
// Cada nivel es un capítulo. El jugador camina por el camino, entra a los niveles y busca bonos:
//   · Casa del reto: tres preguntas rápidas de los temas del mundo (+10 cada una).
//   · Cofre escondido: solo aparece cuando el jugador pasa cerca; trae una pregunta de oro (+25).
// Un nivel sin terminar cierra el paso: no se puede seguir más allá hasta ganarlo (como en los clásicos).
// Se juega con el dedo (tocar un cuadro), con la cruceta en pantalla o con el teclado (flechas y Enter).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Capitulo } from '../datos/capitulos';
import type { Progreso } from '../estado';
import { barajar, conNombre, sonar, useMenosMovimiento, vibrar } from '../estado';
import { Estudiante } from '../componentes/Estudiante';
import { CaraProfe, fotoProfe, NOMBRE_PROFE } from '../componentes/Profe';
import { caminable, COLS, FILAS, MAPAS, type Mapa, type Tema } from './mapas';

const T = 48; // lado de cada cuadro
const PASO_MS = 135;
type Celda = { r: number; c: number };
type Dir = 'arriba' | 'abajo' | 'izq' | 'der';
const DELTA: Record<Dir, Celda> = { arriba: { r: -1, c: 0 }, abajo: { r: 1, c: 0 }, izq: { r: 0, c: -1 }, der: { r: 0, c: 1 } };
const clave = (p: Celda) => `${p.r},${p.c}`;
const PARADAS = 'S123HXE';
const esNivel = (x: string) => x.length === 1 && '123'.includes(x);
const esParada = (x: string) => x.length === 1 && PARADAS.includes(x);

// ---------------------------------------------------------------- dibujo de los cuadros
const Decorado: React.FC<{ ch: string; x: number; y: number; tema: Tema; mapa: string }> = ({ ch, x, y, tema, mapa }) => {
  const cx = x + T / 2, cy = y + T / 2;
  const b = tema.borde;
  if (ch === 'T') {
    if (mapa === 'cumbre') return (
      <g>
        <path d={`M${cx} ${y + 5} L${cx + 15} ${y + 36} H${cx - 15}Z`} fill={tema.arbol} stroke={b} strokeWidth={2} />
        <path d={`M${cx} ${y + 5} L${cx + 6} ${y + 17} H${cx - 6}Z`} fill="#fff" />
        <rect x={cx - 3} y={y + 36} width={6} height={7} fill="#7A4E2D" />
      </g>
    );
    return (
      <g className={mapa === 'bosque' ? '' : 'arbusto'}>
        <rect x={cx - 3} y={cy + 6} width={6} height={12} fill="#7A4E2D" stroke={b} strokeWidth={1.5} />
        <circle cx={cx} cy={cy - 2} r={mapa === 'bosque' ? 19 : 15} fill={tema.arbol} stroke={b} strokeWidth={2} />
        <circle cx={cx - 5} cy={cy - 7} r={5} fill={tema.arbol2} opacity={0.7} />
      </g>
    );
  }
  if (ch === 'R') return <path d={`M${x + 6} ${y + 40} Q${x + 8} ${y + 14} ${cx} ${y + 12} Q${x + 40} ${y + 14} ${x + 42} ${y + 40}Z`} fill={tema.roca} stroke={b} strokeWidth={2} />;
  if (ch === '^') return (
    <g>
      <path d={`M${cx} ${y + 6} L${x + 44} ${y + 42} H${x + 4}Z`} fill={tema.roca} stroke={b} strokeWidth={2} />
      <path d={`M${cx} ${y + 6} L${x + 44} ${y + 42} H${cx}Z`} fill="#000" opacity={0.12} />
    </g>
  );
  if (ch === 'o') return (
    <g>
      <rect x={cx - 5} y={y + 10} width={10} height={32} rx={5} fill={tema.arbol} stroke={b} strokeWidth={2} />
      <path d={`M${cx - 5} ${y + 26} h-7 v-9`} fill="none" stroke={tema.arbol} strokeWidth={6} strokeLinecap="round" />
      <path d={`M${cx + 5} ${y + 22} h7 v-8`} fill="none" stroke={tema.arbol} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
  return null;
};

// Panel de nivel: cuadro naranja con el número del capítulo; verde con ✓ si ya se ganó.
const Nivel: React.FC<{ x: number; y: number; n: number; estado: 'hecho' | 'abierto' | 'cerrado'; proximo: boolean; borde: string; castillo: boolean }> = ({ x, y, n, estado, proximo, borde, castillo }) => {
  const cx = x + T / 2, cy = y + T / 2;
  if (castillo) return (
    <g className={proximo ? 'nivel-proximo' : ''}>
      <rect x={x + 4} y={y + 14} width={40} height={30} fill={estado === 'hecho' ? '#7B5BD6' : '#4B3B7A'} stroke={borde} strokeWidth={2} />
      {[0, 1, 2, 3].map((k) => <rect key={k} x={x + 4 + k * 11} y={y + 8} width={7} height={7} fill="#4B3B7A" stroke={borde} strokeWidth={1.5} />)}
      <path d={`M${cx - 7} ${y + 44} V${y + 32} a7 7 0 0 1 14 0 V${y + 44}Z`} fill="#1B1430" />
      <path d={`M${cx} ${y + 8} V${y - 6} l12 4 -12 4`} fill="#FFD23F" stroke={borde} strokeWidth={1.5} />
    </g>
  );
  const fondo = estado === 'hecho' ? '#2FB344' : estado === 'abierto' ? '#F7A928' : '#9AA3AD';
  return (
    <g className={proximo ? 'nivel-proximo' : ''} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <rect x={x + 5} y={y + 5} width={T - 10} height={T - 10} rx={7} fill={fondo} stroke={borde} strokeWidth={2.5} />
      <rect x={x + 8} y={y + 8} width={T - 16} height={6} rx={3} fill="#fff" opacity={0.35} />
      <text x={cx} y={cy + 8} textAnchor="middle" className="nivel-num">{estado === 'hecho' ? '✓' : n}</text>
    </g>
  );
};

const Casa: React.FC<{ x: number; y: number; usada: boolean; borde: string }> = ({ x, y, usada, borde }) => (
  <g>
    <rect x={x + 9} y={y + 22} width={30} height={20} fill="#FFF7E6" stroke={borde} strokeWidth={2} />
    <path d={`M${x + 4} ${y + 24} L${x + 24} ${y + 6} L${x + 44} ${y + 24}Z`} fill={usada ? '#9AA3AD' : '#E5484D'} stroke={borde} strokeWidth={2} />
    <rect x={x + 20} y={y + 29} width={9} height={13} fill={usada ? '#5B6470' : '#7A4E2D'} />
    {!usada && <text x={x + 24} y={y + 21} textAnchor="middle" className="casa-signo">?</text>}
  </g>
);

const Cofre: React.FC<{ x: number; y: number; estado: 'oculto' | 'visto' | 'abierto'; borde: string }> = ({ x, y, estado, borde }) => {
  const cx = x + T / 2, cy = y + T / 2;
  if (estado === 'oculto') return <path className="destello" d={`M${cx} ${cy - 9} L${cx + 3} ${cy - 3} L${cx + 9} ${cy} L${cx + 3} ${cy + 3} L${cx} ${cy + 9} L${cx - 3} ${cy + 3} L${cx - 9} ${cy} L${cx - 3} ${cy - 3}Z`} fill="#FFF6B0" />;
  return (
    <g className={estado === 'visto' ? 'cofre-nuevo' : ''} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <rect x={x + 8} y={y + 20} width={32} height={20} rx={3} fill="#A0632E" stroke={borde} strokeWidth={2} />
      {estado === 'abierto'
        ? <path d={`M${x + 8} ${y + 20} L${x + 12} ${y + 8} H${x + 36} L${x + 40} ${y + 20}`} fill="#7A4A22" stroke={borde} strokeWidth={2} />
        : <path d={`M${x + 8} ${y + 20} Q${cx} ${y + 6} ${x + 40} ${y + 20}`} fill="#C07A3A" stroke={borde} strokeWidth={2} />}
      <rect x={cx - 4} y={y + 22} width={8} height={9} rx={2} fill="#FFD23F" stroke={borde} strokeWidth={1.5} />
    </g>
  );
};

const Tubo: React.FC<{ x: number; y: number; borde: string; activo: boolean }> = ({ x, y, borde, activo }) => (
  <g opacity={activo ? 1 : 0.55}>
    <rect x={x + 12} y={y + 18} width={24} height={26} fill="#2FB344" stroke={borde} strokeWidth={2} />
    <rect x={x + 8} y={y + 8} width={32} height={12} rx={2} fill="#3DCB55" stroke={borde} strokeWidth={2} />
    <rect x={x + 15} y={y + 20} width={4} height={22} fill="#fff" opacity={0.35} />
  </g>
);

function buscar(mapa: Mapa, x: string): Celda {
  for (let r = 0; r < mapa.filas.length; r++) {
    const c = mapa.filas[r].indexOf(x);
    if (c >= 0) return { r, c };
  }
  return { r: 0, c: 0 };
}

// ---------------------------------------------------------------- el mundo
export const Mundo: React.FC<{
  caps: Capitulo[]; prog: Progreso; abierto: (k: number) => boolean; puntos: number;
  alEntrar: (id: string) => void; alMover: (pos: string) => void; alBono: (id: string, puntos: number) => void;
}> = ({ caps, prog, abierto, puntos, alEntrar, alMover, alBono }) => {
  const menos = useMenosMovimiento();
  const kDe = (id: string) => caps.findIndex((c) => c.id === id);
  const hecho = (id: string) => !!prog.caps[id] || prog.abiertoTodo;
  const mundoAbierto = (k: number) => abierto(kDe(MAPAS[k].caps[0]));
  const bonos = prog.bonus || {};

  // Dónde empieza: lo guardado, o el mundo del próximo capítulo por jugar.
  const inicio = useMemo(() => {
    const [m, r, c] = (prog.pos || '').split(':').map(Number);
    if (MAPAS[m] && caminable(MAPAS[m].filas[r]?.[c] || '') && mundoAbierto(m)) return { m, p: { r, c } };
    const prox = caps.find((c, k) => abierto(k) && !prog.caps[c.id]);
    const mm = Math.max(0, MAPAS.findIndex((x) => !!prox && x.caps.includes(prox.id)));
    return { m: mm, p: buscar(MAPAS[mm], 'S') };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [m, setM] = useState(inicio.m);
  const [pos, setPos] = useState<Celda>(inicio.p);
  const [mira, setMira] = useState<1 | -1>(1);
  const [caminando, setCaminando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [bono, setBono] = useState<null | 'casa' | 'cofre'>(null);
  const [vistos, setVistos] = useState<Set<string>>(new Set());
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const mapa = MAPAS[m];
  const ch = (p: Celda) => mapa.filas[p.r]?.[p.c] ?? '';
  const capDe = (d: string) => mapa.caps[Number(d) - 1];
  // Un nivel sin ganar cierra el paso (se puede llegar a él, pero no pasar por encima).
  const cierra = (p: Celda) => { const x = ch(p); return esNivel(x) && !!capDe(x) && !hecho(capDe(x)); };

  // Cuadros a los que se puede llegar desde el inicio del mundo.
  const alcanzables = useMemo(() => {
    const s = buscar(mapa, 'S');
    const vis = new Set([clave(s)]);
    const cola = [s];
    while (cola.length) {
      const p = cola.shift()!;
      if (cierra(p)) continue;
      for (const d of Object.values(DELTA)) {
        const q = { r: p.r + d.r, c: p.c + d.c };
        if (caminable(ch(q)) && !vis.has(clave(q))) { vis.add(clave(q)); cola.push(q); }
      }
    }
    return vis;
  }, [m, prog.caps, prog.abiertoTodo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Camino más corto entre dos cuadros sin pasar por encima de niveles cerrados.
  const ruta = (a: Celda, b: Celda): Celda[] | null => {
    const prev = new Map<string, string | null>([[clave(a), null]]);
    const cola = [a];
    while (cola.length) {
      const p = cola.shift()!;
      if (clave(p) === clave(b)) break;
      if (clave(p) !== clave(a) && cierra(p)) continue;
      for (const d of Object.values(DELTA)) {
        const q = { r: p.r + d.r, c: p.c + d.c };
        if (alcanzables.has(clave(q)) && !prev.has(clave(q))) { prev.set(clave(q), clave(p)); cola.push(q); }
      }
    }
    if (!prev.has(clave(b))) return null;
    const pasos: Celda[] = [];
    for (let k: string | null = clave(b); k && k !== clave(a); k = prev.get(k) ?? null) {
      const [r, c] = k.split(',').map(Number);
      pasos.unshift({ r, c });
    }
    return pasos;
  };

  // Al llegar a un cuadro: salida al siguiente mundo o bonos.
  const llegar = (p: Celda) => {
    setCaminando(false);
    alMover(`${m}:${p.r}:${p.c}`);
    const x = ch(p);
    if (x === 'E' && MAPAS[m + 1]) {
      sonar('entra');
      const s = buscar(MAPAS[m + 1], 'S');
      setM(m + 1); setPos(s);
      alMover(`${m + 1}:${s.r}:${s.c}`);
      setAviso(`¡Mundo ${m + 2}: ${MAPAS[m + 1].nombre}!`);
      return;
    }
    if (x === 'H' || x === 'X') { sonar('pop'); setBono(x === 'H' ? 'casa' : 'cofre'); }
    else if (esNivel(x)) sonar('pop');
  };

  // Recorrer un camino cuadro por cuadro.
  const recorrer = (pasos: Celda[]) => {
    if (!pasos.length) return;
    clearTimeout(timer.current);
    setBono(null);
    setAviso('');
    const ultimo = pasos[pasos.length - 1];
    if (menos) { setPos(ultimo); llegar(ultimo); return; }
    setCaminando(true);
    let k = 0;
    let antes = pos;
    const paso = () => {
      const p = pasos[k];
      if (p.c !== antes.c) setMira(p.c > antes.c ? 1 : -1);
      antes = p;
      setPos(p);
      sonar('tic');
      k++;
      timer.current = window.setTimeout(k < pasos.length ? paso : () => llegar(p), PASO_MS);
    };
    paso();
  };

  // El cofre aparece cuando el jugador pasa a un cuadro de distancia.
  useEffect(() => {
    const x = buscar(mapa, 'X');
    if (Math.abs(x.r - pos.r) + Math.abs(x.c - pos.c) <= 1 && !vistos.has(mapa.id)) {
      setVistos((v) => new Set(v).add(mapa.id));
      if (prog.bonus?.[`${mapa.id}-cofre`] == null) { sonar('logro'); setAviso('¡Un cofre escondido apareció!'); }
    }
  }, [pos, m]); // eslint-disable-line react-hooks/exhaustive-deps

  // Botón A: entrar al nivel, abrir el bono o cruzar al siguiente mundo.
  const accion = () => {
    if (caminando) return;
    const x = ch(pos);
    if (esNivel(x)) {
      const id = capDe(x);
      if (!abierto(kDe(id))) { sonar('mal'); setAviso('Este nivel aún está cerrado.'); return; }
      sonar('entra'); alEntrar(id);
    } else if (x === 'H') setBono('casa');
    else if (x === 'X') setBono('cofre');
    else if (x === 'E') llegar(pos);
  };

  const tocar = (p: Celda) => {
    if (caminando) return;
    if (clave(p) === clave(pos)) { accion(); return; }
    if (!caminable(ch(p))) return;
    if (!alcanzables.has(clave(p))) {
      sonar('mal'); vibrar(40);
      const cerrado = mapa.caps.find((id) => !hecho(id));
      setAviso(cerrado ? `Primero gana el nivel «${caps[kDe(cerrado)].titulo}».` : 'Todavía no se llega ahí.');
      return;
    }
    const r = ruta(pos, p);
    if (r) recorrer(r);
  };

  // Con la cruceta: avanzar en esa dirección y seguir el camino hasta la próxima parada o cruce.
  const mover = (d: Dir) => {
    if (caminando || bono) return;
    let q = { r: pos.r + DELTA[d].r, c: pos.c + DELTA[d].c };
    if (!alcanzables.has(clave(q))) {
      if (caminable(ch(q))) { sonar('mal'); setAviso('Ese camino sigue cerrado: gana el nivel para pasar.'); }
      return;
    }
    if (cierra(pos) && clave(pos) !== clave(buscar(mapa, 'S'))) {
      // Desde un nivel sin ganar solo se puede volver por donde se llegó (hacia el inicio).
      const r = ruta(buscar(mapa, 'S'), pos);
      const vino = r && r.length > 1 ? r[r.length - 2] : buscar(mapa, 'S');
      if (clave(q) !== clave(vino)) { sonar('mal'); setAviso('Gana este nivel para seguir adelante.'); return; }
    }
    const vecinos = (p: Celda) => Object.values(DELTA).map((dd) => ({ r: p.r + dd.r, c: p.c + dd.c })).filter((v) => alcanzables.has(clave(v)));
    const pasos = [q];
    let atras = pos;
    while (!esParada(ch(q)) && !cierra(q)) {
      const sig = vecinos(q).filter((v) => clave(v) !== clave(atras));
      if (sig.length !== 1) break;
      atras = q; q = sig[0];
      pasos.push(q);
    }
    recorrer(pasos);
  };

  const teclas = (e: React.KeyboardEvent) => {
    const d: Record<string, Dir> = { ArrowUp: 'arriba', ArrowDown: 'abajo', ArrowLeft: 'izq', ArrowRight: 'der' };
    if (e.key === 'Escape') { setBono(null); return; }
    if (bono) return;
    if (d[e.key]) { e.preventDefault(); mover(d[e.key]); }
    else if ((e.key === 'Enter' || e.key === ' ') && (e.target as HTMLElement).dataset.consola) { e.preventDefault(); accion(); }
  };

  const irMundo = (k: number) => {
    if (k === m || caminando || !mundoAbierto(k)) return;
    clearTimeout(timer.current);
    const s = buscar(MAPAS[k], 'S');
    setM(k); setPos(s); setBono(null); sonar('entra');
    setAviso(`¡Mundo ${k + 1}: ${MAPAS[k].nombre}!`);
    alMover(`${k}:${s.r}:${s.c}`);
  };

  // Camino dibujado: líneas entre cuadros vecinos caminables.
  const lineas = useMemo(() => {
    let d = '';
    mapa.filas.forEach((fila, r) => [...fila].forEach((x, c) => {
      if (!caminable(x)) return;
      const cx = c * T + T / 2, cy = r * T + T / 2;
      if (caminable(mapa.filas[r][c + 1] || '')) d += `M${cx} ${cy}H${cx + T}`;
      if (caminable(mapa.filas[r + 1]?.[c] || '')) d += `M${cx} ${cy}V${cy + T}`;
    }));
    return d;
  }, [mapa]);

  // Lo que hay en el cuadro donde está el jugador.
  const aqui = ch(pos);
  const capAqui = esNivel(aqui) ? caps[kDe(capDe(aqui))] : null;
  const proximo = mapa.caps.find((id) => abierto(kDe(id)) && !prog.caps[id]);
  const pProx = proximo ? buscar(mapa, String(mapa.caps.indexOf(proximo) + 1)) : null;
  const ganados = Object.keys(bonos).length;
  const estrellas = Object.values(prog.caps).reduce((s, r) => s + r.estrellas, 0);
  const tema = mapa.tema;
  const nCasa = `${mapa.id}-casa`, nCofre = `${mapa.id}-cofre`;
  let titulo = mapa.nombre, detalle = 'Sigue el camino.', boton = '';
  if (capAqui) {
    const r = prog.caps[capAqui.id];
    titulo = `Nivel ${m + 1}-${mapa.caps.indexOf(capAqui.id) + 1} · Capítulo ${capAqui.n}`;
    detalle = capAqui.titulo + (r ? ` · ${'★'.repeat(r.estrellas)}${'☆'.repeat(3 - r.estrellas)} ${r.puntos} pts` : '');
    boton = r ? 'Repetir' : 'Entrar';
  } else if (aqui === 'H') { titulo = 'Casa del reto'; detalle = bonos[nCasa] != null ? `Ya ganaste ${bonos[nCasa]} pts aquí. Puedes practicar.` : 'Tres preguntas rápidas: +10 cada una.'; boton = 'Abrir'; }
  else if (aqui === 'X') { titulo = 'Cofre escondido'; detalle = bonos[nCofre] != null ? 'Ya lo abriste. Puedes practicar.' : 'Una pregunta de oro: +25.'; boton = 'Abrir'; }
  else if (aqui === 'E') { titulo = 'Tubo al siguiente mundo'; detalle = MAPAS[m + 1] ? `Lleva a ${MAPAS[m + 1].nombre}.` : ''; boton = MAPAS[m + 1] ? 'Cruzar' : ''; }
  else if (aqui === 'S') detalle = mapa.pista;

  return (
    <div className="consola" tabIndex={0} data-consola="1" onKeyDown={teclas} aria-label="Mapa del juego. Flechas para caminar, Enter para entrar.">
      {/* marcador superior, como en los juegos clásicos */}
      <div className="hud">
        <span className="hud-mundo">MUNDO {m + 1}</span>
        <span className="hud-nombre">{mapa.nombre}</span>
        <span className="hud-dato" title="Estrellas">★ {estrellas}</span>
        <span className="hud-dato" title="Bonos encontrados">🎁 {ganados}/{MAPAS.length * 2}</span>
        <span className="hud-dato hud-pts">{puntos} pts</span>
      </div>
      <div className="mundos" role="tablist" aria-label="Mundos">
        {MAPAS.map((x, k) => (
          <button key={x.id} role="tab" aria-selected={k === m} className="mundo-tab" disabled={!mundoAbierto(k)} onClick={() => irMundo(k)}
            title={mundoAbierto(k) ? x.nombre : 'Gana el mundo anterior para abrirlo'} aria-label={`Mundo ${k + 1}: ${x.nombre}${mundoAbierto(k) ? '' : ' (cerrado)'}`}>
            {mundoAbierto(k) ? k + 1 : '🔒'}
          </button>
        ))}
      </div>

      <div className="pantalla-mapa">
        <svg viewBox={`0 0 ${COLS * T} ${FILAS * T}`} className="mapa-svg" role="group" aria-label={`Mundo ${m + 1}: ${mapa.nombre}`}>
          {/* suelo y agua */}
          {mapa.filas.map((fila, r) => [...fila].map((x, c) => (
            x === '~'
              ? <g key={r + '-' + c}><rect x={c * T} y={r * T} width={T} height={T} fill={tema.agua} /><path className="ola" d={`M${c * T + 8} ${r * T + 20} q6 -5 12 0 t12 0`} fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={2} /></g>
              : <rect key={r + '-' + c} x={c * T} y={r * T} width={T} height={T} fill={(r + c) % 2 ? tema.suelo : tema.suelo2} />
          )))}
          {/* el camino */}
          <path d={lineas} stroke={tema.borde} strokeWidth={T * 0.42 + 5} strokeLinecap="round" fill="none" />
          <path d={lineas} stroke={tema.camino} strokeWidth={T * 0.42} strokeLinecap="round" fill="none" />
          <path d={lineas} stroke={tema.borde} strokeOpacity={0.25} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" fill="none" />
          {/* puentes */}
          {mapa.filas.map((fila, r) => [...fila].map((x, c) => x === 'b' && (
            <g key={'b' + r + c}>{[0, 1, 2, 3].map((k) => <rect key={k} x={c * T + 9 + k * 8} y={r * T + 6} width={6} height={T - 12} fill="#B07A3E" stroke={tema.borde} strokeWidth={1} />)}</g>
          )))}
          {/* decorado */}
          {mapa.filas.map((fila, r) => [...fila].map((x, c) => 'TR^o'.includes(x) && <Decorado key={'d' + r + c} ch={x} x={c * T} y={r * T} tema={tema} mapa={mapa.id} />))}
          {/* tocar cualquier cuadro del camino sirve para caminar */}
          {mapa.filas.map((fila, r) => [...fila].map((x, c) => (x === '#' || x === 'b') && (
            <rect key={'t' + r + c} x={c * T} y={r * T} width={T} height={T} fill="transparent" onClick={() => tocar({ r, c })} />
          )))}
          {/* paradas: inicio, niveles, bonos y salida */}
          {mapa.filas.map((fila, r) => [...fila].map((x, c) => {
            if (!esParada(x)) return null;
            const px = c * T, py = r * T;
            let dibujo: React.ReactNode = null;
            let etiqueta = '';
            if (x === 'S') {
              dibujo = <g><circle cx={px + T / 2} cy={py + T / 2} r={14} fill="#fff" stroke={tema.borde} strokeWidth={2.5} /><path d={`M${px + 20} ${py + 16} L${px + 32} ${py + 24} L${px + 20} ${py + 32}Z`} fill="#E5484D" /></g>;
              etiqueta = 'Inicio del mundo';
            } else if (esNivel(x)) {
              const id = capDe(x); const k = kDe(id);
              const est = prog.caps[id] ? 'hecho' : abierto(k) ? 'abierto' : 'cerrado';
              dibujo = <Nivel x={px} y={py} n={caps[k].n} estado={est} proximo={id === proximo} borde={tema.borde} castillo={id === 'reto'} />;
              etiqueta = `Nivel: capítulo ${caps[k].n}, ${caps[k].titulo}. ${est === 'hecho' ? 'Ganado' : est === 'abierto' ? 'Disponible' : 'Cerrado'}`;
            } else if (x === 'H') { dibujo = <Casa x={px} y={py} usada={bonos[nCasa] != null} borde={tema.borde} />; etiqueta = 'Casa del reto'; }
            else if (x === 'X') {
              const est = bonos[nCofre] != null ? 'abierto' : vistos.has(mapa.id) ? 'visto' : 'oculto';
              dibujo = <Cofre x={px} y={py} estado={est} borde={tema.borde} />; etiqueta = est === 'oculto' ? 'Algo brilla aquí' : 'Cofre escondido';
            } else if (x === 'E') { dibujo = <Tubo x={px} y={py} borde={tema.borde} activo={!!MAPAS[m + 1]} />; etiqueta = 'Tubo al siguiente mundo'; }
            return (
              <g key={'p' + r + c} className="cuadro-parada" aria-label={etiqueta} onClick={() => tocar({ r, c })}>
                <rect x={px} y={py} width={T} height={T} fill="transparent" />
                {dibujo}
              </g>
            );
          }))}
          {/* la profe espera en el próximo nivel */}
          {pProx && (
            <g className="profe-mapa" aria-hidden="true">
              <image href={fotoProfe('explica')} x={pProx.c * T + T - 8} y={pProx.r * T - 28} width={38} height={50} />
            </g>
          )}
          {/* el jugador */}
          <g className={'jugador-mapa' + (caminando ? ' camina' : '')} style={{ transform: `translate(${pos.c * T + T / 2}px, ${pos.r * T + T / 2}px)` }} aria-hidden="true">
            <ellipse cx={0} cy={16} rx={13} ry={4} fill="#000" opacity={0.3} />
            <g transform={`translate(${-22 * mira} -40) scale(${mira} 1)`}>
              <Estudiante size={44} gesto={capAqui && prog.caps[capAqui.id] && !caminando ? 'celebra' : 'normal'} />
            </g>
          </g>
        </svg>
        {aviso && <p key={aviso} className="aviso-mapa" role="status">{aviso}</p>}
        {bono && <Bono key={bono + m} tipo={bono} mapa={mapa} caps={caps} yaGanado={bonos[bono === 'casa' ? nCasa : nCofre]}
          alCerrar={() => setBono(null)} alGanar={(p) => alBono(bono === 'casa' ? nCasa : nCofre, p)} />}
      </div>

      {/* controles: cruceta, lo que hay aquí y botón A */}
      <div className="controles">
        <div className="cruceta">
          <button className="cr arriba" onClick={() => mover('arriba')} aria-label="Caminar arriba">▲</button>
          <button className="cr izq" onClick={() => mover('izq')} aria-label="Caminar a la izquierda">◀</button>
          <span className="cr centro" aria-hidden="true" />
          <button className="cr der" onClick={() => mover('der')} aria-label="Caminar a la derecha">▶</button>
          <button className="cr abajo" onClick={() => mover('abajo')} aria-label="Caminar abajo">▼</button>
        </div>
        <div className="info-mapa" aria-live="polite">
          <p className="im-titulo">{titulo}</p>
          <p className="im-detalle">{detalle}</p>
          {aqui === 'S' && <p className="im-profe"><CaraProfe size={24} /> {NOMBRE_PROFE}</p>}
        </div>
        <button className="boton-a" onClick={accion} disabled={!boton || caminando} aria-label={boton || 'Nada que hacer aquí'}>
          <span>A</span><small>{boton || '—'}</small>
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- bonos: casa del reto y cofre
type PreguntaBono = { q: string; ok: string; ops: string[]; por: string };

function preguntasCasa(mapa: Mapa, caps: Capitulo[]): PreguntaBono[] {
  const todas = caps.filter((c) => mapa.caps.includes(c.id)).flatMap((c) => c.preguntas);
  return barajar(todas).slice(0, 3).map((p) => ({ q: p.q, ok: p.ok, ops: barajar([p.ok, ...barajar(p.mal).slice(0, 2)]), por: p.por }));
}
// Pregunta de oro: se arma con una fila de las fichas del mundo («¿Qué corresponde a…?»).
function preguntaCofre(mapa: Mapa, caps: Capitulo[]): PreguntaBono[] {
  const grupos = caps.filter((c) => mapa.caps.includes(c.id)).flatMap((c) => c.fichas.flatMap((f) => (f.filas && f.filas.length >= 3 ? [f.filas] : [])));
  const grupo = barajar(grupos)[0];
  if (!grupo) return preguntasCasa(mapa, caps).slice(0, 1);
  const f = barajar(grupo)[0];
  return [{ q: `¿Qué corresponde a: «${f[1].replace(/\.$/, '')}»?`, ok: f[0], ops: barajar([f[0], ...barajar(grupo.filter((x) => x[0] !== f[0]).map((x) => x[0])).slice(0, 3)]), por: `${f[0]}: ${f[1]}` }];
}

const Bono: React.FC<{
  tipo: 'casa' | 'cofre'; mapa: Mapa; caps: Capitulo[]; yaGanado?: number;
  alCerrar: () => void; alGanar: (puntos: number) => void;
}> = ({ tipo, mapa, caps, yaGanado: ganadoAntes, alCerrar, alGanar }) => {
  // Lo ganado antes de abrir: si ya se cobró, este intento es de práctica.
  const [yaGanado] = useState(ganadoAntes);
  const preguntas = useMemo(() => (tipo === 'casa' ? preguntasCasa(mapa, caps) : preguntaCofre(mapa, caps)), [tipo, mapa, caps]);
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState<string | null>(null);
  const [buenas, setBuenas] = useState(0);
  const [fin, setFin] = useState(false);
  const valor = tipo === 'casa' ? 10 : 25;
  const p = preguntas[i];

  const elegir = (op: string) => {
    if (elegida) return;
    setElegida(op);
    const ok = op === p.ok;
    sonar(ok ? 'bien' : 'mal');
    if (!ok) vibrar(50);
    if (ok) setBuenas((b) => b + 1);
  };
  const seguir = () => {
    if (i + 1 < preguntas.length) { setI(i + 1); setElegida(null); return; }
    setFin(true);
    if (yaGanado == null) { alGanar(buenas * valor); if (buenas) sonar('logro'); }
  };

  return (
    <div className="bono" role="dialog" aria-modal="true" aria-labelledby="t-bono">
      <div className="bono-caja">
        <div className="bono-cabeza">
          <CaraProfe pose={fin && buenas ? 'celebra' : 'explica'} size={44} />
          <div>
            <p className="bono-tipo">{tipo === 'casa' ? '🏠 Casa del reto' : '🎁 Cofre escondido'}{yaGanado != null ? ' · práctica' : ` · +${valor} por acierto`}</p>
            <h3 id="t-bono">{fin ? (buenas ? conNombre('¡Bien hecho!') : 'Casi. Vuelve a intentarlo.') : tipo === 'casa' ? `Pregunta ${i + 1} de ${preguntas.length}` : 'Pregunta de oro'}</h3>
          </div>
          <button className="icono cerrar-bono" onClick={alCerrar} aria-label="Cerrar">✕</button>
        </div>
        {!fin ? (
          <>
            <p className="bono-q">{p.q}</p>
            <div className="bono-ops">
              {p.ops.map((op) => (
                <button key={op} className={'mini-op' + (elegida ? (op === p.ok ? ' ok' : op === elegida ? ' no' : '') : '')} onClick={() => elegir(op)} aria-disabled={!!elegida}>{op}</button>
              ))}
            </div>
            {elegida && <p className="bono-por"><b>{elegida === p.ok ? '✓ ¡Correcto!' : `✗ Era «${p.ok}».`}</b> {p.por}</p>}
            {elegida && <button className="btn" onClick={seguir} autoFocus>{i + 1 < preguntas.length ? 'Siguiente →' : 'Ver resultado'}</button>}
          </>
        ) : (
          <>
            <p className="bono-q">{buenas} de {preguntas.length} correctas · {yaGanado != null ? `Ya habías ganado ${yaGanado} pts aquí.` : `Ganaste ${buenas * valor} puntos.`}</p>
            <button className="btn" onClick={alCerrar} autoFocus>Volver al mapa</button>
          </>
        )}
      </div>
    </div>
  );
};
