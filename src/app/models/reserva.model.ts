import { Vuelo } from './vuelo.model';

// Estados posibles de un vuelo del usuario
export type EstadoReserva = 'en-vuelo' | 'completado' | 'desviado';

// Para que el usuario diga en que se va a concentrar
export type EtiquetaVuelo = 'Estudio' | 'Trabajo' | 'Lectura' | 'Proyecto' | 'Otro';

// Una reserva es un vuelo que el usuario ya tomo (o esta tomando)
export interface Reserva {
  id: string;
  usuarioId: string;
  vuelo: Vuelo;
  etiqueta: EtiquetaVuelo;
  nota: string;
  asiento: string; // ej: 14C
  puerta: string; // ej: B7
  estado: EstadoReserva;
  fechaInicio: string; // fecha en formato ISO
  fechaFin: string | null;
  minutosVolados: number;
}

// Datos que se envian para crear una reserva nueva
export interface NuevaReserva {
  usuarioId: string;
  vuelo: Vuelo;
  etiqueta: EtiquetaVuelo;
  nota: string;
}
