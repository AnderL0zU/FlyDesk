import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { airplane } from 'ionicons/icons';

import { MensajesService } from '../../core/services/mensajes.service';
import { VibracionService } from '../../core/services/vibracion.service';
import { VueloService } from '../../core/services/vuelo.service';

@Component({
  selector: 'app-despegue',
  templateUrl: './despegue.page.html',
  styleUrls: ['./despegue.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonIcon, IonButton],
})
export class DespeguePage {
  private ruta = inject(ActivatedRoute);
  private mensajes = inject(MensajesService);
  private router = inject(Router);
  private vueloService = inject(VueloService);
  private vibracion = inject(VibracionService);

  // Datos del vuelo que vienen en la URL: /despegue/BOG/CUC/45
  origen = '';
  destino = '';
  minutos = 0;

  cuenta = 0; //Cuenta regresiva
  contando = false;
  private intervalo: ReturnType<typeof setInterval> | null = null;

  // Sonido del audio del piloto
  private audio: HTMLAudioElement | null = null;

  constructor() {
    addIcons({ airplane });
  }

  ionViewWillEnter(): void {
    this.origen = this.ruta.snapshot.paramMap.get('origen') || '';
    this.destino = this.ruta.snapshot.paramMap.get('destino') || '';
    this.minutos = Number(this.ruta.snapshot.paramMap.get('minutos'));
    this.cuenta = 0;
    this.contando = false;
  }

  // Al salir paramos la cuenta y el audio
  ionViewWillLeave(): void {
    this.detenerCuenta();
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }

  iniciarVuelo(): void {
    if (this.contando) {
      return;
    }

    this.audio = new Audio('assets/img/reserva/anuncio.mp3');
    this.audio.play().catch(() => {
      this.mensajes.error('No se pudo reproducir el anuncio');
    });

    this.contando = true;
    this.cuenta = 3;
    this.intervalo = setInterval(() => {
      this.cuenta = this.cuenta - 1;
      this.vibracion.toque();
      if (this.cuenta === 0) {
        this.terminarCuenta();
      }
    }, 1000);
  }

  private terminarCuenta(): void {
    this.detenerCuenta();
    this.contando = false;

    const vuelo = this.vueloService.obtenerVueloElegido();
    if (!vuelo) {
      this.mensajes.error('No encontramos el vuelo, elígelo de nuevo');
      this.router.navigate(['/tabs/inicio']);
      return;
    }

    // empieza el tiempo y pasa a la pantalla del vuelo
    this.vueloService.iniciarVuelo(vuelo);
    this.vibracion.fuerte();
    this.router.navigate(['/vuelo'], { replaceUrl: true });
  }

  private detenerCuenta(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }
}
