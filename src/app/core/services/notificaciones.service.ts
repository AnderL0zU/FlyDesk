import { Injectable, inject } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

import type { VueloEnCurso } from '../../models/vuelo.model';

import { AjustesService } from './ajustes.service';

// Programa un aviso para la hora en que aterriza el vuelo
const ID_ATERRIZAJE = 1;

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  private ajustesService = inject(AjustesService);

  // Pide el permiso al usuario. Devuelve true si lo acepto
  async pedirPermiso(): Promise<boolean> {
    try {
      const permiso = await LocalNotifications.requestPermissions();
      return permiso.display === 'granted';
    } catch (error) {
      console.warn('No se pudo pedir permiso de notificaciones', error);
      return false;
    }
  }

  async programarAterrizaje(enCurso: VueloEnCurso): Promise<void> {
    if (!this.ajustesService.obtener().notificaciones) {
      return;
    }
    // por si habia una programada antes
    await this.cancelarAterrizaje();
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: ID_ATERRIZAJE,
            title: '¡Aterrizaste en ' + enCurso.vuelo.destino.ciudad + '!',
            body: 'Completaste tu vuelo de enfoque. Buen trabajo.',
            schedule: { at: new Date(enCurso.horaFin), allowWhileIdle: true },
          },
        ],
      });
    } catch (error) {
      console.warn('No se pudo programar la notificacion', error);
    }
  }

  async cancelarAterrizaje(): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: ID_ATERRIZAJE }] });
    } catch (error) {
      console.warn('No se pudo cancelar la notificacion', error);
    }
  }
}
