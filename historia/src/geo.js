// Funciones puras de ubicación y fechas: las usan el recolector (Node) y la página (navegador).
const TZ_OFFSET = -5; // Colombia, sin horario de verano

// Ciudades y municipios turísticos con coordenadas (para "cerca de ti")
export const CIUDADES = {
  bogota: [4.711, -74.072], medellin: [6.244, -75.581], cali: [3.452, -76.532], cartagena: [10.391, -75.479],
  barranquilla: [10.964, -74.796], "santa marta": [11.241, -74.199], armenia: [4.534, -75.681], pereira: [4.813, -75.696],
  manizales: [5.07, -75.514], bucaramanga: [7.119, -73.122], cucuta: [7.894, -72.508], villavicencio: [4.142, -73.627],
  tunja: [5.535, -73.368], ibague: [4.438, -75.232], neiva: [2.927, -75.282], pasto: [1.214, -77.281], popayan: [2.444, -76.614],
  leticia: [-4.215, -69.94], monteria: [8.748, -75.881], sincelejo: [9.304, -75.398], valledupar: [10.464, -73.253],
  riohacha: [11.544, -72.907], quibdo: [5.692, -76.658], "san andres": [12.584, -81.7], yopal: [5.339, -72.395],
  florencia: [1.614, -75.606], mocoa: [1.152, -76.648], inirida: [3.865, -67.924], mitu: [1.253, -70.234], arauca: [7.084, -70.759],
  "san jose del guaviare": [2.571, -72.645], "puerto carreno": [6.189, -67.486], girardot: [4.303, -74.803], salento: [4.637, -75.57],
  guatape: [6.233, -75.159], rionegro: [6.155, -75.374], "santa rosa de cabal": [4.868, -75.621], "villa de leyva": [5.633, -73.524],
  zipaquira: [5.022, -74.004], honda: [5.208, -74.736], mompox: [9.242, -74.427], "san agustin": [1.882, -76.268],
  caucasia: [7.986, -75.198], envigado: [6.169, -75.586], itagui: [6.184, -75.599], bello: [6.333, -75.558], sabaneta: [6.151, -75.616],
  chia: [4.861, -74.059], soacha: [4.579, -74.218], palmira: [3.539, -76.303], buenaventura: [3.883, -77.031], tulua: [4.084, -76.195],
  duitama: [5.827, -73.033], sogamoso: [5.714, -72.933], "san gil": [6.555, -73.134], barichara: [6.636, -73.223],
  "san martin": [3.696, -73.699], "puerto lopez": [4.084, -72.958], "la dorada": [5.454, -74.664], fusagasuga: [4.337, -74.364],
  calarca: [4.53, -75.643], filandia: [4.674, -75.658], "jardin": [5.598, -75.82], "santa fe de antioquia": [6.556, -75.827],
  "el penol": [6.219, -75.243], tumaco: [1.806, -78.765], ipiales: [0.83, -77.644], aguachica: [8.309, -73.616],
  ciénaga: [11.006, -74.247], cienaga: [11.006, -74.247], magangue: [9.242, -74.754], turbo: [8.093, -76.728],
  betania: [5.746, -75.976], buenavista: [9.32, -74.97], pandi: [4.191, -74.487], "san martin de los llanos": [3.696, -73.699],
};

export const norm = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

export function ubicar(texto = "") {
  const t = norm(texto);
  // la coincidencia más larga gana ("san martin de los llanos" antes que "san martin")
  const hit = Object.keys(CIUDADES).sort((a, b) => b.length - a.length).find((c) => new RegExp(`(^|[^a-z])${c}([^a-z]|$)`).test(t));
  return hit ? { ciudadClave: hit, coords: CIUDADES[hit] } : { ciudadClave: null, coords: null };
}

export function distanciaKm([a1, o1], [a2, o2]) {
  const R = 6371, r = Math.PI / 180;
  const dA = (a2 - a1) * r, dO = (o2 - o1) * r;
  const h = Math.sin(dA / 2) ** 2 + Math.cos(a1 * r) * Math.cos(a2 * r) * Math.sin(dO / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

// Fecha de "hoy" en Colombia como YYYY-MM-DD
export function hoyCO(d = new Date()) {
  return new Date(d.getTime() + TZ_OFFSET * 3600e3).toISOString().slice(0, 10);
}

// Gancho de respaldo cuando no hay IA
export function ganchoBase(e, dias) {
  const donde = e.ciudadNombre ? ` en ${e.ciudadNombre}` : "";
  if (dias <= 0) return `¡Es hoy${donde}! Si estás cerca, todavía alcanzas a vivirlo.`;
  if (dias <= 7) return `Faltan ${dias} días: te armamos el viaje${donde} con hotel y traslados.`;
  if (dias <= 30) return `Este mes${donde}. Separa cupo y viaja sin preocuparte por nada.`;
  return `Planéalo con calma: nosotros organizamos tu viaje${donde}.`;
}

