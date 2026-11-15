// Preferencias que el usuario cambia en la pantalla de perfil
export interface AjustesUsuario {
  modoEstricto: boolean; // si sale de la app el vuelo se desvia
  notificaciones: boolean;
  vibracion: boolean;
  metaDiariaMin: number; // minutos de foco que quiere hacer al dia
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  password: string; // OJO: solo porque el login es simulado
  aeropuertoBase: string | null; // codigo IATA
  fechaRegistro: string;
  ajustes: AjustesUsuario;
}

// Lo que se manda al hacer login
export interface Credenciales {
  email: string;
  password: string;
}

// Lo que se manda al registrarse
export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

// Lo que se guarda en localStorage cuando el usuario inicia sesion
export interface Sesion {
  token: string;
  usuario: Usuario;
}
