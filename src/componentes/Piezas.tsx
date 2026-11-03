// Piezas.tsx
// Piezas pequeñas que usan todos los minijuegos: el aviso con el porqué, las estrellas,
// la barra de avance y la carta que se arrastra con el dedo (o con el mouse) hasta una zona.
import React, { useRef, useState } from 'react';

export type AvisoDato = { ok: boolean; texto: string; por?: string } | null;

// Aviso de retroalimentación: siempre dice si estuvo bien o mal y por qué. Se anuncia en voz alta
// a los lectores de pantalla (aria-live).
export const Aviso: React.FC<{ aviso: AvisoDato; vacio?: string }> = ({ aviso, vacio = 'Toca o arrastra para responder.' }) => (
  <div className={'aviso ' + (aviso ? (aviso.ok ? 'bien' : 'mal') : 'vacio')} aria-live="polite" role="status">
    {aviso ? (
      <>
        <span className="marca-aviso">{aviso.ok ? '✓ ¡Bien!' : '✗ Ojo'}</span>
        <span><b>{aviso.texto}</b>{aviso.por ? <> {aviso.por}</> : null}</span>
      </>
    ) : (
      <span>{vacio}</span>
    )}
  </div>
);

export const Estrellas: React.FC<{ n: number; total?: number }> = ({ n, total = 3 }) => (
  <span className="estrellas" role="img" aria-label={`${n} de ${total} estrellas`}>
    {Array.from({ length: total }, (_, i) => (
      <svg key={i} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7-6.2-3.6-6.2 3.6 1.4-7L2 9.3l7-.8z"
          fill={i < n ? 'var(--c-sis)' : 'none'} stroke="var(--c-sis)" strokeWidth="1.8" />
      </svg>
    ))}
  </span>
);

export const Avance: React.FC<{ hecho: number; total: number }> = ({ hecho, total }) => (
  <div className="progreso-juego" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={hecho} aria-label="Avance del minijuego">
    <i style={{ width: `${total ? (hecho / total) * 100 : 0}%` }} />
  </div>
);

// Carta que se puede arrastrar hasta cualquier elemento con data-zona="...". Al soltarla encima,
// llama alSoltar(zona). Tocar las zonas también funciona (así sirve con teclado y sin arrastrar).
export const CartaArrastrable: React.FC<{
  texto: string; color?: string; alSoltar: (zona: string) => void; className?: string; extra?: React.ReactNode;
}> = ({ texto, color = 'var(--c-sis)', alSoltar, className = '', extra }) => {
  const ref = useRef<HTMLDivElement>(null);
  const estado = useRef<{ x: number; y: number; fantasma: HTMLElement | null; zona: Element | null; dx: number; dy: number } | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const zonaEn = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest('[data-zona]') : null;
  };
  const marcar = (z: Element | null) => {
    const e = estado.current;
    if (!e || e.zona === z) return;
    e.zona?.classList.remove('encima');
    z?.classList.add('encima');
    e.zona = z;
  };

  const abajo = (ev: React.PointerEvent) => {
    if (ev.button !== 0) return;
    const r = ref.current!.getBoundingClientRect();
    estado.current = { x: ev.clientX, y: ev.clientY, fantasma: null, zona: null, dx: ev.clientX - r.left, dy: ev.clientY - r.top };
    ref.current!.setPointerCapture(ev.pointerId);
  };
  const mover = (ev: React.PointerEvent) => {
    const e = estado.current;
    if (!e) return;
    if (!e.fantasma) {
      if (Math.hypot(ev.clientX - e.x, ev.clientY - e.y) < 8) return;
      const r = ref.current!.getBoundingClientRect();
      const f = ref.current!.cloneNode(true) as HTMLElement;
      f.classList.add('carta-fantasma');
      f.style.width = r.width + 'px';
      document.body.appendChild(f);
      e.fantasma = f;
      setArrastrando(true);
    }
    e.fantasma.style.left = ev.clientX - e.dx + 'px';
    e.fantasma.style.top = ev.clientY - e.dy + 'px';
    marcar(zonaEn(ev.clientX, ev.clientY));
  };
  const arriba = (ev: React.PointerEvent) => {
    const e = estado.current;
    estado.current = null;
    if (!e) return;
    if (e.fantasma) {
      e.fantasma.remove();
      e.zona?.classList.remove('encima');
      setArrastrando(false);
      const z = zonaEn(ev.clientX, ev.clientY);
      const id = z?.getAttribute('data-zona');
      if (id) alSoltar(id);
    }
  };
  const cancelar = () => {
    const e = estado.current;
    estado.current = null;
    if (e?.fantasma) e.fantasma.remove();
    e?.zona?.classList.remove('encima');
    setArrastrando(false);
  };

  return (
    <div
      ref={ref}
      className={'carta ' + className}
      style={{ ['--c' as string]: color, opacity: arrastrando ? 0.35 : 1 }}
      onPointerDown={abajo} onPointerMove={mover} onPointerUp={arriba} onPointerCancel={cancelar}
      aria-label={`Carta: ${texto}. Elige una zona con los botones.`}
    >
      {texto}
      {extra}
    </div>
  );
};
