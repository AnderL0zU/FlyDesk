import { ChangeDetectionStrategy, Component, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import {
  ActionSheetController,
  AlertController,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonLabel,
  IonProgressBar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  MenuController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  airplane,
  chevronDownOutline,
  closeCircleOutline,
  ellipsisVertical,
  lockClosedOutline,
  pause,
  play,
  pricetagOutline,
} from 'ionicons/icons';
import { Reserva } from '../../models/reserva.model';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { MensajesService } from '../../core/services/mensajes.service';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { ReservasService } from '../../core/services/reservas.service';
import { VibracionService } from '../../core/services/vibracion.service';
import { VueloActivoService } from '../../core/services/vuelo-activo.service';
import { GloboComponent } from '../../shared/components/globo/globo.component';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';
import { RelojPipe } from '../../shared/pipes/reloj.pipe';

// Segundos que el usuario puede salir de la app en modo estricto sin que se desvie
const SEGUNDOS_PERMITIDOS_FUERA = 10;

@Component({
  selector: 'app-vuelo-en-curso',
  templateUrl: './vuelo-en-curso.page.html',
  styleUrls: ['./vuelo-en-curso.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonProgressBar,
    IonChip,
    IonLabel,
    IonText,
    IonSpinner,
    IonFooter,
    GloboComponent,
    DuracionPipe,
    RelojPipe,
  ],
})
export class VueloEnCursoPage implements OnDestroy {
  reserva: Reserva | null = null;
  usuario: Usuario | null = null;

  restanteMs = 0;
  progreso = 0; // de 0 a 1
  progresoGlobo = 0; // el globo se actualiza con menos frecuencia
  pausado = false;
  terminando = false; // evita llamar aterrizar() dos veces

  private intervalo: any = null;
  private contadorTicks = 0;
  private listenerApp: PluginListenerHandle | null = null;

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
    private zona: NgZone,
    private authService: AuthService,
    private reservasService: ReservasService,
    private vueloActivoService: VueloActivoService,
    private notificacionesService: NotificacionesService,
    private vibracionService: VibracionService,
    private mensajes: MensajesService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private menuController: MenuController,
  ) {
    addIcons({
      airplane,
      pause,
      play,
      ellipsisVertical,
      chevronDownOutline,
      lockClosedOutline,
      pricetagOutline,
      closeCircleOutline,
    });
  }

  ionViewWillEnter(): void {
    this.menuController.enable(false);
    this.usuario = this.authService.obtenerUsuario();
    this.terminando = false;

    const id = this.ruta.snapshot.paramMap.get('id') || '';
    this.reservasService.obtener(id).subscribe({
      next: (reserva) => {
        this.reserva = reserva;
        this.revisarEstadoInicial();
      },
      error: (err) => {
        this.mensajes.error(this.mensajes.obtenerMensajeError(err));
        this.router.navigateByUrl('/tabs/inicio', { replaceUrl: true });
      },
    });
  }

  ionViewWillLeave(): void {
    this.detenerTemporizador();
    this.quitarListenerApp();
  }

  ngOnDestroy(): void {
    this.detenerTemporizador();
    this.quitarListenerApp();
  }

  // ------------------------------------------------------------------
  // Inicio
  // ------------------------------------------------------------------
  private revisarEstadoInicial(): void {
    if (!this.reserva) {
      return;
    }

    // si el vuelo ya termino lo mandamos al resumen
    if (this.reserva.estado !== 'en-vuelo') {
      this.router.navigate(['/aterrizaje', this.reserva.id], { replaceUrl: true });
      return;
    }

    const activo = this.vueloActivoService.obtener();
    if (!activo || activo.reservaId !== this.reserva.id) {
      this.mensajes.error('No encontramos el temporizador de este vuelo');
      this.router.navigateByUrl('/tabs/inicio', { replaceUrl: true });
      return;
    }

    // Modo estricto: si la app se cerro mientras volaba, el vuelo se desvia
    if (this.esModoEstricto() && activo.salidaAppMs !== null) {
      const segundosFuera = this.vueloActivoService.registrarRegreso();
      if (segundosFuera > SEGUNDOS_PERMITIDOS_FUERA) {
        this.desviar('Saliste de FlyDesk durante ' + segundosFuera + ' segundos.');
        return;
      }
    }

    this.pausado = this.vueloActivoService.estaPausado();
    this.actualizar();
    this.progresoGlobo = this.progreso;
    this.iniciarTemporizador();
    this.escucharEstadoApp();
  }

  esModoEstricto(): boolean {
    return this.usuario !== null && this.usuario.ajustes.modoEstricto;
  }

  // ------------------------------------------------------------------
  // Temporizador
  // ------------------------------------------------------------------
  private iniciarTemporizador(): void {
    this.detenerTemporizador();
    this.intervalo = setInterval(() => this.actualizar(), 1000);
  }

  private detenerTemporizador(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }

  // Se ejecuta cada segundo
  private actualizar(): void {
    this.restanteMs = this.vueloActivoService.calcularRestanteMs();
    this.progreso = this.vueloActivoService.calcularProgreso();

    // el globo lo movemos cada 5 segundos para no gastar tanta bateria
    this.contadorTicks++;
    if (this.contadorTicks % 5 === 0) {
      this.progresoGlobo = this.progreso;
    }

    if (this.restanteMs <= 0 && !this.terminando) {
      this.aterrizar();
    }
  }

  // Texto de la fase del vuelo segun el progreso
  obtenerFase(): string {
    if (this.pausado) {
      return 'En espera (pausado)';
    } else if (this.progreso < 0.05) {
      return 'Despegando';
    } else if (this.progreso < 0.9) {
      return 'En crucero';
    }
    return 'Descendiendo';
  }

  obtenerPorcentaje(): number {
    return Math.floor(this.progreso * 100);
  }

  // ------------------------------------------------------------------
  // Plugin @capacitor/app: saber si el usuario salio de la app
  // ------------------------------------------------------------------
  private async escucharEstadoApp(): Promise<void> {
    await this.quitarListenerApp();
    this.listenerApp = await App.addListener('appStateChange', (estado) => {
      // los eventos de Capacitor pasan fuera de Angular, por eso usamos zona.run
      this.zona.run(() => this.alCambiarEstadoApp(estado.isActive));
    });
  }

  private async quitarListenerApp(): Promise<void> {
    if (this.listenerApp) {
      await this.listenerApp.remove();
      this.listenerApp = null;
    }
  }

  // Revisa que el vuelo de esta pagina sea el que esta activo ahora
  private esVueloActivo(): boolean {
    const activo = this.vueloActivoService.obtener();
    return this.reserva !== null && activo !== null && activo.reservaId === this.reserva.id;
  }

  private alCambiarEstadoApp(estaActiva: boolean): void {
    if (!this.esModoEstricto() || this.terminando || !this.esVueloActivo()) {
      return; // en modo flexible el vuelo sigue normal
    }

    if (!estaActiva) {
      this.vueloActivoService.registrarSalida();
    } else {
      const segundosFuera = this.vueloActivoService.registrarRegreso();
      if (segundosFuera > SEGUNDOS_PERMITIDOS_FUERA) {
        this.desviar('Saliste de FlyDesk durante ' + segundosFuera + ' segundos.');
      } else if (segundosFuera > 0) {
        this.mensajes.mostrarToast('¡Casi! Vuelve a concentrarte ✈️', 'warning', 'warning-outline');
      }
    }
  }

  // ------------------------------------------------------------------
  // Acciones del usuario
  // ------------------------------------------------------------------
  async pausarOReanudar(): Promise<void> {
    if (!this.reserva) {
      return;
    }
    if (this.pausado) {
      this.vueloActivoService.reanudar();
      this.pausado = false;
      // reprogramamos la notificacion con la nueva hora de llegada
      if (this.usuario && this.usuario.ajustes.notificaciones) {
        const llegada = new Date(Date.now() + this.vueloActivoService.calcularRestanteMs());
        await this.notificacionesService.programarAterrizaje(this.reserva, llegada);
      }
      this.mensajes.mostrarToast('Vuelo reanudado', 'primary', 'play');
    } else {
      this.vueloActivoService.pausar();
      this.pausado = true;
      await this.notificacionesService.cancelarAterrizaje();
      this.mensajes.mostrarToast('Vuelo en pausa', 'medium', 'pause');
    }
    this.vibracionService.toque();
  }

  async mostrarOpciones(): Promise<void> {
    const botones: any[] = [];

    if (!this.esModoEstricto()) {
      botones.push({
        text: this.pausado ? 'Reanudar vuelo' : 'Pausar vuelo',
        icon: this.pausado ? 'play' : 'pause',
        handler: () => {
          this.pausarOReanudar();
        },
      });
      botones.push({
        text: 'Salir de la cabina (el vuelo sigue)',
        icon: 'chevron-down-outline',
        handler: () => {
          this.router.navigateByUrl('/tabs/inicio');
        },
      });
    }

    botones.push({
      text: 'Abortar vuelo',
      role: 'destructive',
      icon: 'close-circle-outline',
      handler: () => {
        this.confirmarAbortar();
      },
    });
    botones.push({ text: 'Cancelar', role: 'cancel' });

    const hoja = await this.actionSheetController.create({
      header: 'Opciones del vuelo',
      subHeader: this.esModoEstricto() ? 'Modo estricto: no se puede pausar' : 'Modo flexible',
      buttons: botones,
    });
    await hoja.present();
  }

  async confirmarAbortar(): Promise<void> {
    const alerta = await this.alertController.create({
      header: '¿Abortar el vuelo?',
      message: 'El vuelo quedará como "desviado" en tu historial y solo contarán los minutos que llevas.',
      buttons: [
        { text: 'Seguir volando', role: 'cancel' },
        {
          text: 'Abortar',
          role: 'destructive',
          handler: () => {
            this.desviar('Abortaste el vuelo.');
          },
        },
      ],
    });
    await alerta.present();
  }

  // ------------------------------------------------------------------
  // Fin del vuelo
  // ------------------------------------------------------------------
  private aterrizar(): void {
    if (!this.reserva || !this.esVueloActivo()) {
      return;
    }
    this.terminando = true;
    this.detenerTemporizador();

    const cambios: Partial<Reserva> = {
      estado: 'completado',
      fechaFin: new Date().toISOString(),
      minutosVolados: this.reserva.vuelo.duracionMin,
    };

    this.reservasService.actualizar(this.reserva.id, cambios).subscribe({
      next: (reserva) => {
        this.vueloActivoService.terminar();
        this.notificacionesService.cancelarAterrizaje();
        this.vibracionService.aterrizaje();
        this.router.navigate(['/aterrizaje', reserva.id], { replaceUrl: true });
      },
      error: (err) => {
        this.terminando = false;
        this.mensajes.error(this.mensajes.obtenerMensajeError(err));
      },
    });
  }

  private desviar(motivo: string): void {
    if (!this.reserva || this.terminando || !this.esVueloActivo()) {
      return;
    }
    this.terminando = true;
    this.detenerTemporizador();

    const minutos = Math.floor(this.vueloActivoService.calcularTranscurridoMs() / 60000);
    const cambios: Partial<Reserva> = {
      estado: 'desviado',
      fechaFin: new Date().toISOString(),
      minutosVolados: minutos,
    };

    this.reservasService.actualizar(this.reserva.id, cambios).subscribe({
      next: async (reserva) => {
        this.vueloActivoService.terminar();
        await this.notificacionesService.cancelarAterrizaje();
        this.vibracionService.alerta();

        const alerta = await this.alertController.create({
          header: '⚠️ Vuelo desviado',
          message: motivo + ' Alcanzaste ' + minutos + ' minutos de concentración.',
          buttons: ['Entendido'],
          backdropDismiss: false,
        });
        await alerta.present();
        await alerta.onDidDismiss();
        this.router.navigate(['/aterrizaje', reserva.id], { replaceUrl: true });
      },
      error: (err) => {
        this.terminando = false;
        this.mensajes.error(this.mensajes.obtenerMensajeError(err));
      },
    });
  }
}
