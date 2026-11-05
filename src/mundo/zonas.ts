// zonas.ts
// Los cinco mundos del paseo. El jugador camina de izquierda a derecha y el paisaje cambia en cada mundo.
export type Zona = {
  id: string;
  nombre: string;
  caps: string[];             // capítulos del mundo, en orden
  pista: string;              // lo que dice la profe al entrar al mundo
  cielo: [string, string];    // degradado del cielo (arriba, abajo)
  pasto: string;
  tierra: string;
  lejos: string;              // color de las montañas o siluetas lejanas
  medio: string;              // color de los árboles del medio
  astro: 'sol' | 'atardecer' | 'luna';
  deco: 'ciudad' | 'desierto' | 'mar' | 'bosque' | 'nieve';
};

export const ZONAS: Zona[] = [
  {
    id: 'plaza', nombre: 'Plaza del Analista', caps: ['bienvenida', 'sistema', 'modelo'],
    pista: 'Aquí empieza todo: mirar el sistema real antes de pensar en soluciones.',
    cielo: ['#7CC8FF', '#DDF2FF'], pasto: '#5CC15A', tierra: '#8A5A3B', lejos: '#A9D4F2', medio: '#3FA34D', astro: 'sol', deco: 'ciudad',
  },
  {
    id: 'barrio', nombre: 'Barrio A-D-P-C', caps: ['actores', 'datos', 'procesos'],
    pista: 'En este barrio todo se mira por sus actores, datos, procesos y control.',
    cielo: ['#FF8A5B', '#FFD58C'], pasto: '#E2B455', tierra: '#9A6236', lejos: '#E9A061', medio: '#3E9B4A', astro: 'atardecer', deco: 'desierto',
  },
  {
    id: 'islas', nombre: 'Islas de los Diagramas', caps: ['bpmn', 'dfp', 'dfd'],
    pista: 'En las islas dibujamos el sistema: BPMN, diagrama de flujo de procesos y diagrama de flujo de datos.',
    cielo: ['#3DB4F2', '#BFEAFF'], pasto: '#C9A06A', tierra: '#7A4E2D', lejos: '#2E8FD6', medio: '#2F9E44', astro: 'sol', deco: 'mar',
  },
  {
    id: 'bosque', nombre: 'Bosque del Problema', caps: ['control', 'arbol', 'entorno'],
    pista: 'En el bosque buscamos las raíces del problema. Ojo: hay cosas escondidas.',
    cielo: ['#071827', '#123049'], pasto: '#2F9E44', tierra: '#5A3A24', lejos: '#0E2A3C', medio: '#14472C', astro: 'luna', deco: 'bosque',
  },
  {
    id: 'cumbre', nombre: 'Cumbre de la Propuesta', caps: ['factibilidad', 'reto'],
    pista: 'En la cumbre se decide si la propuesta se puede hacer y si conviene. Y al final, el castillo del reto.',
    cielo: ['#5B6FD0', '#C9D6FF'], pasto: '#EEF5FF', tierra: '#6B7FA8', lejos: '#E8F0FF', medio: '#2E6B5A', astro: 'atardecer', deco: 'nieve',
  },
];
