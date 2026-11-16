import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./style.css";
import { DESTINOS, PLANE_D, heartRoute, USAR_FOTOS, fotoEscena } from "./escenas.js";
import { renderPaquetes } from "./paquetes.js";
import { iniciarAgenda } from "./agenda.js";
import { iniciarAsistente } from "./asistente.js";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// ------------------------------------------------------------ montaje del DOM
const track = document.querySelector(".track");
track.insertAdjacentHTML(
  "beforeend",
  `<article class="panel panel-intro"><div><p class="kicker">Capítulo 5 · El viaje</p>
     <h2>Cuatro destinos,<br><em>una sola forma</em> de viajar.</h2>
     <p>Desliza y recorre Colombia con nosotros.</p><div class="arrow" aria-hidden="true">→</div></div></article>` +
    DESTINOS.map(
      (d, i) => `<article class="panel" id="p-${d.id}" aria-label="${d.nombre}">
        ${USAR_FOTOS && d.foto ? fotoEscena(d, i) : d.escena()}
        <div class="card"><span class="num" style="background:${d.color}">0${i + 1}</span>
          <p class="kicker">${d.kicker}</p><h3>${d.nombre}</h3><p>${d.texto}</p></div>
      </article>`
    ).join("")
);

renderPaquetes(document.querySelector(".pq-grid"));
iniciarAsistente();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
iniciarAgenda((grid) => {
  ScrollTrigger.refresh();
  if (reduceMotion) return;
  gsap.from(grid.querySelectorAll(".ev-card"), { y: 50, opacity: 0, stagger: 0.06, duration: 0.6, ease: "power3.out", clearProps: "transform,opacity" });
});

const route = heartRoute();
["routeDots", "routeReveal", "routePath"].forEach((id) => document.getElementById(id).setAttribute("d", route));
document.getElementById("planeShape").setAttribute("d", PLANE_D);

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduce) document.documentElement.classList.add("reduced");

// ------------------------------------------------------------ scroll suave (Lenis + ScrollTrigger)
let lenis;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      lenis.scrollTo(a.getAttribute("href"), { duration: 1.6 });
    })
  );
}

// barra de progreso + nav
gsap.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
ScrollTrigger.create({ trigger: ".hero", start: "bottom 80px", onToggle: (s) => document.querySelector(".nav").classList.toggle("solid", s.isActive || s.progress === 1), onLeave: () => document.querySelector(".nav").classList.add("solid"), onEnterBack: () => document.querySelector(".nav").classList.remove("solid") });

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  // ---------------------------------------------------------- 1 · portada
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".hero-sticker", { scale: 0.35, rotate: -28, opacity: 0, duration: 1.3, ease: "back.out(1.7)" })
    .to(".hero-sticker", { rotate: -4, duration: 0.6, ease: "sine.inOut" }, "-=0.3")
    .from(".hero-in", { y: 30, opacity: 0, duration: 0.8, stagger: 0.12 }, "-=0.7")
    .from(".float-spark", { scale: 0, rotate: 180, duration: 0.9, stagger: 0.1, ease: "back.out(3)" }, "-=0.8");
  gsap.to(".hero-sticker", { y: -10, rotate: -2, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 2 });
  gsap.to(".float-spark", { rotate: 360, duration: 12, ease: "none", repeat: -1 });

  gsap.to(".hero-inner", {
    yPercent: -35, scale: 0.82, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  // parallax genérico: data-speed
  gsap.utils.toArray("[data-speed]").forEach((el) => {
    const sp = parseFloat(el.dataset.speed);
    gsap.to(el, { yPercent: -60 * sp, ease: "none", scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: true } });
  });

  // ---------------------------------------------------------- 2 · la ruta
  const reveal = document.getElementById("routeReveal");
  const len = reveal.getTotalLength();
  gsap.set(reveal, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set("#plane", { opacity: 0 });
  const steps = gsap.utils.toArray(".step");
  gsap.set(steps, { opacity: 0, y: 30 });

  const rt = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: ".ruta", start: "top top", end: "+=2800", pin: true, scrub: 1, anticipatePin: 1 },
  });
  rt.to(steps[0], { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
    .from("#pinShadow", { scale: 0, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(3)" }, 0.1)
    .from("#pin", { scale: 0, y: -60, transformOrigin: "50% 100%", duration: 0.7, ease: "bounce.out" }, 0.1)
    .to(steps[0], { opacity: 0, y: -30, duration: 0.4 }, 1.2)
    .to(steps[1], { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.4)
    .set("#plane", { opacity: 1 }, 1.3)
    .to(reveal, { strokeDashoffset: 0, duration: 4 }, 1.3)
    .to("#plane", { duration: 4, motionPath: { path: "#routePath", align: "#routePath", alignOrigin: [0.5, 0.5], autoRotate: 90 } }, 1.3)
    .to(steps[1], { opacity: 0, y: -30, duration: 0.4 }, 4.4)
    .to(steps[2], { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 4.6)
    .to("#plane", { scale: 1.6, duration: 0.8 }, 4.6)
    .to({}, { duration: 0.6 });

  // ---------------------------------------------------------- 3 · destinos horizontal
  const dist = () => track.scrollWidth - window.innerWidth;
  const hz = gsap.to(track, {
    x: () => -dist(), ease: "none",
    scrollTrigger: { trigger: ".destinos", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
  });
  gsap.to(".trip-fill", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".destinos", start: "top top", end: () => "+=" + dist(), scrub: 1, invalidateOnRefresh: true } });
  gsap.to(".trip-plane", { x: () => document.querySelector(".trip-line").offsetWidth - 30, ease: "none", scrollTrigger: { trigger: ".destinos", start: "top top", end: () => "+=" + dist(), scrub: 1, invalidateOnRefresh: true } });

  gsap.utils.toArray(".panel").forEach((panel) => {
    panel.querySelectorAll("[data-depth]").forEach((ly) => {
      const d = parseFloat(ly.dataset.depth);
      if (!d) return;
      gsap.fromTo(ly, { xPercent: d * 9 }, { xPercent: -d * 9, ease: "none", scrollTrigger: { trigger: panel, containerAnimation: hz, start: "left right", end: "right left", scrub: true } });
    });
    const img = panel.querySelector(".ly-foto img");
    if (img)
      gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: panel, containerAnimation: hz, start: "left right", end: "right left", scrub: true } });
    const card = panel.querySelector(".card");
    if (card)
      gsap.from(card, { y: 120, rotate: -6, opacity: 0, ease: "back.out(1.6)", scrollTrigger: { trigger: panel, containerAnimation: hz, start: "left 70%", end: "left 15%", scrub: 1 } });
  });
  gsap.to(".wheel", { rotate: 360, transformOrigin: "50% 50%", transformBox: "fill-box", repeat: -1, duration: 1.4, ease: "none" });

  // ---------------------------------------------------------- quiénes somos
  const man = document.querySelector(".manifesto");
  const wrapWords = (node) =>
    [...node.childNodes].forEach((n) => {
      if (n.nodeType !== 3) return wrapWords(n);
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) return frag.append(p);
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = p;
        frag.append(s);
      });
      n.replaceWith(frag);
    });
  wrapWords(man);
  gsap.fromTo(".manifesto .w", { opacity: 0.16 }, {
    opacity: 1, stagger: 0.08, ease: "none",
    scrollTrigger: { trigger: ".manifesto", start: "top 80%", end: "bottom 40%", scrub: 0.6 },
  });
  gsap.to(".ns-marquee-in", { xPercent: -25, ease: "none", scrollTrigger: { trigger: ".nosotros", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".ns-card", {
    y: 90, rotate: (i) => [-5, 3, -3][i], opacity: 0, stagger: 0.15, ease: "back.out(1.6)", duration: 0.9,
    scrollTrigger: { trigger: ".ns-grid", start: "top 85%", toggleActions: "play none none reverse" },
  });
  gsap.from(".ns-trust", { y: 50, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".ns-trust", start: "top 90%", toggleActions: "play none none reverse" } });

  // ---------------------------------------------------------- paquetes
  gsap.to(".pq-marquee-in", { xPercent: -30, ease: "none", scrollTrigger: { trigger: ".paquetes", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".pq-head > *", { y: 40, opacity: 0, stagger: 0.12, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".pq-head", start: "top 85%" } });
  ScrollTrigger.batch(".pk", {
    start: "top 92%",
    onEnter: (els) => gsap.from(els, { y: 140, rotate: (i) => (i % 2 ? 9 : -9), scale: 0.9, opacity: 0, stagger: 0.12, duration: 1, ease: "back.out(1.4)", overwrite: true }),
    once: true,
  });
  gsap.utils.toArray(".pk-bg").forEach((bg) =>
    gsap.fromTo(bg, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: bg.parentElement, start: "top bottom", end: "bottom top", scrub: true } })
  );

  // ---------------------------------------------------------- 4 · cierre
  const title = document.querySelector(".cierre-title");
  title.innerHTML = title.innerHTML.replace(/(<em>.*?<\/em>|[^\s<]+)/g, '<span class="w">$1</span>');
  const ct = gsap.timeline({ scrollTrigger: { trigger: ".cierre", start: "top 70%", end: "top 10%", scrub: 1 } });
  ct.from(".cierre-iso", { scale: 0.4, rotate: -20, opacity: 0, ease: "back.out(2)" })
    .from(".cierre-title .w", { yPercent: 120, rotate: 8, opacity: 0, stagger: 0.12, ease: "back.out(2)" }, "<0.2")
    .from([".cierre-copy", ".cierre-cta"], { y: 40, opacity: 0, stagger: 0.15 }, "<0.4");
});

// Recalcula medidas cuando cargan fuentes e imágenes
document.fonts.ready.then(() => ScrollTrigger.refresh());
window.addEventListener("load", () => ScrollTrigger.refresh());
