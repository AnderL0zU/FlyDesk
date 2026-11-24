import { Injectable, inject } from '@angular/core';
import { KeepAwake } from '@capacitor-community/keep-awake';

import { AjustesService } from './ajustes.service';

// Plugin de Capacitor: @capacitor-community/keep-awake
// Evita que la pantalla se apague mientras el usuario esta en un vuelo
@Injectable({
  providedIn: 'root',
})
export class PantallaService {
  private ajustesService = inject(AjustesService);

  async mantenerEncendida(): Promise<void> {
    if (!this.ajustesService.obtener().pantallaEncendida) {
      return;
    }
    try {
      await KeepAwake.keepAwake();
    } catch (error) {
      // algunos navegadores no lo soportan, no pasa nada
      console.warn('No se pudo mantener la pantalla encendida', error);
    }
  }

  async permitirApagar(): Promise<void> {
    try {
      await KeepAwake.allowSleep();
    } catch (error) {
      console.warn('No se pudo liberar la pantalla', error);
    }
  }
}
