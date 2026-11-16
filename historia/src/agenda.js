// Agenda viva: pide /api/eventos y pinta las tarjetas ordenadas por cercanía.
import { waLink } from "./paquetes.js";

const MES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const COLOR = { "Conciertos y shows": "corazon", "Fiestas y ferias": "sol", Cultura: "brisa", "Paseos y tours": "verde" };
const ICONO = { "Conciertos y shows": "🎤", "Fiestas y ferias": "🎉", Cultura: "🎭", "Paseos y tours": "🥾" };

export const estadoAgenda = { eventos: [], cargada: false };

const esc = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function fechaTexto(e) {
  const [, m1, d1] = e.inicio.split("-").map(Number);
  const [, m2, d2] = (e.fin || e.inicio).split("-").map(Number);
  if (e.permanente) return "Disponible";
  if (e.fin && e.fin !== e.inicio) return m1 === m2 ? `${d1}–${d2} ${MES[m1 - 1].toLowerCase()}` : `${d1} ${MES[m1 - 1].toLowerCase()} – ${d2} ${MES[m2 - 1].toLowerCase()}`;
  return `${d1} ${MES[m1 - 1].toLowerCase()}${e.hora ? ` · ${e.hora}` : ""}`;
}

function tarjeta(e, i) {
  const [, m, d] = e.inicio.split("-").map(Number);
  const color = COLOR[e.categoria] || "sol";
  const lugar = e.ciudadNombre || e.ciudad || "Colombia";
  const msg = `Hola San't Viajes 👋 Quiero viajar a "${e.titulo}" (${lugar}, ${fechaTexto(e)}). ¿Me ayudan con el plan?`;
  return `<article class="ev-card c-${color}" data-cat="${esc(e.categoria)}" style="--i:${i}">
    <div class="ev-date">${e.permanente ? `<b>✦</b><span>TODO<br>EL AÑO</span>` : `<b>${d}</b><span>${MES[m - 1]}</span>`}</div>
    <div class="ev-body">
      <div class="ev-tags">${e.etiquetas.map((t) => `<span>${esc(t)}</span>`).join("")}<span class="cat">${ICONO[e.categoria] || "✦"} ${esc(e.categoria)}</span></div>
      <h3>${esc(e.titulo)}</h3>
      <p class="ev-where">📍 ${esc(lugar)} · ${esc(fechaTexto(e))}</p>
      <p class="ev-hook">${e.ia ? '<i title="Escrito por la IA de Puerto Media">✦</i> ' : ""}${esc(e.gancho)}</p>
      <div class="ev-cta">
        <a class="ev-go" href="${waLink(e.titulo).replace(/text=.*/, "text=" + encodeURIComponent(msg))}" target="_blank" rel="noopener">Viajar con San't ✈</a>
        <a class="ev-src" href="${esc(e.url)}" target="_blank" rel="noopener nofollow">Ver en ${esc(e.fuente)}</a>
      </div>
    </div>
  </article>`;
}

export async function iniciarAgenda(onListo) {
  const grid = document.querySelector(".ag-grid");
  const estado = document.querySelector(".ag-status");
  const chips = document.querySelector(".ag-chips");
  const mas = document.querySelector(".ag-more");
  let datos;
  try {
    const r = await fetch("/api/eventos", { headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error(r.status);
    datos = await r.json();
  } catch {
    // En desarrollo local no hay funciones de Netlify: usa la copia de prueba si existe.
    try { datos = await fetch("/agenda-demo.json").then((r) => (r.ok ? r.json() : Promise.reject())); }
    catch { grid.innerHTML = `<p class="ag-empty">La agenda se está actualizando. Mientras tanto, pregúntanos por WhatsApp qué eventos se vienen.</p>`; return; }
  }

  estadoAgenda.eventos = datos.eventos;
  estadoAgenda.cargada = true;
  const cuando = new Date(datos.actualizado).toLocaleString("es-CO", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
  estado.innerHTML = `Actualizada el ${cuando}${datos.origen?.ciudad ? ` · ordenada desde <b>${esc(datos.origen.ciudad)}</b>` : ""} · ${datos.total} eventos vigentes${datos.ia ? " · ✦ textos con IA" : ""}`;

  let filtro = "Todos", visibles = 9;
  const pintar = () => {
    const lista = datos.eventos.filter((e) => filtro === "Todos" || e.categoria === filtro);
    grid.innerHTML = lista.slice(0, visibles).map(tarjeta).join("") || `<p class="ag-empty">No hay eventos en esta categoría por ahora.</p>`;
    mas.hidden = lista.length <= visibles;
    onListo?.(grid);
  };
  const cats = ["Todos", ...new Set(datos.eventos.map((e) => e.categoria))];
  chips.innerHTML = cats.map((c) => `<button type="button" class="${c === "Todos" ? "on" : ""}" data-c="${esc(c)}">${c === "Todos" ? "Todos" : `${ICONO[c] || ""} ${esc(c)}`}</button>`).join("");
  chips.addEventListener("click", (ev) => {
    const b = ev.target.closest("button");
    if (!b) return;
    filtro = b.dataset.c;
    visibles = 9;
    chips.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    pintar();
  });
  mas.addEventListener("click", () => { visibles += 9; pintar(); });
  pintar();
}
