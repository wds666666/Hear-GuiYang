const CACHE = 'hear-guiyang-assets-v1';

function isMedia(url) {
  try {
    const path = new URL(url).pathname;
    return path.includes('/assets/audio/')
      || path.includes('/assets/video/')
      || path.includes('/assets/splats/');
  } catch {
    return false;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith('hear-guiyang-') && key !== CACHE)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !isMedia(event.request.url)) return;
  event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const key = request.url.split('?')[0];
  const cached = await cache.match(key);
  if (cached) return withRange(request, cached);

  const response = await fetch(key);
  if (response.ok) {
    try { await cache.put(key, response.clone()); } catch { /* quota */ }
  }
  return withRange(request, response);
}

async function withRange(request, response) {
  const range = request.headers.get('Range');
  if (!range || !response.ok) return response;
  const blob = await response.blob();
  const match = /bytes=(\d+)-(\d*)/.exec(range);
  if (!match) return new Response(blob, { status: 200, headers: headersFor(blob, blob.size) });
  const start = Number(match[1]);
  const end = match[2] === '' ? blob.size - 1 : Number(match[2]);
  const slice = blob.slice(start, end + 1);
  return new Response(slice, {
    status: 206,
    headers: {
      ...headersFor(blob, slice.size),
      'Content-Range': `bytes ${start}-${end}/${blob.size}`,
      'Accept-Ranges': 'bytes',
    },
  });
}

function headersFor(blob, length) {
  return {
    'Content-Type': blob.type || 'application/octet-stream',
    'Content-Length': String(length),
  };
}
