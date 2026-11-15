import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FiltrosBusqueda, ResultadoBusqueda } from '../../models/filtros.model';

@Injectable({
  providedIn: 'root',
})
export class VuelosService {
  constructor(private http: HttpClient) {}

  // modo 'aleatorio' = vuelos al azar, modo 'busqueda' = segun los filtros
  buscarVuelos(filtros: FiltrosBusqueda, modo: 'aleatorio' | 'busqueda'): Observable<ResultadoBusqueda> {
    let parametros = new HttpParams()
      .set('modo', modo)
      .set('duracionMin', filtros.duracionMin)
      .set('duracionMax', filtros.duracionMax)
      .set('pagina', filtros.pagina);

    if (filtros.origen) {
      parametros = parametros.set('origen', filtros.origen);
    }
    if (filtros.destino) {
      parametros = parametros.set('destino', filtros.destino);
    }
    if (filtros.continente) {
      parametros = parametros.set('continente', filtros.continente);
    }

    return this.http.get<ResultadoBusqueda>('/api/vuelos', { params: parametros });
  }
}
