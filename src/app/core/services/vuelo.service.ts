import { Injectable, inject } from '@angular/core';

import type { Vuelo, VueloEnCurso } from '../../models/vuelo.model';

import { StorageService } from './storage.service';

// Guarda el vuelo elegido y el vuelo en curso en el localStorage.
// Asi no se pierde si se recarga la pagina o se cierra la app.
@Injectable({
  providedIn: 'root',
})
export class VueloService {
  private storage = inject(StorageService);

  //se llama al presionar "Despegar" en la pantalla de reservar
  guardarVueloElegido(vuelo: Vuelo): void {
    this.storage.guardar('vuelo_elegido', vuelo);
  }

  obtenerVueloElegido(): Vuelo | null {
    return this.storage.leer<Vuelo | null>('vuelo_elegido', null);
  }

  //se llama cuando termina la cuenta regresiva 3, 2, 1
  iniciarVuelo(vuelo: Vuelo): void {
    const numero = Math.floor(1000 + Math.random() * 9000);
    const enCurso: VueloEnCurso = {
      codigo: 'FD' + numero,
      vuelo: vuelo,
      horaFin: Date.now() + vuelo.duracionMin * 60 * 1000, // se guarda la hora fin en ms
      pausado: false,
      msRestantes: 0,
    };
    this.guardarVueloEnCurso(enCurso);
  }

  obtenerVueloEnCurso(): VueloEnCurso | null {
    return this.storage.leer<VueloEnCurso | null>('vuelo_en_curso', null);
  }

  guardarVueloEnCurso(enCurso: VueloEnCurso): void {
    this.storage.guardar('vuelo_en_curso', enCurso);
  }

  // Al aterrizar guardamos el vuelo para mostrarlo en la pantalla de felicidades
  guardarUltimoVuelo(enCurso: VueloEnCurso): void {
    this.storage.guardar('ultimo_vuelo', enCurso);
  }

  obtenerUltimoVuelo(): VueloEnCurso | null {
    return this.storage.leer<VueloEnCurso | null>('ultimo_vuelo', null);
  }

  // Se llama al aterrizar o al abortar
  terminarVuelo(): void {
    this.storage.eliminar('vuelo_en_curso');
    this.storage.eliminar('vuelo_elegido');
  }
}
