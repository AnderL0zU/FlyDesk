import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { AjustesService } from './ajustes.service';

//capacitor/hapticsvibracion del celular
@Injectable({
  providedIn: 'root',
})
export class VibracionService {
  private ajustesService = inject(AjustesService);


  // Vibracion corta
  async toque(): Promise<void> {
    if (this.puedeVibrar()) {
      await Haptics.impact({ style: ImpactStyle.Light }); //light
    }
  }

  // Vibracion fuerte
  async fuerte(): Promise<void> {
    if (this.puedeVibrar()) {
      await Haptics.impact({ style: ImpactStyle.Heavy }); //heavy
    }
  }

  //solo vibra en celular y tambien si el usuario lo tiene activado en ajustes
  private puedeVibrar(): boolean {
    return Capacitor.isNativePlatform() && this.ajustesService.obtener().vibracion;
  }
}
