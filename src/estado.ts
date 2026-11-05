// estado.ts
// Progreso guardado en este aparato (localStorage), sonidos cortos sin archivos y utilidades.
import { useEffect, useState } from 'react';

export type ResultadoCap = { puntos: number; estrellas: number; aciertos: number; total: number };
export type Progreso = {
  nombre: string;
  caps: Record<string, ResultadoCap>;
  sonido: boolean;
  tema: 'oscuro' | 'claro';
  abiertoTodo: boolean; // la profe puede abrir todos los capítulos
  pos?: string;         // dónde quedó el jugador en el mapa: «mundo:fila:columna»
  bonus?: Record<string, number>; // bonos del mapa ya ganados (casas del reto y cofres) y sus puntos
  vista?: 'mundo' | 'lista';
};

const CLAVE = 'modo-analista-v1';
const VACIO: Progreso = { nombre: '', caps: {}, sonido: true, tema: 'oscuro', abiertoTodo: false };

// Leer y escribir siempre con try/catch: en ventana privada o con el almacenamiento bloqueado
// el juego sigue funcionando, solo que no recuerda el progreso.
export function leerProgreso(): Progreso {
  try {
    const t = localStorage.getItem(CLAVE);
    if (!t) return { ...VACIO };
    const p = JSON.parse(t);
    return { ...VACIO, ...p, caps: { ...(p?.caps || {}) } };
  } catch {
    return { ...VACIO };
  }
}
export function guardarProgreso(p: Progreso) {
  try { localStorage.setItem(CLAVE, JSON.stringify(p)); } catch { /* sin almacenamiento: no pasa nada */ }
}

export const estrellasDe = (aciertos: number, total: number) => {
  const r = total ? aciertos / total : 0;
  return r >= 0.9 ? 3 : r >= 0.7 ? 2 : 1;
};

export function barajar<T>(a: readonly T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

// ¿La persona pidió menos movimiento en su sistema operativo?
export function useMenosMovimiento() {
  const q = '(prefers-reduced-motion: reduce)';
  const [v, setV] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(q).matches);
  useEffect(() => {
    const m = matchMedia(q);
    const f = () => setV(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return v;
}

// ¿Pantalla angosta (celular de pie)? Las cinemáticas se arman en vertical.
export function useVertical() {
  const q = '(max-width: 720px) and (orientation: portrait)';
  const [v, setV] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(q).matches);
  useEffect(() => {
    const m = matchMedia(q);
    const f = () => setV(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return v;
}

// Sonidos cortos con Web Audio. Se apagan desde el botón de sonido.
let ctx: AudioContext | null = null;
let sonidoActivo = true;
export const ponerSonido = (v: boolean) => { sonidoActivo = v; };
export const sonidoPrendido = () => sonidoActivo;
type Sonido = 'bien' | 'mal' | 'tic' | 'logro' | 'pop' | 'entra';
export function sonar(tipo: Sonido) {
  if (!sonidoActivo) return;
  try {
    ctx = ctx || new AudioContext();
  } catch {
    return;
  }
  const notas: Record<Sonido, [number, number][]> = {
    bien: [[660, 0.08], [990, 0.14]],
    mal: [[240, 0.16]],
    tic: [[880, 0.03]],
    pop: [[1200, 0.03]],
    entra: [[700, 0.05], [940, 0.07]],
    logro: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.32]],
  };
  let t = ctx.currentTime;
  for (const [f, d] of notas[tipo]) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = tipo === 'mal' ? 'square' : 'triangle';
    o.frequency.value = f;
    const vol = tipo === 'mal' ? 0.04 : tipo === 'pop' || tipo === 'tic' ? 0.04 : 0.12;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + d + 0.02);
    t += d * 0.9;
  }
}

// El juego llama a cada jugador por su nombre. Se guarda aquí para que cualquier pieza lo use.
let nombreJugador = '';
export const ponerNombre = (n: string) => { nombreJugador = n.trim().split(/\s+/)[0] || ''; };
export const nombre = () => nombreJugador;
// "Valentina, ahora miremos…" o "¡Hola, Valentina! ¡Bienvenidos…" según cómo empiece la frase.
export function conNombre(frase: string, n = nombreJugador) {
  if (!n) return frase;
  if (/^[¡¿]/.test(frase)) return `¡Hola, ${n}! ${frase}`;
  return `${n}, ${frase.charAt(0).toLowerCase()}${frase.slice(1)}`;
}

// Vibración corta en el celular (si el aparato la tiene).
export const vibrar = (ms = 30) => {
  try { if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(ms); } catch { /* sin vibración */ }
};
