const B = import.meta.env.BASE_URL;
// Paquetes tomados de las publicaciones de @sant_viajesoficial y de santviajes.com.
// Solo se muestra precio o "Incluye" cuando aparece en la pieza original; lo demás va como "Vive".
import { DESTINOS } from "./escenas.js";

const WA = "https://wa.me/573019523262?text=";
export const waLink = (nombre) => WA + encodeURIComponent(`Hola San't Viajes 👋 Quiero información del paquete "${nombre}"`);

const escena = (id) => DESTINOS.find((d) => d.id === id).escena;

export const PAQUETES = [
  {
    id: "alumbrado", nombre: "Medellín Alumbrado", titulo: "MEDELLÍN", script: "Alumbrado",
    tag: "Temporada navideña ✦", noches: "3 noches · 4 días", fecha: "1 dic → 4 dic",
    vive: ["Alumbrados", "Metrocable", "Comuna 13", "Comida paisa"], foto: "medellin", color: "sol",
  },
  {
    id: "alerta", nombre: "¡Alerta Medellín! Fin de año", titulo: "¡ALERTA", titulo2: "MEDELLÍN!", script: "Cuenta regresiva 2027",
    tag: "Fin de año", noches: "3 noches · 4 días", fecha: "30 dic → 2 ene", precio: "Desde $390 USD",
    vive: ["Fuegos artificiales", "Alumbrados", "Plan organizado"], escena: escena("medellin"), color: "brisa",
  },
  {
    id: "cartagena", nombre: "Cartagena de Indias", titulo: "CARTAGENA", script: "de Indias",
    tag: "¡Playa, chiva y rumba!", noches: "3 noches · 4 días",
    incluye: ["Traslados", "Alojamiento", "Desayunos", "City tour y chiva", "Guía acompañante", "Asistencia médica"],
    foto: "cartagena", color: "sol",
  },
  {
    id: "eje", nombre: "Fin de año Eje Cafetero", titulo: "FIN DE AÑO", script: "Eje Cafetero",
    tag: "Valle de Cocora · Salento", vive: ["Finca hotel", "Cena de fin de año", "Valle de Cocora", "Salento"],
    foto: "eje-cafetero", color: "brisa",
  },
  {
    id: "santamarta", nombre: "Modo Caribe Santa Marta", titulo: "MODO CARIBE", script: "¡Activado!",
    tag: "Escápate a la aventura perfecta", sub: "Santa Marta", vive: ["Playa", "Mar Caribe", "Planes en familia"],
    escena: escena("cartagena"), color: "sol",
  },
  {
    id: "bogota", nombre: "Bogotá Experience", titulo: "BOGOTÁ", script: "Experience",
    tag: "¡El momento de viajar es ahora!", vive: ["La Candelaria", "Monserrate", "Museo del Oro", "Zona T"],
    foto: "bogota", color: "sol",
  },
];

function card(p, i) {
  const bg = p.foto
    ? `<img src="${B}fotos/${p.foto}-1200.webp" srcset="${B}fotos/${p.foto}-1200.webp 1200w, ${B}fotos/${p.foto}-2400.webp 2400w" sizes="(max-width:820px) 92vw, 420px" alt="" decoding="async">`
    : p.escena();
  const lista = p.incluye || p.vive;
  return `<article class="pk" style="--tilt:${i % 2 ? 1.6 : -1.6}deg">
    <div class="pk-bg" aria-hidden="true">${bg}</div><div class="pk-tint" aria-hidden="true"></div>
    <div class="pk-body">
      <p class="pk-handle">@SANT_VIAJESOFICIAL · RNT 251308</p>
      <span class="pk-tag">${p.tag}</span>
      <h3 class="pk-title"><span class="stk c-${p.color}" data-t="${p.titulo}">${p.titulo}</span>${p.titulo2 ? `<span class="stk c-${p.color}" data-t="${p.titulo2}">${p.titulo2}</span>` : ""}<span class="pk-script">${p.script}</span></h3>
      ${p.sub ? `<p class="pk-sub">${p.sub}</p>` : ""}
      <div class="pk-pills">${p.noches ? `<span>${p.noches}</span>` : ""}${p.fecha ? `<span class="alt">📅 ${p.fecha}</span>` : ""}</div>
      ${p.precio ? `<span class="pk-price">${p.precio}</span>` : ""}
      <div class="pk-strip"><b>${p.incluye ? "Incluye" : "Vive"}</b><ul>${lista.map((x) => `<li>${x}</li>`).join("")}</ul></div>
      <a class="pk-cta" href="${waLink(p.nombre)}" target="_blank" rel="noopener">${p.precio ? "Reservar ahora" : "Pide tu precio"} <span aria-hidden="true">✈</span></a>
    </div>
  </article>`;
}

export function renderPaquetes(el) {
  el.innerHTML =
    PAQUETES.map(card).join("") +
    `<article class="pk pk-eventos">
      <div class="pk-body">
        <p class="pk-handle">@SANT_VIAJESOFICIAL</p>
        <span class="pk-tag">🎤 Entradas + viaje</span>
        <h3 class="pk-title"><span class="stk c-sol" data-t="EVENTOS">EVENTOS</span><span class="pk-script">y conciertos en Colombia</span></h3>
        <p class="pk-text">Artistas, festivales y partidos que no te puedes perder. Nos encargamos de las entradas, el alojamiento, el transporte y la logística para que tú solo vivas el momento.</p>
        <a class="pk-cta" href="${waLink("Eventos y conciertos")}" target="_blank" rel="noopener">Pregunta por el próximo evento <span aria-hidden="true">✈</span></a>
      </div>
      <svg class="pk-bursts" viewBox="0 0 600 400" aria-hidden="true">
        <g stroke="#F7C64A" stroke-width="8" stroke-linecap="round">${burstLines(470, 110, 90)}</g>
        <g stroke="#8FD5D6" stroke-width="6" stroke-linecap="round">${burstLines(540, 300, 60)}</g>
        <g stroke="#F7E4D4" stroke-width="5" stroke-linecap="round">${burstLines(380, 260, 45)}</g>
      </svg>
    </article>`;
}

function burstLines(x, y, r) {
  let s = "";
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    s += `<line x1="${x + Math.cos(a) * r * 0.35}" y1="${y + Math.sin(a) * r * 0.35}" x2="${x + Math.cos(a) * r}" y2="${y + Math.sin(a) * r}"/>`;
  }
  return s;
}
