import type { Routes } from '@angular/router';
import { authGuard, invitadoGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/inicio',
    pathMatch: 'full',
  },
  // ---- Paginas publicas ----
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/auth/registro/registro.page').then((m) => m.RegistroPage),
  },
  // ---- Paginas con sesion iniciada ----
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./pages/inicio/inicio.page').then((m) => m.InicioPage),
      },
      {
        path: 'buscar',
        loadComponent: () => import('./pages/buscar/buscar.page').then((m) => m.BuscarPage),
      },
      {
        path: 'historial',
        loadComponent: () => import('./pages/historial/historial.page').then((m) => m.HistorialPage),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil.page').then((m) => m.PerfilPage),
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'vuelo/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/vuelo-en-curso/vuelo-en-curso.page').then((m) => m.VueloEnCursoPage),
  },
  {
    path: 'aterrizaje/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/aterrizaje/aterrizaje.page').then((m) => m.AterrizajePage),
  },
  {
    path: '**',
    redirectTo: 'tabs/inicio',
  },
];
