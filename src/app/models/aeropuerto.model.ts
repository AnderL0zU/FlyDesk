// Representa un aeropuerto del archivo assets/data/aeropuertos.json
export interface Aeropuerto {
  iata: string; // codigo de 3 letras, ej: BOG
  nombre: string;
  ciudad: string;
  pais: string;
  continente: string;
  lat: number;
  lng: number;
}
