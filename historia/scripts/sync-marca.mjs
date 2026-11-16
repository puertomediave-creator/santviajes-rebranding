// Copia la fuente SV Conecta y los logos del rebranding a public/
// para que la historia siempre use la versión más reciente de la marca.
import { cpSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(here, "..", "..");
const pub = resolve(here, "..", "public");
mkdirSync(pub, { recursive: true });
cpSync(resolve(raiz, "fonts", "woff2"), resolve(pub, "fonts"), { recursive: true });
cpSync(resolve(raiz, "logos"), resolve(pub, "logos"), { recursive: true });
console.log("Marca sincronizada → public/fonts, public/logos");
