import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Aeropuerto } from '../../models/aeropuerto.model';
import { calcularDistanciaKm } from '../utils/geo.util';

@Injectable({
  providedIn: 'root',
})
export class AeropuertosService {
  // guardamos la lista para no pedirla cada vez
  private aeropuertos: Aeropuerto[] = [];

  constructor(private http: HttpClient) {}

  obtenerAeropuertos(): Observable<Aeropuerto[]> {
    if (this.aeropuertos.length > 0) {
      return of(this.aeropuertos);
    }
    return this.http.get<Aeropuerto[]>('/api/aeropuertos').pipe(tap((lista) => (this.aeropuertos = lista)));
  }

  buscarPorCodigo(iata: string): Aeropuerto | undefined {
    return this.aeropuertos.find((a) => a.iata === iata);
  }

  // Lista de continentes sin repetir (para los filtros)
  obtenerContinentes(): string[] {
    const continentes: string[] = [];
    for (const a of this.aeropuertos) {
      if (!continentes.includes(a.continente)) {
        continentes.push(a.continente);
      }
    }
    return continentes.sort();
  }

  // Recorre todos los aeropuertos y devuelve el que este mas cerca
  buscarMasCercano(lat: number, lng: number): { aeropuerto: Aeropuerto; distanciaKm: number } | null {
    let masCercano: Aeropuerto | null = null;
    let menorDistancia = Number.MAX_VALUE;

    for (const a of this.aeropuertos) {
      const distancia = calcularDistanciaKm(lat, lng, a.lat, a.lng);
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        masCercano = a;
      }
    }

    if (masCercano === null) {
      return null;
    }
    return { aeropuerto: masCercano, distanciaKm: menorDistancia };
  }
}
