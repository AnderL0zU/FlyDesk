import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonBadge, IonCard, IonCardContent, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { airplane, timeOutline } from 'ionicons/icons';
import { Vuelo } from '../../../models/vuelo.model';
import { DuracionPipe } from '../../pipes/duracion.pipe';

// Tarjeta que muestra un vuelo disponible en la lista de resultados.
// Recibe el vuelo con @Input y avisa con @Output cuando lo tocan.
@Component({
  selector: 'app-tarjeta-vuelo',
  templateUrl: './tarjeta-vuelo.component.html',
  styleUrls: ['./tarjeta-vuelo.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonIcon, IonBadge, DuracionPipe],
})
export class TarjetaVueloComponent {
  @Input({ required: true }) vuelo!: Vuelo;
  @Output() seleccionar = new EventEmitter<Vuelo>();

  constructor() {
    addIcons({ airplane, timeOutline });
  }

  // Color del badge segun que tan largo es el vuelo
  obtenerColorDuracion(): string {
    if (this.vuelo.duracionMin <= 60) {
      return 'success';
    } else if (this.vuelo.duracionMin <= 180) {
      return 'primary';
    } else if (this.vuelo.duracionMin <= 480) {
      return 'tertiary';
    }
    return 'danger';
  }

  alTocar(): void {
    this.seleccionar.emit(this.vuelo);
  }
}
