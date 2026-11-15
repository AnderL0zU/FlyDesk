import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenuButton,
  IonNote,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  airplane,
  airplaneOutline,
  checkmarkCircle,
  closeCircle,
  earthOutline,
  flameOutline,
  navigateOutline,
  rocketOutline,
  timeOutline,
  trophyOutline,
} from 'ionicons/icons';
import { Estadisticas } from '../../models/estadisticas.model';
import { Reserva } from '../../models/reserva.model';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { ReservasService } from '../../core/services/reservas.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { VueloActivoService } from '../../core/services/vuelo-activo.service';
import { MensajesService } from '../../core/services/mensajes.service';
import { TarjetaEstadisticaComponent } from '../../shared/components/tarjeta-estadistica/tarjeta-estadistica.component';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonProgressBar,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonNote,
    IonAvatar,
    IonIcon,
    IonButton,
    IonText,
    IonFab,
    IonFabButton,
    TarjetaEstadisticaComponent,
    DuracionPipe,
  ],
})
export class InicioPage {
  usuario: Usuario | null = null;
  estadisticas: Estadisticas | null = null;
  ultimosVuelos: Reserva[] = [];
  vueloEnCurso: Reserva | null = null;
  cargando = true;

  constructor(
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private reservasService: ReservasService,
    private vueloActivoService: VueloActivoService,
    private mensajes: MensajesService,
    private router: Router,
  ) {
    addIcons({
      airplane,
      airplaneOutline,
      timeOutline,
      earthOutline,
      navigateOutline,
      flameOutline,
      trophyOutline,
      rocketOutline,
      checkmarkCircle,
      closeCircle,
    });
  }

  // Cada vez que entramos a la pestaña recargamos los datos
  ionViewWillEnter(): void {
    this.cargarDatos();
  }

  cargarDatos(evento?: RefresherCustomEvent): void {
    this.usuario = this.authService.obtenerUsuario();
    if (!this.usuario) {
      return;
    }
    this.cargando = true;

    this.usuariosService.obtenerEstadisticas(this.usuario.id).subscribe({
      next: (datos) => {
        this.estadisticas = datos;
        this.cargando = false;
        if (evento) {
          evento.target.complete();
        }
      },
      error: (err) => {
        this.cargando = false;
        this.mensajes.error(this.mensajes.obtenerMensajeError(err));
        if (evento) {
          evento.target.complete();
        }
      },
    });

    this.reservasService.listar(this.usuario.id).subscribe({
      next: (reservas) => {
        // las 3 mas recientes que ya terminaron
        this.ultimosVuelos = reservas.filter((r) => r.estado !== 'en-vuelo').slice(0, 3);
        this.buscarVueloEnCurso(reservas);
      },
    });
  }

  private buscarVueloEnCurso(reservas: Reserva[]): void {
    const activo = this.vueloActivoService.obtener();
    this.vueloEnCurso = null;
    if (activo) {
      const reserva = reservas.find((r) => r.id === activo.reservaId && r.estado === 'en-vuelo');
      if (reserva) {
        this.vueloEnCurso = reserva;
      }
    }
  }

  obtenerSaludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) {
      return 'Buenos días';
    } else if (hora < 19) {
      return 'Buenas tardes';
    }
    return 'Buenas noches';
  }

  obtenerPrimerNombre(): string {
    if (!this.usuario) {
      return '';
    }
    return this.usuario.nombre.split(' ')[0];
  }

  // Progreso de la meta diaria (de 0 a 1) para el ion-progress-bar
  obtenerProgresoMeta(): number {
    if (!this.estadisticas || !this.usuario) {
      return 0;
    }
    return Math.min(this.estadisticas.minutosHoy / this.usuario.ajustes.metaDiariaMin, 1);
  }

  obtenerHorasTotales(): string {
    if (!this.estadisticas) {
      return '0';
    }
    return (this.estadisticas.minutosTotales / 60).toFixed(1);
  }

  obtenerKilometros(): string {
    if (!this.estadisticas) {
      return '0';
    }
    // toLocaleString agrega los puntos de miles: 12500 -> 12.500
    return this.estadisticas.kmTotales.toLocaleString('es-CO');
  }

  continuarVuelo(): void {
    if (this.vueloEnCurso) {
      this.router.navigate(['/vuelo', this.vueloEnCurso.id]);
    }
  }

  irABuscar(): void {
    this.router.navigateByUrl('/tabs/buscar');
  }

  irAHistorial(): void {
    this.router.navigateByUrl('/tabs/historial');
  }
}
