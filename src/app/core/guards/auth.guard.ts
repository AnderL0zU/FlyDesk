import { inject } from '@angular/core';
import type { CanActivateFn} from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

// Solo deja entrar si el usuario inicio sesion
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaLogueado()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};


export const invitadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const storage = inject(StorageService);
  const router = inject(Router);

  if (authService.estaLogueado()) {
    return router.createUrlTree(['/tabs/inicio']);
  }
  if (!storage.leer<boolean>('bienvenida_vista', false)) {
    return router.createUrlTree(['/bienvenida']);
  }
  return true;
};
