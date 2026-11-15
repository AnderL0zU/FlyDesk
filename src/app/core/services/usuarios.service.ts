import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Estadisticas } from '../../models/estadisticas.model';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private urlApi = '/api/usuarios';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  obtenerEstadisticas(usuarioId: string): Observable<Estadisticas> {
    return this.http.get<Estadisticas>(this.urlApi + '/' + usuarioId + '/estadisticas');
  }

  actualizar(usuarioId: string, cambios: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(this.urlApi + '/' + usuarioId, cambios).pipe(
      // actualizamos tambien la sesion guardada
      tap((usuario) => this.authService.actualizarUsuarioGuardado(usuario)),
    );
  }
}
