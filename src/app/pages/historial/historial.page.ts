import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonNote,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { airplane, timeOutline, trashOutline } from 'ionicons/icons';

import { HistorialService } from '../../core/services/historial.service';
import { MensajesService } from '../../core/services/mensajes.service';
import type { RegistroVuelo } from '../../models/vuelo.model';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonList,
    IonItemSliding,
    IonItem,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonLabel,
    IonNote,
    IonBadge,
    IonText,
  ],
})
export class HistorialPage {
  private historialService = inject(HistorialService);
  private mensajes = inject(MensajesService);

  vuelos: RegistroVuelo[] = [];

  completados = 0;
  abortados = 0;
  minutosTotales = 0;

  constructor() {
    addIcons({ airplane, timeOutline, trashOutline });
  }

  ionViewWillEnter(): void { // Se llama cada vez que se entra a la pestaña
    this.cargar();
  }

  private cargar(): void {
    this.vuelos = this.historialService.obtenerTodos();

    this.completados = 0;
    this.abortados = 0;
    this.minutosTotales = 0;
    for (const vuelo of this.vuelos) {
      if (vuelo.estado === 'completado') {
        this.completados++;
      } else {
        this.abortados++;
      }
      this.minutosTotales = this.minutosTotales + vuelo.minutosVolados;
    }
  }

  async eliminar(vuelo: RegistroVuelo, deslizable: IonItemSliding): Promise<void> {
    await deslizable.close();
    this.historialService.eliminar(vuelo.id);
    this.cargar();
    this.mensajes.mostrarToast('Vuelo eliminado del historial');
  }

  async borrarTodo(): Promise<void> {
    const aceptar = await this.mensajes.confirmar(
      'Borrar historial',
      'Se eliminarán todos tus vuelos. Esta acción no se puede deshacer.',
      'Borrar',
    );
    if (!aceptar) {
      return;
    }
    this.historialService.borrarTodo();
    this.cargar();
  }

  formatearDuracion(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    if (horas === 0) {
      return resto + 'min';
    }
    if (resto === 0) {
      return horas + 'h';
    }
    return horas + 'h ' + resto + 'min';
  }

  // 1763302980000 -> "16 nov · 14:23"
  formatearFecha(fecha: number): string {
    const dia = new Date(fecha);
    const horas = dia.getHours() < 10 ? '0' + dia.getHours() : '' + dia.getHours();
    const minutos = dia.getMinutes() < 10 ? '0' + dia.getMinutes() : '' + dia.getMinutes();
    return dia.getDate() + ' ' + MESES[dia.getMonth()] + ' · ' + horas + ':' + minutos;
  }
}
