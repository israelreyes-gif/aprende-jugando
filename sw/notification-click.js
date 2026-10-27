// Al tocar un aviso: se abre la app (o se vuelve a ella si ya estaba abierta).
// Si el aviso trae una dirección (por ejemplo '#/p/ID/c/4-primaria/reto'), se va a ella.
async function openApp(path) {
  const target = new URL(path || './', self.registration.scope).href;
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  const open = windows[0];

  if (!open) return self.clients.openWindow(target);
  await open.focus();
  if (path && 'navigate' in open) await open.navigate(target).catch(() => {});
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(openApp(event.notification.data?.url));
});
