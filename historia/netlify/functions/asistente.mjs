// POST /api/asistente → Asistente San't Viajes (IA de Puerto Media).
// Sin ANTHROPIC_API_KEY responde 503 y la página usa el modo guiado sin IA.
import Anthropic from "@anthropic-ai/sdk";
import { getStore } from "@netlify/blobs";
import { ordenar } from "../lib/ranking.mjs";

const SISTEMA = `Eres el Asistente de San't Viajes, creado por Puerto Media. San't Viajes es una operadora de turismo colombiana (RNT 251308), lema "Viajes que conectan contigo". Diseña viajes a la medida: ruta, hotel, traslados, tours y entradas a eventos y conciertos.

Destinos: Medellín (eterna primavera: Comuna 13, metrocable, Guatapé y la Piedra del Peñol, alumbrados en diciembre), Cartagena (Ciudad Amurallada, Getsemaní, Islas del Rosario, Playa Blanca, chiva rumbera), Eje Cafetero (Valle de Cocora, Salento, Parque del Café, termales de Santa Rosa de Cabal, fincas cafeteras), Bogotá (La Candelaria, Monserrate, Museo del Oro, Museo Botero, Zona T), Cali (salsa, Cristo Rey, San Antonio) y Santa Marta.

Paquetes publicados:
- Medellín Alumbrado: 3 noches / 4 días, 1 al 4 de diciembre.
- ¡Alerta Medellín! Fin de año: 30 dic al 2 ene, 3 noches / 4 días, desde 390 USD.
- Cartagena de Indias: 3 noches / 4 días. Incluye traslados, alojamiento, desayunos, city tour y chiva, guía acompañante y asistencia médica.
- Fin de año Eje Cafetero: finca hotel, cena de fin de año, Valle de Cocora y Salento.
- Modo Caribe Santa Marta.
- Bogotá Experience.
- Eventos y conciertos: entradas, alojamiento, transporte y logística.

Reglas:
- Responde en español de Colombia, cálido y breve (máximo 90 palabras), con un solo llamado a la acción.
- No inventes precios, fechas, cupos ni lo que incluye un paquete si no está arriba. El único precio publicado es el de ¡Alerta Medellín!. Para cotizar, envía a WhatsApp.
- Para reservar o cotizar usa este enlace exacto: https://wa.me/573019523262 (atención de lunes a sábado).
- Si preguntan por eventos, usa solo la agenda que se te entrega y menciona fecha y ciudad; propón viajar con San't Viajes.
- Si el tema no tiene que ver con viajes o con San't Viajes, redirige con amabilidad.
- No pidas datos sensibles (documentos, tarjetas, contraseñas).`;

export default async (req) => {
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405 });
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ modo: "guiado" }, { status: 503 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "JSON inválido" }, { status: 400 }); }
  const mensajes = (Array.isArray(body.mensajes) ? body.mensajes : [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }));
  while (mensajes.length && mensajes[0].role !== "user") mensajes.shift();
  if (!mensajes.length) return Response.json({ error: "Sin mensajes" }, { status: 400 });

  // Agenda vigente (los 12 eventos más relevantes) como contexto
  let agenda = "Agenda no disponible en este momento.";
  try {
    const datos = await getStore("agenda").get("eventos", { type: "json" });
    if (datos) {
      agenda = ordenar(datos).eventos.slice(0, 12)
        .map((e) => `- ${e.titulo} · ${e.ciudadNombre || e.ciudad} · ${e.inicio}${e.fin && e.fin !== e.inicio ? ` a ${e.fin}` : ""} · ${e.categoria}`)
        .join("\n");
    }
  } catch {}

  const client = new Anthropic();
  try {
    const res = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [
        { type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } },
        { type: "text", text: `Agenda de eventos vigente (actualizada a diario):\n${agenda}` },
      ],
      messages: mensajes,
    });
    if (res.stop_reason === "refusal") {
      return Response.json({ respuesta: "Prefiero que esto lo atienda una persona del equipo. Escríbenos por WhatsApp: https://wa.me/573019523262" });
    }
    const texto = res.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return Response.json({ respuesta: texto || "¿Me cuentas un poco más de tu viaje?" });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return Response.json({ modo: "guiado", error: "clave" }, { status: 503 });
    if (err instanceof Anthropic.RateLimitError) return Response.json({ modo: "guiado", error: "limite" }, { status: 503 });
    if (err instanceof Anthropic.APIError) return Response.json({ modo: "guiado", error: err.status }, { status: 503 });
    return Response.json({ modo: "guiado" }, { status: 503 });
  }
};

export const config = { path: "/api/asistente" };
