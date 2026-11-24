// Aeropuerto como lo usamos dentro de la app
export interface Aeropuerto {
  iata: string; // codigo de 3 letras, ej: BOG
  nombre: string;
  ciudad: string;
  pais: string;
  codigoPais: string; // codigo de 2 letras, ej: CO
  continente: string; // codigo de 2 letras, ej: SA
  lat: number;
  lng: number;
}

// Aeropuerto como lo devuelve API Ninjas (solo los campos que usamos)
export interface AeropuertoApi {
  iata: string;
  name: string;
  city: string;
  country: string;
  country_name: string;
  continent: string;
  latitude: number;
  longitude: number;
}
