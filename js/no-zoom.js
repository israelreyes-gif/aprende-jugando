/** Bloquea el zoom con dos dedos en iPhone/iPad (Safari ignora user-scalable=no). */
export function disableZoomGestures() {
  for (const name of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(name, (event) => event.preventDefault());
  }
}
