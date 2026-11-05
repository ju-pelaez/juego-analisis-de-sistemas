// App.tsx
// Pantallas del juego: inicio, mapa de capítulos, capítulo y la sala en vivo (QR).
// Con ?sala=CODIGO en la dirección se abre directo el celular de un jugador.
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { CAPITULOS } from './datos/capitulos';
import { guardarProgreso, leerProgreso, ponerNombre, ponerSonido, sonar, useVertical, type Progreso, type ResultadoCap } from './estado';
import { Capitulo } from './Capitulo';
import { callar, cargarVoz } from './voz';
import { Video } from './componentes/Video';
import { Glifo } from './componentes/Glifo';
import { Estrellas } from './componentes/Piezas';
import { DURACION_PORTADA, Portada } from './remotion/Extras';
import { Paseo } from './mundo/Paseo';
import { ZONAS } from './mundo/zonas';
// La sala en vivo (con el cliente de mensajes) se carga solo cuando se abre.
const Sala = lazy(() => import('./sala/Sala').then((m) => ({ default: m.Sala })));

type Vista = { v: 'inicio' } | { v: 'mapa' } | { v: 'cap'; id: string } | { v: 'sala' };

const params = new URLSearchParams(location.search);
const vistaInicial = (): Vista => (params.get('sala') || params.get('modo') === 'sala' ? { v: 'sala' } : { v: 'inicio' });

const Creditos: React.FC = () => (
  <p className="creditos">
    Desarrollo: <b>Juan Pablo Peláez Pino</b>, Ingeniería de Sistemas, Universidad de la Amazonia.<br />
    La lógica y la enseñanza: <b>maestra Ruth Dary Escobar Sarria</b>, clase de Análisis de Sistemas.
  </p>
);

export const App: React.FC = () => {
  const [prog, setProg] = useState<Progreso>(leerProgreso);
  const [vista, setVista] = useState<Vista>(vistaInicial);
  const vertical = useVertical();

  useEffect(() => { guardarProgreso(prog); ponerSonido(prog.sonido); }, [prog]);
  ponerNombre(prog.nombre);
  useEffect(() => { cargarVoz(); }, []);
  useEffect(() => { if (!prog.sonido) callar(); }, [prog.sonido]);
  useEffect(() => { document.documentElement.dataset.tema = prog.tema; }, [prog.tema]);

  // Puntos: los de cada capítulo más los bonos encontrados en el mapa.
  const total = Object.values(prog.caps).reduce((s, r) => s + r.puntos, 0) + Object.values(prog.bonus || {}).reduce((s, n) => s + n, 0);
  const hechos = CAPITULOS.filter((c) => prog.caps[c.id]).length;
  const ir = (v: Vista) => { callar(); setVista(v); window.scrollTo({ top: 0 }); };

  const guardar = (id: string, r: ResultadoCap) =>
    setProg((p) => {
      const viejo = p.caps[id];
      // Se queda el mejor resultado de cada capítulo.
      return { ...p, caps: { ...p.caps, [id]: !viejo || r.puntos >= viejo.puntos ? r : viejo } };
    });

  const barra = (
    <header className="barra">
      <button className="marca" onClick={() => ir(prog.nombre ? { v: 'mapa' } : { v: 'inicio' })} aria-label="Ir al mapa de capítulos">
        <Glifo id="bienvenida" size={26} color="var(--c-sis)" /> Modo <em>Analista</em>
      </button>
      <span className="espacio" />
      {vista.v !== 'sala' && <span className="chip-puntos" aria-label={`${total} puntos`}><b>{total}</b> pts</span>}
      <button className="icono" onClick={() => setProg((p) => ({ ...p, sonido: !p.sonido }))} aria-label={prog.sonido ? 'Apagar sonido' : 'Prender sonido'} aria-pressed={prog.sonido}>
        {prog.sonido ? '🔊' : '🔇'}
      </button>
      <button className="icono" onClick={() => setProg((p) => ({ ...p, tema: p.tema === 'oscuro' ? 'claro' : 'oscuro' }))}
        aria-label={prog.tema === 'oscuro' ? 'Modo proyector (claro)' : 'Tema oscuro'} title="Cambiar tema (modo proyector)">
        {prog.tema === 'oscuro' ? '☀' : '☾'}
      </button>
    </header>
  );

  if (vista.v === 'sala') {
    return <div className="app">{barra}<Suspense fallback={<p className="pista">Abriendo la sala…</p>}><Sala alSalir={() => { history.replaceState(null, '', location.pathname); ir({ v: prog.nombre ? 'mapa' : 'inicio' }); }} /></Suspense></div>;
  }

  if (vista.v === 'cap') {
    const k = CAPITULOS.findIndex((c) => c.id === vista.id);
    const cap = CAPITULOS[k];
    return (
      <div className="app">
        {barra}
        <Capitulo key={cap.id} cap={cap} nombre={prog.nombre} siguiente={CAPITULOS[k + 1]} puntosTotales={total}
          alGuardar={(r) => guardar(cap.id, r)} alSalir={() => ir({ v: 'mapa' })} alIr={(id) => ir({ v: 'cap', id })} />
      </div>
    );
  }

  if (vista.v === 'inicio') {
    return (
      <div className="app">
        {barra}
        <main className="inicio">
          <div className="marco-video">
            <Video key={vertical ? 'v' : 'h'} componente={Portada} props={{}} duracion={DURACION_PORTADA} ancho={vertical ? 720 : 1280} alto={vertical ? 900 : 720} bucle
              etiqueta="Modo Analista: Alex, estudiante de Análisis de Sistemas, invita a mirar todo por sus actores, datos, procesos y control." />
          </div>
          <div className="tarjeta">
            <h1>Aprende Análisis de Sistemas jugando</h1>
            <p className="lead">{CAPITULOS.length} capítulos con la clase completa: el sistema, sus componentes, los diagramas BPMN (como en Bizagi), DFP y DFD, el árbol de problemas, el entorno y la factibilidad. Caminas y saltas por cinco mundos como en un juego de plataformas: cada casa es un capítulo con cinemática, fichas, minijuego e insignia, y hay bloques de reto, datos y bloques secretos con puntos extra. Todo está abierto.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const nombre = String(new FormData(e.currentTarget).get('nombre') || '').trim().slice(0, 30);
              sonar('entra');
              setProg((p) => ({ ...p, nombre }));
              ir({ v: 'mapa' });
            }}>
              <div className="campo">
                <label htmlFor="nombre">¿Cómo te llamas?</label>
                <input id="nombre" name="nombre" defaultValue={prog.nombre} maxLength={30} autoComplete="given-name" placeholder="Tu nombre para el certificado" />
              </div>
              <div className="fila-btn">
                <button className="btn" type="submit">{prog.nombre ? 'Continuar' : 'Empezar'}</button>
                <button className="btn sec" type="button" onClick={() => ir({ v: 'sala' })}>Sala en vivo (QR)</button>
              </div>
            </form>
            <Creditos />
          </div>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------------- mapa
  return (
    <div className="app">
      {barra}
      <main>
        <div className="cabeza-mapa">
          <div>
            <p>Expediente de {prog.nombre || 'analista'}</p>
            <h1>El mundo del analista</h1>
          </div>
          <div className="medidor">
            <span className="chip-puntos"><b>{hechos}</b>/{CAPITULOS.length} capítulos</span>
            <span className="chip-puntos"><b>{total}</b> puntos</span>
          </div>
        </div>
        {/* el mundo para caminar */}
        <Paseo caps={CAPITULOS} prog={prog} puntos={total}
          alEntrar={(id) => ir({ v: 'cap', id })} alMover={(pos) => setProg((p) => ({ ...p, pos }))}
          alBono={(id, n) => setProg((p) => ({ ...p, bonus: { ...(p.bonus || {}), [id]: n } }))} />

        {/* todos los capítulos, ordenados por mundo: se puede entrar a cualquiera */}
        <section className="catalogo" aria-labelledby="t-catalogo">
          <h2 id="t-catalogo">Todos los capítulos</h2>
          <p className="catalogo-ayuda">Todo está abierto: entra al tema que necesites, en el orden que quieras.</p>
          {ZONAS.map((z, zi) => (
            <div key={z.id} className="catalogo-mundo">
              <h3 className="cm-titulo" style={{ ['--cielo' as string]: z.cielo[0] }}><span>MUNDO {zi + 1}</span> {z.nombre}</h3>
              <p className="cm-pista">{z.pista}</p>
              <div className="cm-caps">
                {z.caps.map((id) => {
                  const c = CAPITULOS.find((x) => x.id === id);
                  if (!c) return null;
                  const r = prog.caps[c.id];
                  return (
                    <button key={c.id} className="ficha-cap" style={{ ['--c' as string]: `var(--c-${c.color})` }} onClick={() => { sonar('tic'); ir({ v: 'cap', id: c.id }); }}
                      aria-label={`Capítulo ${c.n}: ${c.titulo}. ${r ? `Ganado con ${r.estrellas} estrellas` : 'Por jugar'}`}>
                      <span className="fc-cabeza">
                        <span className="ico"><Glifo id={c.id} size={28} /></span>
                        <span><span className="num">CAPÍTULO {String(c.n).padStart(2, '0')}</span><b>{c.titulo}</b></span>
                      </span>
                      <span className="fc-sub">{c.sub}</span>
                      <span className="fc-temas">{c.fichas.slice(0, 4).map((f) => <span key={f.titulo}>{f.titulo}</span>)}</span>
                      <span className="fc-pie">
                        <span>🎮 {c.juego.tipo === 'final' ? 'Reto final con certificado' : c.juego.titulo}</span>
                        {r ? <span className="fc-hecho"><Estrellas n={r.estrellas} /> {r.puntos} pts</span> : <span className="fc-jugar">Jugar →</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <section className="sala-banner" aria-labelledby="t-sala">
          <div>
            <h2 id="t-sala">Sala en vivo para todo el salón</h2>
            <p>Abre la sala en el proyector: los estudiantes entran con el QR desde el celular, responden en equipos A-D-P-C, chatean y mandan emoticones en vivo.</p>
          </div>
          <button className="btn" onClick={() => ir({ v: 'sala' })}>Abrir sala con QR</button>
        </section>

        <section className="estante" aria-labelledby="t-ins">
          <h2 id="t-ins">Tus insignias</h2>
          <div className="insignias">
            {CAPITULOS.map((c) => (
              <span key={c.id} className={'insig' + (prog.caps[c.id] ? '' : ' vacia')} style={{ ['--c' as string]: `var(--c-${c.color})` }}
                title={prog.caps[c.id] ? c.insignia : `Por ganar: ${c.insignia}`} role="img" aria-label={prog.caps[c.id] ? `Insignia ${c.insignia}` : `Insignia por ganar: ${c.insignia}`}>
                <Glifo id={c.id} size={30} />
              </span>
            ))}
          </div>
        </section>

        <div className="pie-mapa">
          <button className="btn fantasma" onClick={() => ir({ v: 'inicio' })}>Cambiar nombre</button>
          <button className="btn fantasma" onClick={() => { if (confirm('¿Borrar todo el progreso de este aparato?')) setProg((p) => ({ ...p, caps: {}, bonus: {}, pos: undefined })); }}>Reiniciar progreso</button>
        </div>
        <Creditos />
      </main>
    </div>
  );
};
