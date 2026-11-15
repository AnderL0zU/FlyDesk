import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

// Ayuda a mostrar toasts y alertas de confirmacion desde cualquier pagina
@Injectable({
  providedIn: 'root',
})
export class MensajesService {
  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
  ) {}

  async mostrarToast(mensaje: string, color: string = 'dark', icono: string = 'information-circle-outline'): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color: color,
      icon: icono,
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await toast.present();
  }

  async exito(mensaje: string): Promise<void> {
    await this.mostrarToast(mensaje, 'success', 'checkmark-circle-outline');
  }

  async error(mensaje: string): Promise<void> {
    await this.mostrarToast(mensaje, 'danger', 'alert-circle-outline');
  }

  // Muestra una alerta con Cancelar / Aceptar y devuelve true si acepto
  async confirmar(titulo: string, mensaje: string, textoAceptar: string = 'Aceptar'): Promise<boolean> {
    const alerta = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: textoAceptar, role: 'confirm' },
      ],
    });
    await alerta.present();
    const resultado = await alerta.onDidDismiss();
    return resultado.role === 'confirm';
  }

  // Saca el mensaje de error que manda la API (o uno generico)
  obtenerMensajeError(err: any): string {
    if (err && err.error && err.error.mensaje) {
      return err.error.mensaje;
    }
    return 'Ocurrió un error inesperado, intenta de nuevo';
  }
}
