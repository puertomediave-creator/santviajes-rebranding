// Agenda viva de San't Viajes: recolecta eventos de fuentes públicas,
// descarta los que ya pasaron, ubica cada ciudad y (si hay clave de Anthropic)
// escribe un gancho promocional con IA.
//
// Fuentes y por qué:
//  - colombia.co/eventos ........ Marca País; publica schema.org/Event y permite robots e IA (tiene llms.txt).
//  - colombiasesiente.com/agenda  agenda mensual de ferias, fiestas y festivales; permite robots de IA.
//  - latiquetera.com/event/* .... conciertos y shows con schema.org/Event; robots.txt permite todo.
//  - eventu.co .................. NO se lee: su robots.txt bloquea expresamente a los robots de IA.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const UA = "Mozilla/5.0 (compatible; SantViajesAgenda/1.0; +https://santviajes-historia.netlify.app)";
const TZ_OFFSET = -5; // Colombia, sin horario de verano

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MES_CORTO = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, sept: 8, oct: 9, nov: 10, dic: 11 };

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

const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

async function traer(url, ms = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" }, signal: ctrl.signal });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    const buf = Buffer.from(await r.arrayBuffer());
    const utf = buf.toString("utf8");
    return utf.includes("�") ? buf.toString("latin1") : utf; // algunas páginas llegan en latin-1
  } finally {
    clearTimeout(t);
  }
}

const decode = (s = "") =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/<[^>]+>/g, "").trim();

function ldEventos(html) {
  const out = [];
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]);
      const nodos = [].concat(j["@graph"] || j);
      for (const n of nodos) if (n && n["@type"] === "Event") out.push(n);
    } catch {}
  }
  return out;
}

// ---------------------------------------------------------------- colombia.co
async function colombiaCo() {
  const html = await traer("https://colombia.co/eventos");
  return ldEventos(html).map((e) => {
    const loc = e.location?.address?.addressLocality || e.location?.name || "";
    return {
      titulo: e.name?.trim(), inicio: (e.startDate || "").slice(0, 10), fin: (e.endDate || e.startDate || "").slice(0, 10),
      ciudad: loc.trim(), region: e.location?.address?.addressRegion || "", categoria: "Fiestas y ferias",
      descripcion: (e.description || "").slice(0, 280), imagen: [].concat(e.image || [])[0] || null,
      url: e.url || "https://colombia.co/eventos", fuente: "Colombia.co (Marca País)",
    };
  });
}

// ---------------------------------------------------------------- colombiasesiente.com
function rangoCES(txt) {
  // "11–15 nov 2026", "30 nov – 2 dic 2026", "8 dic 2026"
  const t = norm(txt).replace(/[–—]/g, "-");
  let m = t.match(/(\d{1,2})\s*([a-z]{3,4})?\s*-\s*(\d{1,2})\s*([a-z]{3,4})\s*(\d{4})/);
  if (m) {
    const y = +m[5], m2 = MES_CORTO[m[4]], m1 = m[2] ? MES_CORTO[m[2]] : m2;
    if (m1 === undefined || m2 === undefined) return null;
    const y1 = m1 > m2 ? y - 1 : y;
    return [iso(y1, m1, +m[1]), iso(y, m2, +m[3])];
  }
  m = t.match(/(\d{1,2})\s*([a-z]{3,4})\s*(\d{4})/);
  if (m && MES_CORTO[m[2]] !== undefined) {
    const d = iso(+m[3], MES_CORTO[m[2]], +m[1]);
    return [d, d];
  }
  return null; // "fecha por confirmar" → no se publica
}

function categoriaCES(tipo = "") {
  const t = norm(tipo);
  if (/musica|concierto/.test(t)) return "Conciertos y shows";
  if (/naturaleza|aves|ruta|paseo/.test(t)) return "Paseos y tours";
  if (/patrimonio|cultur|arte|teatro|cine|gastronom|religios/.test(t)) return "Cultura";
  return "Fiestas y ferias";
}

async function colombiaSeSiente(hoy) {
  const [y, mo] = hoy.split("-").map(Number);
  const meses = [0, 1, 2].map((k) => MESES[(mo - 1 + k) % 12]);
  const out = [];
  for (const mes of meses) {
    let html;
    try { html = await traer(`https://colombiasesiente.com/agenda/${mes}`); } catch { continue; }
    for (const li of html.split('<div class="ev">').slice(1)) {
      const fecha = decode(li.match(/class="ev__fecha">([\s\S]*?)<\/p>/)?.[1]);
      const titulo = decode(li.match(/<h3>([\s\S]*?)<\/h3>/)?.[1]);
      const lugar = decode(li.match(/class="ev__ciudad">([\s\S]*?)<\/p>/)?.[1]);
      const desc = decode(li.match(/class="ev__ciudad">[\s\S]*?<\/p>\s*<p>([\s\S]*?)<\/p>/)?.[1]);
      const link = li.match(/class="ev__link" href="([^"]+)"/)?.[1];
      const img = li.match(/<img[^>]+src="([^"]+)"/)?.[1];
      const r = rangoCES(fecha);
      if (!titulo || !r) continue;
      const [ciudad, tipo] = lugar.split("·").map((s) => s.trim());
      out.push({
        titulo, inicio: r[0], fin: r[1], ciudad: ciudad || "", region: "", categoria: categoriaCES(tipo),
        descripcion: desc.slice(0, 280), imagen: img ? new URL(img, "https://colombiasesiente.com").href : null,
        url: link || `https://colombiasesiente.com/agenda/${mes}`, fuente: "Colombia se siente",
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------- latiquetera.com
function categoriaShow(texto) {
  const t = norm(texto);
  if (/\btour\b|city tour|maraton|carrera|caminata|senderismo|ciclo|paseo|hacienda|excursion/.test(t)) return "Paseos y tours";
  if (/teatro|obra|cine|cinema|danza|ballet|opera|museo|expo|infantil/.test(t)) return "Cultura";
  if (/feria|fiesta|carnaval/.test(t)) return "Fiestas y ferias";
  return "Conciertos y shows";
}

async function laTiquetera() {
  const home = await traer("https://latiquetera.com/");
  const links = [...new Set([...home.matchAll(/href="((?:https:\/\/latiquetera\.com)?\/event\/[^"#?]+)"/g)].map((m) => new URL(m[1], "https://latiquetera.com").href))].slice(0, 45);
  const out = [];
  for (let i = 0; i < links.length; i += 5) {
    const lote = await Promise.allSettled(links.slice(i, i + 5).map(async (u) => {
      const html = await traer(u);
      return ldEventos(html).map((e) => {
        const addr = e.location?.address;
        const lugar = [e.location?.name, typeof addr === "string" ? addr : addr?.streetAddress, addr?.addressLocality].filter(Boolean).join(", ");
        return {
          titulo: decode(e.name), inicio: (e.startDate || "").slice(0, 10), fin: (e.endDate || e.startDate || "").slice(0, 10),
          ciudad: lugar, region: "", categoria: categoriaShow(`${e.name} ${e.description || ""}`),
          descripcion: decode(e.description || "").slice(0, 280), imagen: [].concat(e.image || [])[0] || null,
          url: u, fuente: "La Tiquetera", hora: (e.startDate || "").slice(11, 16) || null,
        };
      });
    }));
    for (const r of lote) if (r.status === "fulfilled") out.push(...r.value);
  }
  return out;
}

// ---------------------------------------------------------------- IA: ganchos promocionales
const PROMOS = z.object({
  promos: z.array(z.object({
    id: z.string(),
    gancho: z.string().describe("Frase promocional en español de Colombia, máx. 110 caracteres, cálida y concreta, sin inventar precios ni datos"),
    paquete: z.enum(["alumbrado", "alerta", "cartagena", "eje", "santamarta", "bogota", "eventos", "medida"]),
  })),
});

const SISTEMA_PROMO = `Eres el redactor de San't Viajes, operadora de turismo colombiana (RNT 251308), lema "Viajes que conectan contigo".
Para cada evento escribe un gancho corto que invite a viajar a ese evento con San't Viajes (hotel, traslados, entradas y logística los organiza la agencia).
Reglas: español de Colombia, tono cercano y alegre, máximo 110 caracteres, sin precios, sin fechas inventadas, sin prometer cosas que no estén en los datos.
Si el evento está a pocos días, transmite urgencia ("todavía hay tiempo", "este fin de semana"). Si está lejos, invita a planear con calma.
Elige el paquete de San't Viajes que mejor combina: alumbrado (Medellín en diciembre), alerta (Medellín fin de año), cartagena, eje (Eje Cafetero), santamarta, bogota, eventos (eventos y conciertos en general) o medida (viaje a la medida para cualquier otra ciudad).`;

async function promosIA(eventos, hoy) {
  if (!process.env.ANTHROPIC_API_KEY || !eventos.length) return {};
  const client = new Anthropic();
  const datos = eventos.slice(0, 60).map((e) => ({ id: e.id, titulo: e.titulo, ciudad: e.ciudad, inicio: e.inicio, fin: e.fin, categoria: e.categoria, descripcion: e.descripcion.slice(0, 160) }));
  try {
    const res = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort: "low", format: zodOutputFormat(PROMOS) },
      system: [{ type: "text", text: SISTEMA_PROMO, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: `Hoy es ${hoy}. Eventos:\n${JSON.stringify(datos)}` }],
    });
    if (res.stop_reason === "refusal" || !res.parsed_output) return {};
    return Object.fromEntries(res.parsed_output.promos.map((p) => [p.id, p]));
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) console.error("Clave de Anthropic inválida");
    else if (err instanceof Anthropic.RateLimitError) console.error("Anthropic: límite de uso alcanzado");
    else if (err instanceof Anthropic.APIError) console.error(`Anthropic ${err.status}: ${err.message}`);
    else console.error("IA no disponible:", err?.message);
    return {};
  }
}

// Gancho de respaldo cuando no hay IA
export function ganchoBase(e, dias) {
  const donde = e.ciudadNombre ? ` en ${e.ciudadNombre}` : "";
  if (dias <= 0) return `¡Es hoy${donde}! Si estás cerca, todavía alcanzas a vivirlo.`;
  if (dias <= 7) return `Faltan ${dias} días: te armamos el viaje${donde} con hotel y traslados.`;
  if (dias <= 30) return `Este mes${donde}. Separa cupo y viaja sin preocuparte por nada.`;
  return `Planéalo con calma: nosotros organizamos tu viaje${donde}.`;
}

const NOMBRES = {
  bogota: "Bogotá", medellin: "Medellín", ibague: "Ibagué", cucuta: "Cúcuta", popayan: "Popayán", monteria: "Montería",
  quibdo: "Quibdó", "san andres": "San Andrés", inirida: "Inírida", mitu: "Mitú", "puerto carreno": "Puerto Carreño",
  guatape: "Guatapé", chia: "Chía", zipaquira: "Zipaquirá", "san agustin": "San Agustín", itagui: "Itagüí", tulua: "Tuluá",
  fusagasuga: "Fusagasugá", calarca: "Calarcá", jardin: "Jardín", "el penol": "El Peñol", magangue: "Magangué",
  "san jose del guaviare": "San José del Guaviare", "san martin": "San Martín", "san martin de los llanos": "San Martín de los Llanos",
  "puerto lopez": "Puerto López", cienaga: "Ciénaga", ciénaga: "Ciénaga", "santa fe de antioquia": "Santa Fe de Antioquia",
  "san gil": "San Gil", "villa de leyva": "Villa de Leyva", "santa rosa de cabal": "Santa Rosa de Cabal", "santa marta": "Santa Marta",
};
const titular = (k) => NOMBRES[k] || k.replace(/(^|\s)([a-z])/g, (m, s, c) => s + c.toUpperCase()).replace(/ (De|Del|La|Los|Las) /g, (m) => m.toLowerCase());

// ---------------------------------------------------------------- orquestador
export async function recolectar() {
  const hoy = hoyCO();
  const fuentes = await Promise.allSettled([colombiaCo(), colombiaSeSiente(hoy), laTiquetera()]);
  const estado = ["colombia.co", "colombiasesiente.com", "latiquetera.com"].map((n, i) => ({
    fuente: n, ok: fuentes[i].status === "fulfilled", eventos: fuentes[i].value?.length || 0, error: fuentes[i].reason?.message,
  }));

  const vistos = new Set();
  const eventos = [];
  for (const f of fuentes) {
    if (f.status !== "fulfilled") continue;
    for (const e of f.value) {
      if (!e.titulo || !/^\d{4}-\d{2}-\d{2}$/.test(e.inicio)) continue;
      if ((e.fin || e.inicio) < hoy) continue; // ya pasó
      const clave = `${norm(e.titulo).slice(0, 40)}|${e.inicio}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      const { ciudadClave, coords } = ubicar(`${e.ciudad} ${e.region}`);
      eventos.push({
        ...e,
        id: Buffer.from(clave).toString("base64url").slice(0, 16),
        ciudadNombre: ciudadClave ? titular(ciudadClave) : e.ciudad.split(",")[0] || "",
        coords,
        // tours o temporadas de más de 45 días: disponibles, no "eventos con fecha"
        permanente: (Date.parse(e.fin || e.inicio) - Date.parse(e.inicio)) / 864e5 > 45,
      });
    }
  }
  eventos.sort((a, b) => a.inicio.localeCompare(b.inicio));

  // la IA escribe sobre los más próximos primero
  const promos = await promosIA(eventos, hoy);
  for (const e of eventos) if (promos[e.id]) Object.assign(e, { gancho: promos[e.id].gancho, paquete: promos[e.id].paquete, ia: true });

  return { actualizado: new Date().toISOString(), hoy, ia: Object.keys(promos).length > 0, estado, eventos };
}
