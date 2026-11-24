# FlyDesk

**Aplicación de concentración que convierte cada sesión de estudio en un vuelo, desarrollada con Angular, Ionic y Capacitor.**

FlyDesk es un proyecto académico de la asignatura Programación de Dispositivos Móviles (USCO). Transforma el tiempo de estudio o trabajo en vuelos entre aeropuertos reales: el usuario elige cuánto quiere concentrarse, la aplicación le propone destinos que tardan ese tiempo en llegar y, mientras "vuela", un temporizador lleva la cuenta hasta el aterrizaje.

La plataforma permite crear cuentas, iniciar sesión, buscar aeropuertos reales, reservar y realizar vuelos de concentración, consultar el historial de vuelos y configurar las preferencias del dispositivo.

> **Importante:** FlyDesk es un proyecto educativo. No vende vuelos reales ni se conecta con aerolíneas; los aeropuertos son reales, pero los vuelos son una simulación para medir el tiempo de concentración.

---

## Características principales

- Bienvenida: pantallas de introducción que se muestran solo la primera vez.
- Autenticación: registro, inicio de sesión (con correo o nombre de usuario) y cierre de sesión.
- Buscador de aeropuertos: búsqueda por código IATA usando una API real.
- Reserva de vuelos: elección de la duración (30 min a 2 h) y del destino según la distancia real.
- Despegue: anuncio del piloto y cuenta regresiva con vibración.
- Vuelo en curso: temporizador que se puede pausar, continuar o abortar, y que se recupera si se cierra la aplicación.
- Llegada: resumen del vuelo y clima actual en la ciudad de destino.
- Historial: vuelos completados y abortados por usuario, con estadísticas y opción de eliminar.
- Ajustes: vibración, pantalla siempre encendida y notificaciones.
- Almacenamiento local: persistencia de la información mediante un servicio centralizado.
- Aplicación Android: integración mediante Capacitor para generar el APK.

## Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| Angular 22 | Framework principal (componentes standalone) |
| TypeScript | Lenguaje de programación |
| Ionic 9 | Componentes e interfaz móvil |
| SCSS | Estilos de la aplicación |
| Capacitor 8 | Integración con Android |
| HttpClient + RxJS | Consumo de las APIs externas |
| globe.gl | Globo terráqueo con la ruta del vuelo |
| Vitest | Pruebas unitarias |
| Playwright | Pruebas end-to-end |
| ESLint | Análisis de código |
| Prettier | Formato del código |

## Arquitectura del proyecto

El proyecto separa las páginas (lo que ve el usuario) de los servicios (la lógica y los datos), para que cada parte tenga una sola responsabilidad.

```text
flydesk/
│
├── android/                     # Proyecto nativo Android
│
├── e2e/                         # Pruebas end-to-end
│
├── src/
│   ├── assets/
│   │   ├── icon/                # Íconos propios
│   │   └── img/                 # Fotos de bienvenida, inicio, audio y textura del globo
│   │
│   ├── environments/            # Llave de la API (no se sube al repositorio)
│   │
│   └── app/
│       │
│       ├── core/
│       │   ├── guards/          # Protección de rutas
│       │   ├── services/        # Servicios centrales
│       │   └── utils/           # Cálculo de distancia y duración
│       │
│       ├── models/              # Interfaces de datos
│       │
│       ├── pages/
│       │   ├── bienvenida/      # Introducción
│       │   ├── auth/            # Login y registro
│       │   ├── tabs/            # Barra de pestañas
│       │   ├── inicio/          # Buscador de aeropuertos
│       │   ├── reservar/        # Duración y destino
│       │   ├── despegue/        # Cuenta regresiva
│       │   ├── vuelo/           # Vuelo en curso
│       │   ├── llegada/         # Resumen y clima
│       │   ├── historial/       # Vuelos realizados
│       │   └── ajustes/         # Preferencias y cierre de sesión
│       │
│       ├── shared/
│       │   └── components/      # Componente reutilizable del globo
│       │
│       ├── app.component.ts
│       ├── app.routes.ts
│       └── app.component.html
│
├── capacitor.config.ts
├── angular.json
├── package.json
└── README.md
```

## Servicios principales

Los servicios se encuentran en `src/app/core/services/`.

| Servicio | Responsabilidad |
|---|---|
| AuthService | Gestiona el registro, inicio y cierre de sesión. |
| StorageService | Centraliza la lectura, escritura y eliminación de información en `localStorage`. |
| AeropuertosService | Busca aeropuertos y destinos en la API de API Ninjas. |
| ClimaService | Consulta el clima actual del destino en Open-Meteo. |
| VueloService | Guarda el vuelo elegido, el vuelo en curso y el último vuelo. |
| HistorialService | Registra los vuelos terminados de cada usuario. |
| AjustesService | Guarda las preferencias del usuario. |
| MensajesService | Muestra toasts y alertas de confirmación. |
| VibracionService | Controla la vibración del dispositivo. |
| PantallaService | Mantiene la pantalla encendida durante el vuelo. |
| NotificacionesService | Programa el aviso de aterrizaje. |

Estos servicios permiten separar la lógica de funcionamiento de las interfaces visuales.

## Páginas principales

- **BienvenidaPage:** presenta la idea de la aplicación la primera vez que se abre.
- **LoginPage:** permite iniciar sesión.
- **RegistroPage:** permite registrar nuevos usuarios con validaciones.
- **InicioPage:** busca el aeropuerto de origen.
- **ReservarPage:** permite elegir la duración y el destino del vuelo.
- **DespeguePage:** reproduce el anuncio y la cuenta regresiva.
- **VueloPage:** muestra el tiempo restante y permite pausar, continuar o abortar.
- **LlegadaPage:** muestra el resumen del vuelo y el clima del destino.
- **HistorialPage:** muestra los vuelos realizados y las estadísticas.
- **AjustesPage:** permite cambiar las preferencias y cerrar sesión.

Cada página cuenta con su propio archivo TypeScript, plantilla HTML y hoja de estilos.

## Flujo de un vuelo

| Paso | Ruta |
|---|---|
| Buscar el aeropuerto de origen | `/tabs/inicio` |
| Elegir duración y destino | `/reservar/:iata` |
| Cuenta regresiva | `/despegue/:origen/:destino/:minutos` |
| Vuelo en curso | `/vuelo` |
| Aterrizaje | `/llegada` |
| Consultar vuelos realizados | `/tabs/historial` |

La duración de cada vuelo se calcula con la distancia real entre los dos aeropuertos (fórmula de Haversine) en:

`src/app/core/utils/geo.util.ts`

Los modelos de datos se encuentran en:

`src/app/models/`

## Navegación y seguridad

La navegación se configura en `src/app/app.routes.ts`.

Angular Router permite desplazarse entre las diferentes páginas de la aplicación.

Se utilizan dos guards principales:

- **authGuard:** impide acceder a páginas privadas sin haber iniciado sesión.
- **invitadoGuard:** restringe el acceso al login y al registro cuando ya hay una sesión iniciada, y muestra la bienvenida la primera vez.

Las páginas se cargan mediante carga diferida (*lazy loading*), utilizando `loadComponent`, lo que permite organizar mejor los recursos de la aplicación.

## Almacenamiento de información

El almacenamiento está centralizado mediante `StorageService`, que guarda los datos en el `localStorage` del dispositivo en formato JSON. Todas las llaves empiezan con `flydesk_`.

| Llave | Qué guarda |
|---|---|
| `flydesk_bienvenida_vista` | Si ya se mostró la bienvenida |
| `flydesk_usuarios` | Lista de cuentas registradas |
| `flydesk_sesion` | Usuario con la sesión iniciada |
| `flydesk_correo_recordado` | Correo de la opción "Recordarme" |
| `flydesk_vuelo_elegido` | Vuelo elegido en la reserva |
| `flydesk_vuelo_en_curso` | Vuelo activo con su hora de llegada |
| `flydesk_ultimo_vuelo` | Último vuelo completado |
| `flydesk_historial_<id>` | Vuelos realizados por cada usuario |
| `flydesk_ajustes` | Vibración, pantalla encendida y notificaciones |

El historial se organiza por usuario para mantener separados sus registros.

**Cuenta de prueba** (se crea automáticamente): `demo@flydesk.com` / `123456`

## APIs externas

| API | Uso |
|---|---|
| API Ninjas (`/v1/airports`) | Buscar aeropuertos reales por código IATA, país y continente |
| Open-Meteo (`/v1/forecast`) | Clima actual en el destino al aterrizar |

## Plugins de Capacitor y permisos

| Plugin | Uso | Permiso Android |
|---|---|---|
| `@capacitor/haptics` | Vibración al despegar, pausar y aterrizar | `VIBRATE` |
| `@capacitor/local-notifications` | Aviso de aterrizaje aunque la app esté cerrada | `POST_NOTIFICATIONS` (se pide en tiempo de ejecución), `SCHEDULE_EXACT_ALARM` |
| `@capacitor-community/keep-awake` | Mantener la pantalla encendida durante el vuelo | — |

La aplicación requiere **Android 13 o superior** (`minSdkVersion = 33`).

## Instalación y ejecución

### Requisitos previos

- Node.js.
- npm.
- Angular CLI.
- Android Studio (para compilar la aplicación Android).
- Una llave gratuita de [API Ninjas](https://api-ninjas.com/).

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/flydesk.git
```

### 2. Entrar al proyecto

```bash
cd flydesk
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar la llave de la API

Copiar `src/environments/environment.example.ts` como `environment.ts` y `environment.prod.ts` en la misma carpeta, y escribir la llave de API Ninjas en `apiNinjasKey`.

Estos archivos están en `.gitignore`, por lo que la llave no se sube al repositorio.

### 5. Ejecutar en desarrollo

```bash
npx ng serve
```

La aplicación estará disponible en:

`http://localhost:4200`

## Compilación para Android

FlyDesk utiliza Capacitor para integrar la aplicación web con el entorno nativo de Android.

Después de realizar modificaciones en el código:

```bash
npm run build
```

Sincronizar los archivos web con Android:

```bash
npx cap sync android
```

Abrir el proyecto en Android Studio:

```bash
npx cap open android
```

En Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**. El archivo queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

**Nota:** El proyecto Android se agrega una sola vez mediante `npx cap add android`. No es necesario repetir este comando después de cada modificación.

> Gradle 8.14 no funciona con Java 25/26. En Android Studio ve a **Settings → Build Tools → Gradle → Gradle JDK** y elige un **JDK 21** (por ejemplo `jbr-21`).

## Pruebas y calidad del código

El proyecto cuenta con herramientas para comprobar su funcionamiento y mantener la calidad del código.

### Verificar el código

```bash
npm run lint
```

Este comando ejecuta ESLint, la comprobación de tipos de las pruebas E2E y Prettier.

### Ejecutar pruebas

```bash
npm test
```

Ejecuta las pruebas unitarias y las pruebas end-to-end.

### Compilar la aplicación

```bash
npm run build
```

Genera la versión de producción en la carpeta `www/`.

## Pasos que seguí para instalar la app

_(Escribir aquí con mis propias palabras.)_

## Propósito académico

Este proyecto permite aplicar conocimientos de desarrollo de aplicaciones móviles híbridas: componentes de Ionic, enlace de datos con Angular (`ngModel`, `*ngIf`, `*ngFor`, interpolación), consumo de APIs con HttpClient y JSON, servicios, navegación con guards, almacenamiento local y uso de plugins nativos con sus permisos.

---

**FlyDesk**

Cada sesión de estudio, un nuevo destino.
