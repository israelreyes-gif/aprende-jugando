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
