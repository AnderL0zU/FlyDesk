import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import {
  AlertController,
  IonAvatar,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenuButton,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
  ModalController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  airplaneOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  createOutline,
  earthOutline,
  flagOutline,
  homeOutline,
  locateOutline,
  lockClosedOutline,
  logOutOutline,
  navigateOutline,
  notificationsOutline,
  phonePortraitOutline,
  sendOutline,
  timeOutline,
  trophyOutline,
} from 'ionicons/icons';
import { Aeropuerto } from '../../models/aeropuerto.model';
import { Estadisticas } from '../../models/estadisticas.model';
import { AjustesUsuario, Usuario } from '../../models/usuario.model';
import { AeropuertosService } from '../../core/services/aeropuertos.service';
import { AuthService } from '../../core/services/auth.service';
import { MensajesService } from '../../core/services/mensajes.service';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { UbicacionService } from '../../core/services/ubicacion.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { VibracionService } from '../../core/services/vibracion.service';
import { SeleccionarAeropuertoComponent } from '../../shared/components/seleccionar-aeropuerto/seleccionar-aeropuerto.component';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonAvatar,
    IonButton,
    IonIcon,
    IonList,
    IonListHeader,
    IonItemDivider,
    IonItem,
    IonLabel,
    IonNote,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonChip,
    IonText,
    IonSpinner,
    DuracionPipe,
  ],
})
export class PerfilPage {
  usuario: Usuario | null = null;
  estadisticas: Estadisticas | null = null;
  aeropuertoBase: Aeropuerto | null = null;
  // copia de los ajustes enlazada con ngModel
  ajustes: AjustesUsuario = { modoEstricto: false, notificaciones: true, vibracion: true, metaDiariaMin: 60 };
  buscandoUbicacion = false;
  esCelular = Capacitor.isNativePlatform();

  opcionesMeta = [30, 60, 90, 120, 180, 240];

  constructor(
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private aeropuertosService: AeropuertosService,
    private ubicacionService: UbicacionService,
    private notificacionesService: NotificacionesService,
    private vibracionService: VibracionService,
    private mensajes: MensajesService,
    private alertController: AlertController,
    private modalController: ModalController,
    private router: Router,
  ) {
    addIcons({
      createOutline,
      airplaneOutline,
      homeOutline,
      locateOutline,
      lockClosedOutline,
      notificationsOutline,
      phonePortraitOutline,
      flagOutline,
      timeOutline,
      navigateOutline,
      earthOutline,
      trophyOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      logOutOutline,
      sendOutline,
    });
  }

  ionViewWillEnter(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.usuario = this.authService.obtenerUsuario();
    if (!this.usuario) {
      return;
    }
    // copiamos los ajustes para no modificar el objeto original hasta guardar
    this.ajustes = { ...this.usuario.ajustes };

    this.aeropuertosService.obtenerAeropuertos().subscribe(() => {
      if (this.usuario && this.usuario.aeropuertoBase) {
        this.aeropuertoBase = this.aeropuertosService.buscarPorCodigo(this.usuario.aeropuertoBase) || null;
      }
    });

    this.usuariosService.obtenerEstadisticas(this.usuario.id).subscribe({
      next: (datos) => (this.estadisticas = datos),
      error: (err) => this.mensajes.error(this.mensajes.obtenerMensajeError(err)),
    });
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

  // Guarda cualquier cambio del usuario en la "API"
  private guardar(cambios: Partial<Usuario>, mensajeExito: string): void {
    if (!this.usuario) {
      return;
    }
    this.usuariosService.actualizar(this.usuario.id, cambios).subscribe({
      next: (usuarioActualizado) => {
        this.usuario = usuarioActualizado;
        this.mensajes.exito(mensajeExito);
      },
      error: (err) => this.mensajes.error(this.mensajes.obtenerMensajeError(err)),
    });
  }

  // ------------------- Nombre -------------------
  async editarNombre(): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'Editar nombre',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: this.usuario ? this.usuario.nombre : '',
          placeholder: 'Tu nombre',
          attributes: { maxlength: 40 },
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (datos) => {
            const nombre = (datos.nombre || '').trim();
            if (nombre.length < 3) {
              this.mensajes.error('El nombre debe tener al menos 3 letras');
              return false; // no cierra la alerta
            }
            this.guardar({ nombre: nombre }, 'Nombre actualizado');
            return true;
          },
        },
      ],
    });
    await alerta.present();
  }

  // ------------------- Aeropuerto base -------------------
  async elegirAeropuertoBase(): Promise<void> {
    const modal = await this.modalController.create({
      component: SeleccionarAeropuertoComponent,
      componentProps: {
        titulo: 'Tu aeropuerto base',
        seleccionado: this.aeropuertoBase ? this.aeropuertoBase.iata : '',
        permitirCualquiera: false,
      },
    });
    await modal.present();

    const resultado = await modal.onWillDismiss<Aeropuerto>();
    if (resultado.role === 'seleccionar' && resultado.data) {
      this.aeropuertoBase = resultado.data;
      this.guardar({ aeropuertoBase: resultado.data.iata }, 'Aeropuerto base: ' + resultado.data.ciudad);
    }
  }

  // Geolocalizacion directa desde el perfil
  async detectarAeropuerto(): Promise<void> {
    this.buscandoUbicacion = true;
    try {
      const posicion = await this.ubicacionService.obtenerPosicion();
      const resultado = this.aeropuertosService.buscarMasCercano(posicion.lat, posicion.lng);
      this.buscandoUbicacion = false;

      if (resultado) {
        const confirmo = await this.mensajes.confirmar(
          '📍 Aeropuerto encontrado',
          'El más cercano es ' +
            resultado.aeropuerto.nombre +
            ' en ' +
            resultado.aeropuerto.ciudad +
            ' (a ' +
            resultado.distanciaKm +
            ' km). ¿Usarlo como tu aeropuerto base?',
          'Usar',
        );
        if (confirmo) {
          this.aeropuertoBase = resultado.aeropuerto;
          this.guardar({ aeropuertoBase: resultado.aeropuerto.iata }, 'Aeropuerto base actualizado');
        }
      }
    } catch (error: any) {
      this.buscandoUbicacion = false;
      this.mensajes.error(error.message);
    }
  }

  // ------------------- Ajustes -------------------
  async cambiarNotificaciones(): Promise<void> {
    if (this.ajustes.notificaciones && this.esCelular) {
      // al activarlas pedimos el permiso nativo de Android
      const permitido = await this.notificacionesService.pedirPermiso();
      if (!permitido) {
        this.ajustes.notificaciones = false;
        this.mensajes.error('Debes permitir las notificaciones en los ajustes del celular');
        return;
      }
    }
    this.guardarAjustes();
  }

  async cambiarVibracion(): Promise<void> {
    this.guardarAjustes();
    if (this.ajustes.vibracion) {
      // pequeña vibracion de prueba
      setTimeout(() => this.vibracionService.despegue(), 600);
    }
  }

  guardarAjustes(): void {
    this.guardar({ ajustes: { ...this.ajustes } }, 'Ajustes guardados');
  }

  async probarNotificacion(): Promise<void> {
    if (!this.esCelular) {
      this.mensajes.mostrarToast('Las notificaciones solo funcionan en el celular');
      return;
    }
    const enviada = await this.notificacionesService.enviarPrueba();
    if (enviada) {
      this.mensajes.mostrarToast('Te llegará una notificación en 5 segundos', 'primary', 'send-outline');
    } else {
      this.mensajes.error('No hay permiso para mostrar notificaciones');
    }
  }

  // ------------------- Sesion -------------------
  async cerrarSesion(): Promise<void> {
    const confirmo = await this.mensajes.confirmar('Cerrar sesión', '¿Seguro que quieres salir?', 'Salir');
    if (confirmo) {
      this.authService.cerrarSesion();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
