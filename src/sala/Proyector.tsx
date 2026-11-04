// Proyector.tsx
// La sala en el computador del proyector: muestra el QR, recibe a los estudiantes, lanza las
// preguntas, cuenta las respuestas, muestra el chat y los emoticones del salón y el podio final.
// Todo el estado del juego vive aquí; los celulares solo lo reciben.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { abrirCanal, limpiar, nuevoCodigo, type Canal } from './canal';
import { partida, TEMAS_SALA, type PreguntaSala } from './banco';
import { Qr } from './Qr';
import { COLORES_OP, EQUIPOS, FORMAS, PREGUNTAS, TIEMPO, type EstadoSala, type MsgChat, type MsgEntra } from './tipos';
import { sonar, useMenosMovimiento } from '../estado';

type Jugador = { n: string; av: string; eq: number; p: number; racha: number; ult: number; enLinea: boolean };
type Burbuja = { k: number; n: string; av: string; eq: number; txt: string };
type Flotante = { k: number; emo: string; x: number };

const PUBLICO = 'https://juego-analisis-de-sistemas.vercel.app/';
const ES_LOCAL = location.protocol !== 'https:' || /^(localhost|127\.|10\.|192\.168\.|\[::1\])/.test(location.hostname);
const BASE = ES_LOCAL ? PUBLICO : location.origin + '/';

export const Proyector: React.FC<{ alSalir: () => void }> = ({ alSalir }) => {
  const menos = useMenosMovimiento();
  const [codigo, setCodigo] = useState('');
  const [conectado, setConectado] = useState(false);
  const [, setTick] = useState(0);
  const repintar = () => setTick((t) => t + 1);
  const canal = useRef<Canal | null>(null);
  const jug = useRef(new Map<string, Jugador>());
  const preguntas = useRef<PreguntaSala[]>([]);
  const resp = useRef(new Map<string, { k: number; ms: number }>());
  const t0 = useRef(0);
  const [fase, setFase] = useState<EstadoSala['fase']>('sala');
  const [i, setI] = useState(0);
  const [quedan, setQuedan] = useState(TIEMPO);
  const [chatOn, setChatOn] = useState(true);
  const [temaSala, setTemaSala] = useState('todo');
  const [chat, setChat] = useState<Burbuja[]>([]);
  const [flot, setFlot] = useState<Flotante[]>([]);
  const ref = useRef({ fase, i, chatOn });
  ref.current = { fase, i, chatOn };
  const cuenta = useRef(0);

  // ---------- estado que se manda a los celulares ----------
  const estado = useCallback((): EstadoSala => {
    const { fase, i, chatOn } = ref.current;
    const q = preguntas.current[i];
    const eq = [0, 0, 0, 0];
    const fichas: EstadoSala['jug'] = {};
    jug.current.forEach((j, id) => { eq[j.eq] += j.p; fichas[id] = [j.p, j.eq, j.ult, j.racha]; });
    const conteo = q ? q.ops.map((_, k) => [...resp.current.values()].filter((r) => r.k === k).length) : undefined;
    return {
      v: 1, fase, i, total: preguntas.current.length || PREGUNTAS, jug: fichas, eq, chat: chatOn,
      ...(q && fase !== 'sala' ? { q: { t: q.t, ops: q.ops, tema: q.tema } } : {}),
      ...(fase === 'pregunta' ? { quedan: Math.max(0, TIEMPO - (performance.now() - t0.current) / 1000), nResp: resp.current.size } : {}),
      ...(fase === 'revela' || fase === 'fin' ? { ok: q?.ok, por: q?.por, conteo } : {}),
    };
  }, []);
  const espera = useRef<number | null>(null);
  const publicar = useCallback((ya = false) => {
    if (ya) {
      if (espera.current) { clearTimeout(espera.current); espera.current = null; }
      canal.current?.publicar('estado', estado(), true);
      return;
    }
    if (espera.current) return;
    espera.current = window.setTimeout(() => { espera.current = null; canal.current?.publicar('estado', estado(), true); }, 300);
  }, [estado]);

  // ---------- abrir la sala ----------
  useEffect(() => {
    let vivo = true;
    let cod = nuevoCodigo();
    let revisando = true;
    let ocupado = false;
    const abrir = () => {
      const c = abrirCanal(cod, ['estado', 'entra', 'chat'], (sub, dato) => {
        if (!vivo) return;
        if (sub === 'estado') { if (revisando && dato && (dato as EstadoSala).v) ocupado = true; return; }
        if (revisando) return;
        if (sub === 'entra') recibir(dato as MsgEntra);
        if (sub === 'chat') charla(dato as MsgChat);
      }, (ok) => vivo && setConectado(ok), { sub: 'estado', dato: null, guardar: true });
      canal.current = c;
      // ¿Ya hay otra sala abierta con este código? Se espera un momento a ver si llega su estado.
      c.cliente.once('connect', () => setTimeout(() => {
        if (!vivo) return;
        if (ocupado) { c.cerrar(); cod = nuevoCodigo(); ocupado = false; return abrir(); }
        revisando = false;
        setCodigo(cod);
        publicar(true);
      }, 1200));
    };
    abrir();
    const cerrar = () => { canal.current?.publicar('estado', null, true); };
    addEventListener('pagehide', cerrar);
    return () => {
      vivo = false;
      removeEventListener('pagehide', cerrar);
      cerrar();
      setTimeout(() => canal.current?.cerrar(), 200);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- mensajes de los celulares ----------
  const recibir = (m: MsgEntra) => {
    if (!m || typeof m !== 'object' || typeof m.id !== 'string' || m.id.length > 40) return;
    if (m.t === 'hola') {
      const viejo = jug.current.get(m.id);
      if (viejo) { viejo.enLinea = true; viejo.n = limpiar(m.n, 20) || viejo.n; }
      else {
        // Cada jugador nuevo va al equipo con menos gente: así quedan parejos.
        const gente = [0, 0, 0, 0];
        jug.current.forEach((j) => gente[j.eq]++);
        const eq = gente.indexOf(Math.min(...gente));
        jug.current.set(m.id, { n: limpiar(m.n, 20) || 'Analista', av: limpiar(m.av, 4) || '🦉', eq, p: 0, racha: 0, ult: -1, enLinea: true });
        sonar('entra');
      }
      repintar();
      publicar();
    } else if (m.t === 'resp') {
      const { fase, i } = ref.current;
      if (fase !== 'pregunta' || m.i !== i || !jug.current.has(m.id) || resp.current.has(m.id)) return;
      const q = preguntas.current[i];
      if (!Number.isInteger(m.k) || m.k < 0 || m.k >= q.ops.length) return;
      resp.current.set(m.id, { k: m.k, ms: performance.now() - t0.current });
      sonar('pop');
      repintar();
      publicar();
      const enLinea = [...jug.current.values()].filter((j) => j.enLinea).length;
      if (resp.current.size >= enLinea) setTimeout(revelar, 400);
    } else if (m.t === 'adios') {
      const j = jug.current.get(m.id);
      if (j) { j.enLinea = false; repintar(); }
    }
  };

  const charla = (m: MsgChat) => {
    if (!m || typeof m.id !== 'string' || !jug.current.has(m.id) || !ref.current.chatOn) return;
    const k = ++cuenta.current;
    if (m.emo) {
      const emo = limpiar(m.emo, 4);
      setFlot((f) => [...f.slice(-30), { k, emo, x: 5 + Math.random() * 85 }]);
      setTimeout(() => setFlot((f) => f.filter((x) => x.k !== k)), 3200);
    } else if (m.txt) {
      const j = jug.current.get(m.id)!;
      setChat((c) => [...c.slice(-40), { k, n: j.n, av: j.av, eq: j.eq, txt: limpiar(m.txt) }]);
    }
  };

  // ---------- partida ----------
  const lanzar = (k: number) => {
    resp.current.clear();
    t0.current = performance.now();
    setQuedan(TIEMPO);
    ref.current = { ...ref.current, fase: 'pregunta', i: k };
    setI(k);
    setFase('pregunta');
    sonar('tic');
    publicar(true);
  };
  const empezar = () => {
    preguntas.current = partida(PREGUNTAS, temaSala);
    jug.current.forEach((j) => { j.p = 0; j.racha = 0; j.ult = -1; });
    lanzar(0);
  };
  const revelar = () => {
    if (ref.current.fase !== 'pregunta') return;
    const q = preguntas.current[ref.current.i];
    jug.current.forEach((j, id) => {
      const r = resp.current.get(id);
      if (!r) { j.ult = -1; j.racha = 0; return; }
      if (r.k === q.ok) {
        j.racha += 1;
        j.p += 500 + Math.round(500 * Math.max(0, 1 - r.ms / (TIEMPO * 1000))) + Math.min(200, (j.racha - 1) * 50);
        j.ult = 1;
      } else { j.ult = 0; j.racha = 0; }
    });
    ref.current = { ...ref.current, fase: 'revela' };
    setFase('revela');
    sonar('logro');
    publicar(true);
  };
  const siguiente = () => {
    const k = ref.current.i + 1;
    if (k >= preguntas.current.length) {
      ref.current = { ...ref.current, fase: 'fin' };
      setFase('fin');
      sonar('logro');
      publicar(true);
    } else lanzar(k);
  };

  // Reloj de la pregunta: se refresca en pantalla y en los celulares cada segundo.
  useEffect(() => {
    if (fase !== 'pregunta') return;
    const t = setInterval(() => {
      const q = Math.max(0, TIEMPO - (performance.now() - t0.current) / 1000);
      setQuedan(q);
      if (q <= 0) { clearInterval(t); revelar(); } else publicar();
    }, 1000);
    return () => clearInterval(t);
  }, [fase, i]); // eslint-disable-line react-hooks/exhaustive-deps

  // Atajos del presentador: Enter o espacio = siguiente, C = chat.
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key.toLowerCase() === 'c') { setChatOn((v) => { ref.current.chatOn = !v; publicar(); return !v; }); }
    };
    addEventListener('keydown', tecla);
    return () => removeEventListener('keydown', tecla);
  }, [publicar]);

  const lista = [...jug.current.entries()].map(([id, j]) => ({ id, ...j }));
  const ranking = lista.slice().sort((a, b) => b.p - a.p);
  const eqPuntos = [0, 1, 2, 3].map((e) => lista.filter((j) => j.eq === e).reduce((s, j) => s + j.p, 0));
  const eqGente = [0, 1, 2, 3].map((e) => lista.filter((j) => j.eq === e).length);
  const maxEq = Math.max(1, ...eqPuntos);
  const q = preguntas.current[i];
  const url = codigo ? `${BASE}?sala=${codigo}` : '';
  const conteo = q ? q.ops.map((_, k) => [...resp.current.values()].filter((r) => r.k === k).length) : [];
  const maxConteo = Math.max(1, ...conteo);

  return (
    <div className="proyector">
      <div className="pantalla-sala">
        {fase === 'sala' && (
          <section className="lobby" aria-labelledby="t-lobby">
            <div className="qr-caja">
              {codigo ? <Qr texto={url} size={300} /> : <div className="qr-cargando">{conectado ? 'Abriendo la sala…' : 'Conectando…'}</div>}
              <p className="codigo" aria-label={`Código de la sala: ${codigo.split('').join(' ')}`}>{codigo || '····'}</p>
              <p className="url-sala">{url.replace(/^https:\/\//, '') || '…'}</p>
            </div>
            <div className="lobby-lado">
              <h1 id="t-lobby">Escanea y entra</h1>
              <p className="pista">Abre la cámara del celular, escanea el QR y escribe tu nombre. Cada quien cae en un equipo A-D-P-C.</p>
              <p className="contador"><b>{lista.length}</b> {lista.length === 1 ? 'estudiante' : 'estudiantes'} en la sala</p>
              <div className="equipos-mini">
                {EQUIPOS.map((e, k) => <span key={e.n} style={{ ['--c' as string]: e.c }}>{e.n} · {eqGente[k]}</span>)}
              </div>
              <div className="gente">
                {lista.map((j) => <span key={j.id} className={'persona' + (j.enLinea ? '' : ' fuera')} style={{ ['--c' as string]: EQUIPOS[j.eq].c }}>{j.av} {j.n}</span>)}
              </div>
              <div className="campo">
                <label htmlFor="tema-sala">Tema de hoy</label>
                <select id="tema-sala" value={temaSala} onChange={(e) => setTemaSala(e.target.value)}>
                  {TEMAS_SALA.map((t) => <option key={t.id} value={t.id}>{t.n}</option>)}
                </select>
              </div>
              <div className="fila-btn">
                <button className="btn" onClick={empezar} disabled={!lista.length || !codigo}>Empezar · {PREGUNTAS} preguntas</button>
                <button className="btn sec" onClick={alSalir}>Cerrar sala</button>
              </div>
            </div>
          </section>
        )}

        {(fase === 'pregunta' || fase === 'revela') && q && (
          <section className="ronda" aria-live="polite">
            <div className="ronda-cabeza">
              <span className="chip-puntos">Pregunta <b>{i + 1}</b>/{preguntas.current.length}</span>
              <span className="tema-sala">{q.tema}</span>
              {fase === 'pregunta'
                ? <span className="reloj-sala" style={{ ['--p' as string]: quedan / TIEMPO }}><b>{Math.ceil(quedan)}</b></span>
                : <span className="chip-puntos"><b>{resp.current.size}</b> respondieron</span>}
            </div>
            <h1 className="enunciado">{q.t}</h1>
            <div className={'ops-sala n' + q.ops.length}>
              {q.ops.map((o, k) => (
                <div key={k} className={'op-sala' + (fase === 'revela' ? (k === q.ok ? ' correcta' : ' apagada') : '')} style={{ ['--c' as string]: COLORES_OP[k] }}>
                  <span className="forma" aria-hidden="true">{FORMAS[k]}</span>
                  <span className="texto-op">{o}</span>
                  {fase === 'revela' && <span className="barra-op"><span className="riel"><span style={{ width: `${(conteo[k] / maxConteo) * 100}%` }} /></span><b>{conteo[k]}</b></span>}
                </div>
              ))}
            </div>
            {fase === 'pregunta' ? (
              <div className="pie-ronda">
                <p className="contador"><b>{resp.current.size}</b> de {lista.filter((j) => j.enLinea).length} respondieron</p>
                <button className="btn sec" onClick={revelar}>Mostrar respuesta</button>
              </div>
            ) : (
              <div className="revela-sala">
                <p className="por-sala"><b>¿Por qué?</b> {q.por}</p>
                <ol className="top-sala">
                  {ranking.slice(0, 5).map((j) => (
                    <li key={j.id} style={{ ['--c' as string]: EQUIPOS[j.eq].c }}><span>{j.av} {j.n}{j.racha >= 3 ? ' 🔥' : ''}</span><b>{j.p}</b></li>
                  ))}
                </ol>
                <button className="btn" onClick={siguiente} autoFocus>{i + 1 >= preguntas.current.length ? 'Ver el podio' : 'Siguiente pregunta'}</button>
              </div>
            )}
          </section>
        )}

        {fase === 'fin' && (
          <section className="podio-sala" aria-labelledby="t-podio">
            <h1 id="t-podio">¡Podio del salón!</h1>
            <div className="podio">
              {[1, 0, 2].map((pos) => ranking[pos] && (
                <div key={pos} className={'escalon-podio p' + pos} style={{ ['--c' as string]: EQUIPOS[ranking[pos].eq].c }}>
                  <span className="av">{ranking[pos].av}</span>
                  <b>{ranking[pos].n}</b>
                  <span>{ranking[pos].p} pts</span>
                  <i>{pos + 1}</i>
                </div>
              ))}
            </div>
            <p className="contador">Equipo ganador: <b style={{ color: EQUIPOS[eqPuntos.indexOf(Math.max(...eqPuntos))].c }}>{EQUIPOS[eqPuntos.indexOf(Math.max(...eqPuntos))].n}</b></p>
            {!menos && <div className="confeti" aria-hidden="true">{Array.from({ length: 40 }, (_, k) => <i key={k} style={{ left: `${(k * 37) % 100}%`, animationDelay: `${(k % 10) * 0.15}s`, background: COLORES_OP[k % 4] }} />)}</div>}
            <div className="fila-btn" style={{ maxWidth: 520, margin: '0 auto' }}>
              <button className="btn" onClick={empezar}>Jugar otra partida</button>
              <button className="btn sec" onClick={() => { ref.current = { ...ref.current, fase: 'sala' }; setFase('sala'); publicar(true); }}>Volver a la sala</button>
            </div>
          </section>
        )}

        <div className="equipos-sala" aria-label="Puntos por equipo">
          {EQUIPOS.map((e, k) => (
            <div key={e.n} style={{ ['--c' as string]: e.c }}>
              <span>{e.n}</span>
              <i><b style={{ width: `${(eqPuntos[k] / maxEq) * 100}%` }} /></i>
              <em>{eqPuntos[k]}</em>
            </div>
          ))}
        </div>
      </div>

      <aside className="chat-sala" aria-label="Chat del salón">
        <div className="chat-cabeza">
          <h2>Chat del salón</h2>
          <button className="btn fantasma" onClick={() => { setChatOn((v) => { ref.current.chatOn = !v; publicar(); return !v; }); }} aria-pressed={chatOn}>
            {chatOn ? 'Pausar chat (C)' : 'Activar chat (C)'}
          </button>
        </div>
        <ul className="mensajes" aria-live="polite">
          {chat.length === 0 && <li className="vacio">Aquí aparecen los mensajes y frases rápidas de los celulares.</li>}
          {chat.slice(-14).map((m) => (
            <li key={m.k} style={{ ['--c' as string]: EQUIPOS[m.eq].c }}><span className="quien">{m.av} {m.n}</span>{m.txt}</li>
          ))}
        </ul>
        <p className="estado-red">{conectado ? '● Conectado' : '○ Reconectando…'} · {codigo && `Sala ${codigo}`}</p>
      </aside>
      <div className="flotantes" aria-hidden="true">
        {flot.map((f) => <span key={f.k} style={{ left: `${f.x}%` }}>{f.emo}</span>)}
      </div>
    </div>
  );
};
