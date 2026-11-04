/** Recuerda qué <details> estaban abiertos y devuelve una función que los vuelve a abrir tras repintar. */
export function keepOpenState(root) {
  const open = [...root.querySelectorAll('details')].map((d) => d.open);
  return () => {
    const now = [...root.querySelectorAll('details')];
    if (now.length === open.length) now.forEach((d, i) => { d.open = open[i]; });
  };
}
