// Capitulo.tsx
// Un capítulo de principio a fin: cinemática → fichas → minijuego → preguntas → insignia.
// El reto final cambia las dos últimas fases por el resultado y el certificado.
import React, { useEffect, useState } from 'react';
import { alCambiarVoz, callar, cargarVoz, hablar, hayVoz } from './voz';
import type { Capitulo as Cap, Ficha } from './datos/capitulos';
import { conNombre, estrellasDe, sonar, type ResultadoCap } from './estado';
import { Video } from './componentes/Video';
import { Glifo } from './componentes/Glifo';
import { CaraProfe, fotoProfe, NOMBRE_PROFE } from './componentes/Profe';
import { Preguntas } from './componentes/Preguntas';
import { Estrellas } from './componentes/Piezas';
import { ConceptoBucle } from './remotion/Cinematica';
import { Cine } from './componentes/Cine';
import { MiniReto, tieneReto } from './componentes/MiniReto';
import { Certificado, DURACION_CERT, DURACION_INSIGNIA, Insignia } from './remotion/Extras';
import { Deslizar } from './juegos/Deslizar';
import { Frontera } from './juegos/Frontera';
import { MaquinaJuego } from './juegos/MaquinaJuego';
import { Hilos } from './juegos/Hilos';
import { Embudo } from './juegos/Embudo';
import { Ordenar } from './juegos/Ordenar';
import { Relampago } from './juegos/Relampago';
import { ArbolJuego } from './juegos/ArbolJuego';
import { Lupa } from './juegos/Lupa';
import { Cubetas } from './juegos/Cubetas';
import { RetoFinal } from './juegos/RetoFinal';
import { BpmnJuego } from './juegos/BpmnJuego';
import { DfpJuego } from './juegos/DfpJuego';
import { DfdJuego } from './juegos/DfdJuego';

type Fase = 'cine' | 'fichas' | 'juego' | 'preguntas' | 'fin';
const FASES: { id: Fase; n: string }[] = [
  { id: 'cine', n: 'Cinemática' }, { id: 'fichas', n: 'Fichas' }, { id: 'juego', n: 'Minijuego' },
  { id: 'preguntas', n: 'Preguntas' }, { id: 'fin', n: 'Insignia' },
];

const VistaFicha: React.FC<{ f: Ficha; cap: Cap }> = ({ f, cap }) => (
  <article className="ficha" aria-labelledby="t-ficha">
    <h2 id="t-ficha">{f.titulo}</h2>
    {f.texto && <p className="texto">{f.texto}</p>}
    {f.concepto && (
      <div className="concepto-video">
        <Video componente={ConceptoBucle} props={{ id: cap.id, color: cap.color }} duracion={130} ancho={1000} alto={700} bucle
          etiqueta={`Animación del concepto: ${cap.titulo}.`} />
      </div>
    )}
    {f.filas && (
      <div className="filas">
        {f.filas.map(([a, b, k]) => (
          <div key={a + b} className="f" style={{ ['--k' as string]: k ? `var(--c-${k})` : undefined }}><b>{a}</b><span>{b}</span></div>
        ))}
      </div>
    )}
    {f.dos && (
      <div className="dos">
        <div className="si"><b>✓ {f.dos.si[0]}</b>{f.dos.si[1]}</div>
        <div className="no"><b>✗ {f.dos.no[0]}</b>{f.dos.no[1]}</div>
      </div>
    )}
    {f.flujo && (
      <div className="flujo">
        {f.flujo.map((p, i) => <React.Fragment key={p}>{i > 0 && <i aria-hidden="true">→</i>}<span>{p}</span></React.Fragment>)}
      </div>
    )}
    {f.frase && <p className="frase">{f.frase}</p>}
  </article>
);

export const Capitulo: React.FC<{
  cap: Cap; nombre: string; siguiente?: Cap; puntosTotales: number;
  alGuardar: (r: ResultadoCap) => void; alSalir: () => void; alIr: (id: string) => void;
}> = ({ cap, nombre, siguiente, puntosTotales, alGuardar, alSalir, alIr }) => {
  const [fase, setFase] = useState<Fase>('cine');
  const [ficha, setFicha] = useState(0);
  // Mini retos de las fichas: ficha → acertó o no. Suman al puntaje del capítulo.
  const [mini, setMini] = useState<Record<number, boolean>>({});
  const fichaLista = ficha in mini || !tieneReto(cap.fichas[ficha]);
  const [juego, setJuego] = useState({ a: 0, t: 0 });
  const [resultado, setResultado] = useState<ResultadoCap | null>(null);
  const [caso, setCaso] = useState('');
  const esFinal = cap.juego.tipo === 'final';

  // Fases ya vistas: se puede volver a ellas (atrás) y regresar (adelante) desde la barra de fases.
  const [vistas, setVistas] = useState<Fase[]>(['cine']);
  const ir = (f: Fase) => { setFase(f); setVistas((v) => (v.includes(f) ? v : [...v, f])); window.scrollTo({ top: 0 }); };
  // La profe lee cada ficha en voz alta (la primera empieza con su saludo).
  const [hablando, setHablando] = useState(false);
  useEffect(() => alCambiarVoz(setHablando), []);
  const leerFicha = (k = ficha) => hablar(k === 0 ? [`${cap.id}-dice`, `${cap.id}-f0`] : [`${cap.id}-f${k}`]);
  useEffect(() => {
    if (fase !== 'fichas') return;
    cargarVoz().then(() => leerFicha(ficha));
    return () => callar();
  }, [fase, ficha]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => callar(), []);

  const terminar = (a: number, t: number) => {
    const r: ResultadoCap = { aciertos: a, total: t, estrellas: estrellasDe(a, t), puntos: a * 10 + (estrellasDe(a, t) === 3 ? 20 : 0) };
    setResultado(r);
    alGuardar(r);
    sonar('logro');
    setTimeout(() => hablar(esFinal && a / t >= 0.6 ? 'certificado' : 'insignia'), 900);
    ir('fin');
  };
  const finJuego = (a: number, t: number) => {
    setJuego({ a, t });
    const ma = Object.values(mini).filter(Boolean).length, mt = Object.keys(mini).length;
    if (cap.preguntas.length) ir('preguntas'); else terminar(a + ma, t + mt);
  };

  const juegoVista = () => {
    const j = cap.juego;
    switch (j.tipo) {
      case 'deslizar': return <Deslizar juego={j} alTerminar={finJuego} />;
      case 'frontera': return <Frontera juego={j} alTerminar={finJuego} />;
      case 'maquina': return <MaquinaJuego juego={j} alTerminar={finJuego} />;
      case 'hilos': return <Hilos juego={j} alTerminar={finJuego} />;
      case 'embudo': return <Embudo juego={j} alTerminar={finJuego} />;
      case 'ordenar': return <Ordenar juego={j} alTerminar={finJuego} />;
      case 'relampago': return <Relampago juego={j} alTerminar={finJuego} />;
      case 'arbol': return <ArbolJuego juego={j} alTerminar={finJuego} />;
      case 'lupa': return <Lupa juego={j} alTerminar={finJuego} />;
      case 'cubetas': return <Cubetas juego={j} alTerminar={finJuego} />;
      case 'bpmn': return <BpmnJuego juego={j} alTerminar={finJuego} />;
      case 'dfp': return <DfpJuego juego={j} alTerminar={finJuego} />;
      case 'dfd': return <DfdJuego juego={j} alTerminar={finJuego} />;
      case 'final': return <RetoFinal alTerminar={(a, t, c) => { setCaso(c); finJuego(a, t); }} />;
    }
  };

  const fases = esFinal ? FASES.filter((f) => f.id !== 'preguntas') : FASES;
  const iFase = fases.findIndex((f) => f.id === fase);
  const aprobado = resultado ? resultado.aciertos / resultado.total >= 0.6 : false;
  const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="mundo" style={{ ['--mundo' as string]: `var(--c-${cap.color})` }}>
      {/* El mundo del capítulo: su color y su glifo flotando al fondo. */}
      <div className="mundo-fondo" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((k) => <span key={k} className={'flota f' + k}><Glifo id={cap.id} size={90 + (k % 3) * 40} /></span>)}
      </div>
      <nav className="fases" aria-label="Fases del capítulo">
        {fases.map((f, k) => (
          <button key={f.id} type="button" className={'fase' + (k < iFase ? ' hecha' : k === iFase ? ' actual' : '')} aria-current={k === iFase ? 'step' : undefined}
            disabled={k === iFase || !vistas.includes(f.id) || (f.id === 'fin' && !resultado)} onClick={() => ir(f.id)}
            title={vistas.includes(f.id) ? `Ir a ${f.n}` : 'Todavía no'}>
            <i /><span>{f.n}</span>
          </button>
        ))}
      </nav>
      <header className="titulo-cap">
        <span className="ico" style={{ background: `color-mix(in srgb, var(--c-${cap.color}) 20%, transparent)`, color: `var(--c-${cap.color})` }}><Glifo id={cap.id} size={30} /></span>
        <div><p>Capítulo {cap.n} · {cap.caso}</p><h1>{cap.titulo}</h1></div>
      </header>

      {fase === 'cine' && <Cine cap={cap} nombre={nombre} alSeguir={() => ir('fichas')} />}

      {fase === 'fichas' && (
        <section aria-label="Fichas del capítulo">
          <div className="guia">
            <CaraProfe pose={ficha === cap.fichas.length - 1 ? 'celebra' : 'explica'} size={72} className={hablando ? 'hablando' : ''} />
            {hayVoz(`${cap.id}-f${ficha}`) && (
              <button className="icono oir" onClick={() => (hablando ? callar() : leerFicha())} aria-label={hablando ? 'Callar a la profe' : 'Oír a la profe'} title={hablando ? 'Callar' : 'Oír a la profe'}>
                {hablando ? '■' : '🔊'}
              </button>
            )}
            <p className="burbuja"><b className="quien-habla">{NOMBRE_PROFE}</b>{ficha === 0 ? conNombre(cap.dice) : ficha === cap.fichas.length - 1 ? 'Última ficha. Después viene el minijuego.' : 'Léela con calma. Lo vas a necesitar.'}</p>
          </div>
          <VistaFicha key={ficha} f={cap.fichas[ficha]} cap={cap} />
          <MiniReto key={'reto-' + ficha} ficha={cap.fichas[ficha]} otras={cap.fichas}
            alResponder={(ok) => setMini((m) => ({ ...m, [ficha]: ok }))} />
          <div className="nav-fichas">
            <button className="btn sec" onClick={() => setFicha(ficha - 1)} disabled={ficha === 0} aria-label="Ficha anterior">←</button>
            <div className="puntos" aria-label={`Ficha ${ficha + 1} de ${cap.fichas.length}`}>
              {cap.fichas.map((_, k) => <i key={k} className={(k === ficha ? 'on' : '') + (mini[k] === true ? ' gano' : mini[k] === false ? ' perdio' : '')} />)}
              <span className="mini-cuenta" aria-label="Mini retos ganados">⚡ {Object.values(mini).filter(Boolean).length}</span>
            </div>
            {ficha < cap.fichas.length - 1
              ? <button className="btn" disabled={!fichaLista} title={fichaLista ? undefined : 'Primero resuelve el mini reto'} onClick={() => { sonar('tic'); setFicha(ficha + 1); }}>Siguiente →</button>
              : <button className="btn" disabled={!fichaLista} title={fichaLista ? undefined : 'Primero resuelve el mini reto'} onClick={() => { sonar('entra'); ir('juego'); }}>{esFinal ? '¡Al reto!' : '¡A jugar!'}</button>}
          </div>
        </section>
      )}

      {fase === 'juego' && juegoVista()}

      {fase === 'preguntas' && <Preguntas preguntas={cap.preguntas} alTerminar={(a, t) => terminar(juego.a + a + Object.values(mini).filter(Boolean).length, juego.t + t + Object.keys(mini).length)} />}

      {fase === 'fin' && resultado && (
        <section className="resultado" aria-labelledby="t-res">
          <div className="marco-video">
            {esFinal && aprobado ? (
              <Video componente={Certificado} props={{ nombre: nombre || 'Analista', fecha, puntos: puntosTotales, caso }} duracion={DURACION_CERT}
                ancho={1100} alto={780} etiqueta={`Certificado de Analista de Sistemas para ${nombre || 'ti'}.`} />
            ) : (
              <Video componente={Insignia} props={{ id: cap.id, nombre: cap.insignia, estrellas: resultado.estrellas, puntos: resultado.puntos, color: cap.color }}
                duracion={DURACION_INSIGNIA} ancho={800} alto={800} etiqueta={`Insignia ${cap.insignia} con ${resultado.estrellas} estrellas.`} />
            )}
          </div>
          <div className="resumen">
            <img className="profe-res" src={fotoProfe('celebra')} alt={`${NOMBRE_PROFE} celebrando tu resultado`} width={150} height={200} />
            <h2 id="t-res">{esFinal ? (aprobado ? '¡Eres analista certificado!' : 'Casi lo logras') : `¡Ganaste «${cap.insignia}»${nombre ? `, ${nombre.split(' ')[0]}` : ''}!`}</h2>
            <p>{esFinal
              ? (aprobado ? `Resolviste el caso «${caso}». Imprime o guarda tu certificado.` : `Necesitas el 60 % para el certificado. Intenta con otro caso.`)
              : 'Mira cómo te fue y sigue con el próximo capítulo.'}</p>
            <div className="cifras">
              <div><b>{resultado.aciertos}/{resultado.total}</b>aciertos</div>
              <div><b>{resultado.puntos}</b>puntos</div>
              <div><Estrellas n={resultado.estrellas} />estrellas</div>
            </div>
            <div className="fila-btn">
              {esFinal && aprobado && <button className="btn" onClick={() => window.print()}>Imprimir o guardar PDF</button>}
              {esFinal && !aprobado && <button className="btn" onClick={() => { setResultado(null); ir('juego'); }}>Intentar otro caso</button>}
              {siguiente && <button className="btn" onClick={() => alIr(siguiente.id)}>Siguiente: {siguiente.titulo} →</button>}
              {!esFinal && <button className="btn sec" onClick={() => { setFicha(0); setResultado(null); ir('juego'); }}>Repetir minijuego</button>}
              <button className="btn sec" onClick={alSalir}>Volver al mapa</button>
            </div>
          </div>
          {esFinal && aprobado && (
            <div className="cert-impreso" aria-hidden="true">
              <p style={{ letterSpacing: '.2em', fontWeight: 700 }}>CERTIFICADO</p>
              <h1>Analista de Sistemas</h1>
              <p>Se otorga a</p>
              <p className="nombre">{nombre || 'Analista'}</p>
              <p style={{ marginTop: 18, maxWidth: 560 }}>por superar el reto final de Análisis de Sistemas con el caso «{caso}» y reunir {puntosTotales} puntos en el juego Modo Analista.</p>
              <p style={{ marginTop: 28 }}>La lógica y la enseñanza: maestra Ruth Dary Escobar Sarria<br />Desarrollo: Juan Pablo Peláez Pino<br />{fecha}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
