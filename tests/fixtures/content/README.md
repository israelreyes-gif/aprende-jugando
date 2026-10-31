# Temas de prueba

Sociales, Lengua y Sciences todavía no tienen temas reales, y las pruebas necesitan al menos uno por asignatura
(para comprobar puntos, avisos a padres y el reto diario con 5 asignaturas). Estos temas **solo se usan en las pruebas**:
`run-all.mjs` los copia a una copia temporal de la app y nunca tocan la app real.

- `sociales/`, `lengua/`, `sciences/`: reemplazan el `index.js` de esa asignatura en la copia temporal.
- `mates/`: índice con un solo tema cargable y «Tablas de multiplicar» con preguntas fijas (el real usa generadores); las pruebas de pantalla
  necesitan saber la respuesta de cada pregunta. Los demás temas de Matemáticas se prueban con `test-topic.js`, que recorre la carpeta.
- `ingles/verb-to-be/`: se añade al índice de Inglés en la copia temporal.
