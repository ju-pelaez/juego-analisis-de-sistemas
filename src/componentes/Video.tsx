// Video.tsx
// Envoltorio del <Player> de Remotion para todo el juego. Si la persona pidió menos movimiento,
// el video no arranca solo: se queda en su último cuadro (que muestra el concepto completo).
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { useMenosMovimiento } from '../estado';

type Props<P extends Record<string, unknown>> = {
  componente: React.ComponentType<P>;
  props: P;
  duracion: number;
  ancho: number;
  alto: number;
  bucle?: boolean;
  auto?: boolean;
  etiqueta: string;          // descripción para lectores de pantalla
  alTerminar?: () => void;
  estilo?: React.CSSProperties;
};

function VideoBase<P extends Record<string, unknown>>(
  { componente, props, duracion, ancho, alto, bucle = false, auto = true, etiqueta, alTerminar, estilo }: Props<P>,
  ref: React.Ref<PlayerRef | null>,
) {
  const menos = useMenosMovimiento();
  const player = useRef<PlayerRef>(null);
  useImperativeHandle(ref, () => player.current, []);

  useEffect(() => {
    const p = player.current;
    if (!p || !alTerminar) return;
    const fin = () => alTerminar();
    p.addEventListener('ended', fin);
    return () => p.removeEventListener('ended', fin);
  }, [alTerminar]);

  return (
    <div role="img" aria-label={etiqueta}>
      <Player
        ref={player}
        component={componente as React.ComponentType<Record<string, unknown>>}
        inputProps={props as Record<string, unknown>}
        durationInFrames={duracion}
        compositionWidth={ancho}
        compositionHeight={alto}
        fps={30}
        autoPlay={auto && !menos}
        loop={bucle && !menos}
        initialFrame={menos ? duracion - 1 : 0}
        controls={false}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        spaceKeyToPlayOrPause={false}
        acknowledgeRemotionLicense
        style={{ width: '100%', display: 'block', ...estilo }}
      />
    </div>
  );
}

export const Video = forwardRef(VideoBase) as <P extends Record<string, unknown>>(
  p: Props<P> & { ref?: React.Ref<PlayerRef | null> },
) => React.ReactElement;
