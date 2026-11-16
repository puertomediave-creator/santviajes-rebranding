// Ordena la agenda según la cercanía en el tiempo y la distancia al visitante.
import { distanciaKm, ganchoBase, hoyCO, ubicar } from "./agenda.mjs";

export function ordenar(datos, { lat, lon, ciudad } = {}) {
  const hoy = hoyCO();
  let origen = lat != null && lon != null ? [lat, lon] : null;
  if (!origen && ciudad) origen = ubicar(ciudad).coords;

  const dia = (s) => Date.parse(s + "T00:00:00Z");
  const lista = datos.eventos
    .filter((e) => (e.fin || e.inicio) >= hoy)
    .map((e) => {
      const enCurso = e.inicio <= hoy;
      const dias = enCurso ? 0 : Math.round((dia(e.inicio) - dia(hoy)) / 864e5);
      const km = origen && e.coords ? distanciaKm(origen, e.coords) : null;
      // puntaje: más alto = más relevante. El tiempo pesa más que la distancia.
      let p = e.permanente ? 25 : Math.max(0, 100 - dias * 1.2);
      if (km != null) p += Math.max(0, 80 - km / 8);
      if (e.ia) p += 3;
      const etiquetas = [];
      if (e.permanente) etiquetas.push("Todo el año");
      else if (enCurso) etiquetas.push("¡Es ahora!");
      else if (dias <= 7) etiquetas.push(dias === 1 ? "¡Es mañana!" : `En ${dias} días`);
      else if (dias <= 31) etiquetas.push("Este mes");
      if (km != null && km <= 150) etiquetas.push(km < 15 ? "En tu ciudad" : `A ${km} km de ti`);
      return { ...e, dias, km, puntaje: Math.round(p), etiquetas, gancho: e.gancho || ganchoBase(e, dias) };
    })
    .sort((a, b) => b.puntaje - a.puntaje || a.inicio.localeCompare(b.inicio));

  return { actualizado: datos.actualizado, hoy, ia: datos.ia, origen: origen ? { ciudad: ciudad || null } : null, total: lista.length, eventos: lista };
}
