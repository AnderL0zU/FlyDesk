import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonMenuButton,
  IonModal,
  IonNote,
  IonPopover,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  airplane,
  checkmarkCircle,
  closeCircle,
  filterOutline,
  swapVerticalOutline,
  trashOutline,
} from 'ionicons/icons';
import { EstadoReserva, Reserva } from '../../models/reserva.model';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { MensajesService } from '../../core/services/mensajes.service';
import { ReservasService } from '../../core/services/reservas.service';
import { PaseAbordarComponent } from '../../shared/components/pase-abordar/pase-abordar.component';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';

type FiltroEstado = 'todos' | EstadoReserva;
type OrdenHistorial = 'recientes' | 'antiguos' | 'largos';

// Vuelos agrupados por mes para el ion-accordion
interface GrupoMes {
  titulo: string; // ej: "noviembre 2026"
  reservas: Reserva[];
  minutos: number;
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonTitle,
    IonIcon,
    IonPopover,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSearchbar,
    IonAccordionGroup,
    IonAccordion,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonThumbnail,
    IonBadge,
    IonNote,
    IonText,
    IonSpinner,
    IonModal,
    PaseAbordarComponent,
    DuracionPipe,
  ],
})
export class HistorialPage {
  usuario: Usuario | null = null;
  reservas: Reserva[] = [];
  grupos: GrupoMes[] = [];
  gruposAbiertos: string[] = [];

  filtroEstado: FiltroEstado = 'todos';
  orden: OrdenHistorial = 'recientes';
  textoBusqueda = '';
  cargando = true;

  // Para el modal de detalle
  reservaDetalle: Reserva | null = null;
  modalAbierto = false;

  constructor(
    private authService: AuthService,
    private reservasService: ReservasService,
    private mensajes: MensajesService,
    private router: Router,
  ) {
    addIcons({ airplane, checkmarkCircle, closeCircle, trashOutline, swapVerticalOutline, filterOutline });
  }

  ionViewWillEnter(): void {
    this.usuario = this.authService.obtenerUsuario();
    this.cargarHistorial();
  }

  cargarHistorial(evento?: RefresherCustomEvent): void {
    if (!this.usuario) {
      return;
    }
    this.reservasService.listar(this.usuario.id).subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.cargando = false;
        this.aplicarFiltros();
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
  }

  // Filtra, ordena y agrupa por mes
  aplicarFiltros(): void {
    const texto = this.textoBusqueda.trim().toLowerCase();

    let lista = this.reservas.filter((r) => {
      const cumpleEstado = this.filtroEstado === 'todos' || r.estado === this.filtroEstado;
      const cumpleTexto =
        texto === '' ||
        r.vuelo.origen.ciudad.toLowerCase().includes(texto) ||
        r.vuelo.destino.ciudad.toLowerCase().includes(texto) ||
        r.etiqueta.toLowerCase().includes(texto);
      return cumpleEstado && cumpleTexto;
    });

    if (this.orden === 'recientes') {
      lista = lista.sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));
    } else if (this.orden === 'antiguos') {
      lista = lista.sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
    } else {
      lista = lista.sort((a, b) => b.minutosVolados - a.minutosVolados);
    }

    // agrupamos por mes
    const grupos: GrupoMes[] = [];
    for (const reserva of lista) {
      const fecha = new Date(reserva.fechaInicio);
      const titulo = fecha.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
      let grupo = grupos.find((g) => g.titulo === titulo);
      if (!grupo) {
        grupo = { titulo: titulo, reservas: [], minutos: 0 };
        grupos.push(grupo);
      }
      grupo.reservas.push(reserva);
      grupo.minutos += reserva.minutosVolados;
    }
    this.grupos = grupos;
    // todos los meses abiertos por defecto
    this.gruposAbiertos = grupos.map((g) => g.titulo);
  }

  cambiarOrden(nuevoOrden: OrdenHistorial): void {
    this.orden = nuevoOrden;
    this.aplicarFiltros();
  }

  abrirDetalle(reserva: Reserva): void {
    // si todavia esta volando lo llevamos a la cabina
    if (reserva.estado === 'en-vuelo') {
      this.router.navigate(['/vuelo', reserva.id]);
      return;
    }
    this.reservaDetalle = reserva;
    this.modalAbierto = true;
  }

  cerrarDetalle(): void {
    this.modalAbierto = false;
  }

  async eliminar(reserva: Reserva, item: IonItemSliding): Promise<void> {
    await item.close();

    if (reserva.estado === 'en-vuelo') {
      this.mensajes.error('No puedes borrar un vuelo que está en curso');
      return;
    }

    const confirmo = await this.mensajes.confirmar(
      'Eliminar vuelo',
      '¿Borrar el vuelo ' + reserva.vuelo.origen.iata + ' → ' + reserva.vuelo.destino.iata + ' de tu historial?',
      'Eliminar',
    );
    if (!confirmo) {
      return;
    }

    this.reservasService.eliminar(reserva.id).subscribe({
      next: () => {
        this.reservas = this.reservas.filter((r) => r.id !== reserva.id);
        this.aplicarFiltros();
        this.mensajes.exito('Vuelo eliminado del historial');
      },
      error: (err) => this.mensajes.error(this.mensajes.obtenerMensajeError(err)),
    });
  }

  obtenerColorEstado(estado: EstadoReserva): string {
    if (estado === 'completado') {
      return 'success';
    } else if (estado === 'desviado') {
      return 'danger';
    }
    return 'secondary';
  }

  obtenerTextoEstado(estado: EstadoReserva): string {
    if (estado === 'completado') {
      return 'Completado';
    } else if (estado === 'desviado') {
      return 'Desviado';
    }
    return 'En vuelo';
  }
}
