import { Injectable } from '@angular/core';
import { Reserva } from '../../models/reserva.model';
import { VueloActivo } from '../../models/vuelo-activo.model';
import { StorageService } from './storage.service';

// Lleva el control del temporizador del vuelo en curso.
// Guardamos las HORAS (Date.now()) en vez de un contador, asi aunque
// la app se cierre o el celular se bloquee el tiempo sigue siendo correcto.
@Injectable({
  providedIn: 'root',
})
export class VueloActivoService {
  private llave = 'vuelo_activo';

  constructor(private storage: StorageService) {}

  iniciar(reserva: Reserva): VueloActivo {
    const vuelo: VueloActivo = {
      reservaId: reserva.id,
      inicioMs: Date.now(),
      duracionMs: reserva.vuelo.duracionMin * 60 * 1000,
      pausadoTotalMs: 0,
      pausadoDesdeMs: null,
      salidaAppMs: null,
    };
    this.storage.guardar(this.llave, vuelo);
    return vuelo;
  }

  obtener(): VueloActivo | null {
    return this.storage.leer<VueloActivo | null>(this.llave, null);
  }

  terminar(): void {
    this.storage.eliminar(this.llave);
  }

  estaPausado(): boolean {
    const vuelo = this.obtener();
    return vuelo !== null && vuelo.pausadoDesdeMs !== null;
  }

  pausar(): void {
    const vuelo = this.obtener();
    if (vuelo && vuelo.pausadoDesdeMs === null) {
      vuelo.pausadoDesdeMs = Date.now();
      this.storage.guardar(this.llave, vuelo);
    }
  }

  reanudar(): void {
    const vuelo = this.obtener();
    if (vuelo && vuelo.pausadoDesdeMs !== null) {
      vuelo.pausadoTotalMs += Date.now() - vuelo.pausadoDesdeMs;
      vuelo.pausadoDesdeMs = null;
      this.storage.guardar(this.llave, vuelo);
    }
  }

  // Para el modo estricto: guardamos cuando salio de la app
  registrarSalida(): void {
    const vuelo = this.obtener();
    if (vuelo) {
      vuelo.salidaAppMs = Date.now();
      this.storage.guardar(this.llave, vuelo);
    }
  }

  // Devuelve cuantos segundos estuvo fuera de la app y limpia el dato
  registrarRegreso(): number {
    const vuelo = this.obtener();
    if (!vuelo || vuelo.salidaAppMs === null) {
      return 0;
    }
    const segundosFuera = Math.round((Date.now() - vuelo.salidaAppMs) / 1000);
    vuelo.salidaAppMs = null;
    this.storage.guardar(this.llave, vuelo);
    return segundosFuera;
  }

  // Milisegundos que lleva volando (sin contar las pausas)
  calcularTranscurridoMs(): number {
    const vuelo = this.obtener();
    if (!vuelo) {
      return 0;
    }
    let pausado = vuelo.pausadoTotalMs;
    if (vuelo.pausadoDesdeMs !== null) {
      pausado += Date.now() - vuelo.pausadoDesdeMs;
    }
    const transcurrido = Date.now() - vuelo.inicioMs - pausado;
    return Math.min(Math.max(transcurrido, 0), vuelo.duracionMs);
  }

  calcularRestanteMs(): number {
    const vuelo = this.obtener();
    if (!vuelo) {
      return 0;
    }
    return vuelo.duracionMs - this.calcularTranscurridoMs();
  }

  // Numero entre 0 y 1
  calcularProgreso(): number {
    const vuelo = this.obtener();
    if (!vuelo || vuelo.duracionMs === 0) {
      return 0;
    }
    return this.calcularTranscurridoMs() / vuelo.duracionMs;
  }
}
