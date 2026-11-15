import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { IonCard, IonCardContent, IonIcon, IonSkeletonText } from '@ionic/angular';

// Tarjetita pequeña para mostrar un numero (horas, km, vuelos...)
// Ejemplo: <app-tarjeta-estadistica icono="time-outline" titulo="Horas" [valor]="12"></app-tarjeta-estadistica>
// OJO: los iconos se registran con addIcons() en la pagina que usa este componente.
@Component({
  selector: 'app-tarjeta-estadistica',
  template: `
    <ion-card class="tarjeta">
      <ion-card-content>
        <ion-icon [name]="icono" [color]="color"></ion-icon>
        <ion-skeleton-text *ngIf="cargando" [animated]="true" class="esqueleto"></ion-skeleton-text>
        <div *ngIf="!cargando" class="valor">{{ valor }}</div>
        <div class="titulo">{{ titulo }}</div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `
      .tarjeta {
        margin: 6px;
        text-align: center;
      }
      ion-icon {
        font-size: 26px;
      }
      .valor {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--ion-text-color);
        margin-top: 4px;
      }
      .titulo {
        font-size: 0.8rem;
        color: var(--ion-color-medium);
      }
      .esqueleto {
        width: 60%;
        height: 24px;
        margin: 6px auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgIf, IonCard, IonCardContent, IonIcon, IonSkeletonText],
})
export class TarjetaEstadisticaComponent {
  @Input() icono = 'stats-chart-outline';
  @Input() titulo = '';
  @Input() valor: string | number = 0;
  @Input() color = 'primary';
  @Input() cargando = false;
}
