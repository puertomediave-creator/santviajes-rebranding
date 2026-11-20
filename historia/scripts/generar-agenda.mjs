// Genera public/agenda.json con los eventos vigentes (lo ejecuta GitHub Actions cada mañana).
// Si existe ANTHROPIC_API_KEY (secreto del repositorio), la IA escribe los ganchos promocionales.
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { recolectar } from "../netlify/lib/agenda.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const datos = await recolectar();
writeFileSync(resolve(here, "..", "public", "agenda.json"), JSON.stringify(datos));
console.log(`agenda.json: ${datos.eventos.length} eventos · IA ${datos.ia ? "sí" : "no"} · ${JSON.stringify(datos.estado)}`);
if (!datos.eventos.length) process.exitCode = 0; // una agenda vacía no debe tumbar la publicación
