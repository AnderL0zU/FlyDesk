import { Injectable, inject } from '@angular/core';

import type { RegistroVuelo, VueloEnCurso } from '../../models/vuelo.model';

import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class HistorialService {
  private storage = inject(StorageService);
  private auth = inject(AuthService);

  private obtenerLlave(): string {
    const usuario = this.auth.obtenerUsuario(); // cada usuario tiene su propia lista: "historial_<id del usuario>"
    if (usuario) {
      return 'historial_' + usuario.id;
    }
    return 'historial_invitado';
  }

  obtenerTodos(): RegistroVuelo[] {
    return this.storage.leer<RegistroVuelo[]>(this.obtenerLlave(), []);
  }

  //crea el registro a partir del vuelo en curso y lo guarda de primero
  agregar(enCurso: VueloEnCurso, minutosVolados: number, estado: 'completado' | 'abortado'): void {
    const registro: RegistroVuelo = {
      id: Date.now().toString(),
      codigo: enCurso.codigo,
      origenIata: enCurso.vuelo.origen.iata,
      origenCiudad: enCurso.vuelo.origen.ciudad,
      destinoIata: enCurso.vuelo.destino.iata,
      destinoCiudad: enCurso.vuelo.destino.ciudad,
      duracionMin: enCurso.vuelo.duracionMin,
      minutosVolados: minutosVolados,
      fecha: Date.now(),
      estado: estado,
    };

    const lista = this.obtenerTodos();
    lista.unshift(registro); // el mas nuevo arriba
    this.storage.guardar(this.obtenerLlave(), lista);
  }

  eliminar(id: string): void {
    const lista = this.obtenerTodos().filter((registro) => registro.id !== id);
    this.storage.guardar(this.obtenerLlave(), lista);
  }

  borrarTodo(): void {
    this.storage.eliminar(this.obtenerLlave());
  }
}
