-- ============================================================
-- Aprende y juega · Esquema de la base de datos D1
-- Se ejecuta una sola vez en: Cloudflare > D1 > tu base > Console
-- Si la consola solo admite una sentencia cada vez, pégalas una a una.
-- Para añadir tablas o columnas en el futuro basta con ejecutar
-- el SQL correspondiente: el Worker las descubre solo.
-- ============================================================

-- Perfiles de los niños -------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 20),
  avatar_color TEXT NOT NULL,
  gender       TEXT,
  course_id    TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Ajustes de la app (por ejemplo, el PIN de la zona de padres) -
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Una sesión de ejercicios terminada ------------------------
CREATE TABLE IF NOT EXISTS practice_sessions (
  id          TEXT PRIMARY KEY,
  profile_id  TEXT    NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id   TEXT    NOT NULL,
  subject_id  TEXT    NOT NULL,
  topic_id    TEXT    NOT NULL,
  total       INTEGER NOT NULL CHECK (total > 0),
  correct     INTEGER NOT NULL CHECK (correct >= 0 AND correct <= total),
  duration_s  INTEGER CHECK (duration_s IS NULL OR duration_s >= 0),
  finished_at TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_profile
  ON practice_sessions (profile_id, subject_id, topic_id, finished_at);

-- Cada respuesta dada dentro de una sesión ------------------
CREATE TABLE IF NOT EXISTS answers (
  id          TEXT PRIMARY KEY,
  session_id  TEXT    NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  question_id TEXT    NOT NULL,
  is_correct  INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
  given       TEXT
);

CREATE INDEX IF NOT EXISTS idx_answers_session
  ON answers (session_id);

CREATE INDEX IF NOT EXISTS idx_answers_question
  ON answers (question_id, is_correct);

-- Temas de estudio marcados como estudiados -----------------
CREATE TABLE IF NOT EXISTS study_progress (
  id           TEXT PRIMARY KEY,
  profile_id   TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id    TEXT NOT NULL,
  subject_id   TEXT NOT NULL,
  topic_id     TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  UNIQUE (profile_id, course_id, subject_id, topic_id)
);

-- Temas liberados por los padres para cada perfil ------------
-- Sin fila = tema bloqueado. Al borrar un perfil se borran sus liberaciones.
CREATE TABLE IF NOT EXISTS topic_release (
  id          TEXT PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id   TEXT NOT NULL,
  subject_id  TEXT NOT NULL,
  topic_id    TEXT NOT NULL,
  released_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (profile_id, course_id, subject_id, topic_id)
);

-- Reto diario: 10 preguntas al día por perfil -----------------
-- questions y answers son JSON. finished_at vacío = reto a medias.
CREATE TABLE IF NOT EXISTS reto_diario (
  id          TEXT PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id   TEXT NOT NULL,
  day         TEXT NOT NULL,
  questions   TEXT NOT NULL,
  answers     TEXT NOT NULL DEFAULT '[]',
  finished_at TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (profile_id, day)
);

-- Distingue las sesiones del reto de las de ejercicios normales.
ALTER TABLE practice_sessions ADD COLUMN kind TEXT NOT NULL DEFAULT 'practice';

-- Móviles con avisos activados (notificaciones push) ----------
-- kind 'child' = recordatorios del reto de un perfil (profile_id obligatorio);
-- kind 'parent' = avisos para los padres (sin perfil).
-- Una fila por móvil + uso: el mismo móvil puede tener varios perfiles y, además, los padres.
-- El id lo calcula la app (tipo + perfil + huella del móvil), así que activar dos veces no duplica.
-- Al borrar un perfil se borran sus móviles.
CREATE TABLE IF NOT EXISTS push_devices (
  id         TEXT PRIMARY KEY,
  kind       TEXT NOT NULL CHECK (kind IN ('child', 'parent')),
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Títulos de los temas (la app y el Worker los leen de aquí) --
CREATE TABLE IF NOT EXISTS topic_titles (
  id         TEXT PRIMARY KEY,
  course_id  TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  topic_id   TEXT NOT NULL,
  title      TEXT NOT NULL,
  UNIQUE (course_id, subject_id, topic_id)
);

-- Títulos reales de producción (para las pruebas) --
INSERT OR IGNORE INTO topic_titles (id, course_id, subject_id, topic_id, title) VALUES
('4-primaria|ingles|time', '4-primaria', 'ingles', 'time', 'Telling the time'),
('4-primaria|ingles|question-words', '4-primaria', 'ingles', 'question-words', 'Wh- questions'),
('4-primaria|ingles|vocabulary', '4-primaria', 'ingles', 'vocabulary', 'Vocabulary'),
('4-primaria|ingles|was-were', '4-primaria', 'ingles', 'was-were', 'Was / were'),
('4-primaria|ingles|could', '4-primaria', 'ingles', 'could', 'Could / couldn''t'),
('4-primaria|ingles|reading-crow', '4-primaria', 'ingles', 'reading-crow', 'Reading: The Crow and the Pitcher'),
('4-primaria|mates|numeros', '4-primaria', 'mates', 'numeros', 'Números hasta 6 cifras'),
('4-primaria|mates|romanos', '4-primaria', 'mates', 'romanos', 'Números romanos'),
('4-primaria|mates|pares', '4-primaria', 'mates', 'pares', 'Pares e impares'),
('4-primaria|mates|redondear', '4-primaria', 'mates', 'redondear', 'Redondear y estimar'),
('4-primaria|mates|tablas', '4-primaria', 'mates', 'tablas', 'Tablas de multiplicar'),
('4-primaria|mates|descomponer', '4-primaria', 'mates', 'descomponer', 'Multiplicar descomponiendo'),
('4-primaria|mates|cajitas', '4-primaria', 'mates', 'cajitas', 'Cajitas multiplicativas'),
('4-primaria|mates|relacionar', '4-primaria', 'mates', 'relacionar', 'Relacionar multiplicaciones'),
('4-primaria|mates|repartir', '4-primaria', 'mates', 'repartir', 'Repartir y hacer grupos'),
('4-primaria|mates|division', '4-primaria', 'mates', 'division', 'División con resto'),
('4-primaria|mates|problemas', '4-primaria', 'mates', 'problemas', 'Problemas con operaciones'),
('4-primaria|mates|vocabulario', '4-primaria', 'mates', 'vocabulario', 'Vocabulario geométrico'),
('4-primaria|mates|simetria', '4-primaria', 'mates', 'simetria', 'Triángulos y simetría');

-- Índices añadidos el 2026-11-02: avisos por perfil (y borrado en cascada de un perfil) y sesiones de un perfil por fecha.
CREATE INDEX IF NOT EXISTS idx_push_profile
  ON push_devices (profile_id, kind);

CREATE INDEX IF NOT EXISTS idx_sessions_profile_date
  ON practice_sessions (profile_id, finished_at);

CREATE TABLE IF NOT EXISTS sync_events (
  id         TEXT PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  outcome    TEXT NOT NULL CHECK (outcome IN ('late', 'failed')),
  what       TEXT NOT NULL,
  detail     TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_sync_profile_date
  ON sync_events (profile_id, created_at);

-- Acceso con código (autenticación) --------------------------
-- ask_always: 1 = pedir el código cada vez que se abre la tarjeta del perfil.
ALTER TABLE profiles ADD COLUMN ask_always INTEGER NOT NULL DEFAULT 0;

-- Código de cada perfil y de los padres (owner = id del perfil, o 'parent'). Nunca se guarda el código: solo sal + huella.
CREATE TABLE IF NOT EXISTS credentials (
  owner        TEXT PRIMARY KEY,
  salt         TEXT NOT NULL,
  hash         TEXT NOT NULL,
  fails        INTEGER NOT NULL DEFAULT 0,
  level        INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Sesiones abiertas: solo se guarda la huella del identificador. Caducan a los 7 días sin usarse.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash   TEXT PRIMARY KEY,
  owner        TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_used_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_owner ON sessions (owner);

-- Al borrar un perfil se borran su código y sus sesiones.
CREATE TRIGGER IF NOT EXISTS trg_profile_delete AFTER DELETE ON profiles
BEGIN
  DELETE FROM credentials WHERE owner = OLD.id;
  DELETE FROM sessions WHERE owner = OLD.id;
END;
