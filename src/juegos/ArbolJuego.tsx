// ArbolJuego.tsx · Capítulo 7
// Construir el árbol de problemas. Primero se elige el tronco (el problema central bien formulado).
// Después cada carta se arrastra a la copa (efecto), a las raíces (causa) o al suelo (entorno).
// El árbol es un video de Remotion: cada acierto le dice en qué cuadro aparece una pieza nueva
// y el Player la hace crecer en ese momento.
import React, { useMemo, useRef, useState } from 'react';
import type { PlayerRef } from '@remotion/player';
import type { Juego } from '../datos/capitulos';
import { barajar, sonar, useMenosMovimiento, vibrar } from '../estado';
import { Avance, Aviso, CartaArrastrable, type AvisoDato } from '../componentes/Piezas';
import { Video } from '../componentes/Video';
import { ArbolCrece, type Aparicion } from '../remotion/Arbol';

type J = Extract<Juego, { tipo: 'arbol' }>;
const RAIZ = { act: 0, dat: 1, pro: 2, con: 3 } as const;
const NOMBRE = { raiz: 'las raíces (causa)', copa: 'la copa (efecto)', suelo: 'el suelo (entorno)' };
const COLOR = { raiz: 'var(--c-pro)', copa: 'var(--c-efe)', suelo: 'var(--c-env)' };
const DURACION = 30 * 60 * 30; // media hora de reloj: de sobra para jugar

export const ArbolJuego: React.FC<{ juego: J; alTerminar: (a: number, t: number) => void }> = ({ juego, alTerminar }) => {
  const troncos = useMemo(() => barajar(juego.troncos), [juego]);
  const piezas = useMemo(() => barajar(juego.piezas), [juego]);
  const menos = useMenosMovimiento();
  const player = useRef<PlayerRef>(null);
  const [aparicion, setAparicion] = useState<Aparicion>({ suelo: 0 });
  const [troncoListo, setTroncoListo] = useState(false);
  const [malos, setMalos] = useState<string[]>([]);
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [fallo, setFallo] = useState(false);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const [tiembla, setTiembla] = useState(0);
  const [puestas, setPuestas] = useState<{ t: string; zona: keyof typeof NOMBRE }[]>([]);
  const total = 1 + piezas.length;
  const c = troncoListo ? piezas[i] : undefined;

  // Cuadro actual del video: ahí empieza a crecer la pieza nueva. Con menos movimiento, aparece ya.
  const ahora = () => (menos ? -1000 : (player.current?.getCurrentFrame() ?? 0));
  const crecer = (id: string) => setAparicion((a) => ({ ...a, [id]: ahora() }));

  const elegirTronco = (t: (typeof troncos)[number]) => {
    if (troncoListo) return;
    if (!t.ok) {
      sonar('mal');
      vibrar(60);
      setMalos((m) => [...m, t.t]);
      setAviso({ ok: false, texto: 'Ese no es el tronco.', por: t.por });
      return;
    }
    sonar('logro');
    crecer('tronco');
    setTroncoListo(true);
    setAciertos(malos.length ? 0 : 1);
    setAviso({ ok: true, texto: 'Ese es el problema central.', por: t.por + ' Ahora ubica las demás piezas.' });
  };

  const poner = (zona: string) => {
    if (!c) return;
    const ok = zona === c.zona;
    sonar(ok ? 'bien' : 'mal');
    if (!ok) {
      vibrar(60);
      setFallo(true);
      setTiembla((n) => n + 1);
      setAviso({ ok: false, texto: `Va en ${NOMBRE[c.zona]}.`, por: c.por + ' Inténtalo otra vez.' });
      return;
    }
    const nuevos = aciertos + (fallo ? 0 : 1);
    setAciertos(nuevos);
    setFallo(false);
    setAviso({ ok: true, texto: `Bien: ${NOMBRE[c.zona]}.`, por: c.por });
    const n = puestas.filter((p) => p.zona === c.zona).length;
    if (c.zona === 'raiz') crecer('raiz' + RAIZ[c.comp ?? 'act']);
    else if (c.zona === 'copa') crecer('copa' + n);
    else crecer('ent' + n);
    setPuestas((p) => [...p, { t: c.t, zona: c.zona }]);
    if (i + 1 >= piezas.length) {
      setTimeout(() => crecer('fruto'), 500);
      setTimeout(() => alTerminar(nuevos, total), 2200);
    }
    setI(i + 1);
  };

  const zonaArbol = (id: keyof typeof NOMBRE | 'tronco', rotulo: string) => (
    <div
      className={'zona-arbol' + (id !== 'tronco' && c ? ' activa zona' : '')}
      data-zona={id !== 'tronco' && c ? id : undefined}
      onClick={() => id !== 'tronco' && poner(id)}
    >
      <span>{rotulo}</span>
    </div>
  );

  return (
    <section className="juego" aria-labelledby="t-arbol">
      <h2 id="t-arbol">{juego.titulo}</h2>
      <Avance hecho={(troncoListo ? 1 : 0) + i} total={total} />
      <div className="vivero">
        <div className="lienzo-arbol">
          <Video ref={player} componente={ArbolCrece} props={{ aparicion }} duracion={DURACION} ancho={600} alto={800}
            etiqueta={`Árbol de problemas: ${troncoListo ? 'tronco listo' : 'sin tronco'}, ${puestas.length} piezas ubicadas.`} />
          <div className="zonas-arbol">
            {zonaArbol('copa', 'COPA · EFECTOS')}
            {zonaArbol('tronco', 'TRONCO · PROBLEMA')}
            {zonaArbol('suelo', 'SUELO · ENTORNO')}
            {zonaArbol('raiz', 'RAÍCES · CAUSAS')}
          </div>
        </div>
        <div className="juego">
          {!troncoListo ? (
            <>
              <p className="pista"><b>Paso 1.</b> El consultorio médico. ¿Cuál es el problema central? Recuerda: una sola situación negativa, no la falta de una solución.</p>
              <div className="troncos">
                {troncos.map((t) => (
                  <button key={t.t} onClick={() => elegirTronco(t)} disabled={malos.includes(t.t)} className={malos.includes(t.t) ? 'tiembla' : ''}
                    style={malos.includes(t.t) ? { borderColor: 'var(--mal)', opacity: 0.6 } : undefined}>
                    {t.t}
                  </button>
                ))}
              </div>
            </>
          ) : c ? (
            <>
              <p className="pista"><b>Paso 2.</b> Arrastra la carta a su parte del árbol, o usa los botones.</p>
              <CartaArrastrable key={i + '-' + tiembla} className={tiembla ? 'tiembla' : ''} texto={c.t} alSoltar={poner} />
              <div className="botones-arbol">
                <button className="btn sec zona" data-zona="copa" onClick={() => poner('copa')}>Copa · efecto</button>
                <button className="btn sec zona" data-zona="raiz" onClick={() => poner('raiz')}>Raíz · causa</button>
                <button className="btn sec zona" data-zona="suelo" onClick={() => poner('suelo')}>Suelo · entorno</button>
              </div>
            </>
          ) : (
            <div className="carta">¡Tu árbol está completo! Léelo de abajo hacia arriba.</div>
          )}
          <Aviso aviso={aviso} vacio="Elige el tronco para que el árbol empiece a crecer." />
          {puestas.length > 0 && (
            <div className="lista-arbol" aria-label="Piezas ubicadas">
              {puestas.map((p) => <div key={p.t} style={{ ['--k' as string]: COLOR[p.zona] }}>{p.t}</div>)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
