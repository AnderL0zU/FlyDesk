import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Clima, RespuestaClima } from '../../models/clima.model';

// Este servicio SI consume una API real de internet: Open-Meteo (gratis, sin llave).
// Se usa para mostrar el clima del destino en el pase de abordar.
@Injectable({
  providedIn: 'root',
})
export class ClimaService {
  private urlApi = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  obtenerClima(lat: number, lng: number): Observable<Clima> {
    const parametros = {
      latitude: lat,
      longitude: lng,
      current: 'temperature_2m,weather_code,wind_speed_10m',
    };

    return this.http.get<RespuestaClima>(this.urlApi, { params: parametros }).pipe(
      // convertimos el JSON de la API a nuestro formato
      map((respuesta) => {
        const descripcion = this.describirCodigo(respuesta.current.weather_code);
        const clima: Clima = {
          temperatura: Math.round(respuesta.current.temperature_2m),
          viento: Math.round(respuesta.current.wind_speed_10m),
          descripcion: descripcion.texto,
          icono: descripcion.icono,
        };
        return clima;
      }),
    );
  }

  // Codigos del clima segun la documentacion de Open-Meteo (WMO)
  private describirCodigo(codigo: number): { texto: string; icono: string } {
    if (codigo === 0) {
      return { texto: 'Despejado', icono: 'sunny-outline' };
    } else if (codigo <= 3) {
      return { texto: 'Parcialmente nublado', icono: 'partly-sunny-outline' };
    } else if (codigo <= 48) {
      return { texto: 'Niebla', icono: 'cloud-outline' };
    } else if (codigo <= 67) {
      return { texto: 'Lluvia', icono: 'rainy-outline' };
    } else if (codigo <= 77) {
      return { texto: 'Nieve', icono: 'snow-outline' };
    } else if (codigo <= 82) {
      return { texto: 'Chubascos', icono: 'rainy-outline' };
    } else {
      return { texto: 'Tormenta', icono: 'thunderstorm-outline' };
    }
  }
}
