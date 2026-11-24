import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonText,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  atOutline,
  calendarOutline,
  lockClosedOutline,
  personOutline,
} from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';
import { MensajesService } from '../../../core/services/mensajes.service';
import type { DatosRegistro } from '../../../models/usuario.model';


interface CamposTocados {
  username: boolean;
  email: boolean;
  edad: boolean;
  password: boolean;
}

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonInput,
    IonInputPasswordToggle,
    IonButton,
    IonIcon,
    IonText,
  ],
})
export class RegistroPage {
  private authService = inject(AuthService);
  private mensajes = inject(MensajesService);
  private router = inject(Router);

  datos: DatosRegistro = {
    username: '',
    email: '',
    edad: null,
    password: '',
  };

  tocados: CamposTocados = { //para no mostrar errores antes de tiempo
    username: false,
    email: false,
    edad: false,
    password: false,
  };

  constructor() {
    addIcons({ personOutline, atOutline, calendarOutline, lockClosedOutline });
  }

  // Se llama con (ionBlur) cuando el usuario sale de un campo
  marcarTocado(campo: keyof CamposTocados): void {
    this.tocados[campo] = true;
  }

  //validaciones 

  errorUsername(): string {
    const username = (this.datos.username || '').trim();
    if (username === '') {
      return 'Escribe un nombre de usuario';
    }
    if (username.length < 3) {
      return 'Debe tener al menos 3 caracteres';
    }
    if (username.length > 20) {
      return 'Máximo 20 caracteres';
    }
    // solo letras sin tilde, numeros, punto y guion bajo
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
      return 'Usa solo letras, números, punto (.) o guion bajo (_)';
    }
    return '';
  }

  errorEmail(): string {
    const email = (this.datos.email || '').trim();
    if (email === '') {
      return 'Escribe tu correo electrónico';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return 'El correo no es válido (ejemplo: nombre@correo.com)';
    }
    return '';
  }

  errorEdad(): string {
    const texto = this.datos.edad === null ? '' : String(this.datos.edad).trim();
    if (texto === '') {
      return 'Escribe tu edad';
    }
    const edad = Number(texto);
    if (!Number.isInteger(edad)) {
      return 'La edad debe ser un número entero';
    }
    if (edad < 13) {
      return 'Debes tener al menos 13 años para usar FlyDesk';
    }
    if (edad > 100) {
      return 'Revisa tu edad, máximo 100 años';
    }
    return '';
  }

  errorPassword(): string {
    const password = this.datos.password || '';
    if (password === '') {
      return 'Escribe una contraseña';
    }
    if (password.length < 8) {
      return 'Debe tener al menos 8 caracteres';
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return 'Debe tener al menos una letra y un número';
    }
    return '';
  }

  
  mostrarError(campo: keyof CamposTocados): string {
    if (!this.tocados[campo]) {
      return '';
    }
    if (campo === 'username') {
      return this.errorUsername();
    } else if (campo === 'email') {
      return this.errorEmail();
    } else if (campo === 'edad') {
      return this.errorEdad();
    }
    return this.errorPassword();
  }

  formularioValido(): boolean {
    return this.errorUsername() === '' && this.errorEmail() === '' && this.errorEdad() === '' && this.errorPassword() === '';
  }

  //enviar 
  crearCuenta(): void {
    // al intentar enviar se marca todo como tocado para que se vean los errores
    this.tocados = { username: true, email: true, edad: true, password: true };

    if (!this.formularioValido()) {
      this.mensajes.error('Revisa los campos marcados en rojo');
      return;
    }

    const datosLimpios: DatosRegistro = {
      username: this.datos.username.trim(),
      email: this.datos.email.trim().toLowerCase(),
      edad: Number(this.datos.edad),
      password: this.datos.password,
    };

    // devuelve '' si todo salio bien, o el mensaje de error
    const error = this.authService.registro(datosLimpios);
    if (error !== '') {
      this.mensajes.error(error);
      return;
    }

    this.mensajes.exito('¡Cuenta creada! Bienvenido, ' + datosLimpios.username);
    this.router.navigateByUrl('/tabs/inicio', { replaceUrl: true }); // Se pasa a la pagina de inicio
  }

  
}
