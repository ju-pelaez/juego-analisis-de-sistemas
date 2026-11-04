// Sala.tsx
// Entrada a la sala en vivo: el proyector la abre; el celular entra con el QR o con el código.
import React, { useEffect, useState } from 'react';
import { ALFABETO, cargarMqtt, type Mqtt } from './canal';
import { Celular } from './Celular';
import { Proyector } from './Proyector';

export const Sala: React.FC<{ alSalir: () => void }> = ({ alSalir }) => {
  const enUrl = (new URLSearchParams(location.search).get('sala') || '').toUpperCase().slice(0, 4);
  const [modo, setModo] = useState<'elegir' | 'proyector' | 'celular'>(enUrl ? 'celular' : 'elegir');
  const [codigo, setCodigo] = useState(enUrl);
  const [escrito, setEscrito] = useState('');
  const [mqtt, setMqtt] = useState<Mqtt | null>(null);
  const [falla, setFalla] = useState(false);
  useEffect(() => { cargarMqtt().then(setMqtt, () => setFalla(true)); }, []);

  if (modo !== 'elegir' && !mqtt) {
    return <div className="tarjeta centro"><h2>{falla ? 'No se pudo abrir la sala' : 'Abriendo la sala…'}</h2>
      {falla && <><p className="pista">Revisa el internet y vuelve a intentar.</p><button className="btn" onClick={() => location.reload()}>Reintentar</button></>}</div>;
  }
  if (modo === 'proyector' && mqtt) return <Proyector mqtt={mqtt} alSalir={() => setModo('elegir')} />;
  if (modo === 'celular' && codigo && mqtt) return <Celular mqtt={mqtt} codigo={codigo} alSalir={alSalir} />;

  return (
    <section className="elegir-sala" aria-labelledby="t-sala-in">
      <h1 id="t-sala-in">Sala en vivo</h1>
      <p className="pista">Todo el salón juega a la vez: el proyector muestra las preguntas y cada estudiante responde desde su celular, en equipos A-D-P-C, con chat y emoticones.</p>
      <div className="dos-sala">
        <div className="tarjeta">
          <h2>En el proyector</h2>
          <p className="pista">Abre la sala en el computador conectado al video beam. Sale un QR para que entren todos.</p>
          <button className="btn ancho" onClick={() => setModo('proyector')}>Abrir la sala</button>
        </div>
        <form className="tarjeta" onSubmit={(e) => {
          e.preventDefault();
          const c = escrito.toUpperCase().split('').filter((l) => ALFABETO.includes(l)).join('').slice(0, 4);
          if (c.length === 4) { setCodigo(c); setModo('celular'); }
        }}>
          <h2>En tu celular</h2>
          <div className="campo">
            <label htmlFor="codigo-sala">Código de la sala</label>
            <input id="codigo-sala" value={escrito} onChange={(e) => setEscrito(e.target.value)} maxLength={4} autoCapitalize="characters" autoComplete="off" placeholder="ABCD" style={{ letterSpacing: '.3em', textTransform: 'uppercase' }} />
          </div>
          <button className="btn ancho" type="submit">Entrar</button>
        </form>
      </div>
      <button className="btn fantasma" onClick={alSalir}>← Volver al juego</button>
    </section>
  );
};
