import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';

import type { Clima, ClimaApi } from '../../models/clima.model';

// Devuelve el clima actual de unas coordenadas
@Injectable({
  providedIn: 'root',
})
export class ClimaService {
  private http = inject(HttpClient);
  private url = 'https://api.open-meteo.com/v1/forecast';

  obtenerClimaActual(lat: number, lng: number): Observable<Clima> {
    const parametros = {
      latitude: lat,
      longitude: lng,
      current: 'temperature_2m,weather_code,is_day',
    };
    return this.http.get<ClimaApi>(this.url, { params: parametros }).pipe(
      map((respuesta) => this.convertir(respuesta)),
    );
  }

  // Pasamos la respuesta de la API a nuestro modelo
  private convertir(respuesta: ClimaApi): Clima {
    const codigo = respuesta.current.weather_code;
    const deDia = respuesta.current.is_day === 1;

    // Codigos del clima de Open-Meteo (WMO)
    let descripcion = 'Nublado';
    let icono = 'cloud-outline';
    if (codigo === 0) {
      descripcion = 'Despejado';
      icono = deDia ? 'sunny-outline' : 'moon-outline';
    } else if (codigo <= 3) {
      descripcion = 'Parcialmente nublado';
      icono = deDia ? 'partly-sunny-outline' : 'cloudy-night-outline';
    } else if (codigo === 45 || codigo === 48) {
      descripcion = 'Niebla';
      icono = 'cloud-outline';
    } else if (codigo >= 51 && codigo <= 57) {
      descripcion = 'Llovizna';
      icono = 'rainy-outline';
    } else if ((codigo >= 61 && codigo <= 67) || (codigo >= 80 && codigo <= 82)) {
      descripcion = 'Lluvia';
      icono = 'rainy-outline';
    } else if ((codigo >= 71 && codigo <= 77) || codigo === 85 || codigo === 86) {
      descripcion = 'Nieve';
      icono = 'snow-outline';
    } else if (codigo >= 95) {
      descripcion = 'Tormenta';
      icono = 'thunderstorm-outline';
    }

    return {
      temperatura: Math.round(respuesta.current.temperature_2m),
      descripcion: descripcion,
      icono: icono,
    };
  }
}
