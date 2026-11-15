import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonRadio,
  IonRadioGroup,
  IonTextarea,
  IonTitle,
  IonToolbar,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bookOutline,
  briefcaseOutline,
  closeOutline,
  codeSlashOutline,
  ellipsisHorizontalOutline,
  libraryOutline,
  lockClosedOutline,
  rocketOutline,
} from 'ionicons/icons';
import { Clima } from '../../../models/clima.model';
import { EtiquetaVuelo } from '../../../models/reserva.model';
import { Usuario } from '../../../models/usuario.model';
import { Vuelo } from '../../../models/vuelo.model';
import { AuthService } from '../../../core/services/auth.service';
import { ClimaService } from '../../../core/services/clima.service';
import { MensajesService } from '../../../core/services/mensajes.service';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { ReservasService } from '../../../core/services/reservas.service';
import { VibracionService } from '../../../core/services/vibracion.service';
import { VueloActivoService } from '../../../core/services/vuelo-activo.service';
import { GloboComponent } from '../../../shared/components/globo/globo.component';
import { PaseAbordarComponent } from '../../../shared/components/pase-abordar/pase-abordar.component';

interface OpcionEtiqueta {
  valor: EtiquetaVuelo;
  icono: string;
}

// Modal que se abre al tocar un vuelo: muestra la ruta en el globo,
// el pase de abordar y deja escoger en que se va a concentrar.
@Component({
  selector: 'app-reservar-vuelo',
  templateUrl: './reservar-vuelo.component.html',
  styleUrls: ['./reservar-vuelo.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonListHeader,
    IonRadioGroup,
    IonRadio,
    IonItem,
    IonLabel,
    IonTextarea,
    IonNote,
    IonFooter,
    GloboComponent,
    PaseAbordarComponent,
  ],
})
export class ReservarVueloComponent implements OnInit {
  @Input({ required: true }) vuelo!: Vuelo;

  usuario: Usuario | null = null;
  etiqueta: EtiquetaVuelo = 'Estudio';
  nota = '';
  clima: Clima | null = null;
  cargandoClima = true;

  etiquetas: OpcionEtiqueta[] = [
    { valor: 'Estudio', icono: 'library-outline' },
    { valor: 'Trabajo', icono: 'briefcase-outline' },
    { valor: 'Lectura', icono: 'book-outline' },
    { valor: 'Proyecto', icono: 'code-slash-outline' },
    { valor: 'Otro', icono: 'ellipsis-horizontal-outline' },
  ];

  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private climaService: ClimaService,
    private reservasService: ReservasService,
    private vueloActivoService: VueloActivoService,
    private notificacionesService: NotificacionesService,
    private vibracionService: VibracionService,
    private mensajes: MensajesService,
  ) {
    addIcons({
      closeOutline,
      rocketOutline,
      lockClosedOutline,
      libraryOutline,
      briefcaseOutline,
      bookOutline,
      codeSlashOutline,
      ellipsisHorizontalOutline,
    });
  }

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuario();
    this.cargarClima();
  }

  // Peticion a una API real (Open-Meteo). Si no hay internet simplemente no se muestra.
  cargarClima(): void {
    this.climaService.obtenerClima(this.vuelo.destino.lat, this.vuelo.destino.lng).subscribe({
      next: (clima) => {
        this.clima = clima;
        this.cargandoClima = false;
      },
      error: () => {
        this.cargandoClima = false;
      },
    });
  }

  cerrar(): void {
    this.modalController.dismiss(null, 'cancelar');
  }

  async despegar(): Promise<void> {
    if (!this.usuario) {
      return;
    }

    // solo se puede tener un vuelo a la vez
    if (this.vueloActivoService.obtener() !== null) {
      this.mensajes.error('Ya tienes un vuelo en curso. Termínalo antes de despegar otro.');
      return;
    }

    const cargando = await this.loadingController.create({ message: 'Abordando...', spinner: 'dots' });
    await cargando.present();

    this.reservasService
      .crear({ usuarioId: this.usuario.id, vuelo: this.vuelo, etiqueta: this.etiqueta, nota: this.nota })
      .subscribe({
        next: async (reserva) => {
          // empezamos el temporizador y programamos la notificacion de aterrizaje
          this.vueloActivoService.iniciar(reserva);
          if (this.usuario && this.usuario.ajustes.notificaciones) {
            const fechaAterrizaje = new Date(Date.now() + reserva.vuelo.duracionMin * 60000);
            await this.notificacionesService.programarAterrizaje(reserva, fechaAterrizaje);
          }
          this.vibracionService.despegue();
          await cargando.dismiss();
          this.modalController.dismiss(reserva, 'despegar');
        },
        error: async (err) => {
          await cargando.dismiss();
          this.mensajes.error(this.mensajes.obtenerMensajeError(err));
        },
      });
  }
}
