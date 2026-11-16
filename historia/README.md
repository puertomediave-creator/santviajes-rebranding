# San't Viajes — Historia animada (storytelling parallax)

Web de una sola página que cuenta la marca con scroll: **portada sticker → el corazón que se dibuja → viaje horizontal por Medellín, Cartagena, Eje Cafetero y Bogotá → cierre con WhatsApp**.

## Tecnología
- **GSAP 3.15** · ScrollTrigger (pin, scrub, scroll horizontal, `containerAnimation`) y MotionPathPlugin (el avión sigue la ruta del corazón). Gratis, incluso para uso comercial.
- **Lenis 1.3** · scroll suave sincronizado con el reloj de GSAP.
- **Vite 8** · servidor de desarrollo y compilación.
- Ilustraciones 100 % SVG por capas (`src/escenas.js`): cada capa tiene `data-depth` y se mueve a distinta velocidad.
- Solo se animan `transform` y `opacity` (aceleradas por GPU) → fluido a 60 fps.
- Respeta *movimiento reducido* del sistema: sin pin ni parallax, todo visible.

## Usar
```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # genera dist/ listo para subir (Netlify, Hostinger, etc.)
```
`npm run dev` y `npm run build` copian antes la fuente SV Conecta y los logos desde `../fonts` y `../logos`.

## Editar
| Qué | Dónde |
|---|---|
| Textos de capítulos y cierre | `index.html` |
| Destinos (nombre, frase, color) | `DESTINOS` en `src/escenas.js` |
| Dibujos de cada escena | funciones `medellin()`, `cartagena()`, `eje()`, `bogota()` en `src/escenas.js` |
| Velocidades, duración del pin, suavidad | `src/main.js` (`lerp` de Lenis, `end: "+=2800"`, `xPercent` del parallax) |
| WhatsApp / Instagram | enlaces en `index.html` |
| Fotos reales o ilustraciones | `USAR_FOTOS` en `src/escenas.js` |
| Cambiar una foto | reemplaza `public/fotos/<destino>-2400.webp` y `-1200.webp`, y su crédito en `DESTINOS` |

## Fotos
Pexels (licencia gratuita, uso comercial). Originales y créditos en `fotos-originales/CREDITOS.md`; cada panel muestra el crédito del fotógrafo.
