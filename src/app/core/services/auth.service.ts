import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Credenciales, DatosRegistro, Sesion, Usuario } from '../../models/usuario.model';
import { StorageService } from './storage.service';

// Maneja el inicio y cierre de sesion (login simulado)
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private urlApi = '/api/auth';

  constructor(
    private http: HttpClient,
    private storage: StorageService,
  ) {}

  login(credenciales: Credenciales): Observable<Sesion> {
    return this.http.post<Sesion>(this.urlApi + '/login', credenciales).pipe(
      // cuando el servidor responde bien guardamos la sesion
      tap((sesion) => this.storage.guardar('sesion', sesion)),
    );
  }

  registro(datos: DatosRegistro): Observable<Sesion> {
    return this.http.post<Sesion>(this.urlApi + '/registro', datos).pipe(
      tap((sesion) => this.storage.guardar('sesion', sesion)),
    );
  }

  cerrarSesion(): void {
    this.storage.eliminar('sesion');
    this.storage.eliminar('vuelo_activo');
  }

  estaLogueado(): boolean {
    return this.storage.leer<Sesion | null>('sesion', null) !== null;
  }

  obtenerUsuario(): Usuario | null {
    const sesion = this.storage.leer<Sesion | null>('sesion', null);
    if (sesion === null) {
      return null;
    }
    return sesion.usuario;
  }

  // Cuando el usuario edita su perfil actualizamos la copia guardada
  actualizarUsuarioGuardado(usuario: Usuario): void {
    const sesion = this.storage.leer<Sesion | null>('sesion', null);
    if (sesion !== null) {
      sesion.usuario = usuario;
      this.storage.guardar('sesion', sesion);
    }
  }

  // "Recordar mi correo" del login
  guardarCorreoRecordado(email: string): void {
    this.storage.guardar('correo_recordado', email);
  }

  obtenerCorreoRecordado(): string {
    return this.storage.leer<string>('correo_recordado', '');
  }

  olvidarCorreo(): void {
    this.storage.eliminar('correo_recordado');
  }
}
