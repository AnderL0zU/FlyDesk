import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
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
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { lockClosedOutline, personOutline } from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';
import { MensajesService } from '../../../core/services/mensajes.service';
import type { Credenciales } from '../../../models/usuario.model';

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
  private authService = inject(AuthService);
  private mensajes = inject(MensajesService);
  private router = inject(Router);

  // Datos enlazados con ngModel
  credenciales: Credenciales = {
    email: '',
    password: '',
  };
  recordarCorreo = false;

  constructor() {
    addIcons({ personOutline, lockClosedOutline });
  }

  //ejecuta cada vez que se va a mostrar la pagina
  ionViewWillEnter(): void {
    const correo = this.authService.obtenerCorreoRecordado();
    if (correo) {
      this.credenciales.email = correo;
      this.recordarCorreo = true;
    }
  }

  iniciarSesion(formulario: NgForm): void {
    if (formulario.invalid) {
      this.mensajes.error('Escribe tu usuario y tu contraseña');
      return;
    }

    const correcto = this.authService.login(this.credenciales);
    if (!correcto) {
      this.mensajes.error('Usuario o contraseña incorrectos');
      return;
    }

    if (this.recordarCorreo) {
      this.authService.guardarCorreoRecordado(this.credenciales.email.trim());
    } else {
      this.authService.olvidarCorreo();
    }

    const usuario = this.authService.obtenerUsuario();
    this.mensajes.exito('¡Bienvenido a bordo, ' + usuario?.username + '!'); //toast
    this.credenciales.password = '';
    this.router.navigateByUrl('/tabs/inicio', { replaceUrl: true });//reemplazando en true se entra a inicio
  }

}
