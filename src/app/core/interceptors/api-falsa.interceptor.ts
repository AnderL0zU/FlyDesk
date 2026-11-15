import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, of, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import * as api from './api-falsa.datos';

// Tiempo de espera para simular que la peticion viaja a un servidor
const RETRASO_MS = 400;

// =====================================================================
// Interceptor de la API falsa.
// Todas las peticiones de HttpClient pasan por aqui. Si la URL empieza
// con /api/ respondemos nosotros (con datos del localStorage); si no,
// la dejamos pasar normal (por ejemplo la API del clima).
// =====================================================================
export const apiFalsaInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  const storage = inject(StorageService);
  api.crearDatosDemo(storage);

  // separamos la ruta de los parametros (?origen=BOG&...)
  const url = new URL(req.urlWithParams, 'http://flydesk.local');
  const partes = url.pathname.split('/').filter((p) => p !== ''); // ['api', 'reservas', '123']
  const recurso = partes[1];
  const id = partes[2];
  const metodo = req.method;
  const cuerpo = req.body as any;

  let respuesta: api.RespuestaFalsa;

  if (recurso === 'auth' && id === 'login' && metodo === 'POST') {
    respuesta = api.login(storage, cuerpo);
  } else if (recurso === 'auth' && id === 'registro' && metodo === 'POST') {
    respuesta = api.registro(storage, cuerpo);
  } else if (recurso === 'aeropuertos' && metodo === 'GET') {
    respuesta = api.listarAeropuertos();
  } else if (recurso === 'vuelos' && metodo === 'GET') {
    respuesta = api.buscarVuelos(url.searchParams);
  } else if (recurso === 'reservas' && !id && metodo === 'GET') {
    respuesta = api.listarReservas(storage, url.searchParams.get('usuarioId') || '');
  } else if (recurso === 'reservas' && id && metodo === 'GET') {
    respuesta = api.obtenerReserva(storage, id);
  } else if (recurso === 'reservas' && metodo === 'POST') {
    respuesta = api.crearReserva(storage, cuerpo);
  } else if (recurso === 'reservas' && id && metodo === 'PUT') {
    respuesta = api.actualizarReserva(storage, id, cuerpo);
  } else if (recurso === 'reservas' && id && metodo === 'DELETE') {
    respuesta = api.eliminarReserva(storage, id);
  } else if (recurso === 'usuarios' && id && partes[3] === 'estadisticas' && metodo === 'GET') {
    respuesta = api.obtenerEstadisticas(storage, id);
  } else if (recurso === 'usuarios' && id && metodo === 'PUT') {
    respuesta = api.actualizarUsuario(storage, id, cuerpo);
  } else {
    respuesta = { status: 404, body: { mensaje: 'Endpoint no encontrado: ' + metodo + ' ' + url.pathname } };
  }

  console.log('[API falsa]', metodo, url.pathname, '->', respuesta.status);

  // Si el status es 2xx devolvemos una respuesta exitosa, si no un error
  if (respuesta.status >= 200 && respuesta.status < 300) {
    return of(new HttpResponse({ status: respuesta.status, body: respuesta.body })).pipe(delay(RETRASO_MS));
  }

  return throwError(
    () => new HttpErrorResponse({ status: respuesta.status, error: respuesta.body, url: req.url }),
  );
};
