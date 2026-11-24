import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRadio,
  IonRadioGroup,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonText,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { airplane } from 'ionicons/icons';

import { AeropuertosService } from '../../core/services/aeropuertos.service';
import { MensajesService } from '../../core/services/mensajes.service';
import { VueloService } from '../../core/services/vuelo.service';
import { calcularDistanciaKm, calcularDuracionMin } from '../../core/utils/geo.util';
import type { Aeropuerto } from '../../models/aeropuerto.model';
import type { Vuelo } from '../../models/vuelo.model';
import { GloboComponent } from '../../shared/components/globo/globo.component';

// Margen para buscar destinos: con 1h se muestran los de 45m a 1h15
const MARGEN_MIN = 15;

@Component({
  selector: 'app-reservar',
  templateUrl: './reservar.page.html',
  styleUrls: ['./reservar.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonRadioGroup,
    IonRadio,
    IonItem,
    IonIcon,
    IonNote,
    IonText,
    IonSkeletonText,
    IonButton,
    GloboComponent,
  ],
})
export class ReservarPage {
  private ruta = inject(ActivatedRoute);
  private aeropuertosService = inject(AeropuertosService);
  private mensajes = inject(MensajesService);
  private router = inject(Router);
  private vueloService = inject(VueloService);

  origen: Aeropuerto | null = null;                // hasta que responda la api es null

  duraciones: number[] = [30, 45, 60, 90, 120];
  duracionElegida = 60;

  todosLosVuelos: Vuelo[] = []; 
  vuelosFiltrados: Vuelo[] = []; // los que coinciden con la duracion
  codigoDestino = ''; // eje: "NVA", "mde"
  cargando = true;

  alturaGlobo = Math.round(window.innerHeight * 0.42);

  
  esqueletos = [1, 2, 3, 4]; //mientra carga

  constructor() {
    addIcons({ airplane });
  }

  ionViewWillEnter(): void {
    const codigo = this.ruta.snapshot.paramMap.get('iata') || '';
    this.cargando = true;

    // 1) busca los datos del aeropuerto de origen
    this.aeropuertosService.buscarPorCodigo(codigo).subscribe({
      next: (lista) => {
        const encontrado = lista.find((a) => a.iata === codigo);
        if (!encontrado) {
          this.cargando = false;
          this.mensajes.error('No encontramos el aeropuerto ' + codigo);
          return;
        }
        this.origen = encontrado;
        this.cargarDestinos(encontrado);
      },
      error: () => {
        this.cargando = false;
        this.mensajes.error('No se pudo conectar con el servidor de aeropuertos');
      },
    });
  }

  // 2) buscamos los destinos y calculamos la duracion de cada vuelo
  private cargarDestinos(origen: Aeropuerto): void {
    this.aeropuertosService.buscarDestinos(origen).subscribe({
      next: (destinos) => {
        this.todosLosVuelos = [];
        for (const destino of destinos) {
          const distancia = calcularDistanciaKm(origen.lat, origen.lng, destino.lat, destino.lng);
          this.todosLosVuelos.push({
            origen: origen,
            destino: destino,
            distanciaKm: distancia,
            duracionMin: calcularDuracionMin(distancia),
          });
        }
        this.cargando = false;
        this.filtrar();
      },
      error: () => {
        this.cargando = false;
        this.mensajes.error('No se pudieron cargar los destinos');
      },
    });
  }

  // 3) se llama al cambiar la duracion (no vuelve a llamar a la API)
  filtrar(): void {
    const elegida = Number(this.duracionElegida);
    this.vuelosFiltrados = this.todosLosVuelos.filter(
      (v) => v.duracionMin >= elegida - MARGEN_MIN && v.duracionMin <= elegida + MARGEN_MIN,
    ); // primero los de 45 y 75min
    
    this.vuelosFiltrados.sort(
      (a, b) => Math.abs(a.duracionMin - elegida) - Math.abs(b.duracionMin - elegida),
    ); // mas cercanos a 60

    // deja seleccionado el primero de la lista
    if (this.vuelosFiltrados.length > 0) {
      this.codigoDestino = this.vuelosFiltrados[0].destino.iata;
    } else {
      this.codigoDestino = '';
    }
  }

  obtenerVueloElegido(): Vuelo | null {
    const vuelo = this.vuelosFiltrados.find((v) => v.destino.iata === this.codigoDestino);
    return vuelo || null;
  }

  // Convierte minutos a texto: 90 -> "1h 30m"
  formatearDuracion(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    if (horas === 0) {
      return resto + 'm';
    }
    if (resto === 0) {
      return horas + 'h';
    }
    return horas + 'h ' + resto + 'm';
  }

  // Vamos a la pantalla "Listo para despegar" con los datos del vuelo
  despegar(): void {
    const vuelo = this.obtenerVueloElegido();
    if (!vuelo) {
      this.mensajes.error('Elige un destino primero');
      return;
    }
    // guardamos el vuelo completo (con coordenadas) para usarlo en el vuelo en curso
    this.vueloService.guardarVueloElegido(vuelo);
    this.router.navigate(['/despegue', vuelo.origen.iata, vuelo.destino.iata, vuelo.duracionMin]);
  }
}
