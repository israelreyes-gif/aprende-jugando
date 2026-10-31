// Temporadas del año. Las fechas se miran con el reloj del dispositivo.

/** Halloween: del 15 de octubre al 2 de noviembre, ambos incluidos, todos los años. */
export function isHalloween(date = new Date()) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return (month === 10 && day >= 15) || (month === 11 && day <= 2);
}

/** Navidad: del 15 de diciembre al 6 de enero, ambos incluidos, todos los años. */
export function isChristmas(date = new Date()) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return (month === 12 && day >= 15) || (month === 1 && day <= 6);
}
