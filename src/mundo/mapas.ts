// mapas.ts
// Los cinco mundos de la Ciudad del Analista, dibujados con cuadros (como un mapa de videojuego visto desde arriba).
// Cada letra es un cuadro:
//   S inicio · 1 2 3 niveles (capítulos del mundo, en orden) · # camino · b puente
//   H casa del reto (bono) · X cofre escondido (bono) · E salida al siguiente mundo
//   . suelo · T árbol · R roca · ~ agua · ^ duna o pirámide · o cactus o arbusto
export type Tema = { suelo: string; suelo2: string; camino: string; borde: string; arbol: string; arbol2: string; roca: string; agua: string; cielo: string };

export type Mapa = {
  id: string;
  nombre: string;
  caps: string[];      // capítulos del mundo, en el orden de sus niveles
  tema: Tema;
  filas: string[];
  pista: string;       // lo que dice la profe al llegar al mundo
};

export const COLS = 13;
export const FILAS = 10;

export const MAPAS: Mapa[] = [
  {
    id: 'plaza', nombre: 'Plaza del Analista', caps: ['bienvenida', 'sistema', 'modelo'],
    pista: 'Aquí empieza todo: mirar el sistema real antes de pensar en soluciones.',
    tema: { suelo: '#8DD35F', suelo2: '#7CC34F', camino: '#F6DCA5', borde: '#1E2A1A', arbol: '#2F9E44', arbol2: '#1F7A33', roca: '#C9A46B', agua: '#47A8F0', cielo: '#5FB0FF' },
    filas: [
      'T.T..T..T..T.',
      '............T',
      '.S##1###2###.',
      '..T.#..T...#.',
      '.T..#.T....#.',
      '..X##..T...#.',
      '.T....H####3.',
      '..T.......T#.',
      '.T..T..T...E.',
      'T..T..T..T..T',
    ],
  },
  {
    id: 'barrio', nombre: 'Barrio A-D-P-C', caps: ['actores', 'datos', 'procesos'],
    pista: 'En este barrio todo se mira por sus actores, datos, procesos y control.',
    tema: { suelo: '#F4C66B', suelo2: '#EBB95A', camino: '#FFF1CF', borde: '#3A2412', arbol: '#3E9B4A', arbol2: '#2C7A37', roca: '#D98A3A', agua: '#47A8F0', cielo: '#FFB86B' },
    filas: [
      '^..o...^..o.^',
      '.............',
      '.S###1....^..',
      '.....#..H###.',
      '.^...#.o...#.',
      '..2###.....#.',
      '..#...^..X##.',
      '..#.o......#.',
      '..####3#####.',
      '^..o..E...o.^',
    ],
  },
  {
    id: 'taller', nombre: 'Islas de los Diagramas', caps: ['bpmn', 'dfp', 'dfd'],
    pista: 'Islas de diagramas: BPMN, diagrama de flujo y flujo de datos. Cruza los puentes.',
    tema: { suelo: '#8DD35F', suelo2: '#7CC34F', camino: '#F6DCA5', borde: '#10314F', arbol: '#2F9E44', arbol2: '#1F7A33', roca: '#C9A46B', agua: '#3D9BE9', cielo: '#3D9BE9' },
    filas: [
      '~~~~~~~~~~~~~',
      '~S#1~~~..~~~~',
      '~..#~~.X#.~~~',
      '~~~b~~~.b~~~~',
      '~..#####2.~~~',
      '~~.T~H~.#.~~~',
      '~~~~~~~~b~~~~',
      '~..T~~~.3.~~~',
      '~~.T..~.E.~~~',
      '~~~~~~~~~~~~~',
    ],
  },
  {
    id: 'bosque', nombre: 'Bosque del Problema', caps: ['control', 'arbol', 'entorno'],
    pista: 'En el bosque buscamos las raíces del problema. Ojo con los caminos escondidos.',
    tema: { suelo: '#2E7D4A', suelo2: '#2A7244', camino: '#E8C98A', borde: '#0E2416', arbol: '#1B5E30', arbol2: '#124622', roca: '#7A6A55', agua: '#47A8F0', cielo: '#1B5E30' },
    filas: [
      'TTTTTTTTTTTTT',
      'TS##1TTTTTTTT',
      'TTTT#TTX#TTTT',
      'TTTT###T#TTTT',
      'TTTTTT#T#TTTT',
      'TTH###2##TTTT',
      'TTTTTTTT#TTTT',
      'TTTTTTTT#TTTT',
      'TTTT3####TTTT',
      'TTTTETTTTTTTT',
    ],
  },
  {
    id: 'cumbre', nombre: 'Cumbre de la Propuesta', caps: ['factibilidad', 'reto'],
    pista: 'En la cumbre se decide: ¿se puede hacer? ¿conviene y se sostiene? Y al final, el castillo del reto.',
    tema: { suelo: '#EAF3FB', suelo2: '#DCE9F5', camino: '#B9D3EA', borde: '#1F2A44', arbol: '#2E6B5A', arbol2: '#245446', roca: '#9FB3C8', agua: '#7FC3F5', cielo: '#B9D3EA' },
    filas: [
      '..T..T...T...',
      '.S###1.....T.',
      '.T...#..R....',
      '..R..#####H..',
      '.....#.......',
      '.T...#..X.T..',
      '.....####....',
      '..T.....#..T.',
      '.R......2..R.',
      '..T..T.....T.',
    ],
  },
];

// ¿Se puede caminar por este cuadro?
export const caminable = (ch: string) => ch.length === 1 && '#bS123HXE'.includes(ch);
