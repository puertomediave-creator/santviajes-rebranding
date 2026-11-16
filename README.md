# San't Viajes — Rebranding 2026

Identidad renovada de **San't Viajes** («Viajes que conectan contigo»): el logo sticker y el isotipo de corazón viajero unidos en un solo sistema, con tipografía propia.

## Contenido

| Carpeta | Qué hay |
|---|---|
| `brand/index.html` | **Manual de marca** (concepto, logo, color, tipografía, elementos, aplicaciones, descargas) |
| `brand/tokens.css`, `brand/colores.json` | Paleta oficial como variables CSS y JSON |
| `logos/` | Logos SVG vectoriales: sticker (con y sin fondo), horizontal claro/oscuro, wordmark una tinta, isotipo (app, claro, oscuro) |
| `fonts/` | **Paquete de fuente SV Conecta**: `ttf/` (instalar en el equipo), `woff2/` (web), `sv-conecta.css` (@font-face), `sv-conecta-embebida.css` (fuente incrustada), `juego-de-caracteres.txt` |
| `source/build.py` | Script que dibuja la fuente y genera los logos. Edita y vuelve a ejecutar |

## SV Conecta

Sans redondeada de trazo continuo, dibujada a medida para la marca.

- Pesos: **Regular (400)**, **Bold (700)**, **Black (900)**
- 116 glifos: A–Z, a–z, 0–9, acentos del español (Á É Í Ó Ú Ñ Ü ¿ ¡), puntuación, `# % $ @ °`
- Símbolos de marca dentro de la fuente: ♥ (U+2665), ✈ (U+2708), ✦ (U+2726)
- Instalar en Windows: clic derecho sobre cada `.ttf` en `fonts/ttf/` → **Instalar**. Aparece como «SV Conecta» y «SV Conecta Black».
- En la web:

```html
<link rel="stylesheet" href="fonts/sv-conecta.css">
<style> h1 { font-family: "SV Conecta", sans-serif; font-weight: 900; } </style>
```

Texto largo: **DM Sans** (Google Fonts), la misma del sitio actual.

## Paleta

| Token | HEX | Uso |
|---|---|---|
| Azul Noche | `#0F1B33` | Fondos, textos |
| Aqua Brisa | `#8FD5D6` | SAN'T, mar |
| Amarillo Sol | `#F7C64A` | VIAJES, avión |
| Naranja Corazón | `#EB5A1E` | Acentos, CTA |
| Crema Arena | `#F7E4D4` | Lema, fondos cálidos |
| Blanco Nube | `#FFFFFF` | Borde sticker |

## Regenerar

```bash
pip install fonttools shapely brotli
python source/build.py
```

Ver el manual: abre `brand/index.html` en el navegador.
