import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonProgressBar, IonRow, Platform } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { airplane, closeCircleOutline, closeOutline, pause, play } from 'ionicons/icons';
import type { Subscription } from 'rxjs';

import { HistorialService } from '../../core/services/historial.service';
import { MensajesService } from '../../core/services/mensajes.service';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { PantallaService } from '../../core/services/pantalla.service';
import { VibracionService } from '../../core/services/vibracion.service';
import { VueloService } from '../../core/services/vuelo.service';
import type { VueloEnCurso } from '../../models/vuelo.model';
import { GloboComponent } from '../../shared/components/globo/globo.component';

// Cada cuantos segundos movemos el avion en el globo (para ahorrar bateria)
const SEGUNDOS_GLOBO = 20;

@Component({
  selector: 'app-vuelo',
  templateUrl: './vuelo.page.html',
  styleUrls: ['./vuelo.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, IonContent, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonProgressBar, GloboComponent],
})
export class VueloPage {
  private vueloService = inject(VueloService);
  private historialService = inject(HistorialService);
  private notificaciones = inject(NotificacionesService);
  private pantalla = inject(PantallaService);
  private vibracion = inject(VibracionService);
  private mensajes = inject(MensajesService);
  private router = inject(Router);
  private platform = inject(Platform);

  enCurso: VueloEnCurso | null = null;

  tiempoRestante = ''; // texto tipo "1h 30min"
  progresoBarra = 0; // de 0 a 1, la barra de la tarjeta (cada segundo)
  progresoGlobo = 0; // de 0 a 1, el avion del globo (cada 20 segundos)

  // El globo ocupa toda la pantalla
  alturaGlobo = window.innerHeight;

  private intervalo: ReturnType<typeof setInterval> | null = null;
  private segundosContados = 0;
  private botonAtras: Subscription | null = null;

  constructor() {
    addIcons({ airplane, pause, play, closeOutline, closeCircleOutline });
  }

  ionViewWillEnter(): void {
    this.enCurso = this.vueloService.obtenerVueloEnCurso();

    // si no hay vuelo en curso seva al inicio
    if (!this.enCurso) {
      this.router.navigate(['/tabs/inicio'], { replaceUrl: true });
      return;
    }

    this.actualizarTiempo();
    this.progresoGlobo = this.progresoBarra;

    // cada segundo se actualiza el tiempo y la barra
    this.segundosContados = 0;
    this.intervalo = setInterval(() => {
      this.actualizarTiempo();

      // el avion del globo solo se mueve cada 20 segundos
      this.segundosContados++;
      if (this.segundosContados >= SEGUNDOS_GLOBO) {
        this.segundosContados = 0;
        this.progresoGlobo = this.progresoBarra;
      }
    }, 1000);
  }

  ionViewDidEnter(): void {
    // ajustes: pantalla encendida y aviso al aterrizar
    this.pantalla.mantenerEncendida();
    if (this.enCurso && !this.enCurso.pausado) {
      this.notificaciones.programarAterrizaje(this.enCurso);
    }

    // En Android el boton fisico de atras no hace nada: solo se sale con "Abortar"
    this.botonAtras = this.platform.backButton.subscribeWithPriority(10, () => {
      this.mensajes.mostrarToast('Para salir usa el botón Abortar');
    });
  }

  ionViewWillLeave(): void {
    this.detenerIntervalo();
    this.pantalla.permitirApagar();
    if (this.botonAtras) {
      this.botonAtras.unsubscribe();
      this.botonAtras = null;
    }
  }

  // Calcula cuanto falta usando la hora de llegada
  private actualizarTiempo(): void {
    if (!this.enCurso) {
      return;
    }

    // en pausa el tiempo no avanza; si no, es la hora de llegada menos la hora actual
    let msRestantes = this.enCurso.horaFin - Date.now();
    if (this.enCurso.pausado) {
      msRestantes = this.enCurso.msRestantes;
    }

    if (msRestantes <= 0) {
      this.aterrizar();
      return;
    }

    const msTotales = this.enCurso.vuelo.duracionMin * 60 * 1000;
    this.progresoBarra = 1 - msRestantes / msTotales;
    this.tiempoRestante = this.formatearTiempo(msRestantes);
  }

  // Solo horas y minutos
  private formatearTiempo(ms: number): string {
    const totalMinutos = Math.ceil(ms / 60000);
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    if (horas === 0) {
      return minutos + 'min';
    }
    if (minutos === 0) {
      return horas + 'h';
    }
    return horas + 'h ' + minutos + 'min';
  }

  pausar(): void {
    if (!this.enCurso) {
      return;
    }
    // guarda cuanto faltaba en el momento de pausar
    this.enCurso.msRestantes = this.enCurso.horaFin - Date.now();
    this.enCurso.pausado = true;
    this.vueloService.guardarVueloEnCurso(this.enCurso);
    // en pausa ya no se sabe cuando aterriza,entonces se quita
    this.notificaciones.cancelarAterrizaje();
    this.vibracion.toque();
  }

  continuar(): void {
    if (!this.enCurso) {
      return;
    }
    // la nueva hora de llegada es ahora + lo que faltaba
    this.enCurso.horaFin = Date.now() + this.enCurso.msRestantes;
    this.enCurso.pausado = false;
    this.vueloService.guardarVueloEnCurso(this.enCurso);
    // con la nueva hora de llegada vuelve a programar el aviso
    this.notificaciones.programarAterrizaje(this.enCurso);
    this.vibracion.toque();
  }

  async abortar(): Promise<void> {
    const aceptar = await this.mensajes.confirmar(
      'Abortar vuelo',
      '¿Seguro que quieres abortar el vuelo? Perderás el progreso.',
      'Abortar',
    );
    if (!aceptar || !this.enCurso) {
      return;
    }
    // guardamos en el historial los minutos que alcanzo a volar
    this.historialService.agregar(this.enCurso, this.calcularMinutosVolados(), 'abortado');
    this.notificaciones.cancelarAterrizaje();
    this.vueloService.terminarVuelo();
    this.mensajes.mostrarToast('Vuelo abortado', 'medium', 'close-outline');
    this.router.navigate(['/tabs/inicio'], { replaceUrl: true });
  }

  // prueba
  terminarRapido(): void {
    this.aterrizar();
  }

  // Cuando se acaba el tiempo vamos a la pantalla de felicidades
  private aterrizar(): void {
    if (!this.enCurso) {
      return;
    }
    this.detenerIntervalo();
    this.historialService.agregar(this.enCurso, this.calcularMinutosVolados(), 'completado');
    // si aterrizo con la app abierta (o con el boton de prueba) quitamos el aviso pendiente
    this.notificaciones.cancelarAterrizaje();
    this.vibracion.fuerte();
    this.vueloService.guardarUltimoVuelo(this.enCurso);
    this.vueloService.terminarVuelo();
    this.enCurso = null;
    this.router.navigate(['/llegada'], { replaceUrl: true });
  }

  // Minutos que han pasado desde que despego (sin contar las pausas)
  private calcularMinutosVolados(): number {
    if (!this.enCurso) {
      return 0;
    }
    let msRestantes = this.enCurso.horaFin - Date.now();
    if (this.enCurso.pausado) {
      msRestantes = this.enCurso.msRestantes;
    }
    if (msRestantes < 0) {
      msRestantes = 0;
    }
    const msTotales = this.enCurso.vuelo.duracionMin * 60 * 1000;
    return Math.round((msTotales - msRestantes) / 60000);
  }

  private detenerIntervalo(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }
}
