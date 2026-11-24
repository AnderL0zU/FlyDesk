// Lo que mostramos del clima en la pantalla de llegada
export interface Clima {
  temperatura: number; // en grados centigrados, ya redondeada
  descripcion: string; // ej: "Nublado"
  icono: string; // nombre del icono de ionicons
}

// Lo que responde Open-Meteo (solo los campos que usamos)
export interface ClimaApi {
  current: {
    temperature_2m: number;
    weather_code: number;
    is_day: number; // 1 = de dia, 0 = de noche
  };
}
