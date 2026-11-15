import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonNote,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeOutline, locateOutline } from 'ionicons/icons';
import { Aeropuerto } from '../../../models/aeropuerto.model';
import { AeropuertosService } from '../../../core/services/aeropuertos.service';
import { MensajesService } from '../../../core/services/mensajes.service';
import { UbicacionService } from '../../../core/services/ubicacion.service';

// Un grupo de aeropuertos de un mismo continente (para la lista)
interface GrupoAeropuertos {
  continente: string;
  aeropuertos: Aeropuerto[];
}

// Modal para escoger un aeropuerto. Se abre con ModalController desde
// Buscar vuelos y desde Perfil. Devuelve el aeropuerto elegido.
@Component({
  selector: 'app-seleccionar-aeropuerto',
  templateUrl: './seleccionar-aeropuerto.component.html',
  styleUrls: ['./seleccionar-aeropuerto.component.scss'],
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
    IonSearchbar,
    IonItemGroup,
    IonItemDivider,
    IonItem,
    IonLabel,
    IonNote,
    IonText,
    IonSpinner,
  ],
})
export class SeleccionarAeropuertoComponent implements OnInit {
  // Estos valores llegan desde componentProps al abrir el modal
  @Input() titulo = 'Elegir aeropuerto';
  @Input() seleccionado = '';
  @Input() permitirCualquiera = true;

  textoBusqueda = '';
  grupos: GrupoAeropuertos[] = [];
  private todos: Aeropuerto[] = [];
  buscandoUbicacion = false;

  constructor(
    private modalController: ModalController,
    private aeropuertosService: AeropuertosService,
    private ubicacionService: UbicacionService,
    private mensajes: MensajesService,
  ) {
    addIcons({ closeOutline, locateOutline, checkmarkCircle });
  }

  ngOnInit(): void {
    this.aeropuertosService.obtenerAeropuertos().subscribe({
      next: (lista) => {
        this.todos = lista;
        this.filtrar();
      },
      error: () => this.mensajes.error('No se pudieron cargar los aeropuertos'),
    });
  }

  // Se llama cada vez que el usuario escribe en el buscador
  filtrar(): void {
    const texto = this.textoBusqueda.trim().toLowerCase();
    const filtrados = this.todos.filter(
      (a) =>
        a.ciudad.toLowerCase().includes(texto) ||
        a.iata.toLowerCase().includes(texto) ||
        a.pais.toLowerCase().includes(texto) ||
        a.nombre.toLowerCase().includes(texto),
    );

    // agrupamos por continente
    const grupos: GrupoAeropuertos[] = [];
    for (const aeropuerto of filtrados) {
      let grupo = grupos.find((g) => g.continente === aeropuerto.continente);
      if (!grupo) {
        grupo = { continente: aeropuerto.continente, aeropuertos: [] };
        grupos.push(grupo);
      }
      grupo.aeropuertos.push(aeropuerto);
    }
    this.grupos = grupos.sort((a, b) => a.continente.localeCompare(b.continente));
  }

  elegir(aeropuerto: Aeropuerto): void {
    this.modalController.dismiss(aeropuerto, 'seleccionar');
  }

  elegirCualquiera(): void {
    this.modalController.dismiss(null, 'limpiar');
  }

  cerrar(): void {
    this.modalController.dismiss(null, 'cancelar');
  }

  // Usa el GPS para encontrar el aeropuerto mas cercano
  async usarMiUbicacion(): Promise<void> {
    this.buscandoUbicacion = true;
    try {
      const posicion = await this.ubicacionService.obtenerPosicion();
      const resultado = this.aeropuertosService.buscarMasCercano(posicion.lat, posicion.lng);
      this.buscandoUbicacion = false;

      if (resultado) {
        this.mensajes.exito(
          'Aeropuerto más cercano: ' + resultado.aeropuerto.ciudad + ' (a ' + resultado.distanciaKm + ' km)',
        );
        this.elegir(resultado.aeropuerto);
      }
    } catch (error: any) {
      this.buscandoUbicacion = false;
      this.mensajes.error(error.message);
    }
  }

  // trackBy para que el *ngFor no vuelva a dibujar toda la lista
  trackPorCodigo(indice: number, aeropuerto: Aeropuerto): string {
    return aeropuerto.iata;
  }
}
