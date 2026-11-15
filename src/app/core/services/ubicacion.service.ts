import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

// Plugin de Capacitor: @capacitor/geolocation
// Se usa para sugerir el aeropuerto mas cercano al usuario.
@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  // Devuelve la posicion o lanza un error con un mensaje entendible
  async obtenerPosicion(): Promise<{ lat: number; lng: number }> {
    // En el celular primero revisamos / pedimos el permiso nativo
    if (Capacitor.isNativePlatform()) {
      let permiso = await Geolocation.checkPermissions();
      if (permiso.location === 'prompt' || permiso.location === 'prompt-with-rationale') {
        permiso = await Geolocation.requestPermissions({ permissions: ['coarseLocation'] });
      }
      if (permiso.location === 'denied' && permiso.coarseLocation === 'denied') {
        throw new Error('Permiso de ubicación denegado. Actívalo en los ajustes del celular.');
      }
    }

    try {
      const posicion = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 15000 });
      return { lat: posicion.coords.latitude, lng: posicion.coords.longitude };
    } catch (error) {
      console.error('Error de geolocalizacion', error);
      throw new Error('No se pudo obtener tu ubicación. Revisa que el GPS esté encendido.');
    }
  }
}
