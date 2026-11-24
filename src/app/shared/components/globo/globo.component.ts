import type { AfterViewInit, ElementRef, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import type { GlobeInstance } from 'globe.gl';
import Globe from 'globe.gl';

import { calcularDistanciaKm, puntoIntermedio } from '../../../core/utils/geo.util';
import type { Aeropuerto } from '../../../models/aeropuerto.model';

// Componente que muestra la Tierra en 3D con la ruta del vuelo.
// Usa la libreria globe.gl (que por dentro usa three.js / WebGL).
//
// Ejemplo de uso:
// <app-globo [origen]="vuelo.origen" [destino]="vuelo.destino" [progreso]="0.5"></app-globo>
@Component({
  selector: 'app-globo',
  templateUrl: './globo.component.html',
  styleUrls: ['./globo.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class GloboComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() origen: Aeropuerto | null = null;
  @Input() destino: Aeropuerto | null = null;
  @Input() progreso = 0; // de 0 a 1, donde va el avion
  @Input() altura = 300; // alto en pixeles
  @Input() seguirAvion = false; // la camara sigue al avion
  @Input() pausado = false; // cambia el color de la ruta

  @ViewChild('contenedor') contenedor!: ElementRef<HTMLDivElement>;

  private globo: GlobeInstance | null = null;
  private avion: HTMLDivElement | null = null;

  ngAfterViewInit(): void {
    // esperamos un momento para que el contenedor ya tenga su ancho real
    setTimeout(() => this.crearGlobo(), 100);
  }

  // Se ejecuta cuando cambia algun @Input (ej: el progreso)
  ngOnChanges(cambios: SimpleChanges): void {
    if (this.globo) {
      this.actualizarRuta();
      this.actualizarAvion();
      // si cambio el origen o el destino movemos la camara hacia la nueva ruta
      if (cambios['origen'] || cambios['destino']) {
        this.centrarCamara(900);
      }
    }
  }

  ngOnDestroy(): void {
    // liberamos la memoria de WebGL al salir de la pagina
    if (this.globo) {
      this.globo._destructor();
      this.globo = null;
    }
  }

  private crearGlobo(): void {
    const elemento = this.contenedor.nativeElement;

    this.globo = new Globe(elemento, { animateIn: true })
      .width(elemento.clientWidth)
      .height(this.altura)
      .backgroundColor('rgba(0,0,0,0)') // transparente
      .globeImageUrl('assets/img/tierra-noche.jpg')
      .showAtmosphere(true)
      .atmosphereColor('#60a5fa')
      .atmosphereAltitude(0.18);

    // el usuario puede girar el globo con el dedo, pero no hacer zoom
    this.globo.controls().enableZoom = false;

    // Cuando la camara sigue al avion esta muy cerca,
    // asi que hacemos los puntos, letras y la ruta mas pequeños
    let escala = 1;
    if (this.seguirAvion) {
      escala = 0.3;
    }

    // Puntos de origen y destino
    this.globo
      .pointColor(() => '#38bdf8')
      .pointAltitude(0.01)
      .pointRadius(0.45 * escala);

    // Etiquetas con el codigo IATA
    this.globo
      .labelText((d: any) => d.iata)
      .labelSize(1.4 * escala)
      .labelDotRadius(0.4 * escala)
      .labelColor(() => '#ffffff')
      .labelResolution(2);

    // Ruta (arco)
    this.globo
      .arcColor('color') // usa el campo "color" de cada ruta
      .arcStroke(0.6 * escala)
      .arcAltitudeAutoScale(0.4)
      .arcDashLength(0.4)
      .arcDashGap(0.15)
      .arcDashAnimateTime(2500);

    // Avion (elemento HTML encima del globo)
    // globe.gl mueve el div de afuera, y nosotros giramos el de adentro
    const contenedorAvion = document.createElement('div');
    this.avion = document.createElement('div');
    this.avion.className = 'avion-globo';
    this.avion.innerText = '✈';
    contenedorAvion.appendChild(this.avion);
    this.globo.htmlElement(() => contenedorAvion).htmlAltitude(0.06);

    this.actualizarRuta();
    this.actualizarAvion();
    this.centrarCamara(0);
  }

  private actualizarRuta(): void {
    if (!this.globo || !this.origen) {
      return;
    }
    // sin destino solo mostramos el punto de origen
    if (!this.destino) {
      this.globo.pointsData([this.origen]).pointLat('lat').pointLng('lng');
      this.globo.labelsData([this.origen]).labelLat('lat').labelLng('lng');
      this.globo.arcsData([]);
      return;
    }
    const puntos = [this.origen, this.destino];
    this.globo.pointsData(puntos).pointLat('lat').pointLng('lng');
    this.globo.labelsData(puntos).labelLat('lat').labelLng('lng');

    const color = this.pausado ? ['#868e96', '#868e96'] : ['#38bdf8', '#0284c7'];
    this.globo.arcsData([
      {
        startLat: this.origen.lat,
        startLng: this.origen.lng,
        endLat: this.destino.lat,
        endLng: this.destino.lng,
        color: color,
      },
    ]);
  }

  private actualizarAvion(): void {
    if (!this.globo) {
      return;
    }
    // sin ruta no hay avion
    if (!this.origen || !this.destino) {
      this.globo.htmlElementsData([]);
      return;
    }
    // posicion del avion segun el progreso del vuelo
    const posicion = puntoIntermedio(
      this.origen.lat,
      this.origen.lng,
      this.destino.lat,
      this.destino.lng,
      this.progreso,
    );

    // calculamos hacia donde apunta el avion (un poquito mas adelante)
    const siguiente = puntoIntermedio(
      this.origen.lat,
      this.origen.lng,
      this.destino.lat,
      this.destino.lng,
      Math.min(this.progreso + 0.01, 1),
    );
    const angulo = (Math.atan2(siguiente.lng - posicion.lng, siguiente.lat - posicion.lat) * 180) / Math.PI;
    if (this.avion) {
      // el emoji ✈ apunta a la derecha (90 grados), por eso restamos 90
      this.avion.style.transform = 'rotate(' + (angulo - 90) + 'deg)';
    }

    this.globo.htmlElementsData([{ lat: posicion.lat, lng: posicion.lng }]);

    if (this.seguirAvion) {
      this.globo.pointOfView({ lat: posicion.lat, lng: posicion.lng, altitude: 0.5 }, 900);
    }
  }

  // Coloca la camara en el punto medio de la ruta
  private centrarCamara(tiempoMs: number): void {
    if (!this.globo || !this.origen) {
      return;
    }
    if (!this.destino) {
      this.globo.pointOfView({ lat: this.origen.lat, lng: this.origen.lng, altitude: 1.1 }, tiempoMs);
      return;
    }
    // si seguimos al avion miramos donde va el avion, si no la mitad de la ruta
    const punto = this.seguirAvion ? this.progreso : 0.5;
    const medio = puntoIntermedio(this.origen.lat, this.origen.lng, this.destino.lat, this.destino.lng, punto);

    // entre mas corta la ruta, mas cerca ponemos la camara (maximo 2.2)
    const distancia = calcularDistanciaKm(this.origen.lat, this.origen.lng, this.destino.lat, this.destino.lng);
    let altitud = Math.min(2.2, 0.5 + distancia / 2000);
    if (this.seguirAvion) {
      altitud = 0.5;
    }
    this.globo.pointOfView({ lat: medio.lat, lng: medio.lng, altitude: altitud }, tiempoMs);
  }
}
