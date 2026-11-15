import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonBadge, IonCol, IonGrid, IonIcon, IonRow, IonSkeletonText } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  airplane,
  cloudOutline,
  partlySunnyOutline,
  rainyOutline,
  snowOutline,
  sunnyOutline,
  thunderstormOutline,
} from 'ionicons/icons';
import { Clima } from '../../../models/clima.model';
import { EstadoReserva } from '../../../models/reserva.model';
import { Vuelo } from '../../../models/vuelo.model';
import { DuracionPipe } from '../../pipes/duracion.pipe';

// Dibuja un "pase de abordar" (boarding pass) con los datos del vuelo.
// Se reutiliza en el modal de reservar y en el detalle del historial.
@Component({
  selector: 'app-pase-abordar',
  templateUrl: './pase-abordar.component.html',
  styleUrls: ['./pase-abordar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, IonGrid, IonRow, IonCol, IonIcon, IonBadge, IonSkeletonText, DuracionPipe],
})
export class PaseAbordarComponent {
  @Input({ required: true }) vuelo!: Vuelo;
  @Input() pasajero = '';
  @Input() asiento = '--';
  @Input() puerta = '--';
  @Input() etiqueta = '';
  @Input() fecha: string | null = null;
  @Input() estado: EstadoReserva | null = null;
  @Input() clima: Clima | null = null;
  @Input() cargandoClima = false;

  constructor() {
    addIcons({ airplane, sunnyOutline, partlySunnyOutline, cloudOutline, rainyOutline, snowOutline, thunderstormOutline });
  }

  obtenerTextoEstado(): string {
    if (this.estado === 'completado') {
      return 'Aterrizó';
    } else if (this.estado === 'desviado') {
      return 'Desviado';
    } else if (this.estado === 'en-vuelo') {
      return 'En vuelo';
    }
    return 'Listo para abordar';
  }

  obtenerColorEstado(): string {
    if (this.estado === 'completado') {
      return 'success';
    } else if (this.estado === 'desviado') {
      return 'danger';
    } else if (this.estado === 'en-vuelo') {
      return 'secondary';
    }
    return 'primary';
  }
}
