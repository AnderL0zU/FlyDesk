import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NuevaReserva, Reserva } from '../../models/reserva.model';

// CRUD de reservas (el historial de vuelos del usuario)
@Injectable({
  providedIn: 'root',
})
export class ReservasService {
  private urlApi = '/api/reservas';

  constructor(private http: HttpClient) {}

  listar(usuarioId: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.urlApi, { params: { usuarioId: usuarioId } });
  }

  obtener(id: string): Observable<Reserva> {
    return this.http.get<Reserva>(this.urlApi + '/' + id);
  }

  crear(datos: NuevaReserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.urlApi, datos);
  }

  actualizar(id: string, cambios: Partial<Reserva>): Observable<Reserva> {
    return this.http.put<Reserva>(this.urlApi + '/' + id, cambios);
  }

  eliminar(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(this.urlApi + '/' + id);
  }
}
