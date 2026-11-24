import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private prefijo = 'flydesk_'; 


  guardar(llave: string, valor: unknown): void { //llave-valor
    localStorage.setItem(this.prefijo + llave, JSON.stringify(valor));
  }


  leer<T>(llave: string, valorPorDefecto: T): T {
    const texto = localStorage.getItem(this.prefijo + llave);
    if (texto === null) {
      return valorPorDefecto; //no null / primera vez
    }
    try {
      return JSON.parse(texto) as T;//convierte a texto
    } catch (error) {
      console.error('No se pudo leer ' + llave + ' del storage', error);
      return valorPorDefecto;
    }
  }


  eliminar(llave: string): void {
    localStorage.removeItem(this.prefijo + llave);
  }
}
