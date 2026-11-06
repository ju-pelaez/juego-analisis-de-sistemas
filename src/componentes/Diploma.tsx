// Diploma.tsx
// El certificado que recibe quien termina TODOS los capítulos del juego. Se ve en pantalla y se imprime
// (o se guarda en PDF) en una hoja horizontal: borde ornamental, sello, nombre en letra cursiva y firmas.
import React from 'react';
import { Glifo } from './Glifo';

// Código corto para reconocer el certificado (sale del nombre, la fecha y los puntos).
function codigo(t: string) {
  let h = 2166136261;
  for (const ch of t) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return 'MA-' + (h >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(0, 7);
}

export const Diploma: React.FC<{ nombre: string; fecha: string; puntos: number; estrellas: number; capitulos: number }> = ({ nombre, fecha, puntos, estrellas, capitulos }) => (
  <article className="diploma" aria-label={`Certificado de Analista de Sistemas para ${nombre}`}>
    <svg className="diploma-marco" viewBox="0 0 1100 760" preserveAspectRatio="none" aria-hidden="true">
      <rect x="14" y="14" width="1072" height="732" fill="none" stroke="#B8902B" strokeWidth="6" />
      <rect x="30" y="30" width="1040" height="700" fill="none" stroke="#1F2A4A" strokeWidth="2" />
      <rect x="40" y="40" width="1020" height="680" fill="none" stroke="#B8902B" strokeWidth="1.5" strokeDasharray="2 6" />
      {[[30, 30, 1], [1070, 30, -1], [30, 730, -1], [1070, 730, 1]].map(([x, y, s], k) => (
        <g key={k} transform={`translate(${x} ${y}) scale(${k % 2 ? -1 : 1} ${k > 1 ? -1 : 1})`}>
          <path d="M0 0 Q60 4 90 40 Q50 24 40 60 Q24 30 0 0Z" fill="#B8902B" opacity={s ? 0.9 : 0.9} />
          <circle cx="44" cy="44" r="7" fill="#1F2A4A" />
        </g>
      ))}
    </svg>
    <div className="diploma-cuerpo">
      <p className="dp-sobre">Modo Analista · Clase de Análisis de Sistemas</p>
      <h1 className="dp-titulo">Certificado de Analista de Sistemas</h1>
      <p className="dp-otorga">Se otorga con orgullo a</p>
      <p className="dp-nombre" style={{ fontSize: `${Math.min(7.6, 135 / Math.max(1, nombre.length))}cqw` }}>{nombre}</p>
      <p className="dp-texto">
        por recorrer con éxito los <b>{capitulos} capítulos</b> del juego: el sistema y sus componentes, los diagramas BPMN, DFP y DFD,
        el árbol de problemas, el entorno, la factibilidad y la viabilidad, y por superar el reto final.
        Reunió <b>{puntos} puntos</b> y <b>{estrellas} estrellas</b>.
      </p>
      <div className="dp-pie">
        <div className="dp-firma">
          <span className="dp-rubrica">Ruth Dary Escobar Sarria</span>
          <i />
          <b>Maestra Ruth Dary Escobar Sarria</b>
        </div>
        <div className="dp-sello" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="56" fill="#B8902B" />
            <circle cx="60" cy="60" r="48" fill="none" stroke="#FFF3CF" strokeWidth="2" strokeDasharray="3 4" />
            <circle cx="60" cy="60" r="38" fill="#1F2A4A" />
          </svg>
          <span><Glifo id="reto" size={44} color="#F2D27A" /></span>
        </div>
        <div className="dp-firma">
          <span className="dp-rubrica">Juan Pablo Peláez</span>
          <i />
          <b>Juan Pablo Peláez Pino</b>
          <small>Desarrollo del juego</small>
        </div>
      </div>
      <p className="dp-fecha">Florencia, Caquetá · {fecha} · Código {codigo(nombre + fecha + puntos)}</p>
    </div>
  </article>
);
