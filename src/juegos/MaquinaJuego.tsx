// MaquinaJuego.tsx · Capítulo 2
// La máquina entrada → proceso → salida, con su lazo de control, es un video de Remotion que se
// llena con cada acierto: el estado del juego le pasa cuántas piezas tiene cada estación.
import React, { useMemo, useRef, useState } from 'react';
import type { PlayerRef } from '@remotion/player';
import type { Juego } from '../datos/capitulos';
import { barajar, sonar, vibrar } from '../estado';
import { Avance, Aviso, CartaArrastrable, type AvisoDato } from '../componentes/Piezas';
import { Video } from '../componentes/Video';
import { Maquina, type MaquinaProps, type Zona } from '../remotion/Extras';

type J = Extract<Juego, { tipo: 'maquina' }>;
const ZONAS: { z: Zona; n: string; c: string; q: string }[] = [
  { z: 'e', n: 'Entrada', c: 'var(--c-dat)', q: 'lo que llega' },
  { z: 'p', n: 'Proceso', c: 'var(--c-pro)', q: 'lo que transforma' },
  { z: 's', n: 'Salida', c: 'var(--c-efe)', q: 'lo que sale' },
  { z: 'c', n: 'Control', c: 'var(--c-con)', q: 'lo que evalúa' },
];

export const MaquinaJuego: React.FC<{ juego: J; alTerminar: (a: number, t: number) => void }> = ({ juego, alTerminar }) => {
  const cartas = useMemo(() => barajar(juego.items), [juego]);
  const totales = useMemo(() => {
    const t: Record<Zona, number> = { e: 0, p: 0, s: 0, c: 0 };
    juego.items.forEach((it) => t[it.zona]++);
    return t;
  }, [juego]);
  const player = useRef<PlayerRef>(null);
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [fallo, setFallo] = useState(false);
  const [aviso, setAviso] = useState<AvisoDato>(null);
  const [tiembla, setTiembla] = useState(0);
  const [maq, setMaq] = useState<MaquinaProps>({ llenos: { e: 0, p: 0, s: 0, c: 0 }, totales, ultimo: '', cuadroUltimo: -100 });
  const c = cartas[i];

  const poner = (zona: string) => {
    if (!c) return;
    const z = zona as Zona;
    const ok = z === c.zona;
    const nombre = ZONAS.find((x) => x.z === c.zona)!.n.toLowerCase();
    sonar(ok ? 'bien' : 'mal');
    if (!ok) {
      vibrar(60);
      setFallo(true);
      setTiembla((n) => n + 1);
      setAviso({ ok: false, texto: `«${c.t}» es ${nombre === 'control' ? 'control' : 'una ' + nombre}.`, por: c.por + ' Prueba otra vez.' });
      return;
    }
    const nuevos = aciertos + (fallo ? 0 : 1);
    setAciertos(nuevos);
    setFallo(false);
    setAviso({ ok: true, texto: `«${c.t}» → ${nombre}.`, por: c.por });
    setMaq((m) => ({ ...m, llenos: { ...m.llenos, [z]: m.llenos[z] + 1 }, ultimo: z, cuadroUltimo: player.current?.getCurrentFrame() ?? -100 }));
    if (i + 1 >= cartas.length) setTimeout(() => alTerminar(nuevos, cartas.length), 900);
    setI(i + 1);
  };

  return (
    <section className="juego" aria-labelledby="t-maq">
      <h2 id="t-maq">{juego.titulo}</h2>
      <p className="pista">Arrastra cada pieza a su estación. Cuando entradas y procesos estén completos, la máquina arranca.</p>
      <div className="marco-video">
        <Video ref={player} componente={Maquina} props={maq} duracion={300} ancho={1000} alto={480} bucle etiqueta="La máquina del sistema: entradas, procesos, salidas y control, llenándose con tus aciertos." />
      </div>
      <Avance hecho={i} total={cartas.length} />
      {c ? <CartaArrastrable key={i + '-' + tiembla} className={tiembla ? 'tiembla' : ''} texto={c.t} alSoltar={poner} /> : <div className="carta">¡La máquina funciona!</div>}
      <div className="estaciones">
        {ZONAS.map((z) => (
          <button key={z.z} className="estacion zona" data-zona={z.z} style={{ ['--c' as string]: z.c }} onClick={() => poner(z.z)} disabled={!c}>
            {z.n}<small>{z.q}</small>
          </button>
        ))}
      </div>
      <Aviso aviso={aviso} />
    </section>
  );
};
