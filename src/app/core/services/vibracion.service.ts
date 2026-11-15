import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { AuthService } from './auth.service';

// Plugin de Capacitor: @capacitor/haptics (vibracion del celular)
@Injectable({
  providedIn: 'root',
})
export class VibracionService {
  constructor(private authService: AuthService) {}

  // Solo vibra si estamos en el celular y el usuario lo tiene activado
  private puedeVibrar(): boolean {
    const usuario = this.authService.obtenerUsuario();
    if (!Capacitor.isNativePlatform() || usuario === null) {
      return false;
    }
    return usuario.ajustes.vibracion;
  }

  async toque(): Promise<void> {
    if (this.puedeVibrar()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  }

  async despegue(): Promise<void> {
    if (this.puedeVibrar()) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      await Haptics.vibrate({ duration: 300 });
    }
  }

  async aterrizaje(): Promise<void> {
    if (this.puedeVibrar()) {
      await Haptics.notification({ type: NotificationType.Success });
    }
  }

  async alerta(): Promise<void> {
    if (this.puedeVibrar()) {
      await Haptics.notification({ type: NotificationType.Warning });
    }
  }
}
