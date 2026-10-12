// Composición 360°: azimut 0° al frente, positivo a la derecha; elevación sobre el horizonte.
function calcularPosicionCeleste(azimuth, elevation, distance) {
  const az = azimuth * Math.PI / 180, el = elevation * Math.PI / 180;
  return [distance * Math.cos(el) * Math.sin(az), distance * Math.sin(el), -distance * Math.cos(el) * Math.cos(az)];
}

export const celestialBodies = [
  {
    id: 'saturn', name: 'Saturno', subtitle: 'El señor de los anillos', kind: 'planet', category: 'Gigante gaseoso', order: 6,
    color: '#cbb18a', position: calcularPosicionCeleste(12, 2, 29), radius: 4.1,
    description: 'Un mundo tan ligero que flotaría en el agua. Sus miles de anillos están formados por fragmentos de hielo y roca: algunos tan pequeños como un grano de polvo y otros del tamaño de una montaña.',
    facts: [{ label: 'Diámetro', value: '116.460', unit: 'km' }, { label: 'Distancia al Sol', value: '1.434', unit: 'millones de km' }, { label: 'Un día dura', value: '10,7', unit: 'horas' }, { label: 'Un año dura', value: '29,4', unit: 'años terrestres' }],
    curiosity: 'Sus anillos se extienden unos 282.000 km, pero los principales apenas tienen decenas de metros de grosor.', source: 'https://science.nasa.gov/saturn/'
  },
  {
    id: 'earth', name: 'La Tierra', subtitle: 'Nuestro pequeño punto azul', kind: 'planet', category: 'Planeta terrestre', order: 3,
    color: '#73b4cb', position: calcularPosicionCeleste(-24, 6, 34), radius: 1.8,
    description: 'Entre miles de millones de estrellas, este es nuestro hogar. Océanos, continentes y una delicada atmósfera hacen de la Tierra el único mundo en el que, hasta ahora, conocemos la existencia de vida.',
    facts: [{ label: 'Diámetro', value: '12.742', unit: 'km' }, { label: 'Distancia al Sol', value: '149,6', unit: 'millones de km' }, { label: 'Un día dura', value: '23,9', unit: 'horas' }, { label: 'Un año dura', value: '365,25', unit: 'días' }],
    curiosity: 'La luz del Sol tarda aproximadamente 8 minutos y 20 segundos en llegar a la Tierra.', source: 'https://science.nasa.gov/earth/'
  },
  {
    id: 'mars', name: 'Marte', subtitle: 'El siguiente gran paso', kind: 'planet', category: 'Planeta terrestre', order: 4,
    color: '#bf795d', position: calcularPosicionCeleste(48, -22, 36), radius: 1.15,
    description: 'El planeta rojo guarda las huellas de antiguos ríos y lagos. Hoy es un desierto frío, con tormentas de polvo, cañones gigantes y el volcán más alto del sistema solar.',
    facts: [{ label: 'Diámetro', value: '6.779', unit: 'km' }, { label: 'Distancia al Sol', value: '227,9', unit: 'millones de km' }, { label: 'Un día dura', value: '24,6', unit: 'horas' }, { label: 'Un año dura', value: '687', unit: 'días terrestres' }],
    curiosity: 'El monte Olimpo alcanza unos 22 km de altura, casi tres veces la altura del Everest.', source: 'https://science.nasa.gov/mars/'
  },
  {
    id: 'jupiter', name: 'Júpiter', subtitle: 'Un gigante entre mundos', kind: 'planet', category: 'Gigante gaseoso', order: 5,
    color: '#c4a58b', position: calcularPosicionCeleste(84, 18, 42), radius: 2.65,
    description: 'Júpiter es más masivo que todos los demás planetas juntos. Sus nubes forman bandas de colores y gigantescas tormentas, incluida la Gran Mancha Roja, que lleva siglos girando.',
    facts: [{ label: 'Diámetro', value: '139.820', unit: 'km' }, { label: 'Distancia al Sol', value: '778,6', unit: 'millones de km' }, { label: 'Un día dura', value: '9,9', unit: 'horas' }, { label: 'Un año dura', value: '11,9', unit: 'años terrestres' }],
    curiosity: 'Su luna Europa esconde un océano de agua líquida bajo una corteza de hielo.', source: 'https://science.nasa.gov/jupiter/'
  },
  {
    id: 'neptune', name: 'Neptuno', subtitle: 'En los confines del sistema solar', kind: 'planet', category: 'Gigante de hielo', order: 8,
    color: '#688dbd', position: calcularPosicionCeleste(-96, 24, 38), radius: 1.4,
    description: 'Oscuro, frío y azotado por vientos supersónicos, Neptuno orbita en la región más lejana de los ocho planetas. Su atmósfera de hidrógeno, helio y metano le da su tono azulado.',
    facts: [{ label: 'Diámetro', value: '49.244', unit: 'km' }, { label: 'Distancia al Sol', value: '4.495', unit: 'millones de km' }, { label: 'Un día dura', value: '16,1', unit: 'horas' }, { label: 'Un año dura', value: '165', unit: 'años terrestres' }],
    curiosity: 'Fue el primer planeta localizado mediante predicciones matemáticas antes de ser observado con un telescopio.', source: 'https://science.nasa.gov/neptune/'
  },
  {
    id: 'mercury', name: 'Mercurio', subtitle: 'El viajero más veloz', kind: 'planet', category: 'Planeta terrestre', order: 1,
    color: '#aaa49a', position: calcularPosicionCeleste(-168, -28, 34), radius: 0.85,
    description: 'El planeta más pequeño y cercano al Sol es un mundo de cráteres. Sin una atmósfera significativa que conserve el calor, sus temperaturas cambian drásticamente entre el día y la noche.',
    facts: [{ label: 'Diámetro', value: '4.879', unit: 'km' }, { label: 'Distancia al Sol', value: '57,9', unit: 'millones de km' }, { label: 'Un día solar dura', value: '176', unit: 'días terrestres' }, { label: 'Un año dura', value: '88', unit: 'días terrestres' }],
    curiosity: 'A pesar de estar tan cerca del Sol, algunos cráteres de sus polos contienen hielo.', source: 'https://science.nasa.gov/mercury/'
  },
  {
    id: 'venus', name: 'Venus', subtitle: 'Belleza bajo las nubes', kind: 'planet', category: 'Planeta terrestre', order: 2,
    color: '#d6ba7e', position: calcularPosicionCeleste(120, -15, 38), radius: 1.6,
    description: 'Un espeso manto de nubes oculta el planeta más caliente del sistema solar. Su atmósfera retiene el calor en un intenso efecto invernadero y ejerce una presión enorme sobre la superficie.',
    facts: [{ label: 'Diámetro', value: '12.104', unit: 'km' }, { label: 'Distancia al Sol', value: '108,2', unit: 'millones de km' }, { label: 'Rotación', value: '243', unit: 'días terrestres' }, { label: 'Temperatura media', value: '464', unit: '°C' }],
    curiosity: 'Venus gira en sentido contrario al de la mayoría de los planetas: allí el Sol sale por el oeste.', source: 'https://science.nasa.gov/venus/'
  },
  {
    id: 'uranus', name: 'Urano', subtitle: 'El planeta que gira de lado', kind: 'planet', category: 'Gigante de hielo', order: 7,
    color: '#9cc8c8', position: calcularPosicionCeleste(-132, -6, 39), radius: 2,
    description: 'Este gigante de hielo tiene una atmósfera suave de color azul verdoso. Su eje está tan inclinado que parece rodar alrededor del Sol, dando lugar a estaciones extremas.',
    facts: [{ label: 'Diámetro', value: '50.724', unit: 'km' }, { label: 'Distancia al Sol', value: '2.871', unit: 'millones de km' }, { label: 'Un día dura', value: '17,2', unit: 'horas' }, { label: 'Un año dura', value: '84', unit: 'años terrestres' }],
    curiosity: 'Su eje de rotación está inclinado unos 98 grados: durante parte de su órbita, un polo apunta casi directamente al Sol.', source: 'https://science.nasa.gov/uranus/'
  },
  {
    id: 'moon', name: 'La Luna', subtitle: 'Nuestra compañera de viaje', kind: 'satellite', category: 'Satélite natural', order: 9,
    color: '#b6b7b6', position: calcularPosicionCeleste(-60, -18, 34), radius: 1,
    description: 'La Luna acompaña a la Tierra desde hace miles de millones de años. Sus llanuras oscuras son antiguos mares de lava y sus cráteres conservan la historia de impactos del sistema solar.',
    facts: [{ label: 'Diámetro', value: '3.475', unit: 'km' }, { label: 'Distancia a la Tierra', value: '384.400', unit: 'km' }, { label: 'Órbita', value: '27,3', unit: 'días terrestres' }, { label: 'Gravedad', value: '1,62', unit: 'm/s²' }],
    curiosity: 'Siempre vemos aproximadamente la misma cara de la Luna porque su rotación está sincronizada con su órbita.', source: 'https://science.nasa.gov/moon/'
  },
  {
    id: 'sun', name: 'El Sol', subtitle: 'La estrella que nos da la vida', kind: 'star', category: 'Estrella · Enana amarilla', order: 0,
    color: '#edb86a', position: calcularPosicionCeleste(156, 20, 50), radius: 5,
    description: 'En el corazón de nuestro sistema, el Sol transforma hidrógeno en helio mediante fusión nuclear. La energía liberada ilumina los planetas y hace posible la vida en la Tierra.',
    facts: [{ label: 'Diámetro', value: '1,39', unit: 'millones de km' }, { label: 'Edad', value: '4.600', unit: 'millones de años' }, { label: 'Superficie', value: '5.500', unit: '°C aprox.' }, { label: 'Tipo espectral', value: 'G2 V', unit: 'secuencia principal' }],
    curiosity: 'El Sol concentra aproximadamente el 99,8 % de toda la masa del sistema solar.', source: 'https://science.nasa.gov/sun/'
  }
];

export const constellations = [
  {
    id: 'orion', name: 'Orión', subtitle: 'El gran cazador del cielo', kind: 'constellation', category: 'Constelación', color: '#a8bfd3',
    position: calcularPosicionCeleste(-12, 42, 58), radius: 5,
    points: [[-4, 6, 0], [4, 5, 0], [1, 0, 0], [0, -.4, 0], [-1, -.8, 0], [-4, -7, 0], [5, -6, 0]],
    connections: [[0, 1], [0, 4], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [5, 6]],
    description: 'Una de las figuras más reconocibles del cielo. Tres estrellas alineadas forman el cinturón de Orión, rodeado por la supergigante roja Betelgeuse y la brillante Rigel.',
    facts: [{ label: 'Estrella destacada', value: 'Betelgeuse', unit: 'supergigante roja' }, { label: 'Estrella más brillante', value: 'Rigel', unit: 'supergigante azul' }, { label: 'Mejor temporada', value: 'Invierno', unit: 'hemisferio norte' }, { label: 'Objeto destacado', value: 'M42', unit: 'nebulosa de Orión' }],
    curiosity: 'La nebulosa de Orión es una enorme región donde están naciendo nuevas estrellas.', source: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-42/'
  },
  {
    id: 'ursa', name: 'Osa Mayor', subtitle: 'Una guía entre las estrellas', kind: 'constellation', category: 'Constelación', color: '#a8bfd3',
    position: calcularPosicionCeleste(110, 46, 62), radius: 6,
    points: [[-8, -1, 0], [-4, 0, 0], [0, -2, 0], [3, -3, 0], [7, -1, 0], [6, 3, 0], [1, 2, 0]],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 2]],
    description: 'La Osa Mayor alberga el famoso asterismo del Carro. Sus estrellas han guiado a viajeros durante siglos, y dos de ellas ayudan a encontrar la Estrella Polar.',
    facts: [{ label: 'Asterismo', value: 'El Carro', unit: '7 estrellas principales' }, { label: 'Estrella más brillante', value: 'Alioth', unit: 'Epsilon Ursae Majoris' }, { label: 'Región del cielo', value: 'Norte', unit: 'hemisferio celeste' }, { label: 'Mejor temporada', value: 'Primavera', unit: 'hemisferio norte' }],
    curiosity: 'Si prolongas la línea entre Merak y Dubhe unas cinco veces, encontrarás la Estrella Polar.', source: 'https://science.nasa.gov/solar-system/skywatching/'
  },
  {
    id: 'cassiopeia', name: 'Casiopea', subtitle: 'La reina de la noche', kind: 'constellation', category: 'Constelación', color: '#a8bfd3',
    position: calcularPosicionCeleste(-115, -48, 60), radius: 5,
    points: [[-7, 2, 0], [-3, -2, 0], [0, 1, 0], [3, -2, 0], [7, 3, 0]],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4]],
    description: 'Cinco estrellas dibujan una W en el cielo boreal. Casiopea es fácil de reconocer y, desde muchas latitudes del norte, permanece visible durante todo el año.',
    facts: [{ label: 'Forma característica', value: 'W', unit: '5 estrellas principales' }, { label: 'Estrella destacada', value: 'Schedar', unit: 'gigante naranja' }, { label: 'Región del cielo', value: 'Norte', unit: 'cerca de la Estrella Polar' }, { label: 'Mejor temporada', value: 'Otoño', unit: 'hemisferio norte' }],
    curiosity: 'Casiopea y el Carro de la Osa Mayor están en lados opuestos de la Estrella Polar.', source: 'https://science.nasa.gov/solar-system/skywatching/'
  }
];

export const allObjects = [...celestialBodies, ...constellations];
export const buscarObjetoCeleste = (id) => allObjects.find((body) => body.id === id);

// Composición educativa: tamaños, posiciones y figuras se adaptan a la exploración.
export function esObjetoVisible(object, filter, showConstellations = true) {
  if (object.kind === 'constellation') return filter !== 'planets' && showConstellations;
  return filter !== 'constellations';
}

export function leerDescubrimientosGuardados(storage) {
  try {
    const ids = JSON.parse((storage ?? globalThis.localStorage).getItem('orbita-saved') || '[]');
    return Array.isArray(ids) ? [...new Set(ids)].filter(id => allObjects.some(item => item.id === id)) : [];
  } catch { return []; }
}
