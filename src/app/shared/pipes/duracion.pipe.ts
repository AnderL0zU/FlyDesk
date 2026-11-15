import { Pipe, PipeTransform } from '@angular/core';

// Convierte minutos a texto. Ejemplo: 135 -> "2 h 15 min"
// Uso en el HTML: {{ vuelo.duracionMin | duracion }}
@Pipe({
  name: 'duracion',
})
export class DuracionPipe implements PipeTransform {
  transform(minutos: number | null | undefined): string {
    if (minutos === null || minutos === undefined || minutos <= 0) {
      return '0 min';
    }
    const horas = Math.floor(minutos / 60);
    const resto = Math.round(minutos % 60);

    if (horas === 0) {
      return resto + ' min';
    }
    if (resto === 0) {
      return horas + ' h';
    }
    return horas + ' h ' + resto + ' min';
  }
}
