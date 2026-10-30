// Retired: PDF Mate moved to /Meridian-Pdf-Mate/. Remove this worker and its caches.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (/^pdfmate-/.test(k)) await caches.delete(k);
    await self.registration.unregister();
    for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate('https://tangojulietdev.github.io/Meridian-Pdf-Mate/');
  })());
});
