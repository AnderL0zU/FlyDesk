// Funciones de ayuda para generar valores aleatorios.

// Numero entero entre min y max (incluidos)
export function numeroAleatorio(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Devuelve una copia del arreglo con los elementos en desorden
export function mezclarArreglo<T>(arreglo: T[]): T[] {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temporal = copia[i];
    copia[i] = copia[j];
    copia[j] = temporal;
  }
  return copia;
}

// Id sencillo basado en la fecha y un numero aleatorio
export function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// Asiento tipo "14C"
export function generarAsiento(): string {
  const letras = ['A', 'B', 'C', 'D', 'E', 'F'];
  return numeroAleatorio(1, 32) + letras[numeroAleatorio(0, letras.length - 1)];
}

// Puerta de embarque tipo "B7"
export function generarPuerta(): string {
  const letras = ['A', 'B', 'C', 'D'];
  return letras[numeroAleatorio(0, letras.length - 1)] + numeroAleatorio(1, 20);
}
