// casos.ts
// Casos del reto final. A cada jugador le toca uno al azar, distinto de los que vio en los capítulos.
// Cada caso trae su problema central (y tres distractores), piezas para clasificar como causa,
// efecto o entorno, causas para ubicar en A-D-P-C y dos preguntas de factibilidad.

export type CasoFinal = {
  id: string;
  nombre: string;
  descripcion: string;
  troncos: { t: string; ok: boolean; por: string }[];
  piezas: { t: string; zona: 'causa' | 'efecto' | 'entorno' }[];
  causas: { t: string; comp: 'act' | 'dat' | 'pro' | 'con' }[];
  estudios: { t: string; b: 'tec' | 'ope' | 'eco' | 'leg' | 'via' }[];
};

export const CASOS: CasoFinal[] = [
  {
    id: 'biblioteca', nombre: 'Biblioteca universitaria',
    descripcion: 'Los estudiantes piden libros para sus parciales, pero muchos libros no aparecen cuando se necesitan.',
    troncos: [
      { t: 'Los estudiantes no consiguen a tiempo los libros que necesitan', ok: true, por: 'Una sola situación negativa, en términos del sistema.' },
      { t: 'Falta un catálogo en línea', ok: false, por: 'Es una solución, no el problema.' },
      { t: 'Los estudiantes pierden los parciales', ok: false, por: 'Es un efecto del problema.' },
      { t: 'Los préstamos se anotan en fichas de papel', ok: false, por: 'Es una causa.' },
    ],
    piezas: [
      { t: 'Los préstamos se anotan en fichas de papel', zona: 'causa' },
      { t: 'Nadie revisa qué libros están vencidos', zona: 'causa' },
      { t: 'Los estudiantes sacan fotocopias de otros lados', zona: 'efecto' },
      { t: 'Baja el uso de la biblioteca', zona: 'efecto' },
      { t: 'Semana de parciales que multiplica la demanda', zona: 'entorno' },
      { t: 'El presupuesto nacional para universidades', zona: 'entorno' },
    ],
    causas: [
      { t: 'Un solo bibliotecario atiende toda la sede', comp: 'act' },
      { t: 'Los préstamos se anotan en fichas de papel', comp: 'dat' },
      { t: 'Las reservas no tienen un orden de turno', comp: 'pro' },
      { t: 'Nadie revisa qué libros están vencidos', comp: 'con' },
    ],
    estudios: [
      { t: '¿La biblioteca tiene computadores para registrar los préstamos?', b: 'tec' },
      { t: '¿Los bibliotecarios aceptarían cambiar su forma de trabajo?', b: 'ope' },
    ],
  },
  {
    id: 'cafeteria', nombre: 'Cafetería universitaria',
    descripcion: 'A mediodía la cafetería se llena y muchos estudiantes se van sin almorzar.',
    troncos: [
      { t: 'Los estudiantes esperan demasiado para recibir su almuerzo', ok: true, por: 'Una sola situación negativa, en términos del sistema.' },
      { t: 'Falta una app para pedir el almuerzo', ok: false, por: 'Es una solución, no el problema.' },
      { t: 'Los estudiantes llegan tarde a clase', ok: false, por: 'Es un efecto del problema.' },
      { t: 'Una sola caja cobra todos los pedidos', ok: false, por: 'Es una causa.' },
    ],
    piezas: [
      { t: 'Una sola caja cobra todos los pedidos', zona: 'causa' },
      { t: 'Nadie mide el tiempo de espera', zona: 'causa' },
      { t: 'Los estudiantes llegan tarde a clase', zona: 'efecto' },
      { t: 'La cafetería pierde ventas', zona: 'efecto' },
      { t: 'Todos los horarios de clase terminan a la misma hora', zona: 'entorno' },
      { t: 'Sube el precio de los alimentos en el país', zona: 'entorno' },
    ],
    causas: [
      { t: 'Una sola persona cobra y entrega', comp: 'act' },
      { t: 'No se sabe cuántos almuerzos se venden cada día', comp: 'dat' },
      { t: 'Se cocina todo después de que llega el pedido', comp: 'pro' },
      { t: 'Nadie mide el tiempo de espera', comp: 'con' },
    ],
    estudios: [
      { t: '¿Cuesta menos que las ventas que hoy se pierden?', b: 'eco' },
      { t: '¿Cumple las normas de manipulación de alimentos?', b: 'leg' },
    ],
  },
  {
    id: 'tienda', nombre: 'Tienda en línea de ropa',
    descripcion: 'La tienda vende por internet, pero cada mes crecen las devoluciones y los reclamos.',
    troncos: [
      { t: 'Los clientes reciben pedidos equivocados o tarde', ok: true, por: 'Una sola situación negativa, en términos del sistema.' },
      { t: 'Falta un programa de inventario', ok: false, por: 'Es una solución, no el problema.' },
      { t: 'La tienda recibe malas calificaciones', ok: false, por: 'Es un efecto del problema.' },
      { t: 'El inventario de la web no coincide con la bodega', ok: false, por: 'Es una causa.' },
    ],
    piezas: [
      { t: 'El inventario de la web no coincide con la bodega', zona: 'causa' },
      { t: 'Nadie revisa por qué devuelven los productos', zona: 'causa' },
      { t: 'La tienda recibe malas calificaciones', zona: 'efecto' },
      { t: 'Aumentan los costos de envío por devoluciones', zona: 'efecto' },
      { t: 'Las lluvias cierran las carreteras', zona: 'entorno' },
      { t: 'La ley de protección al consumidor', zona: 'entorno' },
    ],
    causas: [
      { t: 'Una sola persona empaca todos los pedidos', comp: 'act' },
      { t: 'El inventario de la web no coincide con la bodega', comp: 'dat' },
      { t: 'Los pedidos se empacan sin revisar la talla', comp: 'pro' },
      { t: 'Nadie revisa por qué devuelven los productos', comp: 'con' },
    ],
    estudios: [
      { t: '¿Se pueden conectar los datos de la web con los de la bodega?', b: 'tec' },
      { t: '¿Vale la pena y se sostiene si crecen las ventas?', b: 'via' },
    ],
  },
  {
    id: 'transporte', nombre: 'Transporte urbano',
    descripcion: 'En los paraderos de la ciudad la gente espera mucho y los buses pasan llenos.',
    troncos: [
      { t: 'Los pasajeros esperan demasiado el bus en los paraderos', ok: true, por: 'Una sola situación negativa, en términos del sistema.' },
      { t: 'Falta una app que muestre dónde va el bus', ok: false, por: 'Es una solución, no el problema.' },
      { t: 'La gente llega tarde al trabajo', ok: false, por: 'Es un efecto del problema.' },
      { t: 'Nadie registra a qué hora pasa cada bus', ok: false, por: 'Es una causa.' },
    ],
    piezas: [
      { t: 'Nadie registra a qué hora pasa cada bus', zona: 'causa' },
      { t: 'Las quejas de los pasajeros no se revisan', zona: 'causa' },
      { t: 'La gente llega tarde al trabajo', zona: 'efecto' },
      { t: 'Más personas usan moto o mototaxi', zona: 'efecto' },
      { t: 'Obras en las vías principales', zona: 'entorno' },
      { t: 'El precio de la gasolina', zona: 'entorno' },
    ],
    causas: [
      { t: 'Cada conductor decide cuándo sale', comp: 'act' },
      { t: 'Nadie registra a qué hora pasa cada bus', comp: 'dat' },
      { t: 'Las rutas no se ajustan en horas pico', comp: 'pro' },
      { t: 'Las quejas de los pasajeros no se revisan', comp: 'con' },
    ],
    estudios: [
      { t: '¿Los conductores aceptarían cumplir un horario?', b: 'ope' },
      { t: '¿Lo permiten las normas de la autoridad de tránsito?', b: 'leg' },
    ],
  },
  {
    id: 'matricula', nombre: 'Matrícula académica',
    descripcion: 'Cada semestre muchos estudiantes quedan sin las materias que necesitan.',
    troncos: [
      { t: 'Los estudiantes no logran inscribir las materias que necesitan', ok: true, por: 'Una sola situación negativa, en términos del sistema.' },
      { t: 'Falta una página web de matrícula más rápida', ok: false, por: 'Es una solución, no el problema.' },
      { t: 'Los estudiantes se atrasan en la carrera', ok: false, por: 'Es un efecto del problema.' },
      { t: 'Los cupos se calculan con datos del semestre pasado', ok: false, por: 'Es una causa.' },
    ],
    piezas: [
      { t: 'Los cupos se calculan con datos del semestre pasado', zona: 'causa' },
      { t: 'Nadie mide cuántos se quedan sin cupo', zona: 'causa' },
      { t: 'Los estudiantes se atrasan en la carrera', zona: 'efecto' },
      { t: 'Aumentan las solicitudes de cupo extra', zona: 'efecto' },
      { t: 'El calendario académico que fija el Ministerio', zona: 'entorno' },
      { t: 'Los cortes de energía en la ciudad', zona: 'entorno' },
    ],
    causas: [
      { t: 'Un solo funcionario resuelve todas las solicitudes', comp: 'act' },
      { t: 'Los cupos se calculan con datos del semestre pasado', comp: 'dat' },
      { t: 'La validación de requisitos se hace a mano, caso por caso', comp: 'pro' },
      { t: 'Nadie mide cuántos se quedan sin cupo', comp: 'con' },
    ],
    estudios: [
      { t: '¿Cuánto cuesta frente a los semestres que hoy se pierden?', b: 'eco' },
      { t: '¿Hay necesidad real y se sostiene cada semestre?', b: 'via' },
    ],
  },
];

export const ESTUDIOS = [
  { id: 'tec', n: 'Técnica' },
  { id: 'ope', n: 'Operativa' },
  { id: 'eco', n: 'Económica' },
  { id: 'leg', n: 'Legal' },
  { id: 'via', n: 'Viabilidad' },
] as const;
