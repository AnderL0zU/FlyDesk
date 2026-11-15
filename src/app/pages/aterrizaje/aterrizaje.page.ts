import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  MenuController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { airplane, earthOutline, homeOutline, navigateOutline, timeOutline, trophy, warning } from 'ionicons/icons';
import { Estadisticas } from '../../models/estadisticas.model';
import { Reserva } from '../../models/reserva.model';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { MensajesService } from '../../core/services/mensajes.service';
import { ReservasService } from '../../core/services/reservas.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { PaseAbordarComponent } from '../../shared/components/pase-abordar/pase-abordar.component';
import { TarjetaEstadisticaComponent } from '../../shared/components/tarjeta-estadistica/tarjeta-estadistica.component';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';

// Resumen que se muestra cuando el vuelo termina (completado o desviado)
@Component({
  selector: 'app-aterrizaje',
  templateUrl: './aterrizaje.page.html',
  styleUrls: ['./aterrizaje.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonText,
    IonButton,
    IonSpinner,
    PaseAbordarComponent,
    TarjetaEstadisticaComponent,
    DuracionPipe,
  ],
})
export class AterrizajePage {
  reserva: Reserva | null = null;
  usuario: Usuario | null = null;
  estadisticas: Estadisticas | null = null;

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private reservasService: ReservasService,
    private usuariosService: UsuariosService,
    private mensajes: MensajesService,
    private menuController: MenuController,
  ) {
    addIcons({ trophy, warning, airplane, homeOutline, timeOutline, earthOutline, navigateOutline });
  }

  ionViewWillEnter(): void {
    this.menuController.enable(false);
    this.usuario = this.authService.obtenerUsuario();
    const id = this.ruta.snapshot.paramMap.get('id') || '';

    this.reservasService.obtener(id).subscribe({
      next: (reserva) => {
        this.reserva = reserva;
        if (reserva.estado === 'completado') {
          this.mensajes.exito('¡Aterrizaje exitoso en ' + reserva.vuelo.destino.ciudad + '!');
        }
      },
      error: (err) => this.mensajes.error(this.mensajes.obtenerMensajeError(err)),
    });

    if (this.usuario) {
      this.usuariosService.obtenerEstadisticas(this.usuario.id).subscribe({
        next: (datos) => (this.estadisticas = datos),
      });
    }
  }

  fueCompletado(): boolean {
    return this.reserva !== null && this.reserva.estado === 'completado';
  }

  nuevoVuelo(): void {
    this.router.navigateByUrl('/tabs/buscar', { replaceUrl: true });
  }

  irAlInicio(): void {
    this.router.navigateByUrl('/tabs/inicio', { replaceUrl: true });
  }
}
