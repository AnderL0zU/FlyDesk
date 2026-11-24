import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  airplane,
  cloudOutline,
  cloudyNightOutline,
  mapOutline,
  moonOutline,
  partlySunnyOutline,
  rainyOutline,
  snowOutline,
  sunnyOutline,
  thunderstormOutline,
  ticketOutline,
  timeOutline,
} from 'ionicons/icons';

import { ClimaService } from '../../core/services/clima.service';
import { VueloService } from '../../core/services/vuelo.service';
import type { Clima } from '../../models/clima.model';
import type { VueloEnCurso } from '../../models/vuelo.model';

@Component({
  selector: 'app-llegada',
  templateUrl: './llegada.page.html',
  styleUrls: ['./llegada.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, IonContent, IonIcon, IonCard, IonCardContent, IonList, IonItem, IonLabel, IonNote, IonButton, IonChip, IonSpinner],
})
export class LlegadaPage {
  private vueloService = inject(VueloService);
  private router = inject(Router);
  private climaService = inject(ClimaService);

  ultimoVuelo: VueloEnCurso | null = null;

  
  clima: Clima | null = null; //Api open-meteo
  cargandoClima = false;

  constructor() {
    addIcons({
      airplane,
      mapOutline,
      timeOutline,
      ticketOutline,
      sunnyOutline,
      moonOutline,
      partlySunnyOutline,
      cloudyNightOutline,
      cloudOutline,
      rainyOutline,
      snowOutline,
      thunderstormOutline,
    });
  }

  ionViewWillEnter(): void {
    this.ultimoVuelo = this.vueloService.obtenerUltimoVuelo();

    if (!this.ultimoVuelo) {
      this.irAlInicio();
      return;
    }

    this.cargarClima(this.ultimoVuelo.vuelo.destino.lat, this.ultimoVuelo.vuelo.destino.lng);
  }

  private cargarClima(lat: number, lng: number): void { //COORDS aeropuerto destino
    this.clima = null;
    this.cargandoClima = true;
    this.climaService.obtenerClimaActual(lat, lng).subscribe({
      next: (clima) => {
        this.clima = clima;
        this.cargandoClima = false;
      },
      error: () => {
        // si falla no mostramos nada, no es algo importante
        this.cargandoClima = false;
      },
    });
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

  irAlInicio(): void {
    this.router.navigate(['/tabs/inicio'], { replaceUrl: true });
  }
}
