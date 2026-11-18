// Al tocar un aviso: se abre la app (o se vuelve a ella si ya estaba abierta).
// Si el aviso trae una dirección (por ejemplo '#/p/ID/c/4-primaria/reto'), se va a ella.
// Solo se abren direcciones de la propia app; cualquier otra cosa lleva a la portada.
function safeTarget(path) {
  const scope = new URL(self.registration.scope);
  const target = new URL(path || './', scope);
  return target.origin === scope.origin && target.pathname.startsWith(scope.pathname) ? target.href : scope.href;
}

async function openApp(path) {
  const target = safeTarget(path);
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
