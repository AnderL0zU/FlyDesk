import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonNote,
  IonText,
  LoadingController,
  MenuController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { airplane, logInOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';
import { Credenciales } from '../../../models/usuario.model';
import { AuthService } from '../../../core/services/auth.service';
import { MensajesService } from '../../../core/services/mensajes.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonInput,
    IonInputPasswordToggle,
    IonCheckbox,
    IonButton,
    IonIcon,
    IonText,
    IonNote,
  ],
})
export class LoginPage {
  // Datos enlazados con [(ngModel)]
  credenciales: Credenciales = {
    email: '',
    password: '',
  };
  recordarCorreo = false;

  constructor(
    private authService: AuthService,
    private mensajes: MensajesService,
    private loadingController: LoadingController,
    private menuController: MenuController,
    private router: Router,
  ) {
    addIcons({ airplane, logInOutline, mailOutline, lockClosedOutline });
  }

  // Ciclo de vida de Ionic: se ejecuta cada vez que se va a mostrar la pagina
  ionViewWillEnter(): void {
    this.menuController.enable(false); // en el login no hay menu
    const correo = this.authService.obtenerCorreoRecordado();
    if (correo) {
      this.credenciales.email = correo;
      this.recordarCorreo = true;
    }
  }

  async iniciarSesion(formulario: NgForm): Promise<void> {
    if (formulario.invalid) {
      this.mensajes.error('Revisa el correo y la contraseña');
      return;
    }

    const cargando = await this.loadingController.create({ message: 'Preparando la cabina...' });
    await cargando.present();

    this.authService.login(this.credenciales).subscribe({
      next: (sesion) => {
        cargando.dismiss();
        if (this.recordarCorreo) {
          this.authService.guardarCorreoRecordado(this.credenciales.email);
        } else {
          this.authService.olvidarCorreo();
        }
        this.mensajes.exito('¡Bienvenido a bordo, ' + sesion.usuario.nombre + '!');
        this.credenciales.password = '';
        this.router.navigateByUrl('/tabs/inicio', { replaceUrl: true });
      },
      error: (err) => {
        cargando.dismiss();
        this.mensajes.error(this.mensajes.obtenerMensajeError(err));
      },
    });
  }
}
