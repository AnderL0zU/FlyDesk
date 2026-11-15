# ✈️ FlyDesk

App móvil híbrida (Ionic + Angular + Capacitor) que convierte las sesiones de estudio o trabajo en **vuelos entre aeropuertos reales**. La duración del vuelo es el tiempo de concentración: el usuario "despega", ve su avión avanzar sobre un globo 3D y, al aterrizar, el vuelo queda en su historial.

Proyecto de **Programación de Dispositivos Móviles (USCO)**.

---

## Tecnologías

| Tecnología | Versión |
|---|---|
| Angular (componentes standalone) | 22 |
| Ionic Framework | 9 |
| Capacitor | 8 |
| globe.gl (three.js / WebGL) | 2.46 |
| Node.js / npm | 24 / 12 |

## Funcionalidades

- **Login y registro simulados**: sesión guardada en `localStorage`, rutas protegidas con guards.
- **Buscar vuelos**: vuelos aleatorios o por ruta (origen/destino), con filtros de duración (`ion-range` de dos perillas), continente (`ion-chip`), orden y scroll infinito. Botón "Sorpréndeme".
- **Pase de abordar** con vista previa de la ruta en el globo 3D y el **clima actual del destino** (API pública Open-Meteo).
- **Vuelo en curso**: temporizador, globo 3D que sigue al avión, pausar/reanudar y abortar.
  - **Modo estricto**: si el usuario sale de la app más de 10 s, el vuelo se desvía.
  - **Modo flexible**: el vuelo sigue en segundo plano y llega una notificación al aterrizar.
- **Historial** por usuario: agrupado por mes (`ion-accordion`), filtros, búsqueda, deslizar para eliminar y detalle en un modal tipo hoja.
- **Perfil**: aeropuerto base (con GPS), ajustes (modo estricto, notificaciones, vibración, meta diaria) y estadísticas.

## Estructura de carpetas

```
src/
├── assets/
│   ├── data/aeropuertos.json      # 133 aeropuertos reales
│   └── img/tierra-noche.jpg       # textura del globo 3D
├── app/
│   ├── models/                    # interfaces TypeScript (Usuario, Vuelo, Reserva...)
│   ├── core/
│   │   ├── guards/                # authGuard, invitadoGuard
│   │   ├── interceptors/          # API falsa (HttpInterceptor + "base de datos")
│   │   ├── services/              # servicios HTTP, storage y plugins nativos
│   │   └── utils/                 # Haversine, números aleatorios
│   ├── shared/
│   │   ├── components/            # globo, pase-abordar, tarjeta-vuelo, ...
│   │   └── pipes/                 # duracion, reloj
│   └── pages/
│       ├── auth/login, auth/registro
│       ├── tabs/                  # inicio, buscar, historial, perfil
│       ├── vuelo-en-curso/
│       └── aterrizaje/
```

## API falsa (endpoints)

Todas las peticiones se hacen con `HttpClient`. El interceptor `api-falsa.interceptor.ts` responde a las rutas `/api/...` usando `localStorage` como base de datos (con un retraso de 400 ms para simular la red):

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/registro` | Crear cuenta |
| GET | `/api/aeropuertos` | Lista de aeropuertos |
| GET | `/api/vuelos?modo=&origen=&destino=&continente=&duracionMin=&duracionMax=&pagina=` | Buscar vuelos |
| GET | `/api/reservas?usuarioId=` | Historial del usuario |
| GET / PUT / DELETE | `/api/reservas/:id` | Ver, actualizar o borrar un vuelo |
| POST | `/api/reservas` | Despegar (crear vuelo) |
| GET | `/api/usuarios/:id/estadisticas` | Estadísticas |
| PUT | `/api/usuarios/:id` | Editar perfil y ajustes |

Además se consume una **API real**: `https://api.open-meteo.com/v1/forecast` (clima del destino).

**Cuenta de prueba** (se crea automáticamente): `demo@flydesk.com` / `123456`

## Plugins de Capacitor y permisos

| Plugin | Uso | Permiso Android |
|---|---|---|
| `@capacitor/geolocation` | Aeropuerto más cercano | `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION` |
| `@capacitor/local-notifications` | Aviso de aterrizaje | `POST_NOTIFICATIONS` (se pide en tiempo de ejecución), `SCHEDULE_EXACT_ALARM` |
| `@capacitor/haptics` | Vibración al despegar y aterrizar | `VIBRATE` |
| `@capacitor/app` | Detectar si el usuario sale de la app (modo estricto) | — |

La app requiere **Android 13 o superior** (`minSdkVersion = 33`).

## Cómo ejecutar

```bash
npm install
ionic serve            # navegador
```

## Generar el APK

```bash
ionic build
npx cap sync android
npx cap open android
```

En Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**. El archivo queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

> ⚠️ Gradle 8.14 no funciona con Java 25/26. En Android Studio ve a **Settings → Build Tools → Gradle → Gradle JDK** y elige un **JDK 21** (por ejemplo `jbr-21`).

## Pasos que seguí para instalar la app

_(Escribir aquí con mis propias palabras.)_
