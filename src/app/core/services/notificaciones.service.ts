import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Reserva } from '../../models/reserva.model';

// Plugin de Capacitor: @capacitor/local-notifications
// Avisa al usuario cuando su vuelo "aterriza" aunque la app este en segundo plano.
@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  // id fijo porque solo puede haber un vuelo activo a la vez
  private ID_ATERRIZAJE = 1001;

  // En Android 13+ el permiso POST_NOTIFICATIONS se pide en tiempo de ejecucion
  async pedirPermiso(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false; // en el navegador no hacemos nada
    }

    let permiso = await LocalNotifications.checkPermissions();
    if (permiso.display === 'prompt' || permiso.display === 'prompt-with-rationale') {
      permiso = await LocalNotifications.requestPermissions();
    }
    return permiso.display === 'granted';
  }

  async programarAterrizaje(reserva: Reserva, fechaAterrizaje: Date): Promise<void> {
    const tienePermiso = await this.pedirPermiso();
    if (!tienePermiso) {
      return;
    }

    // por si quedo una notificacion vieja
    await this.cancelarAterrizaje();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: this.ID_ATERRIZAJE,
          title: '🛬 ¡Aterrizaste en ' + reserva.vuelo.destino.ciudad + '!',
          body: 'Completaste ' + reserva.vuelo.duracionMin + ' minutos de concentración. Abre FlyDesk para ver tu resumen.',
          schedule: { at: fechaAterrizaje, allowWhileIdle: true },
        },
      ],
    });
  }

  // Para probar desde el perfil: llega una notificacion en 5 segundos
  async enviarPrueba(): Promise<boolean> {
    const tienePermiso = await this.pedirPermiso();
    if (!tienePermiso) {
      return false;
    }
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 2002,
          title: '✈️ FlyDesk',
          body: '¡Las notificaciones funcionan! Así te avisaremos cuando aterrices.',
          schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true },
        },
      ],
    });
    return true;
  }

  async cancelarAterrizaje(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    await LocalNotifications.cancel({ notifications: [{ id: this.ID_ATERRIZAJE }] });
  }
}
