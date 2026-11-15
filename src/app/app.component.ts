import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonAvatar,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  AlertController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  airplaneOutline,
  homeOutline,
  informationCircleOutline,
  logOutOutline,
  personOutline,
  timeOutline,
} from 'ionicons/icons';
import { Usuario } from './models/usuario.model';
import { AuthService } from './core/services/auth.service';
import { MensajesService } from './core/services/mensajes.service';

// Opcion del menu lateral
interface OpcionMenu {
  titulo: string;
  url: string;
  icono: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  // Eager = Angular revisa este componente en cada ciclo (comportamiento clasico)
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonAvatar,
    IonNote,
    IonFooter,
  ],
})
export class AppComponent {
  usuario: Usuario | null = null;

  opciones: OpcionMenu[] = [
    { titulo: 'Inicio', url: '/tabs/inicio', icono: 'home-outline' },
    { titulo: 'Buscar vuelos', url: '/tabs/buscar', icono: 'airplane-outline' },
    { titulo: 'Mi historial', url: '/tabs/historial', icono: 'time-outline' },
    { titulo: 'Perfil', url: '/tabs/perfil', icono: 'person-outline' },
  ];

  constructor(
    private authService: AuthService,
    private mensajes: MensajesService,
    private alertController: AlertController,
    private router: Router,
  ) {
    addIcons({ airplaneOutline, homeOutline, timeOutline, personOutline, logOutOutline, informationCircleOutline });
  }

  // Se ejecuta cada vez que se abre el menu, asi el nombre siempre esta actualizado
  alAbrirMenu(): void {
    this.usuario = this.authService.obtenerUsuario();
  }

  obtenerIniciales(): string {
    if (!this.usuario) {
      return '?';
    }
    const partes = this.usuario.nombre.split(' ');
    let iniciales = partes[0].charAt(0);
    if (partes.length > 1) {
      iniciales += partes[1].charAt(0);
    }
    return iniciales.toUpperCase();
  }

  async mostrarAcercaDe(): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'FlyDesk ✈️',
      subHeader: 'Versión 1.0.0',
      message:
        'Convierte tus sesiones de estudio o trabajo en vuelos alrededor del mundo. ' +
        'Proyecto de Programación de Dispositivos Móviles (USCO).',
      buttons: ['Cerrar'],
    });
    await alerta.present();
  }

  async cerrarSesion(): Promise<void> {
    const confirmo = await this.mensajes.confirmar('Cerrar sesión', '¿Seguro que quieres salir de FlyDesk?', 'Salir');
    if (confirmo) {
      this.authService.cerrarSesion();
      this.router.navigateByUrl('/login', { replaceUrl: true });
      this.mensajes.mostrarToast('Sesión cerrada. ¡Buen viaje!');
    }
  }
}
