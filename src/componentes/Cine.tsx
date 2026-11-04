// Cine.tsx
// La cinemática de cada capítulo con controles para la clase: reproducir y pausar, escena anterior
// y siguiente, y retroceder o adelantar 5 segundos. Al pausar, el video NO se oscurece ni se
// desenfoca: al lado aparece un panel con lo que dice esa escena, para que la profe lo explique.
import React, { useEffect, useRef, useState } from 'react';
import type { PlayerRef } from '@remotion/player';
import type { Capitulo } from '../datos/capitulos';
import { conNombre, useMenosMovimiento, useVertical } from '../estado';
import { Video } from './Video';
import { CaraProfe, NOMBRE_PROFE } from './Profe';
import { Cinematica, DURACION_CINE, ESCENAS } from '../remotion/Cinematica';

const NOMBRES_ESCENA = ['Presentación', 'El concepto', 'La idea clave'];

export const Cine: React.FC<{ cap: Capitulo; nombre: string; alSeguir: () => void }> = ({ cap, nombre, alSeguir }) => {
  const vertical = useVertical();
  const menos = useMenosMovimiento();
  const player = useRef<PlayerRef>(null);
  const [andando, setAndando] = useState(!menos);
  const [cuadro, setCuadro] = useState(0);
  const [termino, setTermino] = useState(false);
  const props = {
    id: cap.id, n: cap.n, titulo: cap.titulo, sub: cap.sub, lema: cap.lema, color: cap.color,
    dice: conNombre(cap.dice, nombre.trim().split(/\s+/)[0]),
  };

  // El estado de los botones sigue al reproductor (también si termina solo).
  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const play = () => { setAndando(true); setTermino(false); };
    const pausa = () => setAndando(false);
    const fin = () => { setAndando(false); setTermino(true); };
    const cuadroNuevo = (e: { detail: { frame: number } }) => setCuadro(e.detail.frame);
    p.addEventListener('play', play);
    p.addEventListener('pause', pausa);
    p.addEventListener('ended', fin);
    p.addEventListener('frameupdate', cuadroNuevo);
    return () => {
      p.removeEventListener('play', play);
      p.removeEventListener('pause', pausa);
      p.removeEventListener('ended', fin);
      p.removeEventListener('frameupdate', cuadroNuevo);
    };
  }, [vertical]);

  const escena = ESCENAS.reduce((k, inicio, i) => (cuadro >= inicio ? i : k), 0);
  const ir = (f: number) => {
    const p = player.current;
    if (!p) return;
    const destino = Math.max(0, Math.min(DURACION_CINE - 1, Math.round(f)));
    p.seekTo(destino);
    setCuadro(destino);
    setTermino(false);
  };
  const alternar = () => {
    const p = player.current;
    if (!p) return;
    if (p.isPlaying()) p.pause();
    else { if (termino || cuadro >= DURACION_CINE - 1) p.seekTo(0); p.play(); }
  };

  // Teclado: espacio = pausa, flechas = escenas.
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, button')) return;
      if (e.key === ' ') { e.preventDefault(); alternar(); }
      if (e.key === 'ArrowLeft') ir(ESCENAS[Math.max(0, escena - 1)]);
      if (e.key === 'ArrowRight') ir(ESCENAS[Math.min(ESCENAS.length - 1, escena + 1)]);
    };
    addEventListener('keydown', tecla);
    return () => removeEventListener('keydown', tecla);
  });

  const segundos = (f: number) => Math.round(f / 30);
  const ficha0 = cap.fichas[0];
  const notas = [
    <><p className="nota-fuerte">{cap.titulo}</p><p>{props.dice}</p></>,
    <>{ficha0.texto && <p>{ficha0.texto}</p>}{ficha0.filas && <ul>{ficha0.filas.map(([a, b]) => <li key={a}><b>{a}:</b> {b}</li>)}</ul>}{ficha0.flujo && <p>{ficha0.flujo.join(' → ')}</p>}</>,
    <><p className="nota-fuerte">«{cap.lema}»</p><p>Pregunta al salón: ¿con qué ejemplo de su vida lo pueden explicar?</p></>,
  ];

  return (
    <section className={'zona-cine' + (!andando ? ' en-pausa' : '')} aria-label="Cinemática de entrada">
      <div className="cine-y-notas">
        <div className="marco-video">
          <Video ref={player} key={vertical ? 'v' : 'h'} componente={Cinematica} props={props} duracion={DURACION_CINE}
            ancho={vertical ? 720 : 1280} alto={vertical ? 1040 : 720}
            etiqueta={`Cinemática del capítulo ${cap.n}: ${cap.titulo}. ${props.dice} ${cap.lema}`} />
        </div>
        {!andando && (
          <aside className="notas-pausa" aria-live="polite">
            <div className="notas-cabeza">
              <CaraProfe size={44} />
              <span><b>{NOMBRE_PROFE}</b><small>Escena {escena + 1} de 3 · {NOMBRES_ESCENA[escena]}</small></span>
            </div>
            {notas[escena]}
          </aside>
        )}
      </div>
      <div className="controles-cine" role="group" aria-label="Controles de la cinemática">
        <button className="icono" onClick={() => ir(ESCENAS[Math.max(0, escena - 1)])} aria-label="Escena anterior" title="Escena anterior">⏮</button>
        <button className="icono" onClick={() => ir(cuadro - 150)} aria-label="Retroceder 5 segundos" title="Retroceder 5 s">⟲5</button>
        <button className="btn play" onClick={alternar} aria-label={andando ? 'Pausar' : 'Reproducir'}>{andando ? '❚❚ Pausa' : '▶ Play'}</button>
        <button className="icono" onClick={() => ir(cuadro + 150)} aria-label="Adelantar 5 segundos" title="Adelantar 5 s">5⟳</button>
        <button className="icono" onClick={() => ir(ESCENAS[Math.min(ESCENAS.length - 1, escena + 1)])} aria-label="Escena siguiente" title="Escena siguiente">⏭</button>
        <input className="linea-tiempo" type="range" min={0} max={DURACION_CINE - 1} value={cuadro} onChange={(e) => ir(Number(e.target.value))}
          aria-label="Línea de tiempo" aria-valuetext={`${segundos(cuadro)} de ${segundos(DURACION_CINE)} segundos`} />
        <span className="tiempo">{segundos(cuadro)} / {segundos(DURACION_CINE)} s</span>
      </div>
      <div className="acciones">
        <span className="nota">{andando ? 'Pausa cuando quieras explicar: las notas salen al lado.' : 'En pausa. Usa ⏮ ⏭ para cambiar de escena.'}</span>
        <button className={'btn' + (termino ? ' salta' : '')} onClick={alSeguir}>{termino ? 'Continuar →' : 'Saltar y continuar'}</button>
      </div>
    </section>
  );
};
