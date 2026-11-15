// Informacion del vuelo que esta en curso (se guarda en localStorage
// para que el temporizador siga bien aunque se cierre la app)
export interface VueloActivo {
  reservaId: string;
  inicioMs: number; // Date.now() cuando despego
  duracionMs: number;
  pausadoTotalMs: number; // tiempo total que estuvo en pausa
  pausadoDesdeMs: number | null; // si esta en pausa, desde cuando
  salidaAppMs: number | null; // cuando el usuario salio de la app
}
