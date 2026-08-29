const CACHE_NAME = 'hear-guiyang-ply-v1';
const blobs = new Map();
const inflight = new Map();

function resolveSrc(src) {
  const base = import.meta.env?.BASE_URL || '/';
  if (src.startsWith('blob:') || src.startsWith(base)) return src;
  return `${base}${src.replace(/^\//, '')}`;
}

function cacheKey(src) {
  try {
    return new URL(src, globalThis.location?.href ?? 'http://localhost/').href;
  } catch {
    return src;
  }
}

async function openCache() {
  try {
    return await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}

async function download(src, onProgress) {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`PLY 下载失败: ${response.status}`);
  const total = Number(response.headers.get('Content-Length')) || 0;
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    if (total) onProgress?.(received / total * 100, `下载中 ${Math.round(received / total * 100)}%`);
  }
  onProgress?.(100, '下载完成');
  return new Blob(chunks, { type: 'application/octet-stream' });
}

async function resolvePly(src, onProgress) {
  src = resolveSrc(src);
  const key = cacheKey(src);
  let blob = blobs.get(key);
  if (blob) {
    onProgress?.(100, '已从缓存读取');
    return URL.createObjectURL(blob);
  }
  const cache = await openCache();
  const hit = await cache?.match(key);
  if (hit) {
    blob = await hit.blob();
    blobs.set(key, blob);
    onProgress?.(100, '已从缓存读取');
    return URL.createObjectURL(blob);
  }
  blob = await download(src, onProgress);
  blobs.set(key, blob);
  try {
    await cache?.put(key, new Response(blob, { headers: { 'Content-Type': 'application/octet-stream' } }));
  } catch { /* quota — memory hit still works this session */ }
  return URL.createObjectURL(blob);
}

export function cachedPlyUrl(src, onProgress) {
  src = resolveSrc(src);
  const key = cacheKey(src);
  let job = inflight.get(key);
  if (!job) {
    job = resolvePly(src, onProgress).finally(() => inflight.delete(key));
    inflight.set(key, job);
  }
  return job;
}
