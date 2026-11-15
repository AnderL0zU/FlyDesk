// Funciones de ayuda para calcular distancias y posiciones en el mapa.

const RADIO_TIERRA_KM = 6371;
const VELOCIDAD_PROMEDIO_KMH = 800; // velocidad aproximada de un avion comercial

function aRadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}

function aGrados(radianes: number): number {
  return (radianes * 180) / Math.PI;
}

// Formula de Haversine: distancia "en linea recta" sobre la Tierra
export function calcularDistanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = aRadianes(lat2 - lat1);
  const dLng = aRadianes(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(RADIO_TIERRA_KM * c);
}

// Duracion del vuelo en minutos: tiempo en el aire + 15 min de despegue/aterrizaje.
// Se redondea a multiplos de 5 para que se vea mas bonito.
export function calcularDuracionMin(distanciaKm: number): number {
  const minutos = (distanciaKm / VELOCIDAD_PROMEDIO_KMH) * 60 + 15;
  return Math.max(15, Math.round(minutos / 5) * 5);
}

// Calcula un punto entre el origen y el destino siguiendo la curva de la Tierra.
// fraccion = 0 es el origen, fraccion = 1 es el destino.
export function puntoIntermedio(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  fraccion: number,
): { lat: number; lng: number } {
  const lat1Rad = aRadianes(lat1);
  const lng1Rad = aRadianes(lng1);
  const lat2Rad = aRadianes(lat2);
  const lng2Rad = aRadianes(lng2);

  // distancia angular entre los dos puntos
  const d = calcularDistanciaKm(lat1, lng1, lat2, lng2) / RADIO_TIERRA_KM;
  if (d === 0) {
    return { lat: lat1, lng: lng1 };
  }

  const a = Math.sin((1 - fraccion) * d) / Math.sin(d);
  const b = Math.sin(fraccion * d) / Math.sin(d);
  const x = a * Math.cos(lat1Rad) * Math.cos(lng1Rad) + b * Math.cos(lat2Rad) * Math.cos(lng2Rad);
  const y = a * Math.cos(lat1Rad) * Math.sin(lng1Rad) + b * Math.cos(lat2Rad) * Math.sin(lng2Rad);
  const z = a * Math.sin(lat1Rad) + b * Math.sin(lat2Rad);

  return {
    lat: aGrados(Math.atan2(z, Math.sqrt(x * x + y * y))),
    lng: aGrados(Math.atan2(y, x)),
  };
}
