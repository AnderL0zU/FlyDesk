import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonSpinner,
  IonText,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { airplane, searchOutline } from 'ionicons/icons';

import { AeropuertosService } from '../../core/services/aeropuertos.service';
import { MensajesService } from '../../core/services/mensajes.service';
import { VueloService } from '../../core/services/vuelo.service';
import type { Aeropuerto } from '../../models/aeropuerto.model';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonModal, IonSearchbar, IonList, IonItem, IonLabel, IonText, IonSpinner],
})
export class InicioPage {
  private aeropuertosService = inject(AeropuertosService);
  private mensajes = inject(MensajesService);
  private router = inject(Router);
  private vueloService = inject(VueloService);

  imagenes: string[] = [
    'assets/img/home/chongqing.jpg',
    'assets/img/home/londres.jpg',
    'assets/img/home/paris.jpg',
    'assets/img/home/seattle.jpg',
    'assets/img/home/sidney.jpg',
  ];
  imagenActual = 0;
  private intervaloImagenes: ReturnType<typeof setInterval> | null = null;

  resultados: Aeropuerto[] = []; //lo que devolvio la API
  textoBusqueda = '';
  buscando = false;
  buscadorAbierto = false;
  aeropuertoElegido: Aeropuerto | null = null;

  constructor() {
    addIcons({ airplane, searchOutline });
  }

  // Si cerraron la app en medio de un vuelo se retoma
  ionViewWillEnter(): void {
    if (this.vueloService.obtenerVueloEnCurso()) {
      this.mensajes.mostrarToast('Retomando tu vuelo', 'primary', 'airplane');
      this.router.navigate(['/vuelo'], { replaceUrl: true });
    }
  }

  // Al entrar a la pestaña empieza el cambio de fotos
  ionViewDidEnter(): void {
    this.detenerImagenes();
    this.intervaloImagenes = setInterval(() => {
      this.imagenActual = (this.imagenActual + 1) % this.imagenes.length;
    }, 5000); // cada 5 seg cambia
  }

  // Al salir se para, para no gastar bateria
  ionViewWillLeave(): void {
    this.detenerImagenes();
  }

  private detenerImagenes(): void {
    if (this.intervaloImagenes) {
      clearInterval(this.intervaloImagenes);
      this.intervaloImagenes = null;
    }
  }

  abrirBuscador(): void {
    this.textoBusqueda = '';
    this.resultados = []; //resultados de la API
    this.buscadorAbierto = true;
  }

  cerrarBuscador(): void {
    this.buscadorAbierto = false;
  }

  // Se llama cada vez que el usuario escribe 
  buscar(): void {
    const codigo = this.textoBusqueda.trim().toUpperCase(); // texto busquda = lo que escribio el usuario ngModel

    // con menos de 2 letras salen demasiados resultados
    if (codigo.length < 2) {
      this.resultados = [];
      this.buscando = false;
      return;
    }

    this.buscando = true;
    this.aeropuertosService.buscarPorCodigo(codigo).subscribe({
      next: (lista) => {  //l API respondio
        this.resultados = lista;
        this.buscando = false;
      },
      error: () => {
        this.resultados = [];
        this.buscando = false;
        this.mensajes.error('No se pudo conectar con el servidor de aeropuertos');
      },
    });
  }

  // Al elegir el origen se va a la pagina para escoger duracion y destino
  elegir(aeropuerto: Aeropuerto): void {
    this.aeropuertoElegido = aeropuerto;
    this.buscadorAbierto = false;
    this.router.navigate(['/reservar', aeropuerto.iata]);
  }
}
