import { Injectable, inject } from '@angular/core';

import type { Ajustes } from '../../models/ajustes.model';

import { StorageService } from './storage.service';

// Guarda y lee los ajustes en el localStorage
@Injectable({
  providedIn: 'root',
})
export class AjustesService {
  private storage = inject(StorageService);

  // Valores la primera vez que se abre la app
  private ajustesPorDefecto: Ajustes = {
    vibracion: true,
    pantallaEncendida: true,
    notificaciones: false,
  };

  obtener(): Ajustes {
    return this.storage.leer<Ajustes>('ajustes', this.ajustesPorDefecto);
  }

  guardar(ajustes: Ajustes): void {
    this.storage.guardar('ajustes', ajustes);
  }
}
