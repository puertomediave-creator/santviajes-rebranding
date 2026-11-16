// Tarea programada: todos los días a las 6:00 a. m. (hora de Colombia) actualiza la agenda.
import { getStore } from "@netlify/blobs";
import { recolectar } from "../lib/agenda.mjs";

export default async () => {
  const datos = await recolectar();
  await getStore("agenda").setJSON("eventos", datos);
  console.log(`Agenda: ${datos.eventos.length} eventos · IA ${datos.ia ? "sí" : "no"} · ${JSON.stringify(datos.estado)}`);
};

export const config = { schedule: "0 11 * * *" }; // 11:00 UTC = 6:00 a. m. en Colombia
