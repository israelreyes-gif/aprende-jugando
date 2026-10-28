# Aprende y juega

PWA para que Alex (y otros perfiles) aprendan y practiquen los contenidos de primaria.
Empieza en 4.º de Primaria con Matemáticas, Sociales, Inglés, Lengua y Sciences.

- **App**: archivos estáticos en GitHub Pages (sin Node, sin compilar).
- **Datos**: base de datos D1 con tablas reales, accesible a través de un Worker mínimo y genérico.
- **Offline**: `sw.js` guarda la app; los resultados hechos sin internet se guardan y se envían solos al volver la conexión.
- **Reto diario**: hasta 10 preguntas al día por perfil, de temas liberados y estudiados, con racha.
- **Zona de padres**: estadísticas, refuerzo (regla del 75 %) y temas liberados por perfil.
- **Avisos push**: recordatorios del reto a cada perfil (08:00 y 18:30) y avisos a los padres cuando un perfil termina un reto, un estudio o ejercicios (ver más abajo).

## Estructura

```
index.html · manifest.webmanifest · sw.js
sw/             piezas del service worker: config, estrategias de caché, aviso de versión nueva
css/            tokens.css (paleta) · base.css · components.css · screens.css
  components/     un archivo por componente
  screens/        un archivo por pantalla
icons/          iconos de la PWA (icon.svg, mochila.svg; tools/make-icons.py los regenera)
js/
  main.js       mapa de pantallas (rutas) y arranque
  config.js     URL del Worker y ajustes fijos
  core/         router, cliente de API con cola offline, dom, rutas, utilidades
  shared/       piezas reutilizables: cabecera, avatar, avisos, modales, interruptor, textos es/en
  data/         acceso a datos: profiles, settings, progress, reto, release (único sitio que habla con la API)
  content/      contenido educativo: registry.js + <curso>/<asignatura>/<tema>.js
  exercises/    generadores de preguntas y tipos (kinds/) que usan los temas
  sounds/       sonidos de acierto y fallo (Web Audio, sin archivos de audio)
  update/       aviso de "Hay una versión nueva"
  features/     una carpeta por funcionalidad, con sus pantallas y su lógica
    setup/        conectar el dispositivo con el Worker
    profiles/     selección, alta y edición de perfiles, banner de inicio
    parents/      PIN, lista de perfiles, estadísticas, refuerzo y liberación de temas
    courses/      cursos de primaria (solo 4.º abierto)
    subjects/     asignaturas de un curso y pestañas Estudio / Ejercicios
    study/        lecciones
    practice/     motor de ejercicios y tipos de pregunta
    reto/         reto diario, racha y su resultado
    push/         avisos push: permiso, suscripción del móvil, la campanita (bell-row.js) y los avisos a padres (parent-alerts/)
worker/         código del Worker (varios ficheros pequeños) · wrangler.jsonc (configuración y variables) · schema.sql (se ejecuta en D1)
tools/          make-icons.py
```

Regla de oro: **una pantalla nunca habla con la API directamente** (usa `data/`) y **nunca escribe rutas a mano** (usa `core/paths.js`).

## Puesta en marcha (todo desde el navegador, sin Node ni Wrangler)

### 1. Base de datos D1
1. Cloudflare → **Storage & Databases → D1** → crear una base, por ejemplo `aprende-jugando`.
2. Abre su pestaña **Console**, pega el contenido de `worker/schema.sql` y ejecútalo.
   Si solo deja ejecutar una sentencia cada vez, pégalas una a una.

### 2. Worker
El Worker está **conectado a este repositorio de GitHub** (Worker → **Settings → Builds**: rama `main`,
comando de despliegue `npx wrangler deploy`). Cada cambio que se sube a `worker/` se despliega solo en
un minuto; no hay que pegar nada en Cloudflare. Se puede comprobar en la pestaña **Deployments**
(el último debe estar en *Ready*).

La configuración vive en `worker/wrangler.jsonc` (nombre, binding `DB` de D1 y variables no secretas).
Cada despliegue **borra las variables de tipo Text creadas a mano en el panel**: las variables normales van siempre en `wrangler.jsonc`.

1. En `worker/wrangler.jsonc`, dentro de `vars`:
   - `ALLOWED_ORIGIN`: `https://TU-USUARIO.github.io`
   - `VAPID_PUBLIC_KEY`: la clave pública de los avisos push.
   - `VAPID_SUBJECT`: la URL de la app.
2. En el panel del Worker → **Settings → Variables and secrets**, solo los secretos (estos sí se conservan):
   - `API_KEY` (*Secret*): una clave larga que inventes. Es la que escribirás en la app.
   - `VAPID_PRIVATE_KEY` (*Secret*): la clave privada de los avisos push.
   Un nombre no puede ser a la vez variable y secreto.
3. Apunta la URL del Worker (`https://NOMBRE.TU-CUENTA.workers.dev`).

Comprobación: abrir `URL-DEL-WORKER/api` en el navegador debe responder `Clave de API incorrecta` (401). Eso significa que está vivo y protegido.

### 3. GitHub Pages
1. Sube **todo el contenido de esta carpeta** al repositorio (`worker/` y `tools/` también; no pasa nada).
2. **Settings → Pages → Deploy from a branch → main / (root)**.
3. En `js/config.js`, `DEFAULT_API_URL` lleva la URL de tu Worker para no teclearla en cada móvil.

### 4. Primer uso en cada dispositivo
Al abrir la app pide la **dirección del Worker** y la **clave**. Se guardan solo en ese dispositivo.
Después, en **Zona de padres**, se crea el PIN la primera vez.

Instalar como app: menú del navegador → *Añadir a pantalla de inicio*.
En iPhone, los avisos push solo funcionan con la app instalada así (iOS 16.4 o superior).

## Cómo añadir contenido

**Un tema nuevo en una asignatura** (por ejemplo, Divisiones en Matemáticas):
1. Crea `js/content/4-primaria/mates/divisiones.js` exportando `study` y `exercises` (copia el formato de `tablas.js`).
2. En `js/content/4-primaria/mates/index.js`, añade `load: () => import('./divisiones.js')` a su línea.

**Un curso nuevo** (por ejemplo, 5.º):
1. En `js/content/registry.js`, pon `available: true` en su curso.
2. Crea `js/content/5-primaria/<asignatura>/index.js` para cada asignatura (mismo formato).

**Una asignatura nueva**: añádela a `SUBJECTS` en `registry.js` y un icono con su mismo id en `shared/icons.js`.

Bloques de una lección: `{ h }` título, `{ p }` párrafo, `{ list }` lista, `{ tip, label }` truco destacado.

Tipos de pregunta: `choice` (opciones), `number` (número), `text` (texto; admite varias respuestas válidas en `answers`).
Para inventar un tipo nuevo, regístralo en `js/features/practice/question-types.js`.

Todo ejercicio nuevo cuenta en la zona de padres con la regla del 75 %.

> Cuando subas cambios grandes a GitHub, sube también el número de `VERSION` en `sw.js` para que los dispositivos limpien la copia antigua.
> Al detectar una versión nueva, la app muestra el aviso "Hay una versión nueva" (no lo muestra en pantallas ocupadas, como un ejercicio en curso).

## La base de datos

| Tabla | Para qué |
|---|---|
| `profiles` | perfiles (nombre y color del icono) |
| `settings` | ajustes; guarda el PIN de padres (con sal y hash, nunca en claro) |
| `practice_sessions` | una fila por sesión de ejercicios o de reto (perfil, tema, total, aciertos, fecha, `kind`) |
| `answers` | una fila por respuesta dentro de una sesión |
| `study_progress` | temas marcados como estudiados |
| `topic_release` | temas liberados por los padres para cada perfil (sin fila = bloqueado) |
| `reto_diario` | el reto de cada perfil y día: preguntas, respuestas y si está terminado |
| `push_devices` | móviles con avisos activados: una fila por móvil y uso (`child` = recordatorios de un perfil, `parent` = avisos a los padres) |

Borrar un perfil borra en cascada todo su progreso y sus móviles de avisos. Las estadísticas y el refuerzo se calculan en la app
(`features/parents/stats.logic.js`): un tema necesita refuerzo según la regla del 75 % (`features/parents/stats/thresholds.js`).

### Cambiar la base de datos más adelante
Añade tablas o columnas con SQL en la consola de D1 (`CREATE TABLE`, `ALTER TABLE ... ADD COLUMN`) y deja la misma sentencia en `worker/schema.sql`.
El Worker las descubre solo (hasta 1 minuto después) y no hay que tocarlo.

## Avisos push

El Worker (`worker/push-*.js`) envía los avisos cifrados con Web Push (VAPID) y el service worker
(`sw/push.js`, `sw/notification-click.js`) los muestra. Hay dos tipos, cada uno con su campanita (por móvil):

- **Recordatorios del reto** (campanita "Avisos del reto" en la edición de cada perfil): a las 08:00 y a las 18:30 (hora de Madrid),
  solo si ese día el reto no está hecho y el perfil tiene algún tema liberado y estudiado. El de las 18:30 menciona la racha si la hay.
  Los manda el Worker con una tarea programada (`triggers.crons` en `worker/wrangler.jsonc`, cada 30 minutos; el plan gratuito
  de Cloudflare solo permite 5 tareas programadas por cuenta, por eso es una sola).
- **Avisos para padres** (campanita "Avisos para padres" en la Zona de padres): cuando un perfil termina un reto, una sesión de ejercicios
  o marca un tema como estudiado. Incluye la nota y marca ⚠️ si está por debajo del 75 % (`features/parents/stats/thresholds.js`).
  Los envía el móvil del niño justo después de guardar el resultado (`features/push/parent-alerts/`); si no hay conexión, no se manda.

En iPhone solo funciona con la app instalada en la pantalla de inicio, y el permiso se pide al pulsar la campanita.

## API del Worker (por si quieres consultarla a mano)

Todas las rutas llevan la cabecera `X-Api-Key`.

```
GET    /api/practice_sessions?profile_id=eq.ID&order=finished_at.desc&limit=20
POST   /api/profiles                      {"id":"...","name":"Lucía","avatar_color":"#FFA8C5"}
POST   /api/answers?conflict=ignore       [ {...}, {...} ]
PATCH  /api/profiles/ID                   {"name":"Nuevo nombre"}
DELETE /api/profiles/ID
POST   /push/send                         {"target":"parents" | {"profile_id":"..."},"title":"...","body":"..."}
```
Operadores de filtro: `eq neq gt gte lt lte like in is`.

## Seguridad

- Los datos solo se leen y escriben con la clave `API_KEY`; sin ella el Worker responde 401.
- La clave no está en GitHub: se escribe en cada dispositivo y se guarda en su `localStorage`.
- La clave privada de los avisos (`VAPID_PRIVATE_KEY`) vive solo como secreto del Worker; nunca se sube al repositorio.
- El PIN de padres sirve para que los niños no entren en las estadísticas; no es una protección fuerte frente a un adulto con acceso al dispositivo.
