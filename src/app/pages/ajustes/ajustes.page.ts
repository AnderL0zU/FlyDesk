import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { documentText, logOutOutline, notifications, pulse, shieldCheckmark, sunny } from 'ionicons/icons';

import { AjustesService } from '../../core/services/ajustes.service';
import { AuthService } from '../../core/services/auth.service';
import { MensajesService } from '../../core/services/mensajes.service';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { VibracionService } from '../../core/services/vibracion.service';
import { VueloService } from '../../core/services/vuelo.service';
import type { Ajustes } from '../../models/ajustes.model';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonIcon,
    IonToggle,
    IonModal,
  ],
})
export class AjustesPage {
  private authService = inject(AuthService);
  private ajustesService = inject(AjustesService);
  private notificacionesService = inject(NotificacionesService);
  private vibracionService = inject(VibracionService);
  private vueloService = inject(VueloService);
  private mensajes = inject(MensajesService);
  private router = inject(Router);

  // Enlazado con los ion-toggle usando ngModel
  ajustes: Ajustes = this.ajustesService.obtener();

  // Modales de "Acerca de"
  privacidadAbierta = false;
  terminosAbiertos = false;

  constructor() {
    addIcons({ pulse, sunny, notifications, shieldCheckmark, documentText, logOutOutline });
  }

  ionViewWillEnter(): void {
    this.ajustes = this.ajustesService.obtener();
  }

  cambiarVibracion(): void {
    this.ajustesService.guardar(this.ajustes);
    // si la acaba de activar, vibramos para que lo note
    this.vibracionService.toque();
  }

  cambiarPantalla(): void {
    this.ajustesService.guardar(this.ajustes);
  }

  async cambiarNotificaciones(): Promise<void> {
    // al activarlas hay que pedir permiso al sistema
    if (this.ajustes.notificaciones) {
      const aceptado = await this.notificacionesService.pedirPermiso();
      if (!aceptado) {
        this.ajustes.notificaciones = false;
        this.mensajes.error('Activa el permiso de notificaciones en la configuración del celular');
      }
    }
    this.ajustesService.guardar(this.ajustes);
  }

  async cerrarSesion(): Promise<void> {
    const aceptar = await this.mensajes.confirmar('Cerrar sesión', '¿Seguro que quieres salir de tu cuenta?', 'Salir');
    if (!aceptar) {
      return;
    }
    // si quedo un vuelo a medias lo borramos, para que la siguiente cuenta no lo retome
    this.vueloService.terminarVuelo();
    this.notificacionesService.cancelarAterrizaje();
    this.authService.cerrarSesion();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
