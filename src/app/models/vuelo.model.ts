import { Aeropuerto } from './aeropuerto.model';

// Un vuelo "disponible" que aparece en la pantalla de buscar
export interface Vuelo {
  codigo: string; // ej: FD1234
  origen: Aeropuerto;
  destino: Aeropuerto;
  distanciaKm: number;
  duracionMin: number; // duracion del vuelo = duracion de la sesion de foco
}
