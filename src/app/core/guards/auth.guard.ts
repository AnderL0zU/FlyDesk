import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Solo deja entrar si el usuario inicio sesion
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaLogueado()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

// Lo contrario: si ya inicio sesion no tiene sentido ver el login
export const invitadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaLogueado()) {
    return true;
  }
  return router.createUrlTree(['/tabs/inicio']);
};
