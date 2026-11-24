import { Injectable, inject } from '@angular/core';

import type { Credenciales, DatosRegistro, Sesion, Usuario } from '../../models/usuario.model';

import { StorageService } from './storage.service';

// registro, inciio y cierre de sesion
// usuarios se guardan en localStorage (llave flydesk_usuarios)
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private storage = inject(StorageService);

  // Lista de todos los usuarios registrados
  private obtenerUsuarios(): Usuario[] {
    const usuarios = this.storage.leer<Usuario[]>('usuarios', []);

    // la primera vez creamos un usuario de prueba
    if (usuarios.length === 0) {
      const demo: Usuario = {
        id: 'usuario-demo',
        username: 'piloto_demo',
        edad: 21,
        email: 'demo@flydesk.com',
        password: '123456',
        fechaRegistro: new Date().toISOString(),
      };
      usuarios.push(demo);
      this.storage.guardar('usuarios', usuarios);
    }

    return usuarios;
  }

  //LOGIN
  login(credenciales: Credenciales): boolean {
    //devuelve true si es correcto
    const usuarios = this.obtenerUsuarios();
    const texto = credenciales.email.trim().toLowerCase();

    // correo o user
    const usuario = usuarios.find(
      (u) => (u.email === texto || u.username.toLowerCase() === texto) && u.password === credenciales.password,
    );

    if (!usuario) {
      return false;
    }

    this.guardarSesion(usuario);
    return true;
  }

  // REGISTRO
  registro(datos: DatosRegistro): string {
    const usuarios = this.obtenerUsuarios();

    if (usuarios.find((u) => u.email === datos.email)) {
      return 'Ya existe una cuenta con ese correo';
    }
    if (usuarios.find((u) => u.username.toLowerCase() === datos.username.toLowerCase())) {
      return 'Ese nombre de usuario ya está en uso';
    }

    const nuevo: Usuario = {
      id: Date.now().toString(),
      username: datos.username,
      edad: Number(datos.edad),
      email: datos.email,
      password: datos.password,
      fechaRegistro: new Date().toISOString(),
    };
    usuarios.push(nuevo);
    this.storage.guardar('usuarios', usuarios);

    // al registrarse queda con la sesion iniciada
    this.guardarSesion(nuevo);
    return '';
  }

  // SESION
  //GUARDAR SESION ACTUAL se hace con un token
  private guardarSesion(usuario: Usuario): void {
    const sesion: Sesion = {
      token: 'token-' + usuario.id,
      usuario: usuario,
    };
    this.storage.guardar('sesion', sesion);
  }

  cerrarSesion(): void {
    this.storage.eliminar('sesion');
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
