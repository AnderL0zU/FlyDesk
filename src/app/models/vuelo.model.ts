import type { Aeropuerto } from './aeropuerto.model';

// Un vuelo posible desde el origen hasta un destino
export interface Vuelo {
  origen: Aeropuerto; // trae y usa dentro la interfaz aeropuerto
  destino: Aeropuerto;
  distanciaKm: number;
  duracionMin: number;
}

// El vuelo que el usuario esta haciendo ahora mismo
export interface VueloEnCurso {
  codigo: string; // numero de vuelo
  vuelo: Vuelo;
  horaFin: number; // fecha en milisegundos en la que aterriza
  pausado: boolean;
  msRestantes: number; // solo se usa cuando esta en pausa
}

export interface RegistroVuelo {
  //registro vuelo = vuelo terminado
  id: string;
  codigo: string;
  origenIata: string;
  origenCiudad: string;
  destinoIata: string;
  destinoCiudad: string;
  duracionMin: number; // lo que duraba el vuelo
  minutosVolados: number; // lo que alcanzo a enfocarse
  fecha: number; // Date.now() cuando termino
  estado: 'completado' | 'abortado';
}
