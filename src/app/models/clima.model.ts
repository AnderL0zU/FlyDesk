// Respuesta (resumida) de la API publica Open-Meteo
export interface RespuestaClima {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
}

// Lo que mostramos en el pase de abordar
export interface Clima {
  temperatura: number;
  viento: number;
  descripcion: string;
  icono: string;
}
