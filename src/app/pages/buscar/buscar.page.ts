import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonNote,
  IonRange,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
  InfiniteScrollCustomEvent,
  ModalController,
  RefresherCustomEvent,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  airplaneOutline,
  arrowForward,
  closeCircle,
  dice,
  flagOutline,
  funnelOutline,
  searchOutline,
  shuffleOutline,
  swapVerticalOutline,
} from 'ionicons/icons';
import { Aeropuerto } from '../../models/aeropuerto.model';
import { FiltrosBusqueda } from '../../models/filtros.model';
import { Reserva } from '../../models/reserva.model';
import { Vuelo } from '../../models/vuelo.model';
import { AeropuertosService } from '../../core/services/aeropuertos.service';
import { AuthService } from '../../core/services/auth.service';
import { MensajesService } from '../../core/services/mensajes.service';
import { VibracionService } from '../../core/services/vibracion.service';
import { VuelosService } from '../../core/services/vuelos.service';
import { SeleccionarAeropuertoComponent } from '../../shared/components/seleccionar-aeropuerto/seleccionar-aeropuerto.component';
import { TarjetaVueloComponent } from '../../shared/components/tarjeta-vuelo/tarjeta-vuelo.component';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';
import { ReservarVueloComponent } from './reservar-vuelo/reservar-vuelo.component';

type ModoBusqueda = 'aleatorio' | 'ruta';
type Orden = 'recomendado' | 'corto' | 'largo' | 'distancia';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonIcon,
    IonNote,
    IonChip,
    IonRange,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonText,
    IonSkeletonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonFab,
    IonFabButton,
    TarjetaVueloComponent,
    DuracionPipe,
  ],
})
export class BuscarPage {
  modo: ModoBusqueda = 'aleatorio';
  orden: Orden = 'recomendado';

  origen: Aeropuerto | null = null;
  destino: Aeropuerto | null = null;
  continentes: string[] = [];
  continenteSeleccionado = '';

  // ion-range con dos perillas (dualKnobs) usa un objeto { lower, upper }
  rangoDuracion = { lower: 15, upper: 600 };

  vuelos: Vuelo[] = [];
  pagina = 1;
  hayMas = true;
  cargando = false;
  private yaCargo = false;

  // Para dibujar 4 "esqueletos" mientras carga
  esqueletos = [1, 2, 3, 4];

  constructor(
    private vuelosService: VuelosService,
    private aeropuertosService: AeropuertosService,
    private authService: AuthService,
    private modalController: ModalController,
    private mensajes: MensajesService,
    private vibracionService: VibracionService,
    private router: Router,
  ) {
    addIcons({
      shuffleOutline,
      searchOutline,
      funnelOutline,
      airplaneOutline,
      flagOutline,
      arrowForward,
      closeCircle,
      dice,
      swapVerticalOutline,
    });
  }

  ionViewWillEnter(): void {
    // solo cargamos la primera vez que se entra a la pestaña
    if (this.yaCargo) {
      return;
    }
    this.yaCargo = true;

    this.aeropuertosService.obtenerAeropuertos().subscribe({
      next: () => {
        this.continentes = this.aeropuertosService.obtenerContinentes();
        // si el usuario tiene aeropuerto base lo usamos como origen
        const usuario = this.authService.obtenerUsuario();
        if (usuario && usuario.aeropuertoBase) {
          this.origen = this.aeropuertosService.buscarPorCodigo(usuario.aeropuertoBase) || null;
        }
        this.cargarVuelos(true);
      },
      error: (err) => this.mensajes.error(this.mensajes.obtenerMensajeError(err)),
    });
  }

  // Arma el objeto de filtros que se manda al servicio
  private armarFiltros(): FiltrosBusqueda {
    return {
      origen: this.origen ? this.origen.iata : '',
      destino: this.modo === 'ruta' && this.destino ? this.destino.iata : '',
      continente: this.continenteSeleccionado,
      duracionMin: this.rangoDuracion.lower,
      duracionMax: this.rangoDuracion.upper,
      pagina: this.pagina,
    };
  }

  cargarVuelos(reiniciar: boolean, eventoScroll?: InfiniteScrollCustomEvent, eventoRefresh?: RefresherCustomEvent): void {
    if (reiniciar) {
      this.pagina = 1;
      this.vuelos = [];
      this.hayMas = true;
      this.cargando = true;
    }

    const modoApi = this.modo === 'aleatorio' ? 'aleatorio' : 'busqueda';

    this.vuelosService.buscarVuelos(this.armarFiltros(), modoApi).subscribe({
      next: (resultado) => {
        this.vuelos = this.vuelos.concat(resultado.vuelos);
        this.hayMas = resultado.hayMas && resultado.vuelos.length > 0;
        this.ordenarVuelos();
        this.cargando = false;
        if (eventoScroll) {
          eventoScroll.target.complete();
        }
        if (eventoRefresh) {
          eventoRefresh.target.complete();
        }
      },
      error: (err) => {
        this.cargando = false;
        this.hayMas = false;
        this.mensajes.error(this.mensajes.obtenerMensajeError(err));
        if (eventoScroll) {
          eventoScroll.target.complete();
        }
        if (eventoRefresh) {
          eventoRefresh.target.complete();
        }
      },
    });
  }

  // Scroll infinito: cuando llega al final pide la siguiente pagina
  cargarMas(evento: InfiniteScrollCustomEvent): void {
    this.pagina++;
    this.cargarVuelos(false, evento);
  }

  refrescar(evento: RefresherCustomEvent): void {
    this.cargarVuelos(true, undefined, evento);
  }

  cambiarModo(): void {
    this.vibracionService.toque();
    this.cargarVuelos(true);
  }

  // Chips de continentes: si toca el mismo se quita el filtro
  seleccionarContinente(continente: string): void {
    if (this.continenteSeleccionado === continente) {
      this.continenteSeleccionado = '';
    } else {
      this.continenteSeleccionado = continente;
    }
  }

  // Texto que aparece en la "burbuja" del ion-range
  formatearPin = (valor: number): string => {
    return new DuracionPipe().transform(valor);
  };

  aplicarFiltros(): void {
    this.cargarVuelos(true);
  }

  limpiarFiltros(): void {
    this.continenteSeleccionado = '';
    this.rangoDuracion = { lower: 15, upper: 600 };
    this.destino = null;
    this.cargarVuelos(true);
  }

  intercambiarRuta(): void {
    const temporal = this.origen;
    this.origen = this.destino;
    this.destino = temporal;
  }

  ordenarVuelos(): void {
    if (this.orden === 'corto') {
      this.vuelos.sort((a, b) => a.duracionMin - b.duracionMin);
    } else if (this.orden === 'largo') {
      this.vuelos.sort((a, b) => b.duracionMin - a.duracionMin);
    } else if (this.orden === 'distancia') {
      this.vuelos.sort((a, b) => b.distanciaKm - a.distanciaKm);
    }
  }

  // Abre el modal para escoger origen o destino
  async elegirAeropuerto(tipo: 'origen' | 'destino'): Promise<void> {
    const actual = tipo === 'origen' ? this.origen : this.destino;
    const modal = await this.modalController.create({
      component: SeleccionarAeropuertoComponent,
      componentProps: {
        titulo: tipo === 'origen' ? '¿Desde dónde despegas?' : '¿A dónde quieres volar?',
        seleccionado: actual ? actual.iata : '',
      },
    });
    await modal.present();

    const resultado = await modal.onWillDismiss();
    if (resultado.role === 'seleccionar') {
      if (tipo === 'origen') {
        this.origen = resultado.data;
      } else {
        this.destino = resultado.data;
      }
    } else if (resultado.role === 'limpiar') {
      if (tipo === 'origen') {
        this.origen = null;
      } else {
        this.destino = null;
      }
    }
  }

  // Boton "Sorpréndeme": escoge un vuelo al azar de la lista
  sorprendeme(): void {
    if (this.vuelos.length === 0) {
      this.mensajes.mostrarToast('No hay vuelos con estos filtros, prueba cambiarlos');
      return;
    }
    const indice = Math.floor(Math.random() * this.vuelos.length);
    this.vibracionService.toque();
    this.abrirReserva(this.vuelos[indice]);
  }

  async abrirReserva(vuelo: Vuelo): Promise<void> {
    const modal = await this.modalController.create({
      component: ReservarVueloComponent,
      componentProps: { vuelo: vuelo },
    });
    await modal.present();

    const resultado = await modal.onWillDismiss<Reserva>();
    if (resultado.role === 'despegar' && resultado.data) {
      this.router.navigate(['/vuelo', resultado.data.id]);
    }
  }

  trackPorCodigo(indice: number, vuelo: Vuelo): string {
    return vuelo.codigo + indice;
  }
}
