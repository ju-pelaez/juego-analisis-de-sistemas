// capitulos.ts
// Todo el contenido del juego: las definiciones de la clase de Análisis de Sistemas con ejemplos
// generales (biblioteca, cafetería, consultorio, tienda en línea, matrícula, transporte).
// Cada capítulo trae: sus fichas (explicación corta), un minijuego distinto y 3 preguntas de control.

// Colores de los componentes del sistema (A-D-P-C) y de las demás partes.
export type Comp = 'act' | 'dat' | 'pro' | 'con' | 'env' | 'efe' | 'sis';

export const COMPONENTES: Record<'act' | 'dat' | 'pro' | 'con', { n: string; q: string }> = {
  act: { n: 'Actores', q: '¿Quién participa?' },
  dat: { n: 'Datos', q: '¿Qué información hay?' },
  pro: { n: 'Procesos', q: '¿Qué se hace?' },
  con: { n: 'Control', q: '¿Cómo se evalúa?' },
};

export type Fila = [string, string, Comp?];
export type Ficha = {
  titulo: string;
  texto?: string;
  filas?: Fila[];
  dos?: { si: [string, string]; no: [string, string] };
  flujo?: string[];
  frase?: string;
  concepto?: boolean; // muestra la animación del concepto (Remotion) en esta ficha
};

export type Pregunta = { q: string; ok: string; mal: string[]; por: string };

export type Juego =
  | { tipo: 'deslizar'; titulo: string; izq: string; der: string; items: { t: string; lado: 'izq' | 'der'; por: string }[] }
  | { tipo: 'frontera'; titulo: string; sistema: string; items: { t: string; dentro: boolean; por: string }[] }
  | { tipo: 'maquina'; titulo: string; items: { t: string; zona: 'e' | 'p' | 's' | 'c'; por: string }[] }
  | { tipo: 'hilos'; titulo: string; pares: { a: string; b: string; por: string }[] }
  | { tipo: 'embudo'; titulo: string; items: { t: string; nivel: 0 | 1 | 2; por: string }[] }
  | { tipo: 'ordenar'; titulo: string; pasos: { t: string; quien: string }[] }
  | { tipo: 'relampago'; titulo: string; segundos: number; items: { t: string; v: boolean; por: string }[] }
  | {
      tipo: 'arbol';
      titulo: string;
      troncos: { t: string; ok: boolean; por: string }[];
      piezas: { t: string; zona: 'raiz' | 'copa' | 'suelo'; comp?: 'act' | 'dat' | 'pro' | 'con'; por: string }[];
    }
  | { tipo: 'lupa'; titulo: string; pista: string; items: { t: string; sel: boolean; por: string }[] }
  | { tipo: 'cubetas'; titulo: string; cubetas: { id: string; n: string; c: Comp }[]; items: { t: string; b: string; por: string }[] }
  | { tipo: 'bpmn'; titulo: string }
  | { tipo: 'final' };

export type Capitulo = {
  id: string;
  n: number;
  titulo: string;
  sub: string;
  lema: string;       // frase clave que cierra la cinemática
  color: Comp;
  caso: string;       // el ejemplo con el que se practica
  insignia: string;   // nombre de la insignia que se gana
  dice: string;       // lo que dice la profe Ruth Dary al entrar al capítulo
  fichas: Ficha[];
  juego: Juego;
  preguntas: Pregunta[];
};

export const CAPITULOS: Capitulo[] = [
  {
    id: 'bienvenida', n: 0, color: 'sis', caso: 'Varios sistemas de la vida diaria',
    titulo: 'Qué hace un analista', sub: 'Entender el problema antes de la solución',
    lema: 'Primero se entiende el problema. La solución viene después.',
    insignia: 'Lente de analista',
    dice: '¡Bienvenidos a Análisis de Sistemas! Aquí aprendemos a entender el problema antes de pensar en la solución.',
    fichas: [
      {
        titulo: 'El analista mira antes de construir', concepto: true,
        texto: 'Un analista de sistemas no empieza programando. Primero comprende cómo funciona hoy la organización: quién participa, qué información hay, qué se hace y cómo se evalúa.',
      },
      {
        titulo: 'Análisis de sistemas tiene dos mundos',
        dos: {
          si: ['Mundo real', 'La organización: actores, procesos, entradas y salidas, control y objetivos. Existe hoy, sin nosotros.'],
          no: ['Mundo de la solución', 'Software, hardware, redes, bases de datos y aplicaciones. Se construye después.'],
        },
        frase: 'Analizar es trabajar primero en el mundo real.',
      },
      {
        titulo: 'AS-IS: cómo funciona HOY',
        texto: 'AS-IS significa "como está". Describe la situación actual del sistema, sin soluciones. Por eso, cuando analizas, no hablas de apps: hablas de lo que pasa.',
        filas: [
          ['Bien', 'En la cafetería, la fila a mediodía tarda 25 minutos.', 'act'],
          ['Todavía no', 'Hagamos una app para pedir almuerzo.', 'efe'],
        ],
      },
      {
        titulo: 'Qué queremos lograr en la clase',
        texto: 'Que aprendas a mirar cualquier organización como un sistema y a explicar su problema antes de proponer una solución.',
        filas: [
          ['Comprender', 'El sistema real: sus elementos, sus límites y su objetivo.', 'sis'],
          ['Descomponer', 'Sus componentes: actores, datos, procesos y control (A-D-P-C).', 'act'],
          ['Formular', 'El problema central y el árbol de problemas: causas y efectos.', 'efe'],
          ['Distinguir', 'Lo que es del sistema y lo que es del entorno.', 'env'],
          ['Evaluar', 'Si una propuesta es factible y viable.', 'dat'],
        ],
      },
      {
        titulo: 'Así funciona cada capítulo',
        flujo: ['Cinemática', 'Fichas cortas', 'Minijuego', 'Preguntas', 'Insignia'],
        frase: 'Cada acierto suma puntos. Tu progreso se guarda en este aparato.',
      },
    ],
    juego: {
      tipo: 'deslizar', titulo: '¿Mundo real o mundo de la solución?', izq: 'Mundo real', der: 'Mundo de la solución',
      items: [
        { t: 'Los estudiantes que piden libros prestados', lado: 'izq', por: 'Son personas del sistema: existen hoy, sin ninguna solución.' },
        { t: 'Una app para pedir almuerzo', lado: 'der', por: 'Una app es software: pertenece a la solución.' },
        { t: 'La fila de la cafetería a mediodía', lado: 'izq', por: 'Es algo que pasa hoy en la organización.' },
        { t: 'Una base de datos de pacientes', lado: 'der', por: 'Las bases de datos se construyen en el mundo de la solución.' },
        { t: 'El turno de atención del consultorio', lado: 'izq', por: 'Es un proceso real de la organización.' },
        { t: 'Un servidor en la nube', lado: 'der', por: 'Es hardware y redes: mundo de la solución.' },
        { t: 'Las quejas por pedidos que llegan tarde', lado: 'izq', por: 'Es un hecho del sistema actual (AS-IS).' },
        { t: 'Una página web de matrícula', lado: 'der', por: 'Es una solución tecnológica, no la situación actual.' },
        { t: 'El horario de las rutas de bus', lado: 'izq', por: 'Es información que existe hoy en el sistema de transporte.' },
        { t: 'Un programa de inventario', lado: 'der', por: 'Es software: se construye después del análisis.' },
      ],
    },
    preguntas: [
      { q: '¿Qué hace primero un analista de sistemas?', ok: 'Comprender cómo funciona hoy el sistema real', mal: ['Programar la aplicación', 'Comprar los computadores', 'Diseñar la base de datos'], por: 'Primero se comprende el mundo real; la solución se construye después.' },
      { q: '¿Qué significa AS-IS?', ok: 'La situación actual: cómo funciona el sistema hoy', mal: ['Cómo debería funcionar el sistema', 'La solución tecnológica', 'El sistema ideal del futuro'], por: 'AS-IS = "como está". Por eso no lleva soluciones.' },
      { q: '¿Cuál de estas cosas es del mundo de la solución?', ok: 'Una base de datos', mal: ['Los actores de la organización', 'Los procesos que se hacen hoy', 'Los objetivos del sistema'], por: 'Software, hardware, redes y bases de datos son del mundo de la solución.' },
    ],
  },

  {
    id: 'sistema', n: 1, color: 'sis', caso: 'Biblioteca universitaria',
    titulo: 'El sistema', sub: 'Elementos, límites y objetivo',
    lema: 'Todo sistema tiene elementos, límites y un objetivo.',
    insignia: 'Trazador de fronteras',
    dice: 'Antes de opinar, hay que saber qué sistema estamos mirando y hasta dónde llega.',
    fichas: [
      {
        titulo: 'Tres preguntas para ver un sistema', concepto: true,
        filas: [
          ['Elementos', '¿Qué lo compone? Sus componentes: actores, datos, procesos y control.', 'act'],
          ['Límites', '¿Dónde empieza y dónde termina? Lo que queda dentro y lo que queda fuera.', 'sis'],
          ['Objetivo', '¿Para qué existe el sistema real?', 'efe'],
        ],
      },
      {
        titulo: 'Ejemplo: el préstamo de libros de la biblioteca',
        texto: 'Vamos a mirar el sistema de préstamo de libros de una biblioteca universitaria.',
        filas: [
          ['Geográfico', 'La biblioteca de la sede principal.', 'sis'],
          ['Organizacional', 'Estudiantes, docentes y bibliotecarios.', 'act'],
          ['De proceso', 'Desde que el estudiante busca el libro hasta que lo devuelve. Fuera: la compra de libros nuevos.', 'pro'],
          ['Temporal', 'Cómo funciona hoy, en este semestre.', 'con'],
        ],
      },
      {
        titulo: 'Los límites evitan que el análisis se desborde',
        texto: 'Lo que queda fuera se excluye a propósito. Si todo entra, no se puede analizar nada con cuidado.',
        frase: 'Límite = dónde empieza y dónde termina el sistema.',
      },
      {
        titulo: 'El objetivo dice para qué existe',
        filas: [
          ['Objetivo', 'Que cada estudiante consiga a tiempo el libro que necesita y que los libros vuelvan a la estantería.', 'efe'],
          ['No es objetivo', 'Desarrollar una aplicación de préstamos. Eso ya sería una solución.', 'act'],
        ],
      },
    ],
    juego: {
      tipo: 'frontera', titulo: 'Traza la frontera: ¿dentro o fuera del sistema?', sistema: 'Préstamo de libros',
      items: [
        { t: 'Prestar un libro', dentro: true, por: 'Es el corazón del proceso de préstamo.' },
        { t: 'El bibliotecario', dentro: true, por: 'Es un actor que participa en el préstamo.' },
        { t: 'Registrar la devolución', dentro: true, por: 'El límite de proceso termina cuando el libro vuelve.' },
        { t: 'El registro de préstamos', dentro: true, por: 'Son los datos del sistema.' },
        { t: 'La multa por retraso', dentro: true, por: 'Es parte del control del préstamo.' },
        { t: 'Comprar libros nuevos', dentro: false, por: 'El límite de proceso lo deja fuera a propósito.' },
        { t: 'La editorial que imprime los libros', dentro: false, por: 'No participa en el préstamo: está fuera del límite organizacional.' },
        { t: 'Una biblioteca de otra ciudad', dentro: false, por: 'Queda fuera del límite geográfico.' },
        { t: 'La cafetería de la universidad', dentro: false, por: 'Es otro sistema distinto.' },
      ],
    },
    preguntas: [
      { q: '¿Qué tres cosas tiene todo sistema?', ok: 'Elementos, límites y un objetivo', mal: ['Una app, un servidor y una red', 'Causas, efectos y soluciones', 'Solo personas'], por: 'Elementos (qué lo compone), límites (dónde empieza y termina) y objetivo (para qué existe).' },
      { q: 'En la biblioteca, "desde que se busca el libro hasta que se devuelve" es un límite…', ok: 'De proceso', mal: ['Geográfico', 'Temporal', 'Organizacional'], por: 'El límite de proceso dice dónde empieza y dónde termina lo que se hace.' },
      { q: '¿Cuál NO es un objetivo del sistema real?', ok: 'Desarrollar una aplicación de préstamos', mal: ['Que el estudiante consiga el libro a tiempo', 'Que los libros vuelvan', 'Que el préstamo sea justo para todos'], por: 'Una app sería una solución. Los objetivos dicen para qué existe el sistema real.' },
    ],
  },

  {
    id: 'modelo', n: 2, color: 'pro', caso: 'Cafetería universitaria',
    titulo: 'Entrada, proceso, salida y control', sub: 'El modelo que explica cualquier sistema',
    lema: 'Todo sistema transforma entradas en salidas. El control lo vigila.',
    insignia: 'Ingeniero de la máquina',
    dice: 'Todo sistema es como una máquina: algo entra, algo se transforma y algo sale.',
    fichas: [
      {
        titulo: 'La máquina de todo sistema', concepto: true,
        flujo: ['Entradas', 'Procesos', 'Salidas'],
        texto: 'Las entradas llegan, los procesos las transforman y salen las salidas. El control evalúa con indicadores y retroalimenta el proceso.',
      },
      {
        titulo: 'Ejemplo: la cafetería universitaria',
        filas: [
          ['Entradas', 'Ingredientes, pedidos de los estudiantes, dinero.', 'dat'],
          ['Procesos', 'Tomar el pedido, preparar, cobrar, entregar.', 'pro'],
          ['Salidas', 'Almuerzo entregado, recibo de pago, estudiantes atendidos.', 'efe'],
          ['Control', 'Medir el tiempo de espera y revisar las quejas cada semana.', 'con'],
        ],
      },
      {
        titulo: 'Proceso = transformar',
        texto: 'Un proceso es un conjunto de tareas que transforma entradas en salidas. Si no transforma nada, no es un proceso.',
        frase: 'Entrada → proceso → salida, y el control mira todo.',
      },
      {
        titulo: 'El control cierra el lazo',
        texto: 'El control evalúa el comportamiento del sistema con indicadores y retroalimenta el proceso. Sin control, el sistema no se da cuenta cuando falla.',
        filas: [['Ejemplo', 'Si la espera pasa de 15 minutos, se abre otra caja.', 'con']],
      },
    ],
    juego: {
      tipo: 'maquina', titulo: 'Arma la máquina de la cafetería',
      items: [
        { t: 'Ingredientes', zona: 'e', por: 'Llegan al sistema para ser transformados.' },
        { t: 'Pedido del estudiante', zona: 'e', por: 'Es lo que entra para que la cafetería trabaje.' },
        { t: 'Dinero del pago', zona: 'e', por: 'Llega al sistema con cada pedido.' },
        { t: 'Preparar el almuerzo', zona: 'p', por: 'Transforma ingredientes en comida.' },
        { t: 'Cobrar', zona: 'p', por: 'Es una tarea que convierte el pedido en una venta.' },
        { t: 'Entregar el pedido', zona: 'p', por: 'Es una acción del sistema.' },
        { t: 'Almuerzo entregado', zona: 's', por: 'Es lo que sale del sistema.' },
        { t: 'Recibo de pago', zona: 's', por: 'Es un resultado del proceso de cobrar.' },
        { t: 'Medir el tiempo de espera', zona: 'c', por: 'Es un indicador para evaluar el sistema.' },
        { t: 'Revisar las quejas cada semana', zona: 'c', por: 'Evalúa y retroalimenta: eso es control.' },
      ],
    },
    preguntas: [
      { q: '¿Qué es un proceso?', ok: 'Un conjunto de tareas que transforma entradas en salidas', mal: ['Una persona del sistema', 'Un dato suelto', 'Una norma'], por: 'Proceso = transformar entradas en salidas.' },
      { q: '¿Qué hace un mecanismo de control?', ok: 'Evalúa el sistema con indicadores y retroalimenta el proceso', mal: ['Prepara el almuerzo', 'Paga los ingredientes', 'Entrega el pedido'], por: 'Control = evaluar + indicadores + retroalimentación.' },
      { q: 'En la cafetería, "almuerzo entregado" es…', ok: 'Una salida', mal: ['Una entrada', 'Un proceso', 'Un control'], por: 'Es lo que sale del sistema después de transformar las entradas.' },
    ],
  },

  {
    id: 'actores', n: 3, color: 'act', caso: 'Consultorio médico',
    titulo: 'Actores', sub: '¿Quién participa?',
    lema: 'Actor es quien participa en el sistema y cumple una función.',
    insignia: 'Mapa de actores',
    dice: 'Un sistema no funciona solo: alguien participa. Vamos a encontrar a cada actor.',
    fichas: [
      {
        titulo: 'Actor = quien participa y cumple una función', concepto: true,
        texto: 'Un actor puede ser una persona, un rol o una organización. Lo importante es la función que cumple dentro del sistema.',
        frase: 'Pregunta de la columna de actores: ¿Quién participa?',
      },
      {
        titulo: 'Ejemplo: el consultorio médico',
        filas: [
          ['Paciente', 'Pide la cita y recibe la atención.', 'act'],
          ['Recepcionista', 'Agenda y confirma las citas.', 'act'],
          ['Médico', 'Atiende al paciente y formula.', 'act'],
          ['Entidad de salud', 'Autoriza los servicios.', 'act'],
          ['Secretaría de Salud', 'Vigila que el consultorio cumpla las normas.', 'act'],
        ],
      },
      {
        titulo: 'Unos operan, otros exigen o regulan',
        texto: 'Algunos actores hacen el trabajo diario (recepcionista, médico). Otros ponen reglas o exigen (la Secretaría de Salud). Todos influyen en cómo funciona el sistema.',
      },
      {
        titulo: 'Ojo con lo que NO es actor',
        dos: {
          si: ['Sí es actor', 'La recepcionista, el paciente, la entidad de salud.'],
          no: ['No es actor', 'La agenda de citas (es un dato) o "agendar" (es un proceso).'],
        },
      },
    ],
    juego: {
      tipo: 'hilos', titulo: 'Une cada actor con su función',
      pares: [
        { a: 'Paciente', b: 'Pide la cita y recibe la atención', por: 'Es quien usa el servicio.' },
        { a: 'Recepcionista', b: 'Agenda y confirma las citas', por: 'Opera la agenda todos los días.' },
        { a: 'Médico', b: 'Atiende y formula', por: 'Cumple la función principal del consultorio.' },
        { a: 'Entidad de salud', b: 'Autoriza los servicios', por: 'Es una organización: también es actor.' },
        { a: 'Secretaría de Salud', b: 'Vigila que se cumplan las normas', por: 'Regula desde afuera de la operación diaria.' },
      ],
    },
    preguntas: [
      { q: '¿Qué es un actor?', ok: 'Quien participa en el sistema y cumple una función', mal: ['Un dato del sistema', 'Una tarea que se repite', 'Un indicador'], por: 'Puede ser una persona, un rol o una organización.' },
      { q: '¿Qué pregunta responde la columna de actores?', ok: '¿Quién participa?', mal: ['¿Qué se hace?', '¿Qué información hay?', '¿Cómo se evalúa?'], por: 'A-D-P-C: Actores = ¿quién participa?' },
      { q: 'En el consultorio, ¿cuál NO es un actor?', ok: 'La agenda de citas', mal: ['La recepcionista', 'El paciente', 'La entidad de salud'], por: 'La agenda es información: va en la columna de datos.' },
    ],
  },

  {
    id: 'datos', n: 4, color: 'dat', caso: 'Tienda en línea',
    titulo: 'Datos', sub: '¿Qué información hay?',
    lema: 'Dato, información y conocimiento no son lo mismo.',
    insignia: 'Destilador de datos',
    dice: 'Tengo muchos datos… pero ¿eso ya es información? ¿Y conocimiento?',
    fichas: [
      {
        titulo: 'Tres palabras que no son lo mismo', concepto: true,
        filas: [
          ['Dato', 'Variable medible: un precio, una fecha, una ciudad.', 'dat'],
          ['Información', 'Datos procesados, relacionados y con contexto.', 'dat'],
          ['Conocimiento', 'Lo que permite decidir y actuar.', 'dat'],
        ],
      },
      {
        titulo: 'Ejemplo: una tienda en línea',
        filas: [
          ['Dato', '"Fecha del pedido: 3 de marzo".', 'dat'],
          ['Información', '"El pedido 1032 lleva 6 días sin despacharse".', 'dat'],
          ['Conocimiento', '"Los envíos a otras ciudades tardan el doble: la tienda decide avisar el tiempo real de entrega".', 'dat'],
        ],
      },
      {
        titulo: 'Variables cuantitativas y cualitativas',
        dos: {
          si: ['Cuantitativa', 'Se mide con números: precio, cantidad, días de entrega.'],
          no: ['Cualitativa', 'Es una categoría o tipo: ciudad de envío, medio de pago, talla.'],
        },
      },
      {
        titulo: 'El dato casi nunca falta del todo',
        texto: 'Lo común es que el dato exista, pero disperso: no se relaciona y no llega a quien decide.',
        frase: 'Falta donde se necesita y como se necesita.',
      },
    ],
    juego: {
      tipo: 'embudo', titulo: '¿Dato, información o conocimiento?',
      items: [
        { t: 'Precio: $45.000', nivel: 0, por: 'Es una variable suelta, sin contexto.' },
        { t: 'Ciudad de envío: Neiva', nivel: 0, por: 'Es un dato: una sola variable.' },
        { t: 'Este mes hubo 40 devoluciones, el doble que el mes pasado', nivel: 1, por: 'Relaciona datos y les da contexto.' },
        { t: 'Fecha del pedido: 3 de marzo', nivel: 0, por: 'Una fecha sola es un dato.' },
        { t: 'La mitad de las devoluciones son por talla equivocada', nivel: 1, por: 'Datos procesados y relacionados: información.' },
        { t: 'Como los lunes se acumulan pedidos, el jefe decide reforzar ese turno', nivel: 2, por: 'Permite decidir y actuar: conocimiento.' },
        { t: 'El pedido 1032 lleva 6 días sin despacharse', nivel: 1, por: 'Junta varios datos con contexto.' },
        { t: 'Con las devoluciones por talla, la tienda decide revisar su tabla de tallas', nivel: 2, por: 'Lleva a una decisión: conocimiento.' },
        { t: 'Medio de pago: tarjeta', nivel: 0, por: 'Variable cualitativa suelta: dato.' },
      ],
    },
    preguntas: [
      { q: '¿Qué es conocimiento?', ok: 'Información que permite decidir y actuar', mal: ['Un número suelto', 'Un documento en papel', 'Una fecha'], por: 'Dato → información (con contexto) → conocimiento (para decidir).' },
      { q: 'La variable "ciudad de envío" es…', ok: 'Cualitativa', mal: ['Cuantitativa', 'Un proceso', 'Un actor'], por: 'Es una categoría, no se mide con números.' },
      { q: '¿Qué pregunta responde la columna de datos?', ok: '¿Qué información hay?', mal: ['¿Quién participa?', '¿Qué se hace?', '¿Cómo se evalúa?'], por: 'A-D-P-C: Datos = ¿qué información hay?' },
    ],
  },

  {
    id: 'procesos', n: 5, color: 'pro', caso: 'Matrícula académica',
    titulo: 'Procesos', sub: '¿Qué se hace y quién lo hace?',
    lema: 'Cada proceso tiene un orden y un responsable.',
    insignia: 'Maestro del flujo',
    dice: 'Ahora miremos qué se hace, en qué orden y quién lo hace.',
    fichas: [
      {
        titulo: 'Proceso = tareas, acciones y funciones', concepto: true,
        texto: 'Los procesos transforman entradas en salidas. Van en un orden y cada uno tiene un responsable.',
        frase: 'Pregunta de la columna de procesos: ¿Qué se hace?',
      },
      {
        titulo: 'Ejemplo: la matrícula académica',
        flujo: ['Generar el recibo', 'Pagar', 'Inscribir materias', 'Validar requisitos', 'Confirmar matrícula'],
      },
      {
        titulo: 'Cada proceso tiene un responsable',
        filas: [
          ['Generar el recibo', 'Oficina financiera', 'pro'],
          ['Pagar el recibo', 'Estudiante', 'pro'],
          ['Inscribir materias', 'Estudiante', 'pro'],
          ['Validar prerrequisitos y cupos', 'Registro académico', 'pro'],
          ['Confirmar la matrícula', 'Registro académico', 'pro'],
        ],
      },
      {
        titulo: 'Si un paso falla, falla la salida',
        texto: 'Si el pago no se registra a tiempo, el estudiante no puede inscribir. Por eso el analista mira el orden completo, no un paso suelto.',
      },
    ],
    juego: {
      tipo: 'ordenar', titulo: 'Toca los pasos de la matrícula en orden',
      pasos: [
        { t: 'Generar el recibo de matrícula', quien: 'Oficina financiera' },
        { t: 'Pagar el recibo', quien: 'Estudiante' },
        { t: 'Inscribir las materias', quien: 'Estudiante' },
        { t: 'Validar prerrequisitos y cupos', quien: 'Registro académico' },
        { t: 'Confirmar la matrícula y entregar el horario', quien: 'Registro académico' },
      ],
    },
    preguntas: [
      { q: '¿Qué pregunta responde la columna de procesos?', ok: '¿Qué se hace?', mal: ['¿Quién participa?', '¿Qué información hay?', '¿Cómo se evalúa?'], por: 'Procesos = tareas, acciones y funciones.' },
      { q: 'En la matrícula, ¿qué va justo después de pagar el recibo?', ok: 'Inscribir las materias', mal: ['Generar el recibo', 'Confirmar la matrícula', 'Validar requisitos'], por: 'Generar → pagar → inscribir → validar → confirmar.' },
      { q: '¿Por qué cada proceso necesita un responsable?', ok: 'Porque alguien debe cumplir esa función para que el sistema avance', mal: ['Porque lo pide el software', 'No lo necesita', 'Para cobrar más'], por: 'Sin responsable, la tarea no se hace y la salida falla.' },
    ],
  },

  {
    id: 'bpmn', n: 6, color: 'efe', caso: 'Préstamo de un libro en la biblioteca',
    titulo: 'Modela el proceso', sub: 'Diagramas BPMN, como en Bizagi',
    lema: 'Un buen diagrama muestra quién hace qué, en qué orden y qué se decide.',
    insignia: 'Modelador de procesos',
    dice: 'Ahora dibujamos el proceso, como lo hacemos en Bizagi: cada símbolo tiene un significado.',
    fichas: [
      {
        titulo: 'Modelar = dibujar el proceso', concepto: true,
        texto: 'Bizagi Modeler es una herramienta para dibujar procesos con la notación BPMN. Con el diagrama, el analista muestra quién hace cada tarea, en qué orden y qué decisiones hay.',
        frase: 'Si lo puedes dibujar, lo entendiste.',
      },
      {
        titulo: 'Los símbolos básicos de BPMN',
        filas: [
          ['Evento de inicio', 'Círculo de borde delgado: dónde empieza el proceso.', 'efe'],
          ['Tarea', 'Rectángulo redondeado: una actividad que alguien hace.', 'pro'],
          ['Compuerta exclusiva', 'Rombo con una X: una decisión; se sigue por un solo camino.', 'sis'],
          ['Evento de fin', 'Círculo de borde grueso: dónde termina el proceso.', 'act'],
          ['Flujo de secuencia', 'Flecha: el orden en que pasan las cosas.', 'dat'],
        ],
      },
      {
        titulo: 'Carriles: cada actor tiene su franja',
        texto: 'El proceso completo va dentro de un pool (la piscina). El pool se divide en carriles: un carril por cada actor o rol. Cada tarea se dibuja en el carril de quien la hace.',
        dos: {
          si: ['Carril Estudiante', 'Pedir el libro · Hacer una reserva'],
          no: ['Carril Bibliotecario', 'Buscar el libro · Prestar el libro'],
        },
      },
      {
        titulo: 'Así se conecta con lo que ya sabes',
        filas: [
          ['Carriles', 'Son los actores: ¿quién participa?', 'act'],
          ['Tareas', 'Son los procesos: ¿qué se hace?', 'pro'],
          ['Compuertas', 'Son las decisiones: el camino cambia según una condición.', 'sis'],
          ['Flechas', 'Son el orden: el flujo de entrada a salida.', 'dat'],
        ],
      },
    ],
    juego: { tipo: 'bpmn', titulo: 'Modela el préstamo de un libro' },
    preguntas: [
      { q: 'En un diagrama BPMN, ¿qué representa un carril?', ok: 'El actor o rol que hace esas tareas', mal: ['Un dato del sistema', 'El orden de las tareas', 'Una decisión'], por: 'Cada tarea va en el carril de quien la hace.' },
      { q: '¿Qué símbolo se usa para una decisión?', ok: 'La compuerta exclusiva: un rombo con una X', mal: ['Un círculo delgado', 'Un rectángulo redondeado', 'Una flecha'], por: 'Desde la compuerta se sigue por un solo camino, según la condición.' },
      { q: '¿Qué muestra el flujo de secuencia (la flecha)?', ok: 'El orden en que se hacen las tareas', mal: ['Quién hace la tarea', 'Dónde termina el proceso', 'Los datos que se guardan'], por: 'Las flechas conectan los elementos en orden.' },
    ],
  },

  {
    id: 'control', n: 7, color: 'con', caso: 'Transporte urbano',
    titulo: 'Mecanismos de control', sub: '¿Cómo se evalúa el sistema?',
    lema: 'Medir, evaluar y corregir: así aprende un sistema.',
    insignia: 'Guardián del lazo',
    dice: '¿Cómo sabe un sistema que está fallando? Con control.',
    fichas: [
      {
        titulo: 'Control = evaluar y retroalimentar', concepto: true,
        flujo: ['Medir con indicadores', 'Evaluar contra reglas', 'Retroalimentar y corregir'],
      },
      {
        titulo: 'Ejemplo: las rutas de bus de la ciudad',
        filas: [
          ['Indicador', 'Minutos de espera en el paradero.', 'con'],
          ['Regla', 'Entre un bus y otro no deben pasar más de 15 minutos.', 'con'],
          ['Retroalimentación', 'Si se pasa, se ajusta la frecuencia de la ruta.', 'con'],
          ['Normativa', 'Las reglas de la autoridad de tránsito.', 'con'],
        ],
      },
      {
        titulo: 'Control débil: existe en el papel',
        texto: 'A veces la norma existe, pero nadie mide ni corrige. Entonces el control opera de manera débil y el sistema repite su falla.',
        frase: 'Sin medición no hay forma de evaluar el sistema.',
      },
      {
        titulo: 'Sin retroalimentación, el sistema no aprende',
        texto: 'Si las quejas de los pasajeros no se registran, el sistema no detecta su propia falla.',
      },
    ],
    juego: {
      tipo: 'relampago', titulo: 'Ronda relámpago: ¿verdadero o falso?', segundos: 10,
      items: [
        { t: 'Un indicador sirve para medir cómo funciona el sistema.', v: true, por: 'Sin indicadores no hay forma de evaluar.' },
        { t: 'Si existe una norma, el control ya funciona perfecto.', v: false, por: 'El control puede existir en el papel y operar débil.' },
        { t: '"Minutos de espera en el paradero" es un indicador.', v: true, por: 'Se mide y permite evaluar el servicio.' },
        { t: 'Retroalimentar es usar lo medido para corregir el proceso.', v: true, por: 'Así el sistema aprende de su falla.' },
        { t: 'Si las quejas no se registran, el sistema detecta solo su falla.', v: false, por: 'Sin registro no hay retroalimentación.' },
        { t: 'El control responde la pregunta "¿quién participa?".', v: false, por: 'Control responde "¿cómo se evalúa?".' },
        { t: 'Una regla dice contra qué se compara lo medido.', v: true, por: 'Medir → evaluar contra reglas → corregir.' },
        { t: 'Comprar más buses es un mecanismo de control.', v: false, por: 'Eso sería una acción o solución, no la evaluación del sistema.' },
      ],
    },
    preguntas: [
      { q: '¿Cuál es el orden del lazo de control?', ok: 'Medir → evaluar contra reglas → retroalimentar y corregir', mal: ['Corregir → medir → evaluar', 'Evaluar → comprar → medir', 'Medir → vender → olvidar'], por: 'Primero se mide, luego se compara con la regla y al final se corrige.' },
      { q: '"La norma existe, pero nadie mide ni corrige" describe…', ok: 'Un control débil', mal: ['Un control perfecto', 'Un actor', 'Una entrada'], por: 'El lazo existe en el papel, pero no mide ni corrige.' },
      { q: '¿Qué pregunta responde la columna de control?', ok: '¿Cómo se evalúa?', mal: ['¿Quién participa?', '¿Qué se hace?', '¿Qué información hay?'], por: 'A-D-P-C: Control = ¿cómo se evalúa?' },
    ],
  },

  {
    id: 'arbol', n: 8, color: 'efe', caso: 'Citas del consultorio médico',
    titulo: 'Árbol de problemas', sub: 'Raíces, tronco y copa',
    lema: 'Porque pasa esto, ocurre esto, y eso genera esto.',
    insignia: 'Jardinero del problema',
    dice: 'Con todo lo aprendido armamos el árbol de problemas: causas, problema central y efectos.',
    fichas: [
      {
        titulo: 'Un árbol con tres partes y un suelo', concepto: true,
        filas: [
          ['Copa = efectos', 'Lo que el problema produce.', 'efe'],
          ['Tronco = problema central', 'Una sola situación negativa.', 'sis'],
          ['Raíces = causas', 'Por qué ocurre el problema.', 'pro'],
          ['Suelo = entorno', 'Lo condiciona, pero no se controla.', 'env'],
        ],
      },
      {
        titulo: 'El tronco: una situación negativa',
        dos: {
          si: ['Bien formulado', '"Los pacientes esperan semanas para conseguir una cita."'],
          no: ['Mal formulado', '"Falta una aplicación para pedir citas." Eso ya es una solución.'],
        },
        frase: 'Un problema bien formulado no contiene su solución.',
      },
      {
        titulo: 'Se lee de abajo hacia arriba',
        flujo: ['Causa (raíz)', 'Problema central (tronco)', 'Efectos (copa)'],
        frase: '"Porque pasa esto (raíz), ocurre esto (tronco), y eso genera esto (copa)."',
      },
      {
        titulo: 'Las 4 columnas recorren el árbol',
        texto: 'Las causas se ordenan por los componentes del sistema. Truco A-D-P-C: Actores, Datos, Procesos y Control. La copa tiene efectos directos, indirectos y un efecto final.',
        filas: [
          ['Actores', 'Una sola persona agenda, confirma y cobra.', 'act'],
          ['Datos', 'Las citas se anotan en un cuaderno y se cruzan.', 'dat'],
          ['Procesos', 'Las citas canceladas no se reasignan.', 'pro'],
          ['Control', 'Nadie mide cuántos pacientes no llegan.', 'con'],
        ],
      },
    ],
    juego: {
      tipo: 'arbol', titulo: 'Haz crecer el árbol del consultorio',
      troncos: [
        { t: 'Los pacientes esperan semanas para conseguir una cita', ok: true, por: 'Es una sola situación negativa, dicha en términos del sistema.' },
        { t: 'Falta una aplicación para pedir citas', ok: false, por: 'Eso ya es una solución: el tronco describe el problema, no lo que falta construir.' },
        { t: 'Los pacientes se quejan en redes sociales', ok: false, por: 'Eso es algo que el problema produce: es un efecto (copa).' },
        { t: 'La recepcionista anota las citas en un cuaderno', ok: false, por: 'Eso explica por qué pasa: es una causa (raíz).' },
      ],
      piezas: [
        { t: 'Una sola persona agenda, confirma y cobra', zona: 'raiz', comp: 'act', por: 'Explica por qué pasa: causa de actores.' },
        { t: 'Las citas se anotan en un cuaderno y se cruzan', zona: 'raiz', comp: 'dat', por: 'Causa de datos: la información no se relaciona.' },
        { t: 'Las citas canceladas no se reasignan', zona: 'raiz', comp: 'pro', por: 'Causa de procesos: una tarea que no se hace.' },
        { t: 'Nadie mide cuántos pacientes no llegan', zona: 'raiz', comp: 'con', por: 'Causa de control: no hay indicador.' },
        { t: 'Los médicos tienen horas vacías mientras hay espera', zona: 'copa', por: 'Es algo que el problema produce: efecto.' },
        { t: 'Las enfermedades se complican por la espera', zona: 'copa', por: 'Consecuencia del problema: efecto.' },
        { t: 'El consultorio pierde pacientes', zona: 'copa', por: 'Es el efecto final hacia donde todo lleva.' },
        { t: 'Temporada de gripa que sube la demanda', zona: 'suelo', por: 'Condiciona al sistema, pero no se controla desde él: entorno.' },
        { t: 'Normas de la Secretaría de Salud', zona: 'suelo', por: 'La norma se recibe, no se decide dentro del consultorio: entorno.' },
      ],
    },
    preguntas: [
      { q: '¿Qué va en el TRONCO del árbol?', ok: 'El problema central: una sola situación negativa', mal: ['Las causas', 'La solución', 'Los efectos'], por: 'Una sola situación negativa, dicha en términos del sistema.' },
      { q: '¿Cómo se lee el árbol de problemas?', ok: 'De abajo hacia arriba: causas → problema → efectos', mal: ['De arriba hacia abajo', 'De izquierda a derecha', 'En cualquier orden'], por: '"Porque pasa esto (raíz), ocurre esto (tronco), y eso genera esto (copa)".' },
      { q: '¿Por qué "falta una app" NO sirve como problema central?', ok: 'Porque ya es una solución; el problema se describe en el sistema real', mal: ['Porque las apps son caras', 'Porque no hay internet', 'Sí sirve'], por: 'Un problema bien formulado no contiene su solución.' },
    ],
  },

  {
    id: 'entorno', n: 9, color: 'env', caso: 'Tienda en línea',
    titulo: 'El entorno', sub: 'Lo que condiciona pero no se controla',
    lema: 'El entorno condiciona al sistema, pero no se controla desde él.',
    insignia: 'Vigía del entorno',
    dice: 'Hay cosas que pesan sobre el sistema pero que el sistema no puede cambiar.',
    fichas: [
      {
        titulo: 'Entorno: afuera, pero pesa', concepto: true,
        texto: 'El entorno es todo lo que condiciona al sistema pero no se controla desde él. En el árbol va en el suelo, en una franja punteada.',
      },
      {
        titulo: 'Ejemplo: el entorno de una tienda en línea',
        filas: [
          ['Clima', 'Las lluvias cierran carreteras y retrasan los envíos.', 'env'],
          ['Economía', 'El precio del dólar sube el costo de los productos.', 'env'],
          ['Normas', 'La ley de protección al consumidor.', 'env'],
          ['Infraestructura', 'La conectividad de cada región.', 'env'],
        ],
      },
      {
        titulo: 'Pregunta trampa',
        dos: {
          si: ['Entorno', '"Las lluvias cierran la vía": la tienda no lo controla.'],
          no: ['Causa interna', '"Nadie registra cuándo sale cada pedido": eso sí depende del sistema.'],
        },
        frase: '¿Lo puede cambiar el sistema? Si no, es entorno.',
      },
    ],
    juego: {
      tipo: 'lupa', titulo: 'Con la lupa: toca SOLO las del entorno', pista: 'Hay 5 del entorno. Las demás son causas dentro del sistema.',
      items: [
        { t: 'Las lluvias cierran la carretera', sel: true, por: 'La tienda no controla el clima.' },
        { t: 'Nadie registra cuándo sale cada pedido', sel: false, por: 'Es una causa de datos dentro del sistema.' },
        { t: 'Sube el precio del dólar', sel: true, por: 'La economía condiciona, pero no se controla desde la tienda.' },
        { t: 'Una sola persona empaca todos los pedidos', sel: false, por: 'Es una causa de actores: la tienda sí puede organizarlo.' },
        { t: 'Ley de protección al consumidor', sel: true, por: 'La norma se recibe, no se decide dentro del sistema.' },
        { t: 'El inventario de la web no coincide con la bodega', sel: false, por: 'Es una causa de datos interna.' },
        { t: 'Paro de transportadores en la vía', sel: true, por: 'Pasa afuera y el sistema no lo controla.' },
        { t: 'Nadie revisa las quejas de los clientes', sel: false, por: 'Es una causa de control: falta retroalimentación.' },
        { t: 'Conectividad débil en algunos municipios', sel: true, por: 'La infraestructura de conectividad está fuera del sistema.' },
      ],
    },
    preguntas: [
      { q: '¿Qué es el entorno?', ok: 'Lo que condiciona al sistema pero no se controla desde él', mal: ['Una causa interna', 'El efecto final', 'El problema central'], por: 'Va en la franja punteada del suelo.' },
      { q: '¿Por qué la conectividad de una región NO es una causa del árbol?', ok: 'Porque es entorno: condiciona, pero el sistema no la controla', mal: ['Porque no importa', 'Porque es un efecto', 'Porque es un actor'], por: 'La infraestructura de conectividad está fuera del sistema.' },
      { q: '¿Cuál de estas SÍ es una causa dentro del sistema?', ok: 'Nadie revisa las quejas de los clientes', mal: ['Las lluvias de la temporada', 'El precio del dólar', 'Una ley nacional'], por: 'Revisar quejas depende del sistema: es control.' },
    ],
  },

  {
    id: 'factibilidad', n: 10, color: 'dat', caso: 'Propuesta: agenda compartida del consultorio',
    titulo: 'Factibilidad y viabilidad', sub: '¿Se puede hacer? ¿Vale la pena?',
    lema: 'Factible: se puede. Viable: conviene y dura.',
    insignia: 'Juez de propuestas',
    dice: 'Ahora sí miramos la propuesta: ¿se puede hacer? ¿vale la pena?',
    fichas: [
      {
        titulo: 'Ahora sí: mirar la propuesta', concepto: true,
        filas: [
          ['Factibilidad', '¿Se PUEDE hacer con los recursos, la tecnología, las personas y las leyes que hay?', 'dat'],
          ['Viabilidad', '¿VALE LA PENA y se SOSTIENE en el tiempo? ¿Hay necesidad real, es el momento, tiene impacto?', 'act'],
        ],
        frase: 'Truco: factible = se puede · viable = conviene y dura.',
      },
      {
        titulo: 'La factibilidad se revisa en cuatro partes',
        filas: [
          ['Técnica', '¿Hay datos y tecnología para hacerlo?', 'dat'],
          ['Operativa', '¿La gente lo usaría y lo podría manejar?', 'act'],
          ['Económica', '¿Cuesta menos de lo que ahorra o de lo que hoy se pierde?', 'pro'],
          ['Legal', '¿Lo permite la ley?', 'con'],
        ],
      },
      {
        titulo: 'Ejemplo: una agenda compartida para el consultorio',
        filas: [
          ['Técnica', 'El consultorio tiene computador e internet; las citas pueden pasar del cuaderno a un registro.', 'dat'],
          ['Operativa', 'La recepcionista necesita aprender a usarla; los pacientes mayores deben poder pedir cita por teléfono.', 'act'],
          ['Económica', 'Cuesta menos que las citas que hoy se pierden.', 'pro'],
          ['Legal', 'Los datos de salud se protegen con la Ley 1581 de 2012 (habeas data).', 'con'],
        ],
      },
      {
        titulo: 'Y la viabilidad',
        filas: [
          ['Necesidad real', 'Los pacientes esperan semanas.', 'efe'],
          ['Se sostiene', 'Alguien la mantiene al día dentro de 3 años.', 'efe'],
          ['Riesgos', 'Que nadie la actualice o que la gente no confíe.', 'efe'],
        ],
      },
    ],
    juego: {
      tipo: 'cubetas', titulo: '¿Qué estudio revisa cada pregunta?',
      cubetas: [
        { id: 'tec', n: 'Técnica', c: 'dat' },
        { id: 'ope', n: 'Operativa', c: 'act' },
        { id: 'eco', n: 'Económica', c: 'pro' },
        { id: 'leg', n: 'Legal', c: 'con' },
        { id: 'via', n: 'Viabilidad', c: 'efe' },
      ],
      items: [
        { t: '¿El consultorio tiene computador e internet estables?', b: 'tec', por: 'Pregunta por la tecnología disponible.' },
        { t: '¿La recepcionista sabría usarla sin ayuda?', b: 'ope', por: 'Pregunta si la gente la puede manejar.' },
        { t: '¿Cuesta menos que las citas que hoy se pierden?', b: 'eco', por: 'Compara el costo con lo que se ahorra.' },
        { t: '¿Protege los datos de los pacientes según la Ley 1581?', b: 'leg', por: 'Pregunta si lo permite la ley.' },
        { t: '¿Los pacientes de verdad la necesitan?', b: 'via', por: 'Necesidad real: viabilidad.' },
        { t: '¿Se pueden pasar las citas del cuaderno a un registro digital?', b: 'tec', por: 'Pregunta por datos y tecnología.' },
        { t: '¿Los pacientes mayores podrán pedir su cita?', b: 'ope', por: 'Pregunta si la gente lo usaría.' },
        { t: '¿Cuánto vale instalarla y mantenerla al año?', b: 'eco', por: 'Es el costo: factibilidad económica.' },
        { t: '¿Cumple las normas de la Secretaría de Salud?', b: 'leg', por: 'Es una pregunta legal.' },
        { t: '¿Seguirá funcionando dentro de 3 años?', b: 'via', por: 'Que se sostenga en el tiempo: viabilidad.' },
      ],
    },
    preguntas: [
      { q: '¿Qué pregunta la factibilidad?', ok: '¿Se puede hacer con los recursos, la tecnología, las personas y las leyes que hay?', mal: ['¿Quién tiene la culpa del problema?', '¿Cuál es el efecto final?', '¿Dónde va el entorno?'], por: 'Factible = se puede hacer.' },
      { q: '¿Qué pregunta la viabilidad?', ok: '¿Vale la pena y se sostiene en el tiempo?', mal: ['¿Cuántos actores hay?', '¿Qué dato falta?', '¿Cómo se lee el árbol?'], por: 'Viable = conviene y dura.' },
      { q: '"¿La gente lo usaría y lo podría manejar?" es factibilidad…', ok: 'Operativa', mal: ['Técnica', 'Económica', 'Legal'], por: 'Operativa mira a las personas que lo van a usar.' },
    ],
  },

  {
    id: 'reto', n: 11, color: 'sis', caso: 'Un caso nuevo, al azar',
    titulo: 'Reto final', sub: 'Un caso nuevo y tu certificado',
    lema: 'Ya piensas como analista. Demuéstralo.',
    insignia: 'Analista certificado',
    dice: 'Último reto: un caso que no has visto. ¡Tú puedes!',
    fichas: [
      {
        titulo: 'El reto final', concepto: true,
        texto: 'Te toca un caso que no has visto. Vas a usar todo: el problema central, las causas, los efectos, el entorno, los componentes A-D-P-C y la factibilidad.',
        frase: 'Si lo superas, recibes tu certificado de analista.',
      },
    ],
    juego: { tipo: 'final' },
    preguntas: [],
  },
];
