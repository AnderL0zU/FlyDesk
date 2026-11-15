export interface Estadisticas {
  totalVuelos: number;
  completados: number;
  desviados: number;
  minutosTotales: number;
  kmTotales: number;
  minutosHoy: number;
  paisesVisitados: string[];
  rachaDias: number; // dias seguidos con al menos un vuelo completado
}
