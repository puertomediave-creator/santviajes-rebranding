// GET /api/eventos → agenda vigente ordenada por cercanía (fecha + ciudad del visitante).
import { getStore } from "@netlify/blobs";
import { recolectar } from "../lib/agenda.mjs";
import { ordenar } from "../lib/ranking.mjs";

const VIGENCIA_MS = 26 * 3600e3; // si la tarea diaria no ha corrido, se recolecta aquí

export default async (req, context) => {
  const store = getStore("agenda");
  let datos = await store.get("eventos", { type: "json" });
  if (!datos || Date.now() - Date.parse(datos.actualizado) > VIGENCIA_MS) {
    datos = await recolectar();
    await store.setJSON("eventos", datos);
  }

  const u = new URL(req.url);
  const lat = parseFloat(u.searchParams.get("lat"));
  const lon = parseFloat(u.searchParams.get("lon"));
  const geo = context.geo || {};
  const enColombia = geo.country?.code === "CO";
  const origen = Number.isFinite(lat) && Number.isFinite(lon)
    ? { lat, lon }
    : enColombia ? { lat: geo.latitude, lon: geo.longitude, ciudad: geo.city } : {};

  const res = ordenar(datos, origen);
  if (origen.ciudad) res.origen = { ciudad: origen.ciudad };
  return Response.json(res, { headers: { "Cache-Control": "public, max-age=0, s-maxage=900" } });
};

export const config = { path: "/api/eventos" };
