# Aprende y juega

PWA para que Alex (y otros perfiles) aprendan y practiquen los contenidos de primaria.
Empieza en 4.º de Primaria con Matemáticas, Sociales, Inglés, Lengua y Sciences.

## Alcance: app familiar (no multifamilia)

Esta app es **solo para la familia de Alex** (sus perfiles, sus padres y los familiares que ellos autoricen, como la abuela). **No está pensada para abrirse a otras familias ni para publicarse.** Por eso, a propósito:

- Hay **una sola base de datos, un solo Worker y una sola `API_KEY`** compartida por todos los dispositivos de la familia. Los códigos de cada perfil y el de los padres separan a las personas de la casa, no a unas familias de otras.
- **No se plantea** separar datos por familia, claves por familia, cuentas multiusuario, registro público, política de privacidad, consentimientos, exportación o borrado de datos de terceros ni revisión legal (RGPD).
- Si alguna revisión (humana o de una IA) propone cosas de ese tipo, están **descartadas** salvo que el objetivo cambie y se decida abrir la app a otras familias. En ese caso habría que replantear antes la base de datos, el Worker y los permisos.

- **App**: archivos estáticos en GitHub Pages (sin Node, sin compilar).
- **Datos**: base de datos D1 con tablas reales, accesible a través de un Worker mínimo y genérico. Cada tabla tiene permisos por operación en `worker/permissions.js` (leer, crear, editar, borrar); lo que no esté ahí da 403. Si añades una tabla nueva, dale permisos en ese fichero.
- **Offline**: `sw.js` guarda la app; los resultados hechos sin internet se guardan y se envían solos al volver la conexión.
- **Reto diario**: hasta 10 preguntas al día por perfil, de temas liberados y estudiados, con racha.
- **Puntos y niveles**: +1 por acierto, −1 por fallo, +10 por tema estudiado y ±5 de bonus por sesión; 20 niveles, en masculino o femenino según el perfil (ver más abajo).
- **Zona de padres**: estadísticas, refuerzo (regla del 75 %), puntos y temas liberados por perfil.
- **Avisos push**: recordatorios del reto a cada perfil (08:00 y 18:30) y avisos a los padres cuando un perfil termina un reto, un estudio o ejercicios (ver más abajo).

## Aclaraciones y decisiones tomadas (para quien revise el proyecto)

Cosas que **no son un olvido**: se decidieron a propósito. Si una revisión las propone otra vez, ya están valoradas.

- **Códigos cortos (4 a 8 cifras)**: es un candado para niños en una app familiar, no una cuenta bancaria. La defensa es el bloqueo progresivo (1, 5 y 15 min) con aviso por Telegram, el hash PBKDF2 con sal y que las sesiones solo guardan su huella.
- **Una sola `API_KEY` compartida** (ver «Alcance»): separa la app del resto de internet, no a unas personas de otras; eso lo hacen los códigos y las sesiones.
- **Sesión de padres de 30 min sin uso y solo mientras la app esté abierta**: más cómodo que pedir el código en cada pantalla y más seguro que dejarla siete días. Al cumplirse los 30 minutos, si estás en la zona de padres aparece un aviso «Sesión caducada» sobre la pantalla; al aceptarlo o tocar fuera se va a la página del código y, tras introducirlo, vuelves donde estabas.
- **Reglas de puntos duplicadas** en la app (`js/features/points/`) y en el Worker (`worker/stats-*.js`): el Worker se despliega aparte y no puede importar de `js/`. `tests/test-stats-points.mjs` falla si dejan de coincidir. Si el Worker no tiene la ruta, la app calcula los puntos en el móvil.
- **El Worker es «genérico»** (CRUD por tabla con permisos en `worker/permissions.js` y `worker/auth-scope.js`) salvo `/api/stats/points`, `/auth/*` y `/push/*`. No se plantea convertirlo en una API con una ruta por caso de uso.
- **Estadísticas de un hijo en Padres**: bajan las sesiones completas (hasta 2000) y calculan en el móvil. Con el uso actual tarda unos 0,8 s la primera vez; se valoró una ruta propia en el Worker y se **descartó**.
- **Sin caché de la sesión en el Worker**: ahorraría 10–30 ms por petición y complica cerrar sesiones al instante; no compensa.
- **Copias en memoria** (ver «Velocidad»): se borran con cualquier escritura o cambio de sesión; la zona de padres nunca se pinta con copias del dispositivo. Preferimos una espera corta a enseñar datos viejos.
- **Mixes de preguntas**: solo entran temas liberados y estudiados, y nunca las lecturas (`inMix: false`).
- **Contenido**: el de Sociales, Lengua y Sciences de 4.º sale de los dictados y fotos del colegio; no se inventa. Mientras no esté, esas asignaturas aún no tienen temas con contenido.
- **Sin build ni Node**: ES modules directos, para poder mantenerlo todo desde el navegador (GitHub y el panel de Cloudflare).
- **Tests**: `node tests/run-all.mjs` los pasa todos; las pruebas que cambian la base «por detrás» de la app usan el gancho `__AJ_TEST_HOOKS`.

## Estructura

```
index.html · manifest.webmanifest · sw.js
sw/             piezas del service worker: instalación de cada versión entera, activación, servir de la copia, avisos push (manifest.js lo genera tools/build-sw-manifest.mjs)
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
    auth/         códigos de acceso (entrar, poner y cambiar)
    parents/      lista de perfiles, estadísticas, refuerzo y liberación de temas
    courses/      cursos de primaria: el actual en grande, los superados y los próximos (solo 4.º abierto)
    subjects/     asignaturas de un curso y pestañas Estudio / Ejercicios
    study/        lecciones
    practice/     motor de ejercicios y tipos de pregunta
    reto/         reto diario, racha y su resultado
    points/       puntos y niveles: reglas, niveles, cálculo y pantallas (ui/)
    push/         avisos push: permiso, suscripción del móvil, la campanita (bell-row.js) y los avisos a padres (parent-alerts/)
worker/         código del Worker (varios ficheros pequeños) · wrangler.jsonc (configuración y variables) · schema.sql (se ejecuta en D1)
tools/          build-sw-manifest.mjs (genera sw/manifest.js: la lista de archivos de cada versión; lo usan también las pruebas)
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
3. En `js/config.js`, `DEFAULT_API_URL` lleva la dirección del proxy de Netlify (`https://israelreyes-proxy.netlify.app/aprende-jugando`), que reenvía al Worker y evita los bloqueos de LaLiga. Así no hay que teclearla en cada móvil.

### 4. Primer uso en cada dispositivo
Al abrir la app pide la **dirección del Worker** y la **clave**. Se guardan solo en ese dispositivo.
Después, al entrar en **Zona de padres** se crea el código de padres la primera vez (el usuario `padres` va implícito, no se escribe; la primera vez se pide el PIN de siempre, que luego se borra). El código de cada perfil lo pone un padre, en Zona de padres, al crear el perfil (obligatorio) o más tarde con «Poner código nuevo»; un perfil sin código no se abre solo.

Instalar como app: menú del navegador → *Añadir a pantalla de inicio*.
En iPhone, los avisos push solo funcionan con la app instalada así (iOS 16.4 o superior).

## Cómo añadir contenido

**Un tema nuevo en una asignatura** (por ejemplo, Divisiones en Matemáticas):
1. Crea `js/content/4-primaria/mates/divisiones.js` exportando `study` y `exercises` (copia el formato de `tablas.js`).
2. En `js/content/4-primaria/mates/index.js`, añade `load: () => import('./divisiones.js')` a su línea.

Cada tema de `index.js` lleva: `id`, `emoji` (el que sale en su tarjeta), `minutes` y `load` (sin `load` sale como "Soon"). El título NO va en el código: se añade una fila a `topic_titles` en D1 (`INSERT INTO topic_titles (id, course_id, subject_id, topic_id, title) VALUES ('4-primaria|mates|divisiones', '4-primaria', 'mates', 'divisiones', 'Divisiones');`); mientras no exista, la app muestra el id del tema. Opcional: `unit`, un texto; los temas seguidos con el mismo `unit` se muestran juntos bajo ese encabezado (Inglés usa "Unit 1 · Practice Time").

**Un curso nuevo** (por ejemplo, 5.º):
1. En `js/content/courses.js`, pon `available: true` en su curso. Opcional: `subjects: ['ingles']` si solo tiene algunas asignaturas (1.º solo tiene Inglés).
2. Crea `js/content/5-primaria/<asignatura>/index.js` para cada asignatura (mismo formato).

**Curso de cada perfil**: cada perfil estudia el curso de su columna `profiles.course_id` (sin valor, 4.º). Se elige al crear el perfil (obligatorio) y se puede cambiar en la zona de padres → perfil → "Curso de …" (entre los cursos con contenido; el progreso se guarda por curso). Los cursos anteriores al suyo salen como superados y los posteriores como próximos.

**Una asignatura nueva**: añádela a `SUBJECTS` en `js/content/subjects.js` (con su `emoji` y sus colores) y un icono con su mismo id en `shared/icons.js`.

Bloques de una lección: `{ h }` título, `{ p }` párrafo, `{ list }` lista, `{ tip, label }` truco destacado, `{ fold, list }` sección plegable (título con el número de líneas; empieza cerrada). En Inglés, el tema Vocabulary construye sus secciones plegables desde `ingles/lib/vocab/` (`vocabulary/sections.js`).

Tipos de pregunta: `choice` (opciones), `number` (número), `text` (texto; admite varias respuestas válidas en `answers`).
Para inventar un tipo nuevo, regístralo en `js/features/practice/question-types.js`.

Todo ejercicio nuevo cuenta en la zona de padres con la regla del 75 %.

## Mix de preguntas

Al final de una unidad (pestaña Ejercicios) hay una tarjeta «Mix» que mezcla preguntas de los temas de esa unidad: solo los **liberados y estudiados** (y nunca las lecturas, que llevan `inMix: false`). Puntúa como los ejercicios normales (+1/−1 por pregunta y ±5 de bonus **una sola vez** por mix) y guarda **una sesión `kind: 'mix'` por tema**, así cuenta en las estadísticas y en la regla del 75 % de cada tema. No se puede retomar a medias.

Se declara en el índice de la asignatura, sin tocar nada más:

```js
export const mixes = [{ id: 'unit-1', unit: UNIT_1, emoji: '🎲', title: 'Mix · Unit 1', size: 36 }];
```

Sin `unit`, mezcla todos los temas de la asignatura. Ahora existe el de la Unit 1 de Inglés.

## Actualizar la app en los móviles

Cada versión de la app es un **paquete cerrado**: el service worker la descarga entera a una copia aparte, copiando de la anterior lo que no ha cambiado, y solo la usa cuando está completa. Si falta un archivo, una descarga se corta o el servidor aún sirve un archivo viejo, la descarta y sigue con la versión que tenía. Nunca se mezclan archivos de dos versiones.

- La app vuelve a preguntar si hay versión nueva cada vez que se vuelve a ella (aunque estuviera en segundo plano), al recuperar la conexión y cada media hora mientras está abierta.
- Cuando la nueva está lista sale "Hay una versión nueva" (no en pantallas ocupadas: ejercicios, reto y formularios). "Actualizar" cambia de versión y recarga; "Ahora no" vuelve a preguntar a los 10 minutos, al cambiar de pantalla o al volver a la app.
- **Antes de cada subida** hay que ejecutar `node tools/build-sw-manifest.mjs`: escribe `sw/manifest.js` (la lista de archivos con su huella y el identificador de la versión). Una prueba (`test-manifest.mjs`) falla si se olvida. Ya no hay `VERSION` ni lista `SHELL` que mantener a mano.
- Primera actualización tras pasar del sistema antiguo al nuevo: abrir la app dos veces y pulsar "Actualizar".

## La base de datos

| Tabla | Para qué |
|---|---|
| `profiles` | perfiles (nombre, color del icono y `gender`: `chico` o `chica`) |
| `settings` | ajustes de la app |
| `credentials` | código de acceso de cada perfil y de los padres (`owner`): sal y hash, intentos fallidos y bloqueo; nunca en claro |
| `sessions` | sesiones abiertas (solo la huella SHA-256 del identificador); caducan a los 7 días sin usarse (30 minutos las de padres) |
| `practice_sessions` | una fila por sesión de ejercicios o de reto (perfil, tema, total, aciertos, fecha, `kind`) |
| `answers` | una fila por respuesta dentro de una sesión |
| `study_progress` | temas marcados como estudiados |
| `topic_release` | temas liberados por los padres para cada perfil (sin fila = bloqueado) |
| `topic_titles` | título de cada tema (`id` = `curso\|asignatura\|tema`). La app y el resumen semanal leen los títulos de aquí; no están en el código |
| `reto_diario` | el reto de cada perfil y día: preguntas, respuestas y si está terminado |
| `push_devices` | móviles con avisos activados: una fila por móvil y uso (`child` = recordatorios de un perfil, `parent` = avisos a los padres) |
| `sync_events` | guardados que no fueron a la primera: `late` (quedó en cola y se guardó después) o `failed` (el servidor lo rechazó y se descartó). Solo lleva qué se guardaba, un motivo corto y el perfil; sale en la zona de padres y en el resumen semanal, y un `failed` avisa a los padres |

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
| 11 | Sabio | Sabia | 2.700 |
| 12 | Genio | Genia | 3.500 |
| 13 | Pionero | Pionera | 4.400 |
| 14 | Héroe | Heroína | 5.400 |
| 15 | Gran Maestro | Gran Maestra | 6.500 |
| 16 | Titán | Titana | 7.700 |
| 17 | Gladiador | Gladiadora | 9.000 |
| 18 | Guardián | Guardiana | 10.500 |
| 19 | Dragón | Dragón | 12.200 |
| 20 | Inmortal | Inmortal | 14.000 |

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
- **Resumen semanal por Telegram**: el domingo a las 20:00 (hora de Madrid) el Worker envía al grupo un resumen de todos los perfiles
  (racha, retos de la semana, temas estudiados con su barra y temas a reforzar). Siempre lleva las mismas líneas, aunque no haya datos
  (`worker/report-*.js`). Los temas a reforzar salen con su id convertido en texto ("was-were" → "Was were"), porque el Worker no conoce los títulos.
- **Avisos para padres** (campanita "Avisos para padres" en la Zona de padres): cuando un perfil termina un reto, una sesión de ejercicios
  o marca un tema como estudiado, y cuando sube de nivel. Incluye la nota (con ⚠️ si está por debajo del 75 %) y los puntos (`features/parents/stats/thresholds.js`).
  Los envía el móvil del niño justo después de guardar el resultado (`features/push/parent-alerts/`); si no hay conexión, no se manda.

- **Avisos de error del servidor** (usan la misma campanita "Avisos para padres"): si el Worker falla por su lado (error 5xx) o un recordatorio
  no sale, avisa a los móviles de padres con el sitio y el motivo (`worker/error-alert.js`). No avisa de errores de quien llama (401, 404, 400, 409)
  ni de fallos del propio envío de avisos (para evitar bucles). El mismo fallo repetido sustituye al aviso anterior en vez de apilarse.
  Si D1 o las claves VAPID fallan, el aviso no puede salir y el error queda solo en el registro del Worker.

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
- **Códigos de acceso**: cada perfil entra con un código numérico de 4 a 8 cifras; los padres, usuario `padres` y 6 a 8 cifras. Se guardan con PBKDF2-SHA256 (100 000 vueltas) y sal propia.
- **Sesiones**: al acertar el código el Worker da un identificador que el móvil guarda y envía en `X-Session`. Se renueva con el uso. La de un perfil caduca a los 7 días sin usarse; la de padres, a los 30 minutos, y además solo vive mientras la app esté abierta (memoria temporal del móvil): cerrar la app la libera. El Worker solo guarda su huella.
- **Cada perfil solo ve y escribe lo suyo** con sesión de perfil: el Worker añade el filtro del perfil dueño de la sesión a cada petición y no deja crear ni borrar perfiles. Con sesión de padres se ve todo. Esto separa a las personas de la casa; no es una barrera frente a quien tenga la clave de la app y el código de un perfil (ver «Alcance»).
- **Quién pone los códigos**: el primer código de un perfil solo se acepta con la sesión de padres (`/auth/setup`); el de los padres se crea sin sesión solo la primera vez (con el PIN antiguo si lo hay). El niño cambia el suyo sabiendo el actual; los padres pueden ponerle uno nuevo sin saberlo (cierra sus sesiones).
- **Datos que un perfil puede guardar**: el Worker rechaza sesiones de más de 40 preguntas, aciertos mayores que preguntas, tipos de sesión inventados, fechas futuras o de hace más de 60 días, y temas estudiados o practicados que no estén liberados para ese perfil (`worker/auth-validate.js`). Así no se inflan los puntos con peticiones a mano. Los padres no pasan por estas reglas.
- **Bloqueo**: 5 fallos seguidos bloquean 1 min, luego 5 y 15 (máximo) y avisan por Telegram. El intento se reserva en una sola orden de la base de datos antes de mirar el código, así que las peticiones en paralelo no se saltan el límite. Ojo: el bloqueo es por código (perfil o padres), no por origen, así que cinco fallos ajenos pueden dejar bloqueado un minuto el acceso legítimo.
- **Editar un perfil** pide siempre el código del perfil (la sesión de padres lo salta). En el perfil se puede activar «Pedir el código siempre al abrir la tarjeta».
- Si un niño olvida su código, los padres le ponen uno nuevo desde sus estadísticas («Poner código nuevo»). Si se olvida el código de padres: en la consola de D1, `DELETE FROM credentials WHERE owner = 'parent';` y se crea uno nuevo.
- Los códigos no entran en las copias de seguridad ni en la caché del dispositivo.

## Pruebas automáticas

Las pruebas viven en `tests/` y las ejecuta GitHub solo en cada subida a `main` (`.github/workflows/tests.yml`; el resultado sale en la pestaña **Actions**).
Para lanzarlas a mano hace falta Node 22 o superior: dentro de `tests/`, `npm install`, `npx playwright install chromium` y `npm test`
(o `npm test -- ui` para solo las que llevan «ui» en el nombre).
Corren sobre una copia temporal de la app con temas de prueba (`tests/fixtures/content/`), porque Sociales, Lengua y Sciences aún no tienen temas reales:
cuando los tengan, esos temas de prueba se pueden ir sustituyendo.

## Privacidad

La app está pensada para uso familiar privado. Qué datos maneja y dónde:

- **Perfiles** (tabla `profiles`): solo nombre de pila (máximo 20 caracteres), color, chico/chica y curso. No hay apellidos, fechas de nacimiento, correos ni fotos.
- **Progreso**: sesiones, respuestas, temas estudiados y liberados, retos y puntos. En `answers.given` queda lo que el niño contestó (como mucho 200 caracteres).
- **Móviles con avisos** (`push_devices`): la suscripción push de cada móvil. No entra en las copias de seguridad.
- **Códigos de acceso** (`credentials`) y **sesiones** (`sessions`): solo huellas con sal; el código no se guarda. No entran en las copias ni en la caché del dispositivo.
- **Avisos de sincronización** (`sync_events`): qué se guardaba, un motivo corto y el perfil, nunca el contenido. Se borran solos a los 90 días (domingo a las 20:00, junto al resumen semanal).
- **Dónde está todo**: en la base de datos D1 de tu cuenta de Cloudflare. En cada dispositivo quedan la clave de la API, la última lectura de cada pantalla y las escrituras pendientes de enviar.
- **Telegram**: el grupo recibe nombre de pila, notas de los ejercicios, rachas, puntos, temas por reforzar y los avisos de error o de guardado fallido. No lleva ids, claves ni datos de contacto. Telegram no cifra de extremo a extremo los mensajes de los grupos, así que conviene que en el grupo solo estén los padres.
- **Borrar un perfil** (zona de padres → estadísticas → "Borrar este perfil") borra de la base de datos todo lo suyo: sesiones, respuestas, progreso, temas liberados, retos, móviles con avisos y avisos de sincronización (`tests/test-privacidad.mjs` lo comprueba). Lo que ya esté en una copia de seguridad guardada por ti no se borra: hay que eliminar ese archivo.
- Si algún día se ofrece a otras familias, habría que revisar con asesoramiento legal las obligaciones aplicables a datos de menores. Esta sección describe lo que hace la app, no certifica el cumplimiento de ninguna norma.

## Velocidad: pintar al instante y refrescar detrás

Las lecturas (`core/api/read-cache.js`) guardan una copia en memoria. Si una pantalla ya se vio, se pinta al momento con esa copia y, si tiene más de 5 s, se pide una nueva en segundo plano; si los datos han cambiado, las pantallas de consulta (rutas con `{ live: true }` en `routes.js`) se repintan solas sin spinner, sin saltar arriba y sin cerrar los desplegables. Reglas de seguridad: cualquier escritura o cambio de sesión borra todas las copias; las lecturas de la zona de padres no se guardan nunca en el dispositivo ni se pintan con copias de él (al caducar su sesión se vuelve a la entrada en vez de seguir enseñando datos), y un error de sesión nunca se tapa con una copia; las pantallas de ejercicios, estudio, mix y reto no se repintan solas; y si al refrescar la sesión ya no vale, se vuelve a la pantalla de entrada. Las pruebas que cambian la base «por detrás» usan el gancho `__AJ_TEST_HOOKS`.

## Puntos calculados por el Worker

`loadPoints` (`js/features/points/load-points.js`) pide `GET /api/stats/points?profile_id=eq.<id>` y el Worker (`worker/stats-points.js`) devuelve los puntos ya calculados, en vez de que el móvil baje hasta 2000 sesiones. Un perfil solo puede pedir los suyos; los padres, los de cualquiera. Las reglas están **duplicadas** en `worker/stats-rules.js` y `worker/stats-summarize.js` (copia de `js/features/points/`): si se cambia una regla de puntos, hay que cambiarla en los dos sitios; `tests/test-stats-points.mjs` falla si no coinciden. Si el Worker no tiene la ruta (aún sin desplegar) o falla, la app calcula los puntos en el móvil como antes.
