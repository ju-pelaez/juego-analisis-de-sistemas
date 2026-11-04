// voz.ts
// La voz de la profe Ruth Dary: cada frase del juego está grabada en /public/voz/<clave>.mp3
// y voz.json dice cuánto dura cada una. Si una frase no existe, el juego sigue en silencio.
import { sonidoPrendido } from './estado';

type Manifiesto = Record<string, { ms: number }>;
let manifiesto: Manifiesto = {};
let carga: Promise<Manifiesto> | null = null;

export const cargarVoz = () =>
  (carga ??= fetch('/voz/voz.json')
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}))
    .then((m: Manifiesto) => (manifiesto = m)));

export const hayVoz = (clave: string) => !!manifiesto[clave];
export const msVoz = (clave: string) => manifiesto[clave]?.ms ?? 0;
export const srcVoz = (clave: string) => `/voz/${clave}.mp3`;

// Una sola voz a la vez: si empieza otra frase, la anterior se calla.
let actual: HTMLAudioElement | null = null;
let turno = 0;
const oyentes = new Set<(hablando: boolean) => void>();
const avisar = (v: boolean) => oyentes.forEach((f) => f(v));
export const alCambiarVoz = (f: (hablando: boolean) => void) => { oyentes.add(f); return () => { oyentes.delete(f); }; };

export function callar() {
  turno++;
  if (actual) { actual.pause(); actual = null; }
  avisar(false);
}

// Dice una o varias frases seguidas. Devuelve false si no hay nada que decir.
export function hablar(claves: string | string[], volumen = 1): boolean {
  const lista = (Array.isArray(claves) ? claves : [claves]).filter(hayVoz);
  if (!lista.length || !sonidoPrendido()) return false;
  callar();
  const mio = ++turno;
  const siguiente = (k: number) => {
    if (mio !== turno) return;
    if (k >= lista.length) { actual = null; avisar(false); return; }
    const a = new Audio(srcVoz(lista[k]));
    a.volume = volumen;
    a.onended = () => siguiente(k + 1);
    a.onerror = () => siguiente(k + 1);
    actual = a;
    a.play().catch(() => { if (mio === turno) { actual = null; avisar(false); } });
  };
  avisar(true);
  siguiente(0);
  return true;
}

// Frase corta de ánimo o de "revisa" en los avisos (varía para no aburrir).
let ultimoAnimo = -1;
export function animo(ok: boolean) {
  const n = ok ? 4 : 3;
  let k = Math.floor(Math.random() * n);
  if (k === ultimoAnimo) k = (k + 1) % n;
  ultimoAnimo = k;
  hablar(`${ok ? 'bien' : 'mal'}-${k}`, 0.9);
}
