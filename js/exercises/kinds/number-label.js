import { fmt } from '../../shared/number-format.js';

/** Texto de un número como respuesta: con puntos de miles si se pide, y coma para decimales. */
export function numberLabel(value, thousands) {
  return thousands ? fmt(value) : String(value).replace('.', ',');
}
