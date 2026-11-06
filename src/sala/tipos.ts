// tipos.ts
// Lo que se mandan el proyector y los celulares, y las constantes de la sala.

export const EQUIPOS = [
  { n: 'Actores', c: 'var(--c-act)', q: '¿Quién participa?' },
  { n: 'Datos', c: 'var(--c-dat)', q: '¿Qué información hay?' },
  { n: 'Procesos', c: 'var(--c-pro)', q: '¿Qué se hace?' },
  { n: 'Control', c: 'var(--c-con)', q: '¿Cómo se evalúa?' },
];
export const COLORES_OP = ['#E2533D', '#2B7BB9', '#C99300', '#1E8C4E'];
export const FORMAS = ['▲', '◆', '●', '■'];
export const AVATARES = ['🦉', '🦊', '🐼', '🐯', '🐸', '🐙', '🦄', '🐝', '🐧', '🦁', '🐨', '🐢', '🐬', '🦖', '🐞', '🦜', '🐺', '🦋'];
export const REACCIONES = ['🔥', '👏', '🤯', '😂', '💡', '🎯', '🙌', '❤️'];
export const FRASES = ['¡Vamos, equipo! 💪', '¡Eso! 🔥', '¿Cuál es? 🤔', '¡Qué rápido! ⚡', '¡Bien, salón! 🎉', 'Ayúdenme 🙏'];
export const TIEMPO = 20;      // segundos por pregunta (modo clásico)
export const PREGUNTAS = 12;   // preguntas por partida (modo clásico)

// Modos de juego de la sala. Cada uno cambia las preguntas, el tiempo y lo que pasa al acertar.
export type Modo = 'clasico' | 'matriz' | 'relampago' | 'cofres';
export const MODOS: { id: Modo; n: string; ico: string; desc: string; tiempo: number; preguntas: number }[] = [
  { id: 'clasico', n: 'Clásico', ico: '🏆', desc: 'Preguntas de la clase. Gana quien acierta más rápido.', tiempo: 20, preguntas: 12 },
  { id: 'matriz', n: 'Matriz factible / viable', ico: '⚖️', desc: 'Llegan propuestas: ¿se puede hacer? ¿conviene y se sostiene? Ubícalas en la matriz.', tiempo: 25, preguntas: 8 },
  { id: 'relampago', n: 'Relámpago', ico: '⚡', desc: 'Verdadero o falso en 8 segundos. Solo los más rápidos sobreviven.', tiempo: 8, preguntas: 15 },
  { id: 'cofres', n: 'Cofres del analista', ico: '🎁', desc: 'Cada acierto abre un cofre sorpresa: puntos extra, doble, bono de equipo… o robar al primero.', tiempo: 20, preguntas: 10 },
];
export const modoDe = (id?: string) => MODOS.find((m) => m.id === id) || MODOS[0];

// [puntos, equipo, acertó la última (1), falló (0) o no respondió (-1), racha]
export type FichaJugador = [number, number, number, number];

export type EstadoSala = {
  v: 1;
  fase: 'sala' | 'pregunta' | 'revela' | 'fin';
  i: number;
  total: number;
  q?: { t: string; ops: string[]; tema: string };
  quedan?: number;
  ok?: number;
  por?: string;
  conteo?: number[];
  nResp?: number;
  jug: Record<string, FichaJugador>;
  eq: number[];
  chat: boolean;
  modo?: Modo;
  tiempo?: number;
  cof?: Record<string, string>; // modo cofres: lo que le salió a cada quien en el cofre de esta ronda
};

export type MsgEntra =
  | { t: 'hola'; id: string; n: string; av: string }
  | { t: 'resp'; id: string; i: number; k: number }
  | { t: 'cofre'; id: string; i: number; k: number }
  | { t: 'adios'; id: string };

export type MsgChat = { id: string; n: string; av: string; eq: number; txt?: string; emo?: string };
