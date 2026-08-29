import test from 'node:test';
import assert from 'node:assert/strict';
import { cachedPlyUrl } from '../src/splat/ply-cache.js';

test('second ply load uses cache and does not refetch', async () => {
  const store = new Map();
  let fetches = 0;
  const bytes = new Uint8Array([1, 2, 3, 4]);

  globalThis.location = { href: 'http://localhost/' };
  globalThis.caches = {
    open: async () => ({
      match: async (url) => store.get(String(url)),
      put: async (url, response) => { store.set(String(url), response); },
    }),
  };
  globalThis.fetch = async () => {
    fetches += 1;
    return new Response(bytes, { headers: { 'Content-Length': String(bytes.byteLength) } });
  };

  const first = await cachedPlyUrl('/assets/splats/demo.ply');
  const second = await cachedPlyUrl('/assets/splats/demo.ply');
  assert.equal(fetches, 1);
  assert.match(first, /^blob:/);
  assert.match(second, /^blob:/);
  URL.revokeObjectURL(first);
  URL.revokeObjectURL(second);
});
