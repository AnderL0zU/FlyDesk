import { CommonModule } from '@angular/common';
import type { OnDestroy} from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonText,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { airplane, arrowBack, schoolOutline } from 'ionicons/icons';

import { StorageService } from '../../core/services/storage.service';
import { VibracionService } from '../../core/services/vibracion.service';
import type { Aeropuerto } from '../../models/aeropuerto.model';
import { GloboComponent } from '../../shared/components/globo/globo.component';

// Cada pantalla de la bienvenida
interface PasoBienvenida {
  tipo: 'foto-estudiante' | 'cerebro' | 'nubes' | 'cabina' | 'globo' | 'final';
  titulo: string;
  texto: string;
  imagen?: string; // ruta 
}

// Pantallas que se muestran la primera vez que se abre la app (onboarding)
@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.page.html',
  styleUrls: ['./bienvenida.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonImg,
    IonText,
    IonFooter,
    GloboComponent,
  ],
})
export class BienvenidaPage implements OnDestroy {
  private router = inject(Router);
  private storage = inject(StorageService);
  private vibracionService = inject(VibracionService);

  pasos: PasoBienvenida[] = [
    {
      tipo: 'foto-estudiante',
      titulo: '¿Te distraes fácil?',
      texto: 'No estás solo: el 87% de los estudiantes lucha por mantenerse enfocado al estudiar.',
      imagen: 'assets/img/bienvenida/estudiante.jpg',
    },
    {
      tipo: 'cerebro',
      titulo: 'No es tu culpa',
      texto: 'Tu cerebro necesita el ambiente correcto para poder enfocarse.',
    },
    {
      tipo: 'nubes',
      titulo: 'El efecto cabina',
      texto: '¿Has notado lo fácil que es concentrarse en un avión? Allá arriba nada te interrumpe.',
      imagen: 'assets/img/bienvenida/nubes.jpg',
    },
    {
      tipo: 'cabina',
      titulo: 'Silencia el ruido',
      texto:
        'El zumbido constante de un avión es ruido rosa, y varios estudios sugieren que ayuda a calmar la mente, incluso en personas con TDAH.',
      imagen: 'assets/img/bienvenida/cabina.jpg',
    },
    {
      tipo: 'globo',
      titulo: 'Convierte tus tareas en vuelos',
      texto: 'No pongas solo un temporizador: vuela de Bogotá a Madrid mientras estudias.',
    },
    {
      tipo: 'final',
      titulo: '¿Listo para abordar?',
      texto: 'Tu viaje hacia la concentración profunda empieza ahora.',
    },
  ];

  pasoActual = 0;

  //background de respaldo (solido)
  imagenesConError: string[] = [];

  
  origenDemo: Aeropuerto = { // globo bienvenid 5
    iata: 'BOG',
    nombre: 'Aeropuerto El Dorado',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    codigoPais: 'CO',
    continente: 'SA',
    lat: 4.701,
    lng: -74.146,
  };
  destinoDemo: Aeropuerto = {
    iata: 'MAD',
    nombre: 'Aeropuerto Adolfo Suárez Barajas',
    ciudad: 'Madrid',
    pais: 'España',
    codigoPais: 'ES',
    continente: 'EU',
    lat: 40.472,
    lng: -3.561,
  };
  progresoDemo = 0.15;
  private intervaloGlobo: any = null;

  // Para detectar cuando el usuario desliza el dedo
  private inicioToqueX = 0;

  constructor() {
    addIcons({ arrowBack, airplane, schoolOutline });
  }

  ngOnDestroy(): void {
    this.detenerAnimacionGlobo();
  }

  esUltimoPaso(): boolean {
    return this.pasoActual === this.pasos.length - 1;
  }

  siguiente(): void {
    if (this.esUltimoPaso()) {
      this.terminar();
      return;
    }
    this.pasoActual++;
    this.vibracionService.toque();
    this.revisarGlobo();
  }

  anterior(): void {
    if (this.pasoActual > 0) {
      this.pasoActual--;
      this.revisarGlobo();
    }
  }

  // Guarda que ya vio la bienvenida y lo manda al login
  terminar(): void {
    this.storage.guardar('bienvenida_vista', true);
    this.detenerAnimacionGlobo();
    this.router.navigateByUrl('/login', { replaceUrl: true }); //se va al login
  }

  imagenFallo(ruta: string | undefined): void {
    if (ruta && !this.imagenesConError.includes(ruta)) {
      this.imagenesConError.push(ruta);
    }
  }

  tieneImagen(paso: PasoBienvenida): boolean {
    return !!paso.imagen && !this.imagenesConError.includes(paso.imagen);
  }





  
  // Tpdo lo del globo
  // deslizar
  alTocar(evento: TouchEvent): void {
    this.inicioToqueX = evento.changedTouches[0].clientX;
  }

  alSoltar(evento: TouchEvent): void {
    const diferencia = evento.changedTouches[0].clientX - this.inicioToqueX;
    if (diferencia < -60) {
      this.siguiente(); // deslizo hacia la izquierda
    } else if (diferencia > 60) {
      this.anterior(); // deslizo hacia la derecha
    }
  }

  // Globo 
  // En la pantalla del globo el avion avanza poco a poco y vuelve a empezar
  private revisarGlobo(): void {
    if (this.pasos[this.pasoActual].tipo === 'globo') {
      this.progresoDemo = 0.15;
      this.detenerAnimacionGlobo();
      this.intervaloGlobo = setInterval(() => {
        this.progresoDemo = this.progresoDemo + 0.01;
        if (this.progresoDemo > 0.85) {
          this.progresoDemo = 0.15;
        }
      }, 200);
    } else {
      this.detenerAnimacionGlobo();
    }
  }

  private detenerAnimacionGlobo(): void {
    if (this.intervaloGlobo) {
      clearInterval(this.intervaloGlobo);
      this.intervaloGlobo = null;
    }
  }
}
