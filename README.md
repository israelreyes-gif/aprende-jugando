# Aprende y juega

PWA para que Alex (y otros perfiles) aprendan y practiquen los contenidos de primaria.
Empieza en 4.º de Primaria con Matemáticas, Sociales, Inglés, Lengua y Sciences.

- **App**: archivos estáticos en GitHub Pages (sin Node, sin compilar).
- **Datos**: base de datos D1 con tablas reales, accesible a través de un Worker mínimo y genérico.
- **Offline**: `sw.js` guarda la app; los resultados hechos sin internet se guardan y se envían solos al volver la conexión.
- **Reto diario**: hasta 10 preguntas al día por perfil, de temas liberados y estudiados, con racha.
- **Puntos y niveles**: +1 por acierto, −1 por fallo, +10 por tema estudiado y ±5 de bonus por sesión; 10 niveles, en masculino o femenino según el perfil (ver más abajo).
- **Zona de padres**: estadísticas, refuerzo (regla del 75 %), puntos y temas liberados por perfil.
- **Avisos push**: recordatorios del reto a cada perfil (08:00 y 18:30) y avisos a los padres cuando un perfil termina un reto, un estudio o ejercicios (ver más abajo).

## Estructura

```
index.html · manifest.webmanifest · sw.js
sw/             piezas del service worker: config, estrategias de caché, aviso de versión nueva
css/            tokens.css (paleta) · base.css · components/ · screens/
  components/     un archivo por componente
  screens/        un archivo por pantalla
icons/          iconos de la PWA (icon.svg, apple-touch-icon.png, mochila.svg; tools/make-icons.py los regenera) y mochila-halloween.svg (15 oct – 2 nov) y mochila-navidad.svg (15 dic – 6 ene), ver js/shared/seasons.js
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
    profiles/     selección, alta y edición de perfiles (chico/chica, porcentaje del perfil), banner de inicio
    parents/      PIN, lista de perfiles, estadísticas, refuerzo y liberación de temas
    courses/      cursos de primaria: el actual en grande, los superados y los próximos (solo 4.º abierto)
    subjects/     asignaturas de un curso y pestañas Estudio / Ejercicios
    study/        lecciones
    practice/     motor de ejercicios y tipos de pregunta
    reto/         reto diario, racha y su resultado
    points/       puntos y niveles: reglas, niveles, cálculo y pantallas (ui/)
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

Cada tema de `index.js` lleva: `id`, `emoji` (el que sale en su tarjeta), `title`, `minutes` y `load` (sin `load` sale como "Soon"). Opcional: `unit`, un texto; los temas seguidos con el mismo `unit` se muestran juntos bajo ese encabezado (Inglés usa "Unit 1 · Practice Time").

**Un curso nuevo** (por ejemplo, 5.º):
1. En `js/content/registry.js`, pon `available: true` en su curso. El último curso abierto pasa a ser el actual y los anteriores salen como superados.
2. Crea `js/content/5-primaria/<asignatura>/index.js` para cada asignatura (mismo formato).

**Una asignatura nueva**: añádela a `SUBJECTS` en `js/content/subjects.js` (con su `emoji` y sus colores) y un icono con su mismo id en `shared/icons.js`.

Bloques de una lección: `{ h }` título, `{ p }` párrafo, `{ list }` lista, `{ tip, label }` truco destacado.

Tipos de pregunta: `choice` (opciones), `number` (número), `text` (texto; admite varias respuestas válidas en `answers`).
Para inventar un tipo nuevo, regístralo en `js/features/practice/question-types.js`.

Todo ejercicio nuevo cuenta en la zona de padres con la regla del 75 %.

## Actualizar la app en los móviles

No hace falta tocar nada especial al subir cambios: el service worker enseña la copia guardada y, por detrás, comprueba si GitHub tiene algo nuevo.
Si algún fichero de texto ha cambiado, la app muestra el aviso "Hay una versión nueva" (no lo muestra en pantallas ocupadas, como un ejercicio en curso).

Solo hay que subir `VERSION` en `sw/config.js` cuando **se borran o se renombran ficheros**, o cuando **cambia la lista `SHELL`** (los ficheros que se guardan al instalar).
Así el móvil tira la copia antigua entera y no se queda con restos.

## La base de datos

| Tabla | Para qué |
|---|---|
| `profiles` | perfiles (nombre, color del icono y `gender`: `chico` o `chica`) |
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
Añade tablas o columnas con SQL en la consola de D1 (`CREATE TABLE`, `ALTER TABLE ... ADD COLUMN`).
El Worker las descubre solo (hasta 1 minuto después) y no hay que tocarlo.

## Puntos y niveles

Los puntos **no se guardan**: se calculan siempre a partir de lo que ya hay en la base de datos (sesiones, respuestas y temas estudiados).
Así cuentan también las sesiones antiguas y, si cambias una regla, se recalcula todo sin tocar la base de datos.

| Qué | Puntos |
|---|---|
| Acierto | +1 |
| Fallo | −1 |
| Tema estudiado | +10 |
| Bonus al terminar una sesión (ejercicios o reto completo) en positivo | +5 |
| Bonus al terminar una sesión en negativo | −5 |

El reto completo cuenta como **una sola** sesión (un solo bonus). El total nunca baja de 0.
Las reglas están en `features/points/rules.js` y los niveles en `features/points/levels.js`:

| Nivel | Nombre (chico) | Nombre (chica) | Puntos |
|---|---|---|---|
| 1 | Explorador | Exploradora | 0 |
| 2 | Aprendiz | Aprendiz | 50 |
| 3 | Curioso | Curiosa | 120 |
| 4 | Aventurero | Aventurera | 220 |
| 5 | Detective | Detective | 350 |
| 6 | Inventor | Inventora | 520 |
| 7 | Experto | Experta | 750 |
| 8 | Campeón | Campeona | 1.050 |
| 9 | Maestro | Maestra | 1.450 |
| 10 | Leyenda | Leyenda | 2.000 |

Un perfil sin chico/chica elegido usa los nombres en masculino.

Alex ve su nivel en las pantallas de inicio, de cursos y de asignaturas (al tocarlo se abre la lista de niveles), los puntos ganados o perdidos al terminar
ejercicios o reto, "+10" al estudiar y una pantalla de "¡Nuevo nivel!". Los padres ven en la zona de padres los puntos de cada perfil,
de dónde vienen y una gráfica de 7 días, y reciben los puntos en los avisos (y un aviso al subir de nivel).
Los puntos no cambian la regla del 75 %, que sigue usando solo los aciertos.

## Porcentajes

- **Curso completado** (`features/courses/course-percent.js`): temas estudiados sobre los temas con contenido del curso. Sale en la tarjeta de nivel de Alex y, con el detalle, en la zona de padres.
- **Perfil completado** (`features/profiles/profile-completion.js`): cada dato vale un 25 %: nombre, color del icono, chico/chica y avisos activados. Sale en la edición del perfil y en cada perfil de la zona de padres.

## Avisos push

El Worker (`worker/push-*.js`) envía los avisos cifrados con Web Push (VAPID) y el service worker
(`sw/push.js`, `sw/notification-click.js`) los muestra. Hay dos tipos, cada uno con su campanita (por móvil):

- **Recordatorios del reto** (campanita "Avisos del reto" en la edición de cada perfil): a las 08:00 y a las 18:30 (hora de Madrid),
  solo si ese día el reto no está hecho y el perfil tiene algún tema liberado y estudiado. El de las 18:30 menciona la racha si la hay.
  Los manda el Worker con una tarea programada (`triggers.crons` en `worker/wrangler.jsonc`, cada 30 minutos; el plan gratuito
  de Cloudflare solo permite 5 tareas programadas por cuenta, por eso es una sola).
- **Avisos para padres** (campanita "Avisos para padres" en la Zona de padres): cuando un perfil termina un reto, una sesión de ejercicios
  o marca un tema como estudiado, y cuando sube de nivel. Incluye la nota (con ⚠️ si está por debajo del 75 %) y los puntos (`features/parents/stats/thresholds.js`).
  Los envía el móvil del niño justo después de guardar el resultado (`features/push/parent-alerts/`); si no hay conexión, no se manda.

En iPhone solo funciona con la app instalada en la pantalla de inicio, y el permiso se pide al pulsar la campanita.

## API del Worker (por si quieres consultarla a mano)

Todas las rutas llevan la cabecera `X-Api-Key`.

```
GET    /api/practice_sessions?profile_id=eq.ID&order=finished_at.desc&limit=20
POST   /api/profiles                      {"id":"...","name":"Lucía","avatar_color":"#FFA8C5","gender":"chica"}
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
