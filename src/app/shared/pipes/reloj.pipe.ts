import { Pipe, PipeTransform } from '@angular/core';

// Convierte milisegundos a formato de reloj. Ejemplo: 3725000 -> "01:02:05"
// Uso en el HTML: {{ restanteMs | reloj }}
@Pipe({
  name: 'reloj',
})
export class RelojPipe implements PipeTransform {
  transform(milisegundos: number | null | undefined): string {
    if (!milisegundos || milisegundos < 0) {
      return '00:00';
    }
    const totalSegundos = Math.ceil(milisegundos / 1000);
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    const mm = minutos.toString().padStart(2, '0');
    const ss = segundos.toString().padStart(2, '0');

    if (horas > 0) {
      return horas.toString().padStart(2, '0') + ':' + mm + ':' + ss;
    }
    return mm + ':' + ss;
  }
}
