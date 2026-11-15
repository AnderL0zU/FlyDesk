// =====================================================================
// "Backend" simulado de FlyDesk.
// Cada funcion de este archivo hace lo que haria un endpoint de un
// servidor real, pero los datos se guardan en el localStorage.
// El interceptor (api-falsa.interceptor.ts) decide cual funcion llamar.
// =====================================================================

import aeropuertosJson from '../../../assets/data/aeropuertos.json';
import { Aeropuerto } from '../../models/aeropuerto.model';
import { Estadisticas } from '../../models/estadisticas.model';
import { EtiquetaVuelo, NuevaReserva, Reserva } from '../../models/reserva.model';
import { Credenciales, DatosRegistro, Sesion, Usuario } from '../../models/usuario.model';
import { Vuelo } from '../../models/vuelo.model';
import { StorageService } from '../services/storage.service';
import { generarAsiento, generarId, generarPuerta, mezclarArreglo, numeroAleatorio } from '../utils/aleatorio.util';
import { calcularDistanciaKm, calcularDuracionMin } from '../utils/geo.util';

// Llaves de las "tablas" en el localStorage
const TABLA_USUARIOS = 'db_usuarios';
const TABLA_RESERVAS = 'db_reservas';

const VUELOS_POR_PAGINA = 15;

// Lista de aeropuertos leida del archivo JSON
const AEROPUERTOS: Aeropuerto[] = aeropuertosJson as Aeropuerto[];

// Lo que devuelve cada endpoint: un codigo HTTP y el cuerpo de la respuesta
export interface RespuestaFalsa {
  status: number;
  body: unknown;
}

function ok(body: unknown): RespuestaFalsa {
  return { status: 200, body: body };
}

function error(status: number, mensaje: string): RespuestaFalsa {
  return { status: status, body: { mensaje: mensaje } };
}

// Quita la contraseña antes de devolver un usuario
function usuarioSinPassword(usuario: Usuario): Usuario {
  return { ...usuario, password: '' };
}

// ---------------------------------------------------------------------
// Datos de demostracion (solo se crean la primera vez)
// ---------------------------------------------------------------------
export function crearDatosDemo(storage: StorageService): void {
  const usuarios = storage.leer<Usuario[]>(TABLA_USUARIOS, []);
  if (usuarios.length > 0) {
    return; // ya existen datos
  }

  const demo: Usuario = {
    id: 'usuario-demo',
    nombre: 'Piloto Demo',
    email: 'demo@flydesk.com',
    password: '123456',
    aeropuertoBase: 'NVA',
    fechaRegistro: new Date().toISOString(),
    ajustes: { modoEstricto: false, notificaciones: true, vibracion: true, metaDiariaMin: 60 },
  };
  storage.guardar(TABLA_USUARIOS, [demo]);

  // Algunos vuelos pasados para que el historial no este vacio
  const rutas = [
    ['NVA', 'BOG'],
    ['BOG', 'MDE'],
    ['MDE', 'CTG'],
    ['BOG', 'PTY'],
    ['CLO', 'LIM'],
    ['BOG', 'MIA'],
  ];
  const etiquetas: EtiquetaVuelo[] = ['Estudio', 'Trabajo', 'Lectura', 'Estudio', 'Proyecto', 'Estudio'];
  const reservas: Reserva[] = [];

  for (let i = 0; i < rutas.length; i++) {
    const vuelo = crearVuelo(buscarAeropuerto(rutas[i][0])!, buscarAeropuerto(rutas[i][1])!);
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - (rutas.length - i) * 2);
    inicio.setHours(9 + i, 0, 0, 0);
    const fin = new Date(inicio.getTime() + vuelo.duracionMin * 60000);
    const fueDesviado = i === 3; // uno desviado para que se vea el estado

    reservas.push({
      id: generarId() + i,
      usuarioId: demo.id,
      vuelo: vuelo,
      etiqueta: etiquetas[i],
      nota: '',
      asiento: generarAsiento(),
      puerta: generarPuerta(),
      estado: fueDesviado ? 'desviado' : 'completado',
      fechaInicio: inicio.toISOString(),
      fechaFin: fin.toISOString(),
      minutosVolados: fueDesviado ? Math.round(vuelo.duracionMin / 2) : vuelo.duracionMin,
    });
  }
  storage.guardar(TABLA_RESERVAS, reservas);
}

// ---------------------------------------------------------------------
// Ayudantes de vuelos
// ---------------------------------------------------------------------
function buscarAeropuerto(iata: string): Aeropuerto | undefined {
  return AEROPUERTOS.find((a) => a.iata === iata);
}

// El codigo del vuelo siempre es el mismo para la misma ruta
function generarCodigoVuelo(origen: Aeropuerto, destino: Aeropuerto): string {
  const texto = origen.iata + destino.iata;
  let suma = 0;
  for (let i = 0; i < texto.length; i++) {
    suma = suma + texto.charCodeAt(i) * (i + 7);
  }
  return 'FD' + ((suma * 37) % 9000 + 1000);
}

function crearVuelo(origen: Aeropuerto, destino: Aeropuerto): Vuelo {
  const distancia = calcularDistanciaKm(origen.lat, origen.lng, destino.lat, destino.lng);
  return {
    codigo: generarCodigoVuelo(origen, destino),
    origen: origen,
    destino: destino,
    distanciaKm: distancia,
    duracionMin: calcularDuracionMin(distancia),
  };
}

// ---------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------
export function login(storage: StorageService, credenciales: Credenciales): RespuestaFalsa {
  const usuarios = storage.leer<Usuario[]>(TABLA_USUARIOS, []);
  const email = (credenciales.email || '').trim().toLowerCase();
  const usuario = usuarios.find((u) => u.email === email && u.password === credenciales.password);

  if (!usuario) {
    return error(401, 'Correo o contraseña incorrectos');
  }

  const sesion: Sesion = { token: 'token-falso-' + usuario.id, usuario: usuarioSinPassword(usuario) };
  return ok(sesion);
}

export function registro(storage: StorageService, datos: DatosRegistro): RespuestaFalsa {
  const usuarios = storage.leer<Usuario[]>(TABLA_USUARIOS, []);
  const email = (datos.email || '').trim().toLowerCase();

  if (!datos.nombre || !email || !datos.password) {
    return error(400, 'Todos los campos son obligatorios');
  }
  if (usuarios.find((u) => u.email === email)) {
    return error(409, 'Ya existe una cuenta con ese correo');
  }

  const nuevo: Usuario = {
    id: generarId(),
    nombre: datos.nombre.trim(),
    email: email,
    password: datos.password,
    aeropuertoBase: null,
    fechaRegistro: new Date().toISOString(),
    ajustes: { modoEstricto: false, notificaciones: true, vibracion: true, metaDiariaMin: 60 },
  };
  usuarios.push(nuevo);
  storage.guardar(TABLA_USUARIOS, usuarios);

  const sesion: Sesion = { token: 'token-falso-' + nuevo.id, usuario: usuarioSinPassword(nuevo) };
  return ok(sesion);
}

// ---------------------------------------------------------------------
// AEROPUERTOS Y VUELOS
// ---------------------------------------------------------------------
export function listarAeropuertos(): RespuestaFalsa {
  const ordenados = [...AEROPUERTOS].sort((a, b) => a.ciudad.localeCompare(b.ciudad));
  return ok(ordenados);
}

// GET /api/vuelos?modo=aleatorio|busqueda&origen=&destino=&continente=&duracionMin=&duracionMax=&pagina=
export function buscarVuelos(parametros: URLSearchParams): RespuestaFalsa {
  const modo = parametros.get('modo') || 'busqueda';
  const origen = parametros.get('origen') || '';
  const destino = parametros.get('destino') || '';
  const continente = parametros.get('continente') || '';
  const duracionMin = Number(parametros.get('duracionMin') || 0);
  const duracionMax = Number(parametros.get('duracionMax') || 100000);
  const pagina = Number(parametros.get('pagina') || 1);

  // 1. Posibles origenes y destinos
  let origenes = AEROPUERTOS;
  if (origen !== '') {
    origenes = AEROPUERTOS.filter((a) => a.iata === origen);
  }

  let destinos = AEROPUERTOS;
  if (destino !== '') {
    destinos = destinos.filter((a) => a.iata === destino);
  }
  if (continente !== '') {
    destinos = destinos.filter((a) => a.continente === continente);
  }

  if (origenes.length === 0 || destinos.length === 0) {
    return error(404, 'No se encontraron aeropuertos con esos datos');
  }

  // 2. Modo aleatorio: escogemos rutas al azar que cumplan los filtros
  if (modo === 'aleatorio') {
    const vuelos: Vuelo[] = [];
    let intentos = 0;
    while (vuelos.length < 10 && intentos < 600) {
      intentos++;
      const o = origenes[numeroAleatorio(0, origenes.length - 1)];
      const d = destinos[numeroAleatorio(0, destinos.length - 1)];
      if (o.iata === d.iata) {
        continue;
      }
      const vuelo = crearVuelo(o, d);
      const repetido = vuelos.find((v) => v.codigo === vuelo.codigo);
      if (!repetido && vuelo.duracionMin >= duracionMin && vuelo.duracionMin <= duracionMax) {
        vuelos.push(vuelo);
      }
    }
    return ok({ vuelos: vuelos, hayMas: true });
  }

  // 3. Modo busqueda: todas las combinaciones, ordenadas por duracion
  const resultado: Vuelo[] = [];
  for (const o of origenes) {
    for (const d of destinos) {
      if (o.iata === d.iata) {
        continue;
      }
      const vuelo = crearVuelo(o, d);
      if (vuelo.duracionMin >= duracionMin && vuelo.duracionMin <= duracionMax) {
        resultado.push(vuelo);
      }
    }
  }

  // si no eligio origen ni destino mezclamos para que no salga siempre lo mismo
  let lista = resultado;
  if (origen === '' && destino === '') {
    lista = mezclarArreglo(resultado);
  } else {
    lista.sort((a, b) => a.duracionMin - b.duracionMin);
  }

  const inicio = (pagina - 1) * VUELOS_POR_PAGINA;
  const paginaVuelos = lista.slice(inicio, inicio + VUELOS_POR_PAGINA);
  return ok({ vuelos: paginaVuelos, hayMas: inicio + VUELOS_POR_PAGINA < lista.length });
}

// ---------------------------------------------------------------------
// RESERVAS (historial de vuelos)
// ---------------------------------------------------------------------
export function listarReservas(storage: StorageService, usuarioId: string): RespuestaFalsa {
  const reservas = storage.leer<Reserva[]>(TABLA_RESERVAS, []);
  const delUsuario = reservas
    .filter((r) => r.usuarioId === usuarioId)
    .sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));
  return ok(delUsuario);
}

export function obtenerReserva(storage: StorageService, id: string): RespuestaFalsa {
  const reservas = storage.leer<Reserva[]>(TABLA_RESERVAS, []);
  const reserva = reservas.find((r) => r.id === id);
  if (!reserva) {
    return error(404, 'La reserva no existe');
  }
  return ok(reserva);
}

export function crearReserva(storage: StorageService, datos: NuevaReserva): RespuestaFalsa {
  if (!datos.usuarioId || !datos.vuelo) {
    return error(400, 'Faltan datos para crear la reserva');
  }
  const reservas = storage.leer<Reserva[]>(TABLA_RESERVAS, []);
  const nueva: Reserva = {
    id: generarId(),
    usuarioId: datos.usuarioId,
    vuelo: datos.vuelo,
    etiqueta: datos.etiqueta,
    nota: datos.nota || '',
    asiento: generarAsiento(),
    puerta: generarPuerta(),
    estado: 'en-vuelo',
    fechaInicio: new Date().toISOString(),
    fechaFin: null,
    minutosVolados: 0,
  };
  reservas.push(nueva);
  storage.guardar(TABLA_RESERVAS, reservas);
  return ok(nueva);
}

export function actualizarReserva(storage: StorageService, id: string, cambios: Partial<Reserva>): RespuestaFalsa {
  const reservas = storage.leer<Reserva[]>(TABLA_RESERVAS, []);
  const posicion = reservas.findIndex((r) => r.id === id);
  if (posicion === -1) {
    return error(404, 'La reserva no existe');
  }
  // el id y el usuario no se pueden cambiar
  reservas[posicion] = { ...reservas[posicion], ...cambios, id: id, usuarioId: reservas[posicion].usuarioId };
  storage.guardar(TABLA_RESERVAS, reservas);
  return ok(reservas[posicion]);
}

export function eliminarReserva(storage: StorageService, id: string): RespuestaFalsa {
  const reservas = storage.leer<Reserva[]>(TABLA_RESERVAS, []);
  const nuevas = reservas.filter((r) => r.id !== id);
  if (nuevas.length === reservas.length) {
    return error(404, 'La reserva no existe');
  }
  storage.guardar(TABLA_RESERVAS, nuevas);
  return ok({ mensaje: 'Reserva eliminada' });
}

// ---------------------------------------------------------------------
// USUARIOS
// ---------------------------------------------------------------------
export function actualizarUsuario(storage: StorageService, id: string, cambios: Partial<Usuario>): RespuestaFalsa {
  const usuarios = storage.leer<Usuario[]>(TABLA_USUARIOS, []);
  const posicion = usuarios.findIndex((u) => u.id === id);
  if (posicion === -1) {
    return error(404, 'El usuario no existe');
  }
  const actual = usuarios[posicion];
  // no dejamos cambiar el id, el correo ni la contraseña desde aqui
  usuarios[posicion] = { ...actual, ...cambios, id: actual.id, email: actual.email, password: actual.password };
  storage.guardar(TABLA_USUARIOS, usuarios);
  return ok(usuarioSinPassword(usuarios[posicion]));
}

export function obtenerEstadisticas(storage: StorageService, usuarioId: string): RespuestaFalsa {
  const reservas = storage.leer<Reserva[]>(TABLA_RESERVAS, []).filter((r) => r.usuarioId === usuarioId);
  const completados = reservas.filter((r) => r.estado === 'completado');
  const hoy = new Date().toDateString();

  const estadisticas: Estadisticas = {
    totalVuelos: reservas.length,
    completados: completados.length,
    desviados: reservas.filter((r) => r.estado === 'desviado').length,
    minutosTotales: 0,
    kmTotales: 0,
    minutosHoy: 0,
    paisesVisitados: [],
    rachaDias: 0,
  };

  for (const r of reservas) {
    estadisticas.minutosTotales += r.minutosVolados;
    if (new Date(r.fechaInicio).toDateString() === hoy) {
      estadisticas.minutosHoy += r.minutosVolados;
    }
  }

  for (const r of completados) {
    estadisticas.kmTotales += r.vuelo.distanciaKm;
    if (!estadisticas.paisesVisitados.includes(r.vuelo.destino.pais)) {
      estadisticas.paisesVisitados.push(r.vuelo.destino.pais);
    }
  }

  // Racha: contamos hacia atras desde hoy los dias con al menos un vuelo completado
  const diasConVuelo = completados.map((r) => new Date(r.fechaInicio).toDateString());
  const dia = new Date();
  // si hoy todavia no ha volado, la racha empieza a contar desde ayer
  if (!diasConVuelo.includes(dia.toDateString())) {
    dia.setDate(dia.getDate() - 1);
  }
  while (diasConVuelo.includes(dia.toDateString())) {
    estadisticas.rachaDias++;
    dia.setDate(dia.getDate() - 1);
  }

  return ok(estadisticas);
}
