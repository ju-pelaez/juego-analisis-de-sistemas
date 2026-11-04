// canal.ts
// Cómo viajan los mensajes entre el proyector y los celulares en la sala en vivo.
// Todos se conectan a un servidor público de mensajes (MQTT por WebSocket seguro), como un chat:
// funciona con wifi o con datos móviles y no necesita un servidor propio.
//
// Temas de cada sala (CODIGO = 4 letras):
//   modoanalista/v1/CODIGO/estado  → el proyector publica el estado del juego (queda guardado)
//   modoanalista/v1/CODIGO/entra   → los celulares mandan: entrar, responder
//   modoanalista/v1/CODIGO/chat    → todos: mensajes y emoticones del salón
import type { MqttClient, IClientOptions } from 'mqtt';

// El cliente MQTT se carga del CDN al abrir la sala (igual que en la sala del árbol de problemas).
// Empaquetado por Vite no recibe la respuesta del servidor; desde el CDN funciona en cualquier navegador.
const MQTT_CDN = 'https://cdn.jsdelivr.net/npm/mqtt@5.16.1/dist/mqtt.esm.js';
export type Mqtt = { connect: (url: string, op: IClientOptions) => MqttClient };
let cargado: Promise<Mqtt> | null = null;
export const cargarMqtt = () => (cargado ??= import(/* @vite-ignore */ MQTT_CDN).then((m) => (m.default || m) as Mqtt));

const SERVIDOR = 'wss://broker.hivemq.com:8884/mqtt';
const RAIZ = 'modoanalista/v1/';
export const tema = (codigo: string, sub: 'estado' | 'entra' | 'chat') => `${RAIZ}${codigo}/${sub}`;

export type Canal = {
  cliente: MqttClient;
  publicar: (sub: 'estado' | 'entra' | 'chat', dato: unknown, guardar?: boolean) => void;
  cerrar: () => void;
};

export function abrirCanal(
  mqtt: Mqtt,
  codigo: string,
  subs: ('estado' | 'entra' | 'chat')[],
  alMensaje: (sub: string, dato: unknown, crudo: string) => void,
  alEstado: (conectado: boolean) => void,
  despedida?: { sub: 'estado' | 'entra'; dato: unknown; guardar?: boolean },
): Canal {
  const cliente = mqtt.connect(SERVIDOR, {
    clientId: 'ma-' + Math.random().toString(36).slice(2, 12),
    clean: true, keepalive: 20, reconnectPeriod: 2000, connectTimeout: 10000,
    // Si el aparato se desconecta de golpe, el servidor manda este mensaje solo.
    will: despedida ? { topic: tema(codigo, despedida.sub), payload: despedida.dato === null ? '' : JSON.stringify(despedida.dato), qos: 1, retain: !!despedida.guardar } : undefined,
  });
  cliente.on('connect', () => {
    alEstado(true);
    cliente.subscribe(subs.map((s) => tema(codigo, s)), { qos: 1 });
  });
  cliente.on('offline', () => alEstado(false));
  cliente.on('close', () => alEstado(false));
  cliente.on('error', () => alEstado(false));
  cliente.on('message', (t, datos) => {
    const sub = t.split('/').pop() || '';
    const crudo = datos.toString();
    if (!crudo) return alMensaje(sub, null, crudo);
    if (crudo.length > 20000) return; // nada tan grande viene de este juego
    try { alMensaje(sub, JSON.parse(crudo), crudo); } catch { /* mensaje que no es del juego */ }
  });
  return {
    cliente,
    publicar: (sub, dato, guardar = false) => {
      if (!cliente.connected) return;
      cliente.publish(tema(codigo, sub), dato === null ? '' : JSON.stringify(dato), { qos: sub === 'chat' ? 0 : 1, retain: guardar });
    },
    cerrar: () => cliente.end(true),
  };
}

// Palabras que se tapan en el chat (es una clase).
const GROSERIAS = /\b(h?ijue?p\w*|hp|gonorrea\w*|malpari\w*|marica\w*|maric[oó]n\w*|mierd\w*|put[ao]s?|perra\w*|zorr[ao]s?|verg\w*|careverg\w*|pendej\w*|imb[eé]cil\w*|idiot\w*|est[uú]pid\w*|g[uü]ev[oó]n\w*|huev[oó]n\w*|culo\w*|chimbo\w*)\b/gi;
export const limpiar = (t: unknown, max = 60) => String(t ?? '').replace(/\s+/g, ' ').trim().slice(0, max).replace(GROSERIAS, '•••');

export const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const nuevoCodigo = () => Array.from({ length: 4 }, () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)]).join('');
