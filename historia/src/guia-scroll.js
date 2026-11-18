// Guía de scroll: si el visitante se queda quieto un rato, lo invita con suavidad a seguir bajando.
// - Aparece tras unos segundos sin interacción (más rápido la primera vez).
// - El texto cambia según la sección y según el tipo de pantalla (mouse o táctil).
// - Desaparece con cualquier scroll, toque o tecla; se puede pulsar para avanzar.
// - No aparece al final de la página, ni con el asistente abierto, y como máximo 5 veces por visita.

const TEXTOS = [
  { id: "inicio", t: "Desliza y empieza el viaje" },
  { id: "ruta", t: "Sigue bajando: el avión está por despegar" },
  { id: "nosotros", t: "Baja y conoce a quienes viajan contigo" },
  { id: "destinos", t: "Sigue bajando para recorrer Colombia" },
  { id: "paquetes", t: "Hay más planes esperándote abajo" },
  { id: "agenda", t: "Baja para ver lo que se viene" },
];

export function iniciarGuiaScroll({ avanzar, reducido = false } = {}) {
  const tactil = window.matchMedia("(pointer: coarse)").matches;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="gs-glow" aria-hidden="true"></div>
    <button class="gs" type="button" hidden>
      <span class="gs-ic" aria-hidden="true">${tactil
        ? '<svg viewBox="0 0 40 56"><path class="gs-finger" d="M16 30V10a4 4 0 0 1 8 0v14l8 2.2a5 5 0 0 1 3.6 5.8L33 46H17l-7.6-9.2a3.6 3.6 0 0 1 5-5.2z" fill="#fff" stroke="#0F1B33" stroke-width="2.4" stroke-linejoin="round"/><path class="gs-trail" d="M20 6v-4" stroke="#F7C64A" stroke-width="3" stroke-linecap="round"/></svg>'
        : '<svg viewBox="0 0 32 48"><rect x="3" y="3" width="26" height="42" rx="13" fill="none" stroke="#0F1B33" stroke-width="3"/><circle class="gs-wheel" cx="16" cy="14" r="3.4" fill="#EB5A1E"/></svg>'}</span>
      <span class="gs-txt"></span>
      <span class="gs-chev" aria-hidden="true"><i></i><i></i></span>
    </button>`);

  const btn = document.querySelector(".gs"), txt = btn.querySelector(".gs-txt"), glow = document.querySelector(".gs-glow");
  let veces = 0, timer = null, visible = false;

  const seccionActual = () => {
    const y = window.innerHeight * 0.4;
    let actual = TEXTOS[0];
    for (const s of TEXTOS) {
      const el = document.getElementById(s.id);
      if (el && el.getBoundingClientRect().top <= y) actual = s;
    }
    return actual;
  };
  const cercaDelFinal = () => window.scrollY + window.innerHeight * 2.2 >= document.documentElement.scrollHeight;
  const asistenteAbierto = () => { const p = document.querySelector(".as-panel"); return p && !p.hidden; };

  function mostrar() {
    if (visible || veces >= 5 || cercaDelFinal() || asistenteAbierto() || document.hidden) return programar();
    veces++;
    visible = true;
    txt.textContent = seccionActual().t + (tactil ? "" : " ↓");
    btn.setAttribute("aria-label", `${txt.textContent}. Pulsa para avanzar`);
    btn.hidden = false;
    glow.classList.add("on");
    document.body.classList.add("gs-activa");
    setTimeout(() => btn.classList.add("on"), 20);
  }

  function ocultar() {
    if (!visible) return;
    visible = false;
    btn.classList.remove("on");
    glow.classList.remove("on");
    document.body.classList.remove("gs-activa");
    setTimeout(() => { if (!visible) btn.hidden = true; }, 400);
  }

  function programar() {
    clearTimeout(timer);
    if (veces >= 5) return;
    // primera vez: 4,5 s (la portada ya terminó su entrada); después: 9 s quieto
    timer = setTimeout(mostrar, veces === 0 ? 4500 : 9000);
  }

  const actividad = () => { ocultar(); programar(); };
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach((ev) => window.addEventListener(ev, actividad, { passive: true }));
  let ultimoY = window.scrollY;
  window.addEventListener("scroll", () => {
    if (Math.abs(window.scrollY - ultimoY) > 6) { ultimoY = window.scrollY; actividad(); }
  }, { passive: true });

  btn.addEventListener("click", () => {
    ocultar();
    avanzar?.(window.innerHeight * 0.85);
    programar();
  });

  if (reducido) btn.classList.add("quieto");
  programar();
}
