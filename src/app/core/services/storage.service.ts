import { Injectable } from '@angular/core';

// Servicio sencillo para guardar y leer datos del localStorage.
// Todo se guarda como texto JSON, por eso usamos JSON.stringify y JSON.parse.
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // prefijo para que nuestras llaves no choquen con otras
  private prefijo = 'flydesk_';

  guardar(llave: string, valor: unknown): void {
    localStorage.setItem(this.prefijo + llave, JSON.stringify(valor));
  }

  leer<T>(llave: string, valorPorDefecto: T): T {
    const texto = localStorage.getItem(this.prefijo + llave);
    if (texto === null) {
      return valorPorDefecto;
    }
    try {
      return JSON.parse(texto) as T;
    } catch (error) {
      console.error('No se pudo leer ' + llave + ' del storage', error);
      return valorPorDefecto;
    }
  }

  eliminar(llave: string): void {
    localStorage.removeItem(this.prefijo + llave);
  }
}
