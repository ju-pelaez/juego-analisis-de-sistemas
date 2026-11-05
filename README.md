# Modo Analista

Juego web para aprender **Análisis de Sistemas** capítulo por capítulo.

**Jugar:** https://juego-analisis-de-sistemas.vercel.app

## Qué trae

- **El mundo del analista:** un juego de plataformas de lado. Se camina con A/D o las flechas, se salta con W o espacio y se entra con S o Enter (en celular, con botones). Cinco mundos (Plaza, Barrio A-D-P-C, Islas de los Diagramas, Bosque del Problema y Cumbre de la Propuesta) y cada capítulo es una casa con su letrero que dice qué se aprende. Hay datos para recoger, bloques ? con preguntas, un bloque secreto por mundo y bugs para eliminar. Todo está abierto.
- Debajo del juego están todos los capítulos ordenados por mundo, con sus temas, para entrar directo al que se necesite.
- 14 capítulos: qué hace un analista, el sistema, entrada-proceso-salida y control, actores, datos, procesos, modelado de procesos con BPMN (como en Bizagi), diagrama de flujo de procesos (DFP), diagrama de flujo de datos (DFD), mecanismos de control, árbol de problemas, entorno, factibilidad y viabilidad, y un reto final con certificado.
- Cada capítulo tiene una cinemática, fichas cortas, un minijuego distinto, preguntas de control y una insignia.
- La profe Ruth Dary es la guía que explica cada tema.
- **Sala en vivo:** el proyector muestra un QR, todo el salón entra desde el celular, responde en equipos (Actores, Datos, Procesos y Control), chatea y manda emoticones.
- Funciona en celular y en proyector, con modo claro, sonido opcional y respeto por la opción de menos movimiento.

## Cómo correrlo

```bash
npm install
npm run dev
```

Para publicar: `npm run build` genera la carpeta `dist`.

Hecho con React, TypeScript, Vite y Remotion.

## Créditos

- **Desarrollo:** Juan Pablo Peláez Pino, Ingeniería de Sistemas, Universidad de la Amazonia (Florencia, Caquetá).
- **La lógica y la enseñanza:** maestra Ruth Dary Escobar Sarria, clase de Análisis de Sistemas.
