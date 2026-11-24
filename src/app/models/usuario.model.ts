export interface Usuario {
  id: string;
  username: string;
  edad: number;
  email: string;
  password: string; // OJO: solo porque el login es simulado
  fechaRegistro: string;
}

// Lo que se manda al hacer login (se puede entrar con correo o con username)
export interface Credenciales {
  email: string;
  password: string;
}

// Lo que se manda al registrarse
export interface DatosRegistro {
  username: string;
  email: string;
  edad: number | null;
  password: string;
}

// Lo que se guarda en localStorage cuando el usuario inicia sesion
export interface Sesion {
  token: string;
  usuario: Usuario;
}
