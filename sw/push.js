// Avisos push: cuando el Worker manda uno, aquí se muestra.
// El aviso llega como JSON: { title, body, tag?, url? }.
function readPush(event) {
  if (!event.data) return {};
  try {
    return event.data.json();
  } catch {
    return { body: event.data.text() };
  }
}

self.addEventListener('push', (event) => {
  const data = readPush(event);
  event.waitUntil(
    self.registration.showNotification(data.title || 'Aprende y juega', {
      body: data.body || '',
      tag: data.tag || undefined,
      icon: './icons/icon-192.png',
      data: { url: data.url || '' },
    }),
  );
});
