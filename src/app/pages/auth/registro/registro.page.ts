import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonText,
  IonTitle,
  IonToolbar,
  LoadingController,
  MenuController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personAddOutline } from 'ionicons/icons';
import { DatosRegistro } from '../../../models/usuario.model';
import { AuthService } from '../../../core/services/auth.service';
import { MensajesService } from '../../../core/services/mensajes.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonInput,
    IonInputPasswordToggle,
    IonCheckbox,
    IonButton,
    IonIcon,
    IonText,
  ],
})
export class RegistroPage {
  datos: DatosRegistro = {
    nombre: '',
    email: '',
    password: '',
  };
  confirmarPassword = '';
  aceptaTerminos = false;

  constructor(
    private authService: AuthService,
    private mensajes: MensajesService,
    private loadingController: LoadingController,
    private menuController: MenuController,
    private router: Router,
  ) {
    addIcons({ personAddOutline });
  }

  ionViewWillEnter(): void {
    this.menuController.enable(false);
  }

  // Se usa en el HTML para mostrar el error debajo del campo
  passwordsCoinciden(): boolean {
    return this.datos.password === this.confirmarPassword;
  }

  async registrarse(formulario: NgForm): Promise<void> {
    if (formulario.invalid || !this.passwordsCoinciden() || !this.aceptaTerminos) {
      this.mensajes.error('Completa bien todos los campos');
      return;
    }

    const cargando = await this.loadingController.create({ message: 'Creando tu pasaporte...' });
    await cargando.present();

    this.authService.registro(this.datos).subscribe({
      next: (sesion) => {
        cargando.dismiss();
        this.mensajes.exito('¡Cuenta creada! Hola ' + sesion.usuario.nombre);
        this.router.navigateByUrl('/tabs/inicio', { replaceUrl: true });
      },
      error: (err) => {
        cargando.dismiss();
        this.mensajes.error(this.mensajes.obtenerMensajeError(err));
      },
    });
  }
}
