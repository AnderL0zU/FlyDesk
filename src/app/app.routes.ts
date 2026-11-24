import type { Routes } from '@angular/router';

import { authGuard, invitadoGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/inicio',
    pathMatch: 'full',
  },

  {
    path: 'bienvenida',
    loadComponent: () => import('./pages/bienvenida/bienvenida.page').then((m) => m.BienvenidaPage),
  },
  {
    path: 'login',
    canActivate: [invitadoGuard], //pone invitado
    loadComponent: () => import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/auth/registro/registro.page').then((m) => m.RegistroPage),
  },

  
  // Paginas con sesion iniciada
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
        path: 'historial',
        loadComponent: () => import('./pages/historial/historial.page').then((m) => m.HistorialPage),
      },
      {
        path: 'ajustes',
        loadComponent: () => import('./pages/ajustes/ajustes.page').then((m) => m.AjustesPage),
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'reservar/:iata', //iata es el codigo que recibe del usuario del aeropuerto origen
    canActivate: [authGuard],
    loadComponent: () => import('./pages/reservar/reservar.page').then((m) => m.ReservarPage),
  },
  {
    path: 'despegue/:origen/:destino/:minutos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/despegue/despegue.page').then((m) => m.DespeguePage),
  },
  {
    path: 'vuelo',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/vuelo/vuelo.page').then((m) => m.VueloPage),
  },
  {
    path: 'llegada',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/llegada/llegada.page').then((m) => m.LlegadaPage),
  },
  {
    path: '**',
    redirectTo: 'tabs/inicio',
  },
];
