// Ilustraciones vectoriales por capas para el parallax.
// Cada capa es un <svg> independiente con data-depth (0 = fondo quieto, 1 = primer plano rápido).

export const C = {
  noche: "#0F1B33", noche2: "#1A2A4D", noche3: "#24365F",
  brisa: "#8FD5D6", sol: "#F7C64A", corazon: "#EB5A1E", arena: "#F7E4D4",
  verde1: "#8CCB8A", verde2: "#4FA36F", verde3: "#2F7D5B", cafe: "#7A3E1D", rosa: "#E98AA6",
};

// Generador pseudoaleatorio estable (misma ilustración en cada carga)
export function rng(seed) {
  let s = seed;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

const layer = (depth, inner, extra = "") =>
  `<svg class="ly" data-depth="${depth}" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" ${extra}>${inner}</svg>`;

export const PLANE_D =
  "M0 -40C4 -40 6 -35 6 -30L6 -12L38 6L38 14L6 4L6 22L15 30L15 36L0 32L-15 36L-15 30L-6 22L-6 4L-38 14L-38 6L-6 -12L-6 -30C-6 -35 -4 -40 0 -40Z";

function burst(x, y, r, color, w = 7) {
  let s = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    s += `<line x1="${x + Math.cos(a) * r * 0.35}" y1="${y + Math.sin(a) * r * 0.35}" x2="${x + Math.cos(a) * r}" y2="${y + Math.sin(a) * r}"/>`;
  }
  return `<g class="burst" stroke="${color}" stroke-width="${w}" stroke-linecap="round" style="transform-origin:${x}px ${y}px">${s}</g>`;
}

function stars(n, seed, h = 500) {
  const r = rng(seed);
  let s = "";
  for (let i = 0; i < n; i++) s += `<circle cx="${r() * 1600}" cy="${r() * h}" r="${1 + r() * 2.4}" fill="#fff" opacity="${0.3 + r() * 0.7}"/>`;
  return s;
}

function waxPalm(x, y, s) {
  const top = y - 420 * s;
  return `<line x1="${x}" y1="${y}" x2="${x}" y2="${top}" stroke="#E9E2D0" stroke-width="${11 * s}" stroke-linecap="round"/>
  <g fill="${C.verde3}" stroke="${C.noche}" stroke-width="${4 * s}" stroke-linejoin="round" transform="translate(${x} ${top}) scale(${s})">
   <path d="M0 0C-40 -50 -100 -40 -120 10C-70 -20 -30 -15 0 0Z"/><path d="M0 0C40 -50 100 -40 120 10C70 -20 30 -15 0 0Z"/>
   <path d="M0 0C-20 -60 10 -100 50 -100C20 -70 10 -40 0 0Z"/><path d="M0 0C20 -60 -10 -100 -50 -100C-20 -70 -10 -40 0 0Z"/>
   <path d="M0 0C-60 -10 -90 30 -90 60C-60 30 -30 15 0 0Z"/><path d="M0 0C60 -10 90 30 90 60C60 30 30 15 0 0Z"/></g>`;
}

function coconutPalm(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
   <path d="M0 0C10 -120 -10 -220 30 -330" fill="none" stroke="${C.noche}" stroke-width="22" stroke-linecap="round"/>
   <g fill="#2F8F6B" stroke="${C.noche}" stroke-width="6" stroke-linejoin="round">
    <path d="M30 -330C-40 -380 -120 -350 -150 -290C-80 -330 -20 -320 30 -330Z"/>
    <path d="M30 -330C100 -390 190 -360 210 -300C140 -340 80 -330 30 -330Z"/>
    <path d="M30 -330C0 -410 60 -460 120 -450C70 -420 50 -380 30 -330Z"/>
    <path d="M30 -330C-30 -420 -110 -430 -140 -400C-80 -400 -20 -370 30 -330Z"/></g></g>`;
}

// ---------------------------------------------------------------- Medellín
function medellin() {
  const r = rng(11);
  let lights = "";
  for (let i = 0; i < 260; i++) {
    const x = r() * 1600, y = 600 + r() * 210;
    lights += `<circle cx="${x}" cy="${y}" r="${1.5 + r() * 3}" fill="${[C.sol, C.brisa, C.corazon, C.arena][i % 4]}" opacity="${0.45 + r() * 0.55}"/>`;
  }
  let cabins = "";
  [260, 760, 1260].forEach((x) => {
    const y = 300 + x * 0.16;
    cabins += `<g class="cabin" transform="translate(${x} ${y})"><line x1="0" y1="-34" x2="0" y2="0" stroke="${C.arena}" stroke-width="4"/>
      <rect x="-46" y="0" width="92" height="70" rx="18" fill="${C.sol}" stroke="${C.noche}" stroke-width="5"/>
      <rect x="-32" y="14" width="28" height="24" rx="6" fill="${C.noche}"/><rect x="4" y="14" width="28" height="24" rx="6" fill="${C.noche}"/></g>`;
  });
  return (
    layer(0, `<defs><linearGradient id="gM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1428"/><stop offset="1" stop-color="#24365F"/></linearGradient></defs><rect width="1600" height="900" fill="url(#gM)"/>${stars(120, 3)}`) +
    layer(0.15, burst(300, 210, 120, C.sol) + burst(1200, 170, 150, C.brisa, 8) + burst(820, 300, 80, C.corazon) + burst(1450, 380, 70, C.arena)) +
    layer(0.4, `<path d="M0 640L160 520L320 590L480 470L640 560L820 450L980 550L1150 470L1320 560L1480 480L1600 520V900H0Z" fill="${C.noche2}"/>${lights}`) +
    layer(0.75, `<path d="M0 770L200 690L380 740L600 670L820 750L1040 680L1260 740L1450 690L1600 730V900H0Z" fill="${C.noche3}"/>
      <line x1="-60" y1="290" x2="1700" y2="572" stroke="${C.arena}" stroke-width="5" opacity=".8"/>${cabins}`)
  );
}

// ---------------------------------------------------------------- Cartagena
function cartagena() {
  const cols = [C.corazon, C.sol, C.arena, C.brisa, C.rosa, C.sol, C.corazon, C.brisa, C.arena, C.rosa];
  let houses = "", x = -40;
  [200, 250, 190, 240, 210, 260, 200, 240, 220, 250].forEach((h, i) => {
    const w = 180, y = 640 - h;
    houses += `<rect x="${x}" y="${y}" width="${w}" height="${h + 60}" fill="${cols[i]}" stroke="${C.noche}" stroke-width="7"/>
     <rect x="${x - 8}" y="${y - 20}" width="${w + 16}" height="24" rx="6" fill="${C.noche}"/>
     <rect x="${x + 34}" y="${y + 46}" width="42" height="62" rx="21" fill="${C.noche}"/><rect x="${x + 104}" y="${y + 46}" width="42" height="62" rx="21" fill="${C.noche}"/>
     <rect x="${x + 20}" y="${y + 108}" width="140" height="15" rx="4" fill="${C.verde3}"/>
     <path d="M${x + 24} ${y + 123}v20M${x + 56} ${y + 123}v20M${x + 88} ${y + 123}v20M${x + 120} ${y + 123}v20M${x + 152} ${y + 123}v20" stroke="${C.verde3}" stroke-width="5"/>
     <circle cx="${x + 90}" cy="${y + 190}" r="14" fill="${C.noche}" opacity=".25"/>`;
    x += w - 6;
  });
  const chiva = `<g class="bob" transform="translate(980 600)">
    <rect x="0" y="0" width="420" height="160" rx="26" fill="${C.sol}" stroke="${C.noche}" stroke-width="8"/>
    <rect x="0" y="-38" width="420" height="46" rx="14" fill="${C.corazon}" stroke="${C.noche}" stroke-width="8"/>
    <g fill="${C.brisa}" stroke="${C.noche}" stroke-width="6"><rect x="24" y="22" width="74" height="58" rx="10"/><rect x="116" y="22" width="74" height="58" rx="10"/><rect x="208" y="22" width="74" height="58" rx="10"/><rect x="300" y="22" width="96" height="58" rx="10"/></g>
    <path d="M0 108H420" stroke="${C.corazon}" stroke-width="12"/><path d="M0 130H420" stroke="${C.brisa}" stroke-width="10"/>
    <g fill="${C.arena}"><circle cx="50" cy="-62" r="11"/><circle cx="150" cy="-62" r="11"/><circle cx="250" cy="-62" r="11"/><circle cx="350" cy="-62" r="11"/></g>
    <g class="wheel"><circle cx="96" cy="170" r="36" fill="${C.noche}"/><circle cx="96" cy="170" r="12" fill="${C.arena}"/></g>
    <g class="wheel"><circle cx="326" cy="170" r="36" fill="${C.noche}"/><circle cx="326" cy="170" r="12" fill="${C.arena}"/></g></g>`;
  return (
    layer(0, `<defs><linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FDDE3"/><stop offset="1" stop-color="#FFF1D6"/></linearGradient></defs><rect width="1600" height="900" fill="url(#gC)"/>`) +
    layer(0.12, `<circle class="sun" cx="1250" cy="230" r="120" fill="${C.sol}"/><g fill="#fff" opacity=".85"><ellipse cx="300" cy="170" rx="120" ry="34"/><ellipse cx="380" cy="150" rx="80" ry="40"/><ellipse cx="900" cy="120" rx="100" ry="28"/></g>`) +
    layer(0.35, `<rect y="560" width="1600" height="340" fill="#4DB6BF"/><path class="wave" d="M-100 590Q35 570 170 590T440 590T710 590T980 590T1250 590T1520 590T1790 590" fill="none" stroke="#fff" stroke-width="6" opacity=".7"/>`) +
    layer(0.55, houses) +
    layer(0.9, `<rect y="790" width="1600" height="110" fill="#F2D9A6"/>${coconutPalm(170, 860, 1.1)}${coconutPalm(1530, 880, 0.8)}${chiva}`)
  );
}

// ---------------------------------------------------------------- Eje Cafetero
function eje() {
  let palms = "";
  [[160, 640, 1.1], [380, 600, 0.8], [560, 630, 0.95], [820, 590, 0.75], [1040, 620, 1.05], [1260, 600, 0.8], [1480, 630, 1]].forEach(([x, y, s]) => (palms += waxPalm(x, y, s)));
  return (
    layer(0, `<defs><linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE8DD"/><stop offset="1" stop-color="#F3F7E6"/></linearGradient></defs><rect width="1600" height="900" fill="url(#gE)"/>`) +
    layer(0.1, `<circle class="sun" cx="1300" cy="200" r="110" fill="${C.sol}"/>`) +
    layer(0.3, `<path d="M0 560C220 470 420 510 640 560S1050 470 1300 520S1520 500 1600 520V900H0Z" fill="${C.verde1}"/>`) +
    layer(0.55, `${palms}<path d="M0 660C240 590 470 630 700 680S1100 600 1350 650S1550 640 1600 650V900H0Z" fill="${C.verde2}"/>`) +
    layer(0.9, `<path d="M0 780C280 720 560 790 860 790S1300 730 1600 760V900H0Z" fill="${C.verde3}"/>
      <path d="M40 840C300 760 600 880 860 800S1300 740 1560 690" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-dasharray="1 26"/>
      <g fill="${C.cafe}" stroke="${C.noche}" stroke-width="5"><ellipse cx="1350" cy="830" rx="34" ry="46" transform="rotate(-30 1350 830)"/><ellipse cx="1430" cy="845" rx="30" ry="40" transform="rotate(25 1430 845)"/></g>`)
  );
}

// ---------------------------------------------------------------- Bogotá
function bogota() {
  const r = rng(29);
  let bld = "", x = 0;
  while (x < 1600) {
    const w = 70 + r() * 90, h = 120 + r() * 220;
    const tall = Math.abs(x - 900) < 60;
    const H = tall ? 430 : h;
    bld += `<rect x="${x}" y="${720 - H}" width="${w}" height="${H + 40}" fill="${tall ? C.corazon : [C.noche2, C.noche3, "#2D3F6B"][Math.floor(r() * 3)]}"/>`;
    for (let wy = 720 - H + 24; wy < 700; wy += 34)
      for (let wx = x + 14; wx < x + w - 16; wx += 26) if (r() > 0.45) bld += `<rect x="${wx}" y="${wy}" width="12" height="16" rx="3" fill="${C.sol}" opacity="${0.5 + r() * 0.5}"/>`;
    x += w + 6;
  }
  return (
    layer(0, `<defs><linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#24365F"/><stop offset=".55" stop-color="#E98AA6"/><stop offset="1" stop-color="${C.sol}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#gB)"/>${stars(50, 8, 260)}`) +
    layer(0.2, `<path d="M-50 720C150 600 300 300 520 210C600 180 650 190 700 230C900 380 1100 560 1700 640V900H-50Z" fill="#3B4F7E"/>
      <g transform="translate(610 205)"><rect x="-34" y="-56" width="68" height="56" fill="#fff"/><rect x="-14" y="-96" width="28" height="44" fill="#fff"/><path d="M-20 -96L0 -124L20 -96Z" fill="#fff"/><rect x="-8" y="-38" width="16" height="38" rx="8" fill="${C.noche}"/></g>
      <path d="M560 300C640 380 700 470 780 520" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="1 16" stroke-linecap="round"/>`) +
    layer(0.5, bld) +
    layer(0.9, `<rect y="760" width="1600" height="140" fill="${C.noche}"/><g class="bob" transform="translate(260 650)"><rect width="460" height="120" rx="24" fill="#D7263D" stroke="${C.noche}" stroke-width="7"/>
      <g fill="${C.brisa}" stroke="${C.noche}" stroke-width="5"><rect x="22" y="18" width="80" height="48" rx="8"/><rect x="118" y="18" width="80" height="48" rx="8"/><rect x="214" y="18" width="80" height="48" rx="8"/><rect x="310" y="18" width="128" height="48" rx="8"/></g>
      <g class="wheel"><circle cx="90" cy="124" r="30" fill="${C.noche}"/><circle cx="90" cy="124" r="10" fill="${C.arena}"/></g><g class="wheel"><circle cx="370" cy="124" r="30" fill="${C.noche}"/><circle cx="370" cy="124" r="10" fill="${C.arena}"/></g></g>`)
  );
}

// true = fotos reales (Pexels) · false = ilustraciones vectoriales
export const USAR_FOTOS = true;

export const DESTINOS = [
  { id: "medellin", nombre: "Medellín", kicker: "La eterna primavera", texto: "Alumbrados, metrocable y fin de año con la ciudad iluminada.", color: C.sol, escena: medellin, oscuro: true,
    foto: "medellin", credito: "Clive Kim", url: "https://www.pexels.com/photo/4150118/" },
  { id: "cartagena", nombre: "Cartagena", kicker: "Playa, chiva y rumba", texto: "Calles de colores, mar Caribe y noches que no se olvidan.", color: C.corazon, escena: cartagena,
    foto: "cartagena", credito: "Kelly", url: "https://www.pexels.com/photo/11815901/" },
  { id: "eje", nombre: "Eje Cafetero", kicker: "El corazón verde", texto: "Palmas de cera, fincas cafeteras y aire de montaña.", color: C.verde3, escena: eje,
    foto: "eje-cafetero", credito: "Chris Rodriguez", url: "https://www.pexels.com/photo/2884864/" },
  { id: "bogota", nombre: "Bogotá", kicker: "Enamórate de la capital", texto: "La Candelaria, Monserrate y la ciudad que nunca se queda quieta.", color: C.brisa, escena: bogota, oscuro: true,
    foto: "bogota", credito: "Rodolfo Torres Bermudez", url: "https://www.pexels.com/photo/33675799/" },
];

// Escena con foto real: foto (lenta + zoom) → velo para leer → capa de marca (rápida)
export function fotoEscena(d, i) {
  const r = rng(40 + i);
  let sparks = "";
  for (let k = 0; k < 5; k++) {
    const x = 700 + r() * 850, y = 80 + r() * 380, s = 0.5 + r() * 0.9;
    sparks += `<path class="tw" transform="translate(${x} ${y}) scale(${s})" d="M0 -40C4 -12 12 -4 40 0C12 4 4 12 0 40C-4 12 -12 4 -40 0C-12 -4 -4 -12 0 -40Z" fill="${[C.sol, C.corazon, "#fff"][k % 3]}"/>`;
  }
  const y0 = 760 - r() * 120;
  return `<div class="ly ly-foto" data-depth="0.22"><img src="/fotos/${d.foto}-1200.webp" srcset="/fotos/${d.foto}-1200.webp 1200w, /fotos/${d.foto}-2400.webp 2400w" sizes="124vw" alt="${d.nombre}" decoding="async"></div>
   <div class="tint" aria-hidden="true"></div>
   ${layer(0.85, `<path d="M-40 ${y0}C300 ${y0 - 160} 560 ${y0 + 60} 900 ${y0 - 80}S1400 ${y0 - 320} 1680 ${y0 - 260}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-dasharray="1 26" opacity=".9"/>
     <path transform="translate(1540 ${y0 - 290}) rotate(60) scale(1.2)" d="${PLANE_D}" fill="${C.sol}" stroke="${C.noche}" stroke-width="3"/>${sparks}`, 'style="z-index:2"')}
   <a class="credit" href="${d.url}" target="_blank" rel="noopener">Foto: ${d.credito} / Pexels</a>`;
}

// Ruta del corazón (misma geometría que el isotipo) → atributo d de un <path>
export function heartRoute() {
  const hp = (t, sc = 10.5, cx = 250, cy = 282) => {
    const X = 16 * Math.sin(t) ** 3;
    const Y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [cx + sc * X, cy - sc * (Y + 2.5)];
  };
  const pts = [[250, 272], hp(2 * Math.PI)];
  const n = 160, t0 = 2 * Math.PI, t1 = 1.0;
  for (let i = 1; i <= n; i++) pts.push(hp(t0 + ((t1 - t0) * i) / n));
  const [ex, ey] = pts[pts.length - 1];
  // Despegue: sale del corazón hacia arriba a la derecha
  return `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}C${ex + 20} ${ey - 50} ${ex + 90} ${ey - 110} ${ex + 260} ${ey - 200}`;
}
