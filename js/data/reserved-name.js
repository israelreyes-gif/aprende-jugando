/** 'parent' es el nombre interno de la zona de padres: ningún perfil puede llamarse así (en ninguna mayúscula). */
export function isReservedName(name) {
  return String(name ?? '').trim().toLowerCase() === 'parent';
}
