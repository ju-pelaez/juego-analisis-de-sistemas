// Celular.tsx
// El celular de cada estudiante en la sala en vivo: entra con su nombre y avatar, responde
// con botones grandes de color y figura, ve si acertó y por qué, y chatea con el salón
// (frases rápidas, texto corto y emoticones que vuelan en el proyector).
import React, { useEffect, useRef, useState } from 'react';
import { abrirCanal, limpiar, type Canal, type Mqtt } from './canal';
import { AVATARES, COLORES_OP, EQUIPOS, FORMAS, FRASES, modoDe, REACCIONES, type EstadoSala, type MsgChat } from './tipos';
import { sonar, vibrar } from '../estado';

const leer = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const escribir = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };

// Cada celular tiene un id que se guarda: si se bloquea la pantalla o se cae el internet, vuelve con sus puntos.
function miId() {
  let id = leer('ma-sala-id');
  if (!id) { id = 'e' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); escribir('ma-sala-id', id); }
  return id;
}

export const Celular: React.FC<{ mqtt: Mqtt; codigo: string; alSalir: () => void }> = ({ mqtt, codigo, alSalir }) => {
  const id = useRef(miId()).current;
  const perfil = (() => { try { return JSON.parse(leer('ma-sala-perfil') || '{}'); } catch { return {}; } })();
  const [nombre, setNombre] = useState<string>(perfil.n || '');
  const [avatar, setAvatar] = useState<string>(perfil.av || AVATARES[Math.floor(Math.random() * AVATARES.length)]);
  const [dentro, setDentro] = useState(false);
  const [conectado, setConectado] = useState(false);
  const [est, setEst] = useState<EstadoSala | null | undefined>(undefined); // undefined = esperando, null = sala cerrada
  const [elegida, setElegida] = useState<{ i: number; k: number } | null>(null);
  const [chat, setChat] = useState<{ k: number; n: string; av: string; eq: number; txt: string }[]>([]);
  const [texto, setTexto] = useState('');
  const [quedan, setQuedan] = useState(0);
  const ultimoEnvio = useRef(0);
  const fin = useRef(0);
  const canal = useRef<Canal | null>(null);
  const cuenta = useRef(0);
  const faseAntes = useRef('');
  const [cofreElegido, setCofreElegido] = useState<{ i: number; k: number } | null>(null);

  useEffect(() => {
    if (!dentro) return;
    let c: Canal | null = null;
    // Se espera un momento antes de conectar: si React desmonta enseguida, no queda una conexión a medias.
    const arranque = setTimeout(() => {
      c = abrirCanal(mqtt, codigo, ['estado', 'chat'], (sub, dato) => {
        if (sub === 'estado') {
          const e = dato as EstadoSala | null;
          if (e && e.v !== 1) return;
          setEst(e);
          if (e?.fase === 'pregunta' && typeof e.quedan === 'number') fin.current = performance.now() + e.quedan * 1000;
          if (e && e.fase !== faseAntes.current) {
            if (e.fase === 'revela') {
              const yo = e.jug[id];
              if (yo) { sonar(yo[2] === 1 ? 'bien' : 'mal'); vibrar(yo[2] === 1 ? 40 : 120); }
            }
            if (e.fase === 'pregunta') sonar('tic');
            faseAntes.current = e.fase;
          }
        } else if (sub === 'chat') {
          const m = dato as MsgChat;
          if (!m || !m.txt) return;
          const k = ++cuenta.current;
          setChat((c) => [...c.slice(-20), { k, n: limpiar(m.n, 20), av: limpiar(m.av, 4), eq: Number(m.eq) || 0, txt: limpiar(m.txt) }]);
        }
      }, (ok) => {
        setConectado(ok);
        if (ok) c?.publicar('entra', { t: 'hola', id, n: nombre, av: avatar });
      }, { sub: 'entra', dato: { t: 'adios', id } });
      canal.current = c;
    }, 250);
    // Al volver a la pantalla (después de bloquear el celular) se vuelve a saludar.
    const volver = () => { if (document.visibilityState === 'visible') c?.publicar('entra', { t: 'hola', id, n: nombre, av: avatar }); };
    document.addEventListener('visibilitychange', volver);
    return () => {
      clearTimeout(arranque);
      document.removeEventListener('visibilitychange', volver);
      const viejo = c;
      viejo?.publicar('entra', { t: 'adios', id });
      setTimeout(() => viejo?.cerrar(), 150);
    };
  }, [dentro]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reloj local de la pregunta.
  useEffect(() => {
    if (est?.fase !== 'pregunta') return;
    const t = setInterval(() => setQuedan(Math.max(0, (fin.current - performance.now()) / 1000)), 200);
    return () => clearInterval(t);
  }, [est?.fase, est?.i]);

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    const n = limpiar(nombre, 20);
    if (!n) return;
    setNombre(n);
    escribir('ma-sala-perfil', JSON.stringify({ n, av: avatar }));
    sonar('entra');
    setDentro(true);
  };
  const responder = (k: number) => {
    if (!est || est.fase !== 'pregunta' || elegida?.i === est.i) return;
    setElegida({ i: est.i, k });
    vibrar(25);
    sonar('pop');
    canal.current?.publicar('entra', { t: 'resp', id, i: est.i, k });
  };
  const enviar = (msg: { txt?: string; emo?: string }) => {
    if (!est?.chat) return;
    const ahora = Date.now();
    if (ahora - ultimoEnvio.current < (msg.emo ? 600 : 2000)) return; // sin inundar el chat
    ultimoEnvio.current = ahora;
    const eq = est?.jug[id]?.[1] ?? 0;
    canal.current?.publicar('chat', { id, n: nombre, av: avatar, eq, ...(msg.txt ? { txt: limpiar(msg.txt) } : { emo: msg.emo }) });
    sonar('pop');
  };

  // ---------- entrar ----------
  if (!dentro) {
    return (
      <section className="cel" aria-labelledby="t-entrar">
        <p className="pista">Sala <b>{codigo}</b></p>
        <h1 id="t-entrar">Entra a la sala</h1>
        <form onSubmit={entrar}>
          <div className="campo">
            <label htmlFor="cel-nombre">Tu nombre</label>
            <input id="cel-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={20} autoComplete="given-name" placeholder="Como te dicen en clase" required />
          </div>
          <p className="etiqueta">Elige tu avatar</p>
          <div className="avatares" role="radiogroup" aria-label="Avatar">
            {AVATARES.map((a) => (
              <button type="button" key={a} role="radio" aria-checked={a === avatar} className={a === avatar ? 'on' : ''} onClick={() => setAvatar(a)}>{a}</button>
            ))}
          </div>
          <button className="btn ancho" type="submit">Entrar</button>
        </form>
      </section>
    );
  }

  const yo = est?.jug[id];
  const eq = yo ? EQUIPOS[yo[1]] : null;
  const puesto = est && yo ? Object.values(est.jug).filter((j) => j[0] > yo[0]).length + 1 : 0;
  const totalJug = est ? Object.keys(est.jug).length : 0;

  return (
    <section className="cel" aria-live="polite">
      <div className="yo" style={{ ['--c' as string]: eq?.c || 'var(--c-sis)' }}>
        <span className="av">{avatar}</span>
        <span><b>{nombre}</b><small>{eq ? `Equipo ${eq.n}` : 'Entrando…'}</small></span>
        <span className="pts"><b>{yo?.[0] ?? 0}</b> pts</span>
      </div>

      {est === undefined && <div className="tarjeta centro"><h2>{conectado ? 'Buscando la sala…' : 'Conectando…'}</h2><p className="pista">Si tarda, revisa que el código {codigo} sea el del proyector.</p></div>}
      {est === null && <div className="tarjeta centro"><h2>La sala se cerró</h2><p className="pista">Espera a que el profe la abra otra vez.</p><button className="btn" onClick={alSalir}>Salir</button></div>}

      {est?.fase === 'sala' && (
        <div className="tarjeta centro">
          <span className="av-grande">{avatar}</span>
          <h2>¡Estás dentro!</h2>
          <p className="pista">{eq ? <>Tu equipo es <b style={{ color: eq.c }}>{eq.n}</b>: {eq.q}</> : 'Asignando equipo…'}</p>
          <p className="pista">Somos {totalJug}. Mira el proyector: el juego empieza pronto.</p>
          <p className="modo-cel">{modoDe(est.modo).ico} <b>{modoDe(est.modo).n}</b><br /><small>{modoDe(est.modo).desc}</small></p>
        </div>
      )}

      {est?.fase === 'pregunta' && est.q && (
        <div className="pregunta-cel">
          <div className="ronda-cabeza"><span>{modoDe(est.modo).ico} {est.i + 1}/{est.total}</span><span className="reloj-mini">{Math.ceil(quedan)} s</span></div>
          <p className="enunciado-cel">{est.q.t}</p>
          {elegida?.i === est.i ? (
            <div className="tarjeta centro"><h2>¡Respuesta enviada!</h2><p className="pista">Elegiste {FORMAS[elegida.k]} «{est.q.ops[elegida.k]}». Espera a que todos respondan.</p></div>
          ) : (
            <div className={'botones-cel n' + est.q.ops.length}>
              {est.q.ops.map((o, k) => (
                <button key={k} style={{ ['--c' as string]: COLORES_OP[k] }} onClick={() => responder(k)}>
                  <span className="forma" aria-hidden="true">{FORMAS[k]}</span>{o}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {est?.fase === 'revela' && est.q && (
        <div className={'tarjeta centro resultado-cel ' + (yo?.[2] === 1 ? 'bien' : 'mal')}>
          <h2>{yo?.[2] === 1 ? '¡Correcto!' : yo?.[2] === 0 ? 'Esta vez no' : 'No alcanzaste'}</h2>
          <p>Era {FORMAS[est.ok ?? 0]} <b>{est.q.ops[est.ok ?? 0]}</b></p>
          <p className="pista">{est.por}</p>
          {est.modo === 'cofres' && yo?.[2] === 1 && (
            est.cof?.[id] ? <p className="premio-cofre">🎁 {est.cof[id]}</p>
              : cofreElegido?.i === est.i ? <p className="pista">Abriendo el cofre…</p>
                : (
                  <div className="cofres-cel" role="group" aria-label="Elige un cofre">
                    <p><b>¡Elige un cofre!</b></p>
                    {[0, 1, 2].map((k) => (
                      <button key={k} onClick={() => { setCofreElegido({ i: est.i, k }); sonar('pop'); vibrar(30); canal.current?.publicar('entra', { t: 'cofre', id, i: est.i, k }); }} aria-label={`Cofre ${k + 1}`}>🎁</button>
                    ))}
                  </div>
                )
          )}
          {yo && <p className="puesto">Vas en el puesto <b>{puesto}</b> de {totalJug}{yo[3] >= 3 ? ` · racha de ${yo[3]} 🔥` : ''}</p>}
        </div>
      )}

      {est?.fase === 'fin' && (
        <div className="tarjeta centro">
          <span className="av-grande">{puesto === 1 ? '🏆' : puesto <= 3 ? '🥇' : avatar}</span>
          <h2>¡Fin de la partida!</h2>
          <p className="puesto">Quedaste en el puesto <b>{puesto}</b> de {totalJug} con <b>{yo?.[0] ?? 0}</b> puntos.</p>
          {eq && <p className="pista">Tu equipo {eq.n} sumó {est.eq[yo?.[1] ?? 0]} puntos.</p>}
        </div>
      )}

      {est && (
        <div className="chat-cel" aria-label="Chat del salón">
          <div className="reacciones">
            {REACCIONES.map((r) => <button key={r} onClick={() => enviar({ emo: r })} disabled={!est.chat} aria-label={`Mandar ${r}`}>{r}</button>)}
          </div>
          {est.chat ? (
            <>
              <div className="frases">
                {FRASES.map((f) => <button key={f} onClick={() => enviar({ txt: f })}>{f}</button>)}
              </div>
              <form className="escribir" onSubmit={(e) => { e.preventDefault(); if (texto.trim()) { enviar({ txt: texto }); setTexto(''); } }}>
                <input value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={60} placeholder="Escribe al salón (60 letras)" aria-label="Mensaje para el chat" />
                <button className="btn" type="submit">Enviar</button>
              </form>
              <ul className="mensajes mini">
                {chat.slice(-5).map((m) => <li key={m.k} style={{ ['--c' as string]: EQUIPOS[m.eq]?.c }}><span className="quien">{m.av} {m.n}</span>{m.txt}</li>)}
              </ul>
            </>
          ) : <p className="pista centro">El profe pausó el chat.</p>}
        </div>
      )}
    </section>
  );
};
