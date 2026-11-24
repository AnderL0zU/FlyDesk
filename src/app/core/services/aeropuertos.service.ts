import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { forkJoin, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Aeropuerto, AeropuertoApi } from '../../models/aeropuerto.model';

// Busca aeropuertos en la API
@Injectable({
  providedIn: 'root',
})
export class AeropuertosService {
  private http = inject(HttpClient);

  private urlApi = 'https://api.api-ninjas.com/v1/airports';

  // peticion 1: busca por codigo IATA
  buscarPorCodigo(codigo: string): Observable<Aeropuerto[]> {
    return this.pedir('iata=' + encodeURIComponent(codigo) + '&has_iata=true&limit=20');
  } //llama a la funcion pedir que es la que hace la peticion http

  // peticion 2: aeropuertos a donde se puede volar desde el origen:
  buscarDestinos(origen: Aeropuerto): Observable<Aeropuerto[]> {
    const delPais = this.pedir(
      'country=' + origen.codigoPais + '&has_iata=true&scheduled_service=true&limit=100',
    );
    const delContinente = this.pedir('continent=' + origen.continente + '&type=large_airport&limit=100');

    
    // forkJoin espera a que terminen las dos peticiones
    return forkJoin([delPais, delContinente]).pipe(
      map((respuestas) => {
        const todos = respuestas[0].concat(respuestas[1]); //se une la busqueda por pais y continent
        const resultado: Aeropuerto[] = [];
        for (const aeropuerto of todos) {
          // quita el origen y los repetidos
          const repetido = resultado.find((a) => a.iata === aeropuerto.iata);
          if (aeropuerto.iata !== origen.iata && !repetido) { //es como el trycatch para evitar poner el origen o repetidos
            resultado.push(aeropuerto);
          }
        }
        return resultado;
      }),
    );
  }

  // Peticion http
  private pedir(parametros: string): Observable<Aeropuerto[]> {
    const headers = new HttpHeaders({ 'X-Api-Key': environment.apiNinjasKey }); //llave
    return this.http
      .get<AeropuertoApi[]>(this.urlApi + '?' + parametros, { headers: headers }) //get parametros
      .pipe(map((lista) => lista.map((item) => this.convertir(item))));           //convierte al modelo 
  }

  //se hace esto (usa 2 modelos de interface) para hacer que si se cambia de API sea mas simple

  private convertir(item: AeropuertoApi): Aeropuerto { //convierte al numero modelo de interface
    return {
      iata: item.iata,
      nombre: item.name,
      ciudad: item.city,
      pais: item.country_name,
      codigoPais: item.country,
      continente: item.continent,
      lat: item.latitude,
      lng: item.longitude,
    };
  }
}
