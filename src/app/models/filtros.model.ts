import { Vuelo } from './vuelo.model';

// Filtros de la pantalla Buscar vuelos
export interface FiltrosBusqueda {
  origen: string; // codigo IATA o '' si no eligio
  destino: string;
  continente: string; // continente del destino o '' para todos
  duracionMin: number;
  duracionMax: number;
  pagina: number;
}

// Respuesta del endpoint GET /api/vuelos
export interface ResultadoBusqueda {
  vuelos: Vuelo[];
  hayMas: boolean;
}
