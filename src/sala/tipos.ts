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
export const TIEMPO = 20;      // segundos por pregunta
export const PREGUNTAS = 12;   // preguntas por partida

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
};

export type MsgEntra =
  | { t: 'hola'; id: string; n: string; av: string }
  | { t: 'resp'; id: string; i: number; k: number }
  | { t: 'adios'; id: string };

export type MsgChat = { id: string; n: string; av: string; eq: number; txt?: string; emo?: string };
