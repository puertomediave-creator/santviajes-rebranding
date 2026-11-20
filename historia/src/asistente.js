const B = import.meta.env.BASE_URL;
// Asistente San't Viajes · IA de Puerto Media
// Si se configura VITE_ASISTENTE_URL (una función con Claude, p. ej. en Supabase), conversa con IA;
// si no, responde en modo guiado con paquetes y agenda, sin servidor.
const API_IA = import.meta.env.VITE_ASISTENTE_URL || "";
import { PAQUETES, waLink } from "./paquetes.js";
import { estadoAgenda } from "./agenda.js";

const WA = "https://wa.me/573019523262";
const esc = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// texto seguro + enlaces clicables
const enriquecer = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/(https?:\/\/[^\s<)]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
    .replace(/\n/g, "<br>");

export function iniciarAsistente() {
  document.body.insertAdjacentHTML("beforeend", `
    <button class="as-fab" type="button" aria-controls="as-panel" aria-expanded="false"><span class="as-dot"></span>Asistente</button>
    <aside class="as-panel" id="as-panel" aria-label="Asistente de San't Viajes" hidden>
      <header><img src="${B}logos/isotipo-oscuro.svg" alt=""><div><b>Asistente San't Viajes</b><small>IA de Puerto Media</small></div><button type="button" class="as-x" aria-label="Cerrar asistente">×</button></header>
      <div class="as-log" aria-live="polite"></div>
      <form class="as-form"><input autocomplete="off" placeholder="Escribe tu pregunta…" aria-label="Mensaje para el asistente" maxlength="600"><button type="submit" aria-label="Enviar">✈</button></form>
    </aside>`);

  const fab = document.querySelector(".as-fab"), panel = document.querySelector(".as-panel"), log = panel.querySelector(".as-log");
  const form = panel.querySelector(".as-form"), input = form.querySelector("input");
  const historia = [];
  let modoIA = API_IA ? null : false, saludado = false, ocupado = false;

  const abrir = () => { panel.hidden = false; fab.hidden = true; fab.setAttribute("aria-expanded", "true"); if (!saludado) { saludado = true; saludar(); } input.focus({ preventScroll: true }); };
  const cerrar = () => { panel.hidden = true; fab.hidden = false; fab.setAttribute("aria-expanded", "false"); fab.focus(); };
  fab.addEventListener("click", abrir);
  panel.querySelector(".as-x").addEventListener("click", cerrar);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) cerrar(); });
  document.querySelectorAll("[data-asistente]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); abrir(); }));

  const decir = (html, cls = "b") => { const d = document.createElement("div"); d.className = `as-m ${cls}`; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; };
  const rapidas = (lista) => decir(lista.map((q) => `<button type="button" data-q="${esc(q)}">${esc(q)}</button>`).join(""), "quick");
  log.addEventListener("click", (e) => { const b = e.target.closest("[data-q]"); if (b) enviar(b.dataset.q); });

  const miniPaquete = (p) => decir(`<span class="lbl">${esc(p.tag)}</span><b>${esc(p.nombre)}</b>${p.noches ? `<span>${esc(p.noches)}${p.fecha ? ` · ${esc(p.fecha)}` : ""}</span>` : ""}${p.precio ? `<span class="pr">${esc(p.precio)}</span>` : ""}<a href="${waLink(p.nombre)}" target="_blank" rel="noopener">Pedir información ✈</a>`, "mini");
  const miniEvento = (e) => decir(`<span class="lbl">${esc(e.etiquetas?.[0] || e.categoria)}</span><b>${esc(e.titulo)}</b><span>📍 ${esc(e.ciudadNombre || e.ciudad)} · ${esc(e.inicio)}</span><a href="${WA}?text=${encodeURIComponent(`Hola San't Viajes 👋 Quiero viajar a "${e.titulo}" (${e.ciudadNombre || e.ciudad}).`)}" target="_blank" rel="noopener">Viajar a este evento ✈</a>`, "mini");

  function saludar() {
    decir("¡Hola! 👋 Soy el asistente de San't Viajes. Te ayudo a elegir destino, ver los paquetes o encontrar eventos y conciertos cerca de ti.");
    rapidas(["¿Qué eventos hay cerca?", "Recomiéndame un viaje", "Ver paquetes", "Hablar con una persona"]);
  }

  // ------------------------------------------------ modo guiado (sin IA)
  function guiado(texto) {
    const t = texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const pk = (id) => PAQUETES.find((p) => p.id === id);
    if (/persona|asesor|humano|whatsapp|llamar|reserv/.test(t)) return decir(`Te paso con el equipo: <a href="${WA}?text=${encodeURIComponent("Hola, vengo de la página y quiero información de un viaje.")}" target="_blank" rel="noopener">abrir WhatsApp</a> (+57 301 952 3262). Atienden de lunes a sábado.`);
    if (/evento|concierto|feria|fiesta|festival|show|carnaval|agenda|cerca/.test(t)) {
      const ev = estadoAgenda.eventos.slice(0, 3);
      if (!ev.length) return decir(`La agenda se está actualizando. Pregúntale al equipo por <a href="${WA}" target="_blank" rel="noopener">WhatsApp</a> qué eventos se vienen.`);
      decir("Estos son los eventos más cercanos para ti ahora mismo:");
      ev.forEach(miniEvento);
      return rapidas(["Ver toda la agenda", "Hablar con una persona"]);
    }
    if (/ver toda la agenda/.test(t)) { document.getElementById("agenda")?.scrollIntoView({ behavior: "smooth" }); return decir("Te llevé a la agenda completa 👇"); }
    if (/precio|cuanto|vale|cuesta|tarifa|presupuesto/.test(t)) {
      const destino = /cartagena|playa|caribe/.test(t) ? "cartagena" : /santa marta/.test(t) ? "santamarta" : /cafe|eje|cocora|salento/.test(t) ? "eje" : /bogota/.test(t) ? "bogota" : /alumbr/.test(t) ? "alumbrado" : null;
      if (destino) {
        decir("Ese paquete todavía no tiene precio publicado. El equipo te lo cotiza por WhatsApp según fechas y número de personas:");
        miniPaquete(pk(destino));
      } else {
        decir("El precio publicado hoy es el de ¡Alerta Medellín! (desde 390 USD). Para los demás, el equipo te cotiza según fechas y personas, sin cifras inventadas:");
        miniPaquete(pk("alerta"));
      }
      return rapidas(["Hablar con una persona", "Ver paquetes"]);
    }
    if (/medell|alumbr|comuna|guatap|paisa/.test(t)) { decir("Para Medellín tenemos:"); miniPaquete(pk("alumbrado")); return miniPaquete(pk("alerta")); }
    if (/cartagena|playa|caribe|chiva|mar\b|islas/.test(t)) { decir("Playa, chiva y rumba 🌴"); miniPaquete(pk("cartagena")); return miniPaquete(pk("santamarta")); }
    if (/cafe|eje|cocora|salento|naturaleza|montana|descanso/.test(t)) { decir("El corazón verde de Colombia ☕"); return miniPaquete(pk("eje")); }
    if (/bogota|candelaria|monserrate|museo|capital/.test(t)) { decir("La capital te espera:"); return miniPaquete(pk("bogota")); }
    if (/paquete|plan|oferta|promo/.test(t)) { decir("Estos son los paquetes publicados:"); PAQUETES.forEach(miniPaquete); return; }
    if (/recomien|ayuda|no se|elegir|viaje|vacacion/.test(t)) { decir("¿Qué plan te provoca más?"); return rapidas(["Playa y mar", "Café y naturaleza", "Ciudad y alumbrados: Medellín", "Historia y museos: Bogotá", "¿Qué eventos hay cerca?"]); }
    if (/hola|buenas|buenos|hey/.test(t)) { decir("¡Hola! ¿Buscas destino, paquete o un evento?"); return rapidas(["Recomiéndame un viaje", "¿Qué eventos hay cerca?"]); }
    decir("Puedo recomendarte un destino, mostrarte los paquetes y la agenda de eventos, o pasarte con una persona del equipo.");
    rapidas(["Recomiéndame un viaje", "Ver paquetes", "Hablar con una persona"]);
  }

  // ------------------------------------------------ envío (IA si está disponible)
  async function enviar(texto) {
    texto = texto.trim();
    if (!texto || ocupado) return;
    if (panel.hidden) abrir();
    const u = document.createElement("div"); u.className = "as-m u"; u.textContent = texto; log.appendChild(u); log.scrollTop = log.scrollHeight;
    historia.push({ role: "user", content: texto });

    if (modoIA !== false) {
      ocupado = true;
      const espera = decir('<span class="as-typing"><i></i><i></i><i></i></span>');
      try {
        const r = await fetch(API_IA, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mensajes: historia }) });
        espera.remove();
        if (r.ok) {
          const { respuesta } = await r.json();
          modoIA = true;
          historia.push({ role: "assistant", content: respuesta });
          decir(enriquecer(respuesta));
          ocupado = false;
          return;
        }
        modoIA = false; // 503: sin clave o sin cupo → modo guiado
      } catch {
        espera.remove();
        modoIA = false;
      }
      ocupado = false;
    }
    setTimeout(() => guiado(texto), 250);
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); const v = input.value; input.value = ""; enviar(v); });
}
